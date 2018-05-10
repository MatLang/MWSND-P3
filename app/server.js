var StaticServer = require('static-server');

var server = new StaticServer({
  rootPath: './',
  port: 8000
});

server.start(function() {
  console.log('Server started');
});