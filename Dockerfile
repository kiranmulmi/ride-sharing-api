# ==== CONFIGURE =====
FROM node:16-alpine 
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install nodemon -g --silent
RUN npm install --silent


COPY . ./
CMD ["npm", "run", "dev"]