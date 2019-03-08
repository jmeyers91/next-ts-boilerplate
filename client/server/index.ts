import NextApp from './NextApp';
import { dir, apiUrl, conf } from './config';

main();
async function main() {
  const app = await new NextApp({ dir, conf })
    .proxy('/api/', apiUrl)
    .proxy('/socket.io/', apiUrl)
    .start();

  /* tslint:disable */
  console.log(`Listening on port ${app.port}`);
  /* tslint:enable */
}
