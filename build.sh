#!/bin/bash

UGLIFY="/usr/local/bin/uglifyjs"
RAW="-raw.js"
MIN=".js"
FILES=( "classes/htmlController" "classes/jsonController" "classes/session" "classes/oop" "modules/cookie-node/index" "modules/cookie-node/base64" )

echo "start build"

for i in ${FILES[@]}; do
    $UGLIFY $i$RAW > $i$MIN
done

echo "build done"

exit 0
