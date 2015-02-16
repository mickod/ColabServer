var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var fs = require('fs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'uploaded_videos')));
app.use(express.static(path.join(__dirname, 'public')));

// ------------------------------- ROUTES: steering GET, POST etc requests -------------------------------

// get an instance of router
var router = express.Router();

// Enable CORS - cross domain routing
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

// GET: home page route 
router.get('/', function(req, res) {
	res.send('Colab Server default nodejs home page - you shouldnt really be here ...');	
});

// GET: videoViewerPage
router.get('/viewvideos', function(req, res) {
        res.sendfile(__dirname + '/public/viewvideos.html');
});

// POST: video upload route
// multer approach
var multer = require('multer');
app.use(multer({
	
	//Set dstination directory
	dest: path.resolve(__dirname, 'public', 'uploaded_videos'),
	
	//Rename file
	rename: function (fieldname, filename) {
		//Add the current date and time in ISO format, removing the last 'Z' character this usually
		//includes
		var dateNow = new Date();
	    return filename + "_" + dateNow.toISOString().slice(0,-1)
	},
	
	//Log start of file upload
	onFileUploadStart: function (file) {
	  console.log(file.originalname + ' is starting ...')
	},
	
	//Log end of file upload
	onFileUploadComplete: function (file) {
	  console.log(file.fieldname + ' uploaded to  ' + file.path)
	  done=true;
	}

}));

router.post('/web_video_upload', function(req, res) {
	res.send('Video Uploading');
	console.dir(req.files);
});

// GET: route to return list of upload videos 
router.get('/video_list', function(req, res) {
	// Get the path for the uploaded_video directory - in a real app the video list would likely be taken from 
	// a database index table, but this is fine for us for now
	var _p;
    _p = path.resolve(__dirname, 'public', 'uploaded_videos');
	
	//Find all the files in the diectory and add to a JSON list to return
	var resp = [];
	fs.readdir(_p, function(err, list) {
		//Check if the list is undefined or empty first and if so just return 
		if ( typeof list == 'undefined' || !list ) {
			return;
		}
		for (var i = list.length - 1; i >= 0; i--) {
			
			// For each file in the directory add an id and filename to the response
			console.log('Looping through video files in directory: ', list, 'at index: ', i);
			console.dir(list);
	    	resp.push( 
				{"index": i,
				"file_name": list[i]}
			);
			console.log('resp at iteration: ', i, " is: ", resp);
	    }
		
		// Set the response to be sent
		res.json(resp);
	});
});

// DELETE: remove a video from the uploaded folder
router.delete('/uploaded_videos/:id', function(req, res) {
	console.dir("function: delete_video: " + req.params.id);
	//Delete the video from the uploaded videos folder
	var _p;
    _p = path.resolve(__dirname, 'public', 'uploaded_videos', req.params.id);
	fs.unlink(_p);
});

// apply the routes to our application
app.use('/', router);
app.use('/users', users);

//----------------------------------------------------------------------------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;