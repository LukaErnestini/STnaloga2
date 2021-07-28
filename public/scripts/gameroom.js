var username = localStorage.getItem('username');
var socket = io();
// TODO io now connect without username first, then with username, cause I don't know how to from the getgo
socket.auth = { username };
socket.connect();

socket.on('connect_error', (err) => {
  if (err.message === 'invalid username') {
    console.log('Username already selected');
  }
});

// Development
socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('users', function (users) {
  var $playerlist = $('#playerlist');
  $playerlist.empty();
  users.forEach((user) => {
    var li = document.createElement('li');
    li.id = user.userID;
    li.innerHTML = user.username;
    $playerlist.append(li);
  });
});

socket.on('chat message', function (msg) {
  var chat = $('#chat-textarea');
  var oldContent = chat.val();
  chat.val(oldContent + '\n' + msg);
  chat.scrollTop(chat[0].scrollHeight);
});

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var input = $('#input');
  var text = input.val();
  if (text) {
    socket.emit('chat message', text);
    input.val('');
  }
});

// DRAWING
// get canvas
var canvas = document.getElementById('canvas');

// some hotfixes... ( ≖_≖)
//document.body.style.margin = 0;
//canvas.style.position = 'fixed';

// get canvas 2D context and set him correct size
var ctx = canvas.getContext('2d');
//resize();

// last known position
var pos = { x: 0, y: 0 };
var positions = [];

document.addEventListener('mousemove', draw);
document.addEventListener('mousedown', setPosition);
document.addEventListener('mouseenter', setPosition);
document.addEventListener('mouseup', stopDrawing);
document.addEventListener('mouseleave', stopDrawing);

function setPosition(evt) {
  var rect = canvas.getBoundingClientRect();
  pos.x = evt.clientX - rect.left;
  pos.y = evt.clientY - rect.top;
  positions.push({ x: pos.x, y: pos.y });
}

function stopDrawing() {
  // draw the line
  // SOCKET.IO SYNC
  if (positions.length > 1) socket.emit('draw', { positions });
  positions = []; //clear
}

function draw(e) {
  // mouse left button must be pressed
  if (e.buttons !== 1) return;

  ctx.beginPath(); // begin

  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c0392b';

  ctx.moveTo(pos.x, pos.y); // from

  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // to

  ctx.stroke(); // draw it!
}

socket.on('draw', function replicate(positions) {
  for (let i = 1; i < positions.length - 1; i += 1) {
    ctx.beginPath(); // begin
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#c0392b';
    ctx.moveTo(positions[i].x, positions[i].y); // from
    ctx.lineTo(positions[i + 1].x, positions[i + 1].y); // to
    ctx.stroke(); // draw it!
  }
});

$('#clear-button').on('click', function () {
  ctx.clearRect(0, 0, 3000, 3000);
});
