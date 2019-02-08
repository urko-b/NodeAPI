FROM node:10-jessie


# Create app directory
WORKDIR /usr/src/app

#set environment variables
#ENV NODE_ENV=${NODE_ENV}
#ENV PORT=3000
#ENV WEBAPINAME="restful_api"
#ENV VERSION=1.0

#ENV DOCKER_DB_PORT=27018
#ENV DB="mongodb://mongodb:${MONGO_DB_PORT}/NodeAPI"

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production


# Bundle app source
COPY . .


EXPOSE 3000

CMD [ "npm", "start" ]
