#!/usr/bin/env bash
# Add individual files here for single debugging
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/history.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/history.newtabs.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/home.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/network-throttle.auto.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/network-throttle.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/network-throttle.manual.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/network-throttle.remove.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/plugins.inline.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/plugins.js
#./node_modules/.bin/protractor test/client/e2e/config.js --file tests/remote-debug.js

for file in test/client/e2e/tests/*
do
  set -e
  ./node_modules/.bin/protractor test/client/e2e/config.js --file $file
done
