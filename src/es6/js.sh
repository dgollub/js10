#!/bin/bash
set -e
set -o pipefail

mkdir -p dist

BROWSERIFY="./node_modules/.bin/browserify"
WATCH="./node_modules/.bin/watch"
COMPILE="npm run js"
COMPILE_ALL="npm run js:full"

if [ "x$1" = "x" ]; then
    echo $COMPILE_ALL
    $COMPILE_ALL
else
    $WATCH "$COMPILE" js/
fi
