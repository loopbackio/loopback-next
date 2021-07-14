#!/bin/bash
SCRIPT_NAME=${BASH_SOURCE[0]}
BASE_DIR=`dirname "${SCRIPT_NAME}"`
$BASE_DIR/stop-fluentd.sh

FLUENTD__CONTAINER_NAME="fluentd_lb4"
pushd $BASE_DIR >/dev/null
ROOT_DIR=$(pwd)
rm -rf $ROOT_DIR/logs/*
docker pull fluent/fluentd:v1.7.4-debian-1.0
docker run --name $FLUENTD__CONTAINER_NAME -d \
  -p 24224:24224 -p 9880:9880 -v $ROOT_DIR/etc:/fluentd/etc \
  -e FLUENTD_CONF=fluentd.conf fluent/fluentd
popd >/dev/null

export FLUENTD_SERVICE_HOST=127.0.0.1
export FLUENTD_SERVICE_PORT_TCP=24224
export FLUENTD_SERVICE_PORT_HTTP=9880
