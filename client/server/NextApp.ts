import Http from 'http';
import Url from 'url';
import HttpProxy from 'http-proxy';
import Next from 'next';

type ProxyTest = (pathname: string) => boolean;
type NextRequestHandler = ReturnType<Next.Server['getRequestHandler']>;

// Handles creating the Next server app and serving it on an HTTP server and proxying API requests
export default class NextApp {
  public port?: number;
  private readonly proxies: Array<{ test: ProxyTest; proxy: HttpProxy }>;
  private readonly server: Http.Server;
  private readonly nextOptions: Next.ServerOptions;
  private nextServer?: Next.Server;
  private handle?: NextRequestHandler;

  constructor(nextOptions: Next.ServerOptions = {}) {
    this.nextOptions = nextOptions;
    this.proxies = [];
    this.server = Http.createServer(this.handleRequest.bind(this));
  }

  // Pass a test string/regex/function and a URL to proxy requests that match the regex to the URL
  public proxy(rawTest: RegExp | string | ProxyTest, proxyTo: string) {
    let test: ProxyTest;

    if (typeof rawTest === 'function') {
      test = rawTest;
    } else if (typeof rawTest === 'string') {
      test = (pathname: string) => pathname.startsWith(rawTest);
    } else {
      test = (pathname: string) => rawTest.test(pathname);
    }

    const proxy = HttpProxy.createProxyServer({
      target: proxyTo,
      changeOrigin: true,
    });

    this.proxies.push({
      test,
      proxy,
    });

    return this;
  }

  public async start(port: number): Promise<this> {
    this.port = port;
    const { dev } = this.nextOptions;
    let { conf } = this.nextOptions;

    // Typescript is pre-compiled in production, so the typescript plugin is only loaded during development.
    // This allows us to avoid installing typescript in production.
    if (dev) {
      const withTypescript = (await import('@zeit/next-typescript')).default;
      conf = withTypescript(conf);
    }

    this.nextServer = Next({
      ...this.nextOptions,
      conf,
    });
    this.handle = this.nextServer.getRequestHandler();

    await this.nextServer.prepare();
    await new Promise((resolve, reject) => {
      this.server.listen(port, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return this;
  }

  public async stop(): Promise<this> {
    if (this.nextServer) {
      await this.nextServer.close();
    }
    await new Promise((resolve, reject) => {
      this.server.close((error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    return this;
  }

  // Get the proxy for the passed pathname
  private getProxyForRequest(pathname: string): HttpProxy | null {
    for (const { test, proxy } of this.proxies) {
      if (test(pathname)) {
        return proxy;
      }
    }
    return null;
  }

  private async handleRequest(
    req: Http.IncomingMessage,
    res: Http.ServerResponse,
  ): Promise<void> {
    const parsedUrl = Url.parse(req.url || '', true);
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
    } else {
      // This isn't reachable until handle has been set and the server starts in `start`
      this.handle!(req, res, parsedUrl);
    }
  }
}
