const express     = require('express'),
path              = require('path'),
bodyParser        = require("body-parser");

// Init app
const app = express();

// Import pois router to app.js
const pois = require('./api/pois');
//const map = require('./routes/map');
const map = require('./routes/map');

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// need to understand these better!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static('public'));

// mount the pois api on the route api/pois
app.use('/api/pois', pois);

// map pages
app.use('/', map);

// catch 404 and forward error to handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status||500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

// Start Server
app.listen(3005, function(){
  console.log('server is running on port 3005')
});
