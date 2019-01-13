# arduino-cli-agent
A simple server to allow local compilation and upload of sketches, using arduino-cli called from python

# Install

- Download arduino_cli for your platform from https://github.com/arduino/arduino-cli/releases
- Unzip it and put it in the arduino-cli directory.
- You should have arduino-cli/arduino-cli on linux or arduino-cli/arduino-cli.exe on windows


# Usage
Run python3 start.py

A window opens with the logs (debug messages)

A server is created, it responds to localhost:3280

Visit http://localhost:3280/ with a browser.

This is a proof of concept and a work in progress at that :-)
