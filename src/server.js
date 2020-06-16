const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const port = 3000;

const app = express();
const server = http.Server(app);
const io = socketIO(server);

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
  console.log('a user connected');
});
