#!/bin/bash

DIR=`dirname $0`

PB_REL="https://github.com/protocolbuffers/protobuf/releases"
PB_VER="3.13.0"

pushd $DIR 2>&1 1>/dev/null

curl -LOs $PB_REL/download/v${PB_VER}/protoc-${PB_VER}-linux-x86_64.zip
unzip -o protoc-${PB_VER}-linux-x86_64.zip -d linux "bin/*" readme.txt

curl -LOs $PB_REL/download/v${PB_VER}/protoc-${PB_VER}-osx-x86_64.zip
unzip -o protoc-${PB_VER}-osx-x86_64.zip -d darwin "bin/*" readme.txt

curl -LOs $PB_REL/download/v${PB_VER}/protoc-${PB_VER}-win64.zip
unzip -o protoc-${PB_VER}-win64.zip -d win32 "bin/*" readme.txt

rm protoc-${PB_VER}-*.zip

popd 2>&1 1>/dev/null
