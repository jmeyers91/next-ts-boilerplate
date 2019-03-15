"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const NextApp_1 = __importDefault(require("./NextApp"));
const config_1 = require("./config");
main();
async function main() {
    const app = await new NextApp_1.default({
        dir: config_1.dir,
        conf: config_1.conf,
        dev: config_1.dev,
    })
        .proxy('/api/', config_1.apiUrl)
        .proxy('/socket.io/', config_1.apiUrl)
        .start(config_1.port);
    /* tslint:disable */
    console.log(`Listening on port ${app.port}`);
    /* tslint:enable */
}
//# sourceMappingURL=index.js.map