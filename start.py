#!/usr/bin/python
# very good tutorial for simple webserver here : https://www.acmesystems.it/python_http
# and very good subprocess tutorial here : https://www.sharats.me/posts/the-ever-useful-and-neat-subprocess-module/


from BaseHTTPServer import BaseHTTPRequestHandler,HTTPServer
from os import curdir, sep
import cgi
import subprocess


PORT_NUMBER = 3280

#This class will handles any incoming request from
#the browser
class myHandler(BaseHTTPRequestHandler):

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
			    self.wfile.write("<H1>Error</H1> Please fill in the arduino_code, board and filename fields.")
			    return

			#self.wfile.write("<p>name:", form["name"].value)
			#self.wfile.write("<p>addr:", form["addr"].value)
			# create a sketch
			self.wfile.write(subprocess.check_output(["./arduino-cli", "sketch", "new", form["filename"].value]))
			# install the board is needed

			# compile the sketch

			# upload the sketch to the board



			print form
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
