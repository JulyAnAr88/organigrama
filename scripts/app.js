var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mime = require('mime');
//var jsonServer = require('json-server');

var indexRouter = require('./routes/index');
var dependenciasRouter = require('./routes/dependencias');
var graphRouter = require('./routes/graph');
var createJSONRouter = require('./routes/crearJSON');

// escribimos la función que creará nuestra cabecera para archivos estáticos
const setHeadersOnStatic = (res, path, stat) => {
  const type = mime.getType(path);
  res.set('content-type', type);
}
const staticOptions = {
  setHeaders: setHeadersOnStatic
}

// usamos las opciones en el método static()

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public'), staticOptions));

app.use('/', indexRouter);
app.use('/dependencias', dependenciasRouter);
app.use('/graph', graphRouter);
app.use('/crearJSON', createJSONRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
