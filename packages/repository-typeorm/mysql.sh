#!/bin/bash

### Shell script to spin up a docker container for mysql.

## color codes
RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
PLAIN='\033[0m'

## variables
MYSQL_CONTAINER="mysql_c"
HOST="localhost"
USER="root"
PASSWORD="pass"
PORT=3306
DATABASE="testdb"
if [ "$1" ]; then
    HOST=$1
fi
if [ "$2" ]; then
    PORT=$2
fi
if [ "$3" ]; then
    USER=$3
fi
if [ "$4" ]; then
    PASSWORD=$4
fi
if [ "$5" ]; then
    DATABASE=$5
fi

## check if docker exists
printf "\n${RED}>> Checking for docker${PLAIN} ${GREEN}...${PLAIN}"
docker -v > /dev/null 2>&1
DOCKER_EXISTS=$?
if [ "$DOCKER_EXISTS" -ne 0 ]; then
    printf "\n\n${CYAN}Status: ${PLAIN}${RED}Docker not found. Terminating setup.${PLAIN}\n\n"
    exit 1
fi
printf "\n${CYAN}Found docker. Moving on with the setup.${PLAIN}\n"


## cleaning up previous builds
printf "\n${RED}>> Finding old builds and cleaning up${PLAIN} ${GREEN}...${PLAIN}"
docker rm -f $MYSQL_CONTAINER > /dev/null 2>&1
printf "\n${CYAN}Clean up complete.${PLAIN}\n"

## pull latest mysql image
printf "\n${RED}>> Pulling latest mysql image${PLAIN} ${GREEN}...${PLAIN}"
docker pull mysql:latest > /dev/null 2>&1
printf "\n${CYAN}Image successfully built.${PLAIN}\n"

## run the mysql container
printf "\n${RED}>> Starting the mysql container${PLAIN} ${GREEN}...${PLAIN}"
CONTAINER_STATUS=$(docker run --name $MYSQL_CONTAINER -e MYSQL_ROOT_USER=$USER -e MYSQL_ROOT_PASSWORD=$PASSWORD -p $PORT:3306 -d mysql:latest 2>&1)
if [[ "$CONTAINER_STATUS" == *"Error"* ]]; then
    printf "\n\n${CYAN}Status: ${PLAIN}${RED}Error starting container. Terminating setup.${PLAIN}\n\n"
    exit 1
fi
docker cp ./test/schema.sql $MYSQL_CONTAINER:/home/ > /dev/null 2>&1
printf "\n${CYAN}Container is up and running.${PLAIN}\n"

## export the schema to the mysql database
printf "\n${RED}>> Exporting default schema${PLAIN} ${GREEN}...${PLAIN}\n"

## command to export schema
docker exec -it $MYSQL_CONTAINER /bin/sh -c "mysql -u$USER -p$PASSWORD < /home/schema.sql" > /dev/null 2>&1

## variables needed to health check export schema
OUTPUT=$?
TIMEOUT=120
TIME_PASSED=0
WAIT_STRING="."

printf "\n${GREEN}Waiting for mysql to respond with updated schema $WAIT_STRING${PLAIN}"
while [ "$OUTPUT" -ne 0 ] && [ "$TIMEOUT" -gt 0 ]
    do
        docker exec -it $MYSQL_CONTAINER /bin/sh -c "mysql -u$USER -p$PASSWORD < /home/schema.sql" > /dev/null 2>&1
        OUTPUT=$?
        sleep 1s
        TIMEOUT=$((TIMEOUT - 1))
        TIME_PASSED=$((TIME_PASSED + 1))

        if [ "$TIME_PASSED" -eq 5 ]; then
            printf "${GREEN}.${PLAIN}"
            TIME_PASSED=0
        fi
    done

if [ "$TIMEOUT" -le 0 ]; then
    printf "\n\n${CYAN}Status: ${PLAIN}${RED}Failed to export schema. Terminating setup.${PLAIN}\n\n"
    exit 1
fi
printf "\n${CYAN}Successfully exported schema to database.${PLAIN}\n"

## create the database
printf "\n${RED}>> Creating the database${PLAIN} ${GREEN}...${PLAIN}"
docker exec -it $MYSQL_CONTAINER /bin/sh -c "mysql -u$USER -p$PASSWORD -e \"DROP DATABASE IF EXISTS $DATABASE\"" > /dev/null 2>&1
docker exec -it $MYSQL_CONTAINER /bin/sh -c "mysql -u$USER -p$PASSWORD -e \"CREATE DATABASE $DATABASE\"" > /dev/null 2>&1
DATABASE_CREATED=$?
if [ "$DATABASE_CREATED" -ne 0 ]; then
    printf "\n\n${CYAN}Status: ${PLAIN}${RED}Database could not be created. Terminating setup.${PLAIN}\n\n"
    exit 1
fi
printf "\n${CYAN}Successfully created the database.${PLAIN}\n"

## set env variables for running test
printf "\n${RED}>> Setting env variables to run test${PLAIN} ${GREEN}...${PLAIN}"
export MYSQL_HOST=$HOST
export MYSQL_PORT=$PORT
export MYSQL_USER=$USER
export MYSQL_PASSWORD=$PASSWORD
export MYSQL_DATABASE=$DATABASE
printf "\n${CYAN}Env variables set.${PLAIN}\n"

printf "\n${CYAN}Status: ${PLAIN}${GREEN}Set up completed successfully.${PLAIN}\n"
printf "\n${CYAN}Instance url: ${YELLOW}mysql://$USER:$PASSWORD@$HOST/$DATABASE${PLAIN}\n"
printf "\n${CYAN}To run the test suite:${PLAIN} ${YELLOW}npm test${PLAIN}\n\n"

