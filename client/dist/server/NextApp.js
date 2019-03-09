"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const http_proxy_1 = __importDefault(require("http-proxy"));
const next_1 = __importDefault(require("next"));
const defaultPort = parseInt(process.env.PORT || '3000', 10);
const defaultNextDev = process.env.NODE_ENV === 'development';
const defaultNextConfig = {};
const useTypescriptLoader = process.env.NODE_ENV !== 'production';
// Handles creating the Next server app and serving it on an HTTP server and proxying API requests
class NextApp {
    constructor(nextOptions = {}) {
        this.nextOptions = nextOptions;
        this.proxies = [];
        this.server = http_1.default.createServer(this.handleRequest.bind(this));
    }
    // Pass a test string/regex/function and a URL to proxy requests that match the regex to the URL
    proxy(rawTest, proxyTo) {
        let test;
        if (typeof rawTest === 'function') {
            test = rawTest;
        }
        else if (typeof rawTest === 'string') {
            test = (pathname) => pathname.startsWith(rawTest);
        }
        else {
            test = (pathname) => rawTest.test(pathname);
        }
        const proxy = http_proxy_1.default.createProxyServer({
            target: proxyTo,
            changeOrigin: true,
        });
        this.proxies.push({
            test,
            proxy,
        });
        return this;
    }
    async start(port = defaultPort) {
        this.port = port;
        let conf = Object.assign({}, defaultNextConfig, this.nextOptions.conf);
        if (useTypescriptLoader) {
            const withTypescript = (await Promise.resolve().then(() => __importStar(require('@zeit/next-typescript')))).default;
            conf = withTypescript(conf);
        }
        this.nextServer = next_1.default(Object.assign({ dev: defaultNextDev }, this.nextOptions, { conf }));
        this.handle = this.nextServer.getRequestHandler();
        await this.nextServer.prepare();
        await new Promise((resolve, reject) => {
            this.server.listen(port, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
        return this;
    }
    async stop() {
        if (this.nextServer) {
            await this.nextServer.close();
        }
        await new Promise((resolve, reject) => {
            this.server.close((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
        return this;
    }
    // Get the proxy for the passed pathname
    getProxyForRequest(pathname) {
        for (const { test, proxy } of this.proxies) {
            if (test(pathname)) {
                return proxy;
            }
        }
        return null;
    }
    async handleRequest(req, res) {
        const parsedUrl = url_1.default.parse(req.url || '', true);
        const { pathname } = parsedUrl;
        const proxy = pathname && this.getProxyForRequest(pathname);
        if (proxy) {
            proxy.web(req, res, {}, error => {
                if (error) {
                    /* tslint:disable */
                    console.error('Failed to proxy request', error.message);
                    /* tslint:enable */
                }
            });
        }
        else {
            // This isn't reachable until handle has been set and the server starts in `start`
            this.handle(req, res, parsedUrl);
        }
    }
}
exports.default = NextApp;
//# sourceMappingURL=NextApp.js.map