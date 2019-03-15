"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const next_config_1 = __importDefault(require("./next.config"));
const { env } = process;
/**
 * Port to host the server on. Loaded from `process.env.PORT`. Defaults to 3000.
 */
exports.port = parseInt(env.PORT || '3000', 10);
/**
 * Client root directory that gets passed to Next.
 */
exports.dir = path_1.default.resolve(__dirname, '..', 'src');
/**
 * Development flag passed to Next. Enables/disables the webpack dev server.
 */
exports.dev = env.NODE_ENV === 'development';
/**
 * The exported value of next.config.js that gets passed to Next.
 */
exports.conf = next_config_1.default;
/**
 * API server url for proxying API requests from the client. Loaded from `process.env.API_URL`.
 * Defaults to localhost during development/testing.
 * Throws if missing in production.
 */
exports.apiUrl = getApiUrl();
/**
 * Loads the API server url from the environmental variable API_VARIABLE.
 * Defaults to localhost during development.
 * Throws if missing in production.
 *
 * @returns API server url
 */
function getApiUrl() {
    console.log('getApiUrl', env.NODE_ENV);
    if (env.API_URL) {
        return env.API_URL;
    }
    else if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
        return `http://localhost:${env.PORT || 8080}`;
    }
    else {
        throw new Error(`You must set the API_URL env variable to the URL of the API server.`);
    }
}
//# sourceMappingURL=config.js.map