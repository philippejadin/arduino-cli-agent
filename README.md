# arduino-cli-agent
A simple server to allow local compilation and upload of sketches, using arduino-cli called from nodejs

# Usage for end users
- Download the latest release for your platform
- Unzip it somewhere
- Start the provided executable (start.exe on Windows)

Curently only windows binaries are provided. If you are on another platform, see below

# For developers
- Install nodejs for your platform (curently tested with node v8 lastest, but there is no reason it would not work with other version)
- Run `npm install` to install dependencies
- Download arduino_cli for your platform from https://github.com/arduino/arduino-cli/releases
- Unzip it and put it in the arduino-cli directory.
- You should have arduino-cli/arduino-cli on linux or arduino-cli/arduino-cli.exe on windows


# Usage
- Run node `start.js`
- A window opens with the logs (debug messages)
- A server is created, it responds to localhost:8080
- Open the file `/examples/uploader_simple.html` with your browser to view an example using only html form
- Open the file `/examples/uploader_ajax.html` with your browser to view an example using ajax

This is a proof of concept and a work in progress at that :-)

# Build binaries
- Install pkg : `npm install -g pkg`
- Run `npm run-script build-windows` to make the windows binary
- Run `npm run-script build-linux` to make the linux binary
- Run `npm run-script build-mac` to make the macosx binary
- You'll find the binaries inside the /dist directory


# Python version
There is also a python version that almost works, but I tend to prefer nodejs for this kind of work.
