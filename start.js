var express = require('express');
var os = require('os');
var arduino_cli_wrapper = require('arduino-cli').default;
var app = express();

port = 3280;

console.log('Starting arduino-cli-server on http://localhost:' + port);

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = '.\\arduino-cli\\arduino-cli.exe';
} else {
  arduino_cli_binary = './arduino-cli/arduino-cli';
}

// Those folders are the default for arduino IDE so boards, libraries and sketches are synced with arduino ide
// You might want this or not TODO make it configurable
const arduino_data = os.homedir() + '/.arduino15';
const sketchbook_path = os.homedir() + '/Arduino';


const arduino_cli = arduino_cli_wrapper(arduino_cli_binary, {
  arduino_data: arduino_data,
  sketchbook_path: sketchbook_path
});


app.get('*', function(req, res, next) {
  // This middleware throws an error, so Express will go straight to
  // the next error handler
  throw new Error('woops');
});

// this does the heavy duty
// port and fqbn can be set as 'auto',
// in this case the tool will try to guess from the first connected board, yeah!
function compileAndUpload(code, port, fqbn) {
//  throw new Error('fourte');
  /*
  // create sketch
  cli.createSketch(sketchName).then(function(sketchPath) {
      console.log('Sketche created in ' + sketchPath);

      fs.writeFile(sketchPath, code, function(err) {
        if (err) {
          console.log(err);
          throw new Error(err);
        }
      });

      // compile sketch
      cli.compile(function(progress) {}, fqbn, sketchName).then(function(result) {
          console.log('Compiled successfuly');
          console.log(result)
          log('Compiled successfuly');
          // upload sketch
          cli.upload(function(progress) {}, port, fqbn, sketchName).then(function(result) {
            console.log('Uploaded successfuly');
            console.log(result);
            log('Uploaded successfuly');
          }, function(err) {
            console.error(err); // upload error
          });
        },
        function(err) {
          console.error(err); // compile error
        });
    },
    function(err) {
      console.error(err); // create sketch error
    });
    */
}


app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.send('welcome to arduino-cli-server');
});

/*
app.get('/compile', function(req, res) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({
        'message': 'welcome'
      }));
      */


app.use(function(error, req, res, next) {
  // Any request to this server will get here, and will send an HTTP
  // response with the error message 'woops'
  res.json({
    error: true,
    message: error.message
  });
});


try {
  compileAndUpload('code', 'port', 'fqbn');
} catch (e) {
  console.error(e)
}



app.listen(port);
