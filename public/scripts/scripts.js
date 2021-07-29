$(document).ready(function () {
  var username = localStorage.getItem('username');
  if (!username) $('#logout-button').prop('disabled', true);
  else $('#username-link').text(username);
});

$('#register-button').on('click', function () {
  $.ajax({
    url: '/signup/',
    method: 'POST',
    data: {
      email: $('#email').val(),
      username: $('#username').val(),
      password: $('#password').val(),
    },
  }).done((res) => {
    //TODO if username/mail taken notify of this
    console.log(res);
    localStorage.setItem('username', res.username);
    location.href = '/games';
  });
});

$('#login-button').on('click', function () {
  $.ajax({
    url: '/login/',
    method: 'POST',
    data: {
      username: $('#username').val(),
      password: $('#password').val(),
    },
  }).done((res) => {
    //TODO if not successful, notify
    localStorage.setItem('username', res.username);
    location.href = '/games';
  });
});

$('#logout-button').on('click', function () {
  $.ajax({
    url: '/logout',
    method: 'POST',
  })
    .done((res) => {
      localStorage.setItem('username', '');
      location.href = '/login';
    })
    .fail((e) => {
      console.log(e);
    });
});

$('#new-game-button').on('click', function () {
  $.ajax({
    url: '/game/new',
    method: 'POST',
  })
    .done((res) => {
      location.href = '/game/' + res.game._id;
    })
    .fail((e) => {
      console.log(e);
    });
});

function getGames() {
  $.ajax({
    url: '/games',
    method: 'POST',
  })
    .done((res) => {
      var listdiv = $('#gamelist');
      listdiv.empty();
      res.games.forEach((game) => {
        var button = document.createElement('button');
        button.id = game._id;
        button.className = 'game-button list-group-item list-group-item-action';
        if (game.started) button.disabled = true;
        game.players.forEach((player) => {
          button.innerHTML += player.username + ', ';
        });
        button.innerHTML = button.innerHTML.slice(0, -2);
        listdiv.append(button);
      });

      // Join game
      $('.game-button').on('click', function () {
        var id = this.id;
        $.ajax({
          url: '/game/join',
          method: 'POST',
          data: { id },
        })
          .done((res) => {
            location.href = '/game/' + id;
          })
          .fail((e) => {
            console.log(e);
          });
      });
    })
    .fail((e) => {
      console.log(e);
    });
}
