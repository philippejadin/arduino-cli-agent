var express = require('express')
const bodyParser = require('body-parser')
var os = require('os')
var fs = require('fs')
var arduino_cli_wrapper = require('arduino-cli').default
var app = express()
// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({
  extended: false
}))


serverport = 3280
detected_port = false
detected_fqbn = false

// use the following instead of console log
function log(message) {
  console.log('---INFO---')
  console.log(message)
  console.log('')
}

// use the following instead of console log, debug only, can be turned of or on
function debug(message) {
  console.debug(message)
  console.debug('---')
}

// use the following to report an error
function error(message, details) {
  console.error('---ERROR : ' + message)
  console.error('Details : ' + details)
  console.error('')
}


// general error handler
var errHandler = function(err) {
  error(err)
}

console.clear()


log('Starting arduino-cli-server on http://localhost:' + serverport)

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = '.\\arduino-cli\\arduino-arduino_cli.exe'
} else {
  arduino_cli_binary = './arduino-cli'
}

// TODO download arduino cli if not found


// Those folders are the default for arduino IDE so boards, libraries and sketches are synced with arduino ide
// You might want this or not TODO make it configurable
const arduino_data = os.homedir() + '/.arduino15'
const sketchbook_path = os.homedir() + '/Arduino'


const arduino_cli = arduino_cli_wrapper(arduino_cli_binary, {
  arduino_data: arduino_data,
  sketchbook_path: sketchbook_path
})


function arduino_cli(command_line) {
  return child_process.execSync(arduino_cli_binary, command_line)
}

command_line = ["board", "list", "--format", "json"]
process = arduino_cli(command_line)
log(str(process))



/*
// TODO / explore this https://developers.google.com/web/fundamentals/primers/promises#promises_arrive_in_javascript
var findConnectedBoard = new Promise(function(resolve, reject) {
  // do a thing, possibly async, then…

  if (// everything was fine) {
    resolve("Stuff worked!");
  }
  else {
    reject(Error("It broke"));
  }
});
*/


function findConnectedBoard() {
  arduino_cli.listConnectedBoards().then(function(result) {
    result.forEach(function(board) {
      log('Board ' + board.name + ' found on port ' + board.port);
    })
    if (result.length == 0) {
      error('No board found, please connect one and restart app');
    }
    if (result.length > 1) {
      log('More than one board found, will use the first found in automatic mode');
    }
    detected_fqbn = result[0].fqbn
    detected_port = result[0].port
  }, function(error) {
    error(error)
  })
}



// this does the heavy duty
// port and fqbn can be set as 'auto',
// in this case the tool will try to guess from the first connected board, yeah!
function compileAndUpload(sketchName, code, port, fqbn) {

  // create sketch
  arduino_cli.createSketch(sketchName).then(function(sketchPath) {
      log('Sketch created in ' + sketchPath)
      fs.writeFileSync(sketchPath, code)

      // compile sketch
      arduino_cli.compile(function(progress) {}, fqbn, sketchName).then(
        function(result) {
          log('Compiled successfuly')
          debug(result)

          // upload sketch
          arduino_cli.upload(function(progress) {}, port, fqbn, sketchName).then(
            function(result) {
              log('Uploaded successfuly')
              debug(result)
              return result
            },
            function(err) {
              error('Upload failed', err)
            })
        },
        function(err) {
          error('Compile failed', err)
        })
    },
    function(err) {
      error('Create sketch failed', err)
    })
}



app.get('/', function(req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.send('welcome to arduino-cli-server')
})


app.get('/compile', function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.json({
    'error': true,
    'message': 'use a post request'
  })
})


app.post('/compile', function(req, res) {
  // todo validate !!!
  sketchName = req.body.filename
  code = req.body.code
  port = req.body.port || detected_port
  fqbn = req.body.fqbn || detected_fqbn

  Promise.all([arduino_cli.createSketch(sketchName), arduino_cli.compile(function(progress) {}, fqbn, sketchName), arduino_cli.upload(function(progress) {}, port, fqbn, sketchName)])
    .then(function(result) {
        log('Uploaded successfuly')
        debug(result)
        /*
        res.setHeader('Content-Type', 'application/json')
        res.json({
          'error': false,
          'details': result
        })*/
      },
      function(error) {
        log(error)
      })
})
/*
  arduino_cli.createSketch(sketchName)
    .then(arduino_cli.compile(function(progress) {}, fqbn, sketchName))
    .then(arduino_cli.upload(function(progress) {}, port, fqbn, sketchName))
    .then(function(result) {
      log('Uploaded successfuly')
      debug(result)
      res.setHeader('Content-Type', 'application/json')
      res.json({
        'error': false,
        'details': result
      })
    })
    .catch(function(err) {
      error('Upload and compile failed', err)
      res.setHeader('Content-Type', 'application/json')
      res.json({
        'error': true,
        'details': err
      })
    })

})
*/





app.get('/listconnectedboards', function(req, res) {
  arduino_cli.listConnectedBoards().then(function(result) {
    if (result.length > 0) {
      res.setHeader('Content-Type', 'application/json')
      res.json({
        'error': false,
        'count': result.length,
        'boards': result
      })
    } else {
      res.json({
        'count': 0,
        'error': false,
        'message': 'No connected boards found'
      })
    }

  }, function(error) {
    res.setHeader('Content-Type', 'application/json')
    res.json({
      'error': true,
      'message': 'Failed to list connected boards',
      'details': error
    })
  })
})


// this is needed because I don't know what I'm doing :-)
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})


// get a list of connected boards
findConnectedBoard()

// start server
app.listen(serverport)
