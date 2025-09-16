# BASE Image
FROM node:20.17.0-alpine3.19


WORKDIR /home/app

COPY package*.json . 
COPY Dockerfile Dockerfile

# Install the dependencies
RUN npm install

COPY index.js index.js

EXPOSE 3000

CMD [ "npm" , "start" ]