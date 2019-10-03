#!/bin/bash
if [ -z "$CI" ]; then
  BASE_DIR=`dirname "$0"`
  pushd ${BASE_DIR} >/dev/null

  ./stop-brokers.sh

  # Start redis
  REDIS_CONTAINER_NAME="pubsub_test_redis"
  docker pull redis:latest
  docker run --name $REDIS_CONTAINER_NAME -p 6379:6379 -d redis:latest

  # Start kafka
  docker-compose up -d

  popd >/dev/null
fi
