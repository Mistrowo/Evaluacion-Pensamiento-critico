const express = require('express');
const app = express();
const port = 3000;

const session = require('express-session');

app.use(session({
  secret: 'mi_secreto', 
  resave: false, 
  saveUninitialized: false, 
  cookie: { secure: false } 
}));


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));

const indexRouter = require('./routes/index');

app.use('/', indexRouter);

app.set('view engine', 'ejs');

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
