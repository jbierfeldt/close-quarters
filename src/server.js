import {DEBUG, createID} from './lib/shared/utilities.js';
const debug = new DEBUG(process.env.DEBUG, 0);
import Game from './lib/shared/Game.js';
import * as Units from './lib/shared/Unit.js';
import Base from './lib/shared/Base.js';
import BasicAI from './lib/shared/AI.js';
import GameController from './lib/server/GameController.js';
import ClientController from './lib/server/ClientController.js';
import ConnectionHandler from './lib/server/ConnectionHandler.js';

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const port = 3000;

const app = express();
const server = http.Server(app);
const IO = socketIO(server,  {
	pingInterval: 15000
});

const SERVER_SECRET_KEY = 'abc123test';

const CONFIG = {
	maxPlayers: 4
}

const connectionHandler = new ConnectionHandler(IO, SERVER_SECRET_KEY);
connectionHandler.init();

app.set('port', port);
app.use('/static', express.static(__dirname + '/static'));

// Routing
app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(port, () => {
	console.log('Server listening at port %d', port);
});
