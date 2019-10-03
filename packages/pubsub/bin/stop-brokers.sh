#!/bin/bash
BASE_DIR=`dirname "$0"`

# Stop redis
REDIS_CONTAINER_NAME="pubsub_test_redis"
docker rm -f $MONGO_CONTAINER_NAME $REDIS_CONTAINER_NAME

# Stop kafka
pushd ${BASE_DIR} >/dev/null
docker-compose down
popd >/dev/null
