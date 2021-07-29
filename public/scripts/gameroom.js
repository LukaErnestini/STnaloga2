var countdown;
var username = localStorage.getItem('username');
// const socket = io({ auth: { username, gameid: '1234' } });
const socket = io('http://localhost:3000/', {
  auth: {
    x: username,
    gid: $('#gameID').val(),
  },
});
// TODO io now connect without username first, then with username, cause I don't know how to from the getgo
// socket.auth = { auth: {username, gameid: '1234'} };

socket.on('connect_error', (err) => {
  if (err.message === 'invalid username') {
    console.log('Username already selected');
  }
});

// Development
socket.onAny((event, ...args) => {
  console.log(event, args);
});

socket.on('gameplayers', function (data) {
  // First on the list is the GAME OWNER, who can start the game
  if (
    data.users[0].username === username &&
    data.users.length >= 3 &&
    !data.started
  ) {
    $('#start-button').removeClass('inactive');
    //$('#start-button').addClass('ianimate__animated animate__bounce');
  }

  var $playerlist = $('#playerlist');
  $playerlist.empty();
  data.users.forEach((user) => {
    var li = document.createElement('li');
    var a = document.createElement('a');
    //li.id = user.userID;
    a.href = '/profile/' + user.username;
    a.innerHTML = user.username;
    li.append(a);
    $playerlist.append(li);
  });
});

socket.on('chat message', function (msg) {
  var chat = $('#chat-textarea');
  //$(chat).addClass('ianimate__animated animate__bounce');
  var oldContent = chat.val();
  chat.val(oldContent + '\n' + msg);
  chat.scrollTop(chat[0].scrollHeight);
});

// send game id
socket.emit('gameid', { gameid: $('#gameID').val() });

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var input = $('#input');
  var text = input.val();
  if (text) {
    socket.emit('chat message', text);
    input.val('');
  }
});

$('#start-button').on('click', function () {
  socket.emit('start', true);
});

socket.on('finished', function (data) {
  $('#aboveCanvasText').html('Winner: ' + data.winner[0]);
  $('#word').html(data.winner[1] + ' points!');
  $('#time').addClass('inactive');
  $('#game').removeClass('inactive');
  $('#game').addClass('animate__animated animate__bounce blink_me');

  $('#leave-button').removeClass('inactive');
  document.removeEventListener('mousemove', draw);
  document.removeEventListener('mousedown', setPosition);
  document.removeEventListener('mouseenter', setPosition);
  document.removeEventListener('mouseup', stopDrawing);
  document.removeEventListener('mouseleave', stopDrawing);
});

socket.on('start', function (data) {
  $('#game').removeClass('inactive');
  $('#start-button').addClass('inactive');
  var threeMinutes = 60 * 3;
  if (data.elapsedTime) threeMinutes -= data.elapsedTime;
  var display = document.querySelector('#time');
  clearInterval(countdown);
  startTimer(threeMinutes, display);
  if (data.move === username) {
    // ta igralec je na vrsti
    $('#aboveCanvasText').html('Draw:');
    $('#word').html(data.word);
    $('#turnCounter').html(data.round + '/' + data.totalRounds);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mousedown', setPosition);
    document.addEventListener('mouseenter', setPosition);
    document.addEventListener('mouseup', stopDrawing);
    document.addEventListener('mouseleave', stopDrawing);
    $('#clear-button').prop('disabled', false);
  } else {
    // tej igralci ugibajo
    $('#aboveCanvasText').html('Guess the word!');
    $('#word').html('');
    $('#turnCounter').html(data.round + '/' + data.totalRounds);
    $('#clear-button').prop('disabled', true);
    document.removeEventListener('mousemove', draw);
    document.removeEventListener('mousedown', setPosition);
    document.removeEventListener('mouseenter', setPosition);
    document.removeEventListener('mouseup', stopDrawing);
    document.removeEventListener('mouseleave', stopDrawing);
  }
});

function timeToSeconds(t) {
  var seconds = 0;
  var time = t.match(/(\d+)(?::(\d\d))?\s*(p?)/);
  seconds = (parseInt(time[1]) + (time[3] ? 12 : 0)) * 60;
  seconds += parseInt(time[2]) || 0;
  return seconds;
}

// TIMER
function startTimer(duration, display) {
  var timer = duration;
  var minutes;
  var seconds;
  countdown = setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    display.textContent = minutes + ':' + seconds;

    if (--timer < 0) {
      socket.emit('timesup', { secondsLeft: timeToSeconds($('#time').html()) });
      clearInterval(countdown);
    }
  }, 1000);
}

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

socket.on('clear', function clear() {
  ctx.clearRect(0, 0, 3000, 3000);
});

socket.on('goodGuess', function sound1() {
  var snd = new Audio('/audio/mixkit-retro-game-notification-212.wav'); // buffers automatically when created
  snd.play();
});

socket.on('win', function sound2() {
  var snd = new Audio('/audio/mixkit-male-voice-cheer-2010.wav'); // buffers automatically when created
  snd.play();
});

$('#clear-button').on('click', function () {
  ctx.clearRect(0, 0, 3000, 3000);
  socket.emit('clear');
});

$('#leave-button').on('click', function () {
  socket.disconnect();
  $.ajax({
    url: '/game/' + $('#gameID').val() + '/leave',
    method: 'PUT',
  }).done((res) => {
    location.href = '/games';
  });
});
