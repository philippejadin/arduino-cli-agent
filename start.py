#!/usr/bin/python
# very good tutorial for simple webserver here : https://www.acmesystems.it/python_http
# and very good subprocess tutorial here : https://www.sharats.me/posts/the-ever-useful-and-neat-subprocess-module/


from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import subprocess
import string


PORT_NUMBER = 3280

#This class will handles any incoming request from
#the browser
class myHandler(BaseHTTPRequestHandler):


	def write(self, text):
		self.wfile.write(text)

	#Handler for the GET requests
	def do_GET(self):
		if self.path=="/":
			self.wfile.write("Calling arduino-cli\n")
			self.wfile.write(subprocess.check_output(["./arduino-cli"]))



	#Handler for the POST requests
	def do_POST(self):
		if self.path=="/":
			form = cgi.FieldStorage(
				fp=self.rfile,
				headers=self.headers,
				environ={'REQUEST_METHOD':'POST',
		                 'CONTENT_TYPE':self.headers['Content-Type'],
			})

			#self.wfile.write(form)

			#self.wfile.write(form.getfirst("arduino_code"))

			if "arduino_code" not in form or "board" not in form or "filename" not in form:
			    self.write("<H1>Error</H1> Please fill in the arduino_code, board and filename fields.")
			    return

			# create a sketch
		
			sketch_name = form["filename"].value
			process = subprocess.check_output(["./arduino-cli", "sketch", "new", sketch_name])
			self.write(process)
			sketch_path =  string.rstrip(string.replace(process, "Sketch created in: ", ""))
			sketch_filename = sketch_path + "/" + sketch_name + ".ino"

			self.write("Created sketch dir in " + sketch_filename )

			sketch_file = open(sketch_filename, 'w')
			sketch_file.write(form["arduino_code"].value);

			# install the board is needed

			# compile the sketch

			# upload the sketch to the board




			#print "Got code to compile" + form["arduino_code"].value
			#self.send_response(200)
			#self.end_headers()
			#self.wfile.write("Thanks %s !" % form["arduino_code"].value)
			#return


try:
	#Create a web server and define the handler to manage the
	#incoming request
	server = HTTPServer(('', PORT_NUMBER), myHandler)
	print 'Started httpserver on port ' , PORT_NUMBER

	#Wait forever for incoming htto requests
	server.serve_forever()

except KeyboardInterrupt:
	print '^C received, shutting down the web server'
	server.socket.close()
