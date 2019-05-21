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

RUN ls -al
RUN npm cache clean --force

RUN npm install
# RUN npm install tslint
# This commands runs a monkeypatch to filterable function that is
# required in order to resolve array fields filtering. 
# This issue is specified in their github repo:
# https://github.com/baugarten/node-restful/pull/141
RUN npx patch-package

# If you are building your code for production
# RUN npm install --only=production


# Bundle app source
COPY . .


EXPOSE 3000

CMD [ "npm", "start" ]
