FROM node:16.1.0-alpine3.11
WORKDIR /usr/src/app
COPY . .
RUN npm i
EXPOSE 5000
CMD ["npm", "run" ,"start:dev"]
