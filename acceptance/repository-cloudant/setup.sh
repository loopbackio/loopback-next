#!/bin/bash		
 		
 # Shell script to start the database and app services before running the tests.		
 		
 ## color codes		
 RED='\033[1;31m'		
 GREEN='\033[1;32m'		
 YELLOW='\033[1;33m'		
 CYAN='\033[1;36m'		
 PLAIN='\033[0m'		
 		
 ## variables		
 COUCHDB_CONTAINER="couchdb3"
 HOST=localhost		
 USER='admin'		
 PASSWORD='pass'		
 PORT=5984		
 DATABASE='testdb'	
 SCRIPT='./docker.setup.js'			
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
 docker rm -f $COUCHDB_CONTAINER > /dev/null 2>&1
 printf "\n${CYAN}Clean up complete.${PLAIN}\n"	
 		
 ## https://hub.docker.com/r/ibmcom/couchdb3
 DOCKER_IMAGE=ibmcom/couchdb3:latest

 ## pull latest couchdb3 image
 printf "\n${RED}>> Pulling ${DOCKER_IMAGE} image${PLAIN} ${GREEN}...${PLAIN}"

 docker pull ${DOCKER_IMAGE} > /dev/null 2>&1
 printf "\n${CYAN}Image successfully built.${PLAIN}\n"

 ## run the container
 ## docker run -p 5984:5984 -d --name couchdb3 -e COUCHDB_USER=admin -e COUCHDB_PASSWORD=pass ibmcom/couchdb3:latest
 printf "\n${RED}>> Starting the couchdb container${PLAIN} ${GREEN}...${PLAIN}"
 CONTAINER_STATUS=$(docker run -p $PORT:5984 --name $COUCHDB_CONTAINER -e COUCHDB_USER=$USER -e COUCHDB_PASSWORD=$PASSWORD -d ${DOCKER_IMAGE} 2>&1)
 if [[ "$CONTAINER_STATUS" == *"Error"* ]]; then
     printf "\n\n${CYAN}Status: ${PLAIN}${RED}Error starting container. Terminating setup.${PLAIN}\n\n"
     exit 1
 fi

 printf "\n${CYAN}Container is up and running.${PLAIN}\n"

 ## set env variables for creating database
 printf "\n${RED}>> Setting env variables to create database${PLAIN} ${GREEN}...${PLAIN}"
 export CLOUDANT_HOST=$HOST
 export CLOUDANT_PORT=$PORT
 export CLOUDANT_USERNAME=$USER
 export CLOUDANT_PASSWORD=$PASSWORD
 export CLOUDANT_DATABASE=$DATABASE
 printf "\n${CYAN}Env variables set.${PLAIN}\n"		


## run script to create databases
 printf "\n${RED}>> Creating databases ${CLOUDANT_DATABASE}${PLAIN} ${GREEN}...${PLAIN}\n"
 node $SCRIPT
