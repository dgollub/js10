#!/bin/bash
#/**
# *
# *   js10 - A game of numbers
# * 
# *   Copyright (c) 2015 Daniel Kurashige-Gollub <daniel@kurashige-gollub.de>
# *
# **/

#if [ npm help 2>/dev/null -ne 0 ]; then
#    echo -e "Please install node.js package-manager npm first."
#    exit 1
#fi
#if [ sass --help 2>/dev/null -ne 0 ]; then
#    echo -e "Please install sass first."
#    echo -e "On Mac OS X/Linux: sudo gem install sass"
#    exit 1
#fi
#
#if [ ! -d "node_modules" ]; then
#    echo -e "\nIt looks like 'npm install' was never run. Trying to install npm modules now ..."
#    
#    npm install 
#
#    NPM_RESULT=$?
#
#    if [ $NPM_RESULT -ne 0 ]; then
#        echo -e "Something went wrong when running 'npm install'. Please check."
#        exit 1
#    fi
#
#    npm run run
#    exit $?
#fi

# Basically start the Python webserver in he background, then launch the user's browser
# and then kill the webserver when the user kills the wait command via CTRL+C.
# Not sure if this works cross platforms, but it works in Bash 4.1 on Mac OS X 10.9.

trap 'kill $!' EXIT

cd src

python -m SimpleHTTPServer 9999 &

PID=$!

open "http://localhost:9999/"

echo -e "Local Python Webserver running on port 9999 with pid ${PID}."
echo -e "You should see the example page in your browser on http://localhost:9999/"
echo -e "Press CTRL-C to stop the Python Webserver."

wait

cd ..
