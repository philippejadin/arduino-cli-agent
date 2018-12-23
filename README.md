# arduino-cli-agent
A simple server to allow local compilation and upload of sketches, using arduino-cli called from python

# Install

You need to download the arduino-cli binary for your platform (currently only tested on linux) from here: https://github.com/arduino/arduino-cli/

Then rename it to arduino-cli and put it in the same directory as start.py

# Usage
Run python3 start.py

A window opens with the logs (debug messages)

A server is created, it responds to localhost:3280

Visit http://localhost:3280/ with a browser.

This is a proof of concept and a work in progress at that :-)
