FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm ci --only=production

EXPOSE 3000

CMD [  "npm", "run", "start" ]