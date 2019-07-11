#!/bin/bash
PROM_PGW_CONTAINER_NAME="prom_pushgateway_lb4"
docker rm -f $PROM_PGW_CONTAINER_NAME
