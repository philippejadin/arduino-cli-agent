var express = require('express')
const bodyParser = require('body-parser')
var os = require('os')
var fs = require('fs')
const path = require('path');


var app = express()
var child_process = require('child_process')


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


console.clear()


log('Starting arduino-cli-server on http://localhost:' + serverport)

// initialize arduino cli
if (process.platform === "win32") {
  arduino_cli_binary = '.' + path.sep + 'arduino-cli' + path.sep + 'arduino-cli.exe'
} else {
  arduino_cli_binary = path.join(__dirname, 'arduino-cli', 'arduino-cli')
}

// TODO download arduino cli if not found


// Those folders are the default for arduino IDE so boards, libraries and sketches are synced with arduino ide
// You might want this or not TODO make it configurable
const arduino_data = os.homedir() + '/.arduino15'
const sketchbook_path = os.homedir() + '/Arduino'


function arduino_cli(command_line) {
  return child_process.execSync(arduino_cli_binary + ' ' + command_line.join(' ')).toString()
}




function findConnectedBoard() {
  result = JSON.parse(arduino_cli(["board", "list", "--format", "json"]))

  result.serialBoards.forEach(function(board) {
    log('Board ' + board.name + ' found on port ' + board.port);
  })
  if (result.serialBoards.length == 0) {
    error('No board found, please connect one and rescan');
  }
  if (result.serialBoards.length > 0) {
    detected_fqbn = result.serialBoards[0].fqbn
    detected_port = result.serialBoards[0].port
  }
  if (result.serialBoards.length > 1) {
    log('More than one board found, will use the first found in automatic mode');
  }


  return result

}




// this does the heavy duty
// port and fqbn can be set as 'auto',
// in this case the tool will try to guess from the first connected board, yeah!
function compileAndUpload(sketchName, code, port, fqbn) {

  // create sketch would be like this if using cli :
  //result = arduino_cli(["sketch", "new", sketchName])
  // but let's just create it inside our own ./sketches directory for now

  sketchPath = path.join(__dirname, 'sketches', sketchName, path.sep)

  if (!fs.existsSync(sketchPath)) {
    fs.mkdirSync(sketchPath);
  }

  sketchFilename = sketchPath + sketchName + '.ino'
  fs.writeFileSync(sketchFilename, code)
  log('Sketch created');

  result = arduino_cli(["compile", "--fqbn", fqbn, sketchPath])
  log('Sketch compiled');

  result = arduino_cli(["upload", "--fqbn", fqbn, '--port', port, sketchPath])
  log('Sketch uploaded');

  return result

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
  code = req.body.arduino_code
  port = req.body.port || detected_port
  fqbn = req.body.fqbn || detected_fqbn

  try {
    result = compileAndUpload(sketchName, code, port, fqbn)

    res.setHeader('Content-Type', 'application/json')
    res.json({
      'error': false,
      'details': result
    })
  } catch (err) {
    res.setHeader('Content-Type', 'application/json')
    res.json({
      'error': true,
      'details': err.toString()
    })
    log(err.toString())
  }

})






app.get('/listconnectedboards', function(req, res) {
  result = findConnectedBoard()
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
})


// start server
app.listen(serverport)


// find connected boards
log('Searching connected boards')
try {
  findConnectedBoard()
} catch (err) {
  error('findConnectedBoard failed', err.message);
}
