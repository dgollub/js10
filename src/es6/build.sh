#!/bin/bash
set -e
set -o pipefail

npm run clean
exec sass.sh
npm run js:full
npm run show
