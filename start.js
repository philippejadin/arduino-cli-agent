/******************* ARDUINO-CLI-AGENT ***********************/
//
// A nodejs wrapper around arduino cli, to allow it's use from a browser.
// https://github.com/philippejadin/arduino-cli-agent/
//

const express = require('express') // web server
const bodyParser = require('body-parser') // parse html forms
const os = require('os')
const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const chalk = require('chalk') // colorize console text
const mkdirp = require('mkdirp') // recursively create dirs


const app = express()


///////////////////////// CONFIG  ////////////////////


serverport = 8080
detected_port = false
detected_fqbn = false

///////////////////////// UTILITIES ////////////////////

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
  console.error(chalk.red('---ERROR ---'))
  console.error(chalk.red(message))
  if (details) console.error('Details : ' + details)
  console.error('')
}


////////////////// ARDUINO-CLI FUNCTIONS / COMMUNICATION ///////////////



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
function compileAndUpload(filename, code, port, fqbn) {

  // create sketch would be like this if using cli :
  //result = arduino_cli(["sketch", "new", sketchName])
  // but let's just create it inside our own ./sketches directory for now

  sketchPath = path.join(process.cwd(), 'sketches', filename, path.sep)

  if (!fs.existsSync(sketchPath)) {
    mkdirp.sync(sketchPath)
  }

  sketchFilename = sketchPath + filename + '.ino'
  fs.writeFileSync(sketchFilename, code)
  log('Sketch created in ' + sketchPath);

  if (fqbn == 'auto') fqbn = detected_fqbn
  if (port == 'auto') port = detected_port

  result = arduino_cli(["compile", "--fqbn", fqbn, sketchPath])
  log('Sketch compiled');

  result = arduino_cli(["upload", "--fqbn", fqbn, '--port', port, sketchPath])
  log('Sketch uploaded');

  return result

}


///////////////////////// SERVER ROUTES ////////////////////

// Tell express to use the body-parser middleware and to not parse extended bodies
app.use(bodyParser.urlencoded({
  extended: false
}))


app.get('/', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json({
    'message': 'Welcome to arduino-cli-server'
  })
})


app.get('/compile', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json({
    'error': true,
    'message': 'use a post request'
  })
})



app.get('/version', function(req, res) {
  //res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.json({
    'error': false,
    'version': '0.1',
    'arduino-cli': arduino_cli(['version'])
  })
})

app.post('/compile', function(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*')

  // todo validate !!!
  filename = req.body.filename
  code = req.body.code
  port = req.body.port || detected_port
  fqbn = req.body.fqbn || detected_fqbn

  if (!req.body.code) {
    error('No code set in request')
    res.json({
      'error': true,
      'details': 'No code set in request'
    })
  }

  if (!req.body.port) {
    error('No port set in request')
    res.json({
      'error': true,
      'details': 'No port set in request'
    })
  }

  if (!req.body.fqbn) {
    error('No fqbn set in request')
    res.json({
      'error': true,
      'details': 'No fqbn set in request'
    })
  }

  if (!req.body.filename) {
    error('No filename set in request')
    res.status(400).json({
      'error': true,
      'details': 'No filename set in request'
    })
  }

  try {
    result = compileAndUpload(filename, code, port, fqbn)
    res.json({
      'error': false,
      'details': result
    })
  } catch (err) {
    res.json({
      'error': true,
      'details': err.toString()
    })
    error(err.toString())
  }
})






app.get('/connectedboards', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*') // TODO security issue
  result = findConnectedBoard()

  if (result.serialBoards.length > 0) {
    res.json({
      'error': false,
      'count': result.serialBoards.length,
      'boards': result.serialBoards
    })
  } else {
    res.json({
      'count': 0,
      'error': false,
      'message': 'No connected boards found'
    })
  }
})

///////////////////////// STARTUP & init ////////////////////

console.clear()
log('Starting arduino-cli-server on http://localhost:' + serverport)



// initialize arduino cli path
if (process.platform === "win32") {
  arduino_cli_binary = path.join(process.cwd(), 'arduino-cli', 'arduino-cli.exe')
}
if (process.platform === "linux") {
  arduino_cli_binary = path.join(process.cwd(), 'arduino-cli', 'arduino-cli')
}
if (process.platform === "darwin") {
  arduino_cli_binary = path.join(process.cwd(), 'arduino-cli', 'arduino-cli')
}

// warn about arduino cli if not found and wait a bit before exiting cleanly
if (!fs.existsSync(arduino_cli_binary)) {
  error('arduino-cli not found, in ' + arduino_cli_binary + ' : check readme for instructions')
  var waitTill = new Date(new Date().getTime() + 5000);
  while (waitTill > new Date()) {}
  process.exit(1)
}



// start server
// todo use https://www.npmjs.com/package/portscanner
app.listen(serverport)


// find connected boards
log('Searching connected boards')
try {
  findConnectedBoard()
} catch (err) {
  error('findConnectedBoard failed', err.message);
}
