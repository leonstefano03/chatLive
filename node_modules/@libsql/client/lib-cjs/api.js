"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibsqlError = void 0;
/** Error thrown by the client. */
class LibsqlError extends Error {
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
exports.LibsqlError = LibsqlError;
