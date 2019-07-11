#!/bin/bash
BASE_DIR=`dirname "$0"`
$BASE_DIR/stop-pushgateway.sh

PROM_PGW_CONTAINER_NAME="prom_pushgateway_lb4"
docker pull prom/pushgateway:latest
docker run --name $PROM_PGW_CONTAINER_NAME -p 9091:9091 -d prom/pushgateway:latest
