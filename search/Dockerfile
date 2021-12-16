FROM node:15.11.0 AS base
WORKDIR /search
COPY ./ ./

RUN npm i

ENV NODE_ENV=production
CMD node watch.js