FROM node:boron

# Create App Directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Dependencies
COPY package.json /usr/src/app
RUN npm install

# bundle app source codes
COPY ./*.js /usr/src/app/

# Expose Port
EXPOSE 3000
CMD ["npm", "start"]
