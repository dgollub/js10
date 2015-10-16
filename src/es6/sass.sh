#!/bin/bash
set -e
set -o pipefail

mkdir -p dist
sass scss/app.scss dist/app.css
