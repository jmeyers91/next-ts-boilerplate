import NextApp from './NextApp';
import { dir, apiUrl, conf, port, dev } from './config';

main();
async function main() {
  const app = await new NextApp({
    dir,
    conf,
    dev,
  })
    .proxy('/api/', apiUrl)
    .proxy('/socket.io/', apiUrl)
    .start(port);

  /* tslint:disable */
  console.log(`Listening on port ${app.port}`);
  /* tslint:enable */
}
