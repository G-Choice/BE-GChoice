    # Base image
    FROM node:21

    # Create app directory
    WORKDIR /usr/src/app

    # A wildcard is used to ensure both package.json AND yarn.lock are copied
    COPY package.json yarn.lock ./

    # Install app dependencies using yarn
    RUN yarn install

    # Bundle app source
    COPY . .

    # Creates a "dist" folder with the production build
    RUN yarn build

    EXPOSE 3000

    # Start the server using the production build
    CMD [ "yarn", "start:prod" ]
