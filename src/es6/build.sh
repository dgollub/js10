#!/bin/bash
set -e
set -o pipefail

npm run release
npm run show
