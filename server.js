const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const WIN_SCORE = 10;
const players = {};
let target = newTarget();
let winner = null;

function newTarget() {
  return { id: Date.now() + Math.random(), x: Math.random() * 85, y: Math.random() * 85 };
}

function sendState() {
  io.emit('state', { players: Object.values(players), target, winner, winScore: WIN_SCORE });
}

io.on('connection', (socket) => {
  socket.on('join', (name) => {
    players[socket.id] = {
      id: socket.id,
      name: String(name).trim().slice(0, 12) || 'Player',
      score: 0,
    };
    sendState();
  });

  socket.on('hit', (targetId) => {
    const p = players[socket.id];
    if (!p || winner || targetId !== target.id) return;

    p.score++;
    if (p.score >= WIN_SCORE) {
      winner = { id: p.id, name: p.name };
    } else {
      target = newTarget();
    }
    sendState();
  });

  socket.on('restart', () => {
    if (!winner) return;
    Object.values(players).forEach((p) => (p.score = 0));
    winner = null;
    target = newTarget();
    sendState();
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    sendState();
  });
});

server.listen(3000, () => console.log('Running on http://localhost:3000'));