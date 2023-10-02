FROM node:16

# Create app directory
WORKDIR /usr/Backend/src/app

ENV DATABASE_USER admin
ENV DATABASE_PASS ysoserious454
ENV DATABASE_HOST first.cqjcsrxo1aks.us-east-1.rds.amazonaws.com
ENV DATABASE_NAME automation_master

# Install app dependencies
COPY /Backend/package*.json ./
RUN npm install --silent


# Bundle app source
COPY /Backend ./

EXPOSE 8080
CMD [ "node", "index.js" ]
