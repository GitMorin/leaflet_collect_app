const express     = require('express'),
path              = require('path'),
bodyParser        = require("body-parser");

// Init app
const app = express();

// Import pois router to app.js
const pois = require('./api/pois')

// need to understand these better!
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Use the route pois at the url /api/pois
app.use('/api/pois', pois);

// Home route
app.get("/", function(req, res){
   res.render("home.ejs");
});

// catch 404 and forward error to handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
})

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status||500);
  res.json({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

// Start Server
app.listen(3000, function(){
  console.log('server is running on port 3000')
});
