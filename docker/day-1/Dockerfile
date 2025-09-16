# BASE Image
FROM node:20.17.0-alpine3.19

# Copying the source code to docker image
WORKDIR /home/ap
COPY package*.json .

COPY Dockerfile Dockerfile

RUN npm install




COPY index.js index.js

# Install the dependencies
EXPOSE 3000

CMD [ "npm" , "start" ]