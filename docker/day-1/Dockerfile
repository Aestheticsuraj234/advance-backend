# BASE Image
FROM node:20.17.0-alpine3.19

# Copying the source code to docker image
WORKDIR /home/ap
COPY package*.json .

RUN npm install


COPY index.js index.js

# Install the dependencies


CMD [ "npm" , "start" ]