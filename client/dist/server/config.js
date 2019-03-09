"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const next_config_1 = __importDefault(require("./next.config"));
const { env } = process;
exports.dir = path_1.default.resolve(__dirname, '..', 'src');
exports.apiUrl = process.env.API_URL || `http://localhost:${env.API_PORT || 8080}`;
exports.conf = next_config_1.default;
//# sourceMappingURL=config.js.map