var express = require('express');
var os = require('os');
var fs = require('fs');
var arduino_cli_wrapper = require('arduino-cli').default;
var app = express();



port = 3280;

// use the following instead of console log
function log(message) {
  console.log('---INFO---');
  console.log(message);
  console.log('');
}

// use the following instead of console log, debug only, can be turned of or on
function debug(message) {
  console.debug(message);
  console.debug('---');
}

// use the following to report an error
function error(message, details) {
  console.error('---ERROR : ' + message);
  console.error('Details : ' + details);
  console.error('');
}


// general error handler
var errHandler = function(err) {
  error(err);
}

console.clear();


log('Starting arduino-cli-server on http://localhost:' + port);

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = '.\\arduino-cli\\arduino-arduino_cli.exe';
} else {
  arduino_cli_binary = './arduino-cli';
}

// TODO download arduino cli if not found


// Those folders are the default for arduino IDE so boards, libraries and sketches are synced with arduino ide
// You might want this or not TODO make it configurable
const arduino_data = os.homedir() + '/.arduino15';
const sketchbook_path = os.homedir() + '/Arduino';


const arduino_cli = arduino_cli_wrapper(arduino_cli_binary, {
  arduino_data: arduino_data,
  sketchbook_path: sketchbook_path
});

//arduino_cli.version().then(console.log('ok')).catch(console.log('error'));

// this does the heavy duty
// port and fqbn can be set as 'auto',
// in this case the tool will try to guess from the first connected board, yeah!
function compileAndUpload(sketchName, code, port, fqbn) {
  // create sketch
  arduino_cli.createSketch(sketchName).then(function(sketchPath) {
      log('Sketch created in ' + sketchPath);
      fs.writeFileSync(sketchPath, code);

      // compile sketch
      arduino_cli.compile(function(progress) {}, fqbn, sketchName).then(
        function(result) {
          log('Compiled successfuly');
          debug(result);

          // upload sketch
          arduino_cli.upload(function(progress) {}, port, fqbn, sketchName).then(
            function(result) {
              log('Uploaded successfuly');
              debug(result);
            },
            function(err) {
              error('Upload failed', err);
            })
        },
        function(err) {
          error('Compile failed', err);
        })
    },
    function(err) {
      error('Create sketch failed', err);
    })
}



app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send('welcome to arduino-cli-server');
});


app.get('/compile', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    'error': true,
    'message': 'use a post request'
  })
});




// better try this : https://www.npmjs.com/package/node-monkey#quick-usage

app.use(function(error, req, res, next) {
  // Any request to this server will get here, and will send an HTTP
  // response with the error message 'woops'
  res.json({
    'error': true,
    'message': error.message
  });
});

// this is needed because I don't know what I'm doing :-)
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

try {
  compileAndUpload('mysketchoooo', 'code', 'port', 'fqbn');
} catch (err) {
  log('Error : ' + err.message)
}




app.listen(port);
