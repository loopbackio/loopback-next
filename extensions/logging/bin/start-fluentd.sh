#!/bin/bash
BASE_DIR=`dirname "$0"`
$BASE_DIR/stop-fluentd.sh

FLUENTD__CONTAINER_NAME="fluentd_lb4"
pushd $BASE_DIR >/dev/null
docker pull fluent/fluentd:v1.7.4-debian-1.0
docker run --name $FLUENTD__CONTAINER_NAME -d \
  -p 24224:24224 -p 9880:9880 -v $(pwd):/fluentd/etc \
  -e FLUENTD_CONF=fluentd.conf fluent/fluentd
popd >/dev/null
