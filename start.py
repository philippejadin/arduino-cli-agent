#!/usr/bin/env python3

# this got me started quick https://stackoverflow.com/questions/33662842/simple-python-server-to-process-get-and-post-requests-with-json


from bottle import route, run, template, get, post, request, static_file, abort, response
import subprocess
import sys
import os

DEBUG = True

# a few utility functions first

# logs if debug is enabled
def log(s):
    if DEBUG:
        print (s)
        print('-------------------')

# returns a json formated error message
def error(message):
    response.status = 400
    response.content_type = 'application/json'
    return {'error' : True, 'message' : message}

# returns a json formated success message
def success(message):
    response.status = 200
    response.content_type = 'application/json'
    return {'error' : False, 'message' : message}

def arduino_cli(command_line):
    return subprocess.run(command_line,stderr=subprocess.STDOUT, stdout=subprocess.PIPE, cwd=os.path.dirname(os.path.abspath(__file__)))


@route('/')
def index():
    return static_file('index.html', './examples/')

@route('/hello/<name>')
def index(name):
    return template('<b>Hello {{name}}</b>!', name=name)

@route('/error')
def index():
    return error("This is an error message")

@route('/check')
def index():
    tmp = subprocess.run(["./arduino-cli"], stdout=subprocess.PIPE)
    log (tmp)
    return tmp.stdout.decode().replace('\n', '<br />')

@route('/compile')
def index():
    return static_file('uploader.html', './examples/')

@post('/compile')
def index():
    if not request.forms.get('arduino_code') or not request.forms.get('board') or not request.forms.get('filename'):
        return error('Please provide the arduino_code, board and filename fields.')

    sketch_name = request.forms.get('filename')

    sketch_path =  os.getcwd() + '/sketches/' + sketch_name + '/'

    # Create the sketch directory and file
    try:
        os.makedirs (sketch_path)
    except:
        log('Error creating sketch directory at ' +  sketch_path)

    sketch_path =  os.getcwd() + '/sketches/' + sketch_name + '/'
    sketch_filename = sketch_path + sketch_name + '.ino'

    sketch_file = open(sketch_filename, 'w')
    sketch_file.write("// File autogenerated by blockly, save as a copy to avoid overwrite\n\n")
    sketch_file.write(request.forms.get('arduino_code'))
    sketch_file.close();

    # Compile the sketch :
    log(type(request.forms.get('board')))
    command_line = ["./arduino-cli", "compile", "--fqbn", str(request.forms.get('board')), str(sketch_path)]
    log(command_line)
    compile_process = arduino_cli(command_line)
    log (str(compile_process))

    if compile_process.returncode != 0:
        return error("Compilation failed, arduino-cli says : " + str(compile_process.stdout.decode()))


    return success('Compilation suceeded')



# warn python 3 only
if sys.version_info[0] < 3:
    raise Exception("Python 3 or a more recent version is required.")


# start the server in a forever loop
run(host='localhost', port=3280, debug=True, reloader=True)