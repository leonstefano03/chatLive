/** Error thrown by the client. */
export class LibsqlError extends Error {
    /** Machine-readable error code. */
    code;
    constructor(message, code, cause) {
        if (code !== undefined) {
            message = `${code}: ${message}`;
        }
        super(message, { cause });
        this.code = code;
        this.name = "LibsqlError";
    }
}
