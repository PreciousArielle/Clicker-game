const socket = io();


const nameInput = document.getElementById('nameInput');
const joinScreen = document.getElementById('join');
const gameScreen = document.getElementById('gameScreen');
const target = document.getElementById('target');
const status = document.getElementById('status');
const overlay = document.getElementById('overlay');
const winnerText = document.getElementById('winnerText');
const scoreList = document.getElementById('scores');

let targetId = null;

function join() {
  socket.emit('join', nameInput.value);
  joinScreen.style.display = 'none';
  gameScreen.style.display = 'block';
}

document.getElementById('joinBtn').onclick = join;


target.onclick = function () {
  socket.emit('hit', targetId);
};

document.getElementById('restartBtn').onclick = function () {
  socket.emit('restart');
};


socket.on('state', function (state) {

  targetId = state.target.id;
  target.style.left = state.target.x + '%';
  target.style.top = state.target.y + '%';


  if (state.winner) {
    if (state.winner.id === socket.id) {
      winnerText.textContent = 'You win!';
    } else {
      winnerText.textContent = '🏆 ' + state.winner.name + ' wins!';
    }
    overlay.style.display = 'flex';
    target.style.display = 'none';
    status.textContent = 'Game over! Press "Play again" in any tab.';
  } else {
    overlay.style.display = 'none';
    target.style.display = 'block';

    if (state.players.length < 2) {
      status.textContent = 'Only you so far. Open this page in another tab and join!';
    } else {
      status.textContent = state.players.length + ' players online. First to ' + state.winScore + ' wins!';
    }
  }

 
  scoreList.innerHTML = '';
  state.players.sort(function (a, b) {
    return b.score - a.score;
  });

  for (const player of state.players) {
    const li = document.createElement('li');
    let name = player.name;
    if (player.id === socket.id) {
      name = name + ' (you)';
      li.classList.add('me');
    }
    li.textContent = name + ': ' + player.score + ' / ' + state.winScore;
    scoreList.appendChild(li);
  }
});