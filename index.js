const runmode = require('./runmode');

if(runmode === 'API') {
  require('./api/dist');
} else if(runmode === 'CLIENT') {
  require('./client/dist/server');
}
