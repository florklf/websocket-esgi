FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm ci --only=production

EXPOSE 8000

CMD [  "npm", "run", "start" ]