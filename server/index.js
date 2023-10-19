import express from "express";
import logger from "morgan";
import { Server } from "socket.io";
import { createServer } from "node:http";
import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@libsql/client";
const port = process.env.PORT ?? 3001;
const URL = process.env.DB_URL || "";
const TOKEN = process.env.DB_TOKEN || "";

const app = express();
const server = createServer(app);
const io = new Server(server, { connectionStateRecovery: {} });

const db = createClient({
  url: URL,
  authToken: TOKEN,
});
await db.execute(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  content TEXT,
  user TEXT
 )
`);
io.on("connection", async (socket) => {
  console.log("a user has connected!");
  socket.on("disconnect", () => {
    console.log("a user has disconnected");
  });

  socket.on("chat message", async (msg) => {
    let result;
    const username = socket.handshake.auth.username ?? 'anonymous'
    console.log({ username })
    try {
      result = await db.execute({
        sql: "INSERT INTO messages (content, user) VALUES (:msg, :username)",
        args: { msg, username },
      });
    } catch (e) {
      console.error(e);
      return;
    }
    io.emit("chat message", msg, result.lastInsertRowid.toString(), username);
  });

  if(!socket.recovered){ //recupera los mensajes sin conexion
try{
  const results = await db.execute({
    sql: 'SELECT * FROM messages WHERE id > ?',
    args: [socket.handshake.auth.serverOffset ?? 0]
  })
  results.rows.forEach(row=>{
    socket.emit('chat message', row.content, row.id.toString(), row.user)
  })
}catch(e){
  console.error(e)
}
  }
});

app.use(logger("dev"));

app.get("/", (_req, res) => {
  res.status(200).sendFile(process.cwd() + "/client/index.html");
});

server.listen(port, () => {
  console.log(`server running on port ${port}`);
});
