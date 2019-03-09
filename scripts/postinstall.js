const path = require('path');
const { execSync } = require('child_process');
const clientPath = path.resolve(__dirname, '..', 'client');

execSync('npm install', {
  stdio: 'inherit',
  cwd: clientPath,
});
