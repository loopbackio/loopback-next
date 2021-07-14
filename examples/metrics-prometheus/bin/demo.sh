#!/bin/bash

# This script runs prometheus to scape and visulize metrics collected for the
# example LoopBack 4 application.

DIR=`dirname $0`
CWD=`pwd`
CONFIG=$CWD/$DIR/prometheus.yml

PROM_CONTAINER_NAME="prometheus_lb4_demo"
docker rm -f $PROM_CONTAINER_NAME
docker pull prom/prometheus:latest
docker run --name $PROM_CONTAINER_NAME -p 9090:9090 -v $CONFIG:/etc/prometheus/prometheus.yml -d prom/prometheus

echo Prometheus is running at http://localhost:9090.

pushd $DIR/.. >/dev/null
npm run build
node .
popd
