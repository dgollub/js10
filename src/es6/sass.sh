#!/bin/bash
set -e
set -o pipefail

mkdir -p dist

if [ "x$1" = "x" ]; then
    sass scss/app.scss dist/app.css
else
    sass --watch scss/app.scss:dist/app.css
fi
