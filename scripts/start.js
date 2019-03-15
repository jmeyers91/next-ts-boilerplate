const { spawn } = require('child_process');
const { RUN_MODE } = process.env;

if(!RUN_MODE) {
  throw new Error(`You must set the RUN_MODE env variable. Valid values: API, CLIENT`);
} else if(RUN_MODE === 'API') {
  spawn('npm', ['run', 'start-api'], { stdio: 'inherit' });
} else if(RUN_MODE === 'CLIENT') {
  spawn('npm', ['run', 'start-client'], { stdio: 'inherit' });
} else {
  throw new Error(`Invalid RUN_MODE "${RUN_MODE}". Valid values: API, CLIENT`);
}
