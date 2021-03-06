#!/bin/bash

UGLIFY="/usr/local/bin/uglifyjs"
JS=".js"
FILES=( "classes/htmlController" "classes/jsonController" "classes/session" "classes/oop" "tsappserver" )
MODULES_FILES=( "cookie-node/index")

echo "start build"
mkdir -p build/classes

for i in ${FILES[@]}; do
#    echo src/$i$JS
    $UGLIFY src/$i$JS > build/$i$JS
done

cp src/classes/index.js build/classes/
mkdir -p build/modules/cookie-node

for i in ${MODULES_FILES[@]}; do
#    echo src/$i$JS
    $UGLIFY src/modules/$i$JS > build/modules/$i$JS
done


echo "build done"

exit 0
