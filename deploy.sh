#!/bin/zsh

set -eu

jspm=node_modules/.bin/jspm

$jspm bundle lib/main --inject --minify

# Use a different production database.
# Keep same length to avoid breaking source maps.
sed -i 's/"nv2_test"/"nv2"     /g' build.js

files=(index.html jspm_packages/system.js config.js build.js build.js.map)
rsync -Rav $files mvw:~/www/nv2.mvwuermersheim.de/
$jspm unbundle
