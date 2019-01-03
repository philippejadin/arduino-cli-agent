var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var arduino_cli = require('arduino-cli').default;

var urlencodedParser = bodyParser.urlencoded({
  extended: false
});


var app = express();


console.log (arduino_cli);

const cli = arduino_cli('./arduino-cli', {
  arduino_data: '~/arduino-cli/data',
  sketchbook_path: '~/arduino-cli/sketches',
});


cli.version().then(console.log); // "0.2.1-alpha.preview"





/* On affiche la todolist et le formulaire */
.get('/todo', function(req, res) {
  res.render('todo.ejs', {
    todolist: req.session.todolist
  });
})


/* On ajoute un élément à la todolist */
.post('/todo/ajouter/', urlencodedParser, function(req, res) {
  if (req.body.newtodo != '') {
    req.session.todolist.push(req.body.newtodo);
  }
  res.redirect('/todo');
})


/* Supprime un élément de la todolist */
.get('/todo/supprimer/:id', function(req, res) {
  if (req.params.id != '') {
    req.session.todolist.splice(req.params.id, 1);
  }
  res.redirect('/todo');
})


/* On redirige vers la todolist si la page demandée n'est pas trouvée */

.use(function(req, res, next) {
  res.redirect('/todo');
})

.listen(8080);
