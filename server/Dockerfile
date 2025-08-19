FROM node:22.12.0 AS base
WORKDIR /api
COPY ./ ./

RUN apt-get update && apt-get install vim zip -y

RUN npm i

RUN mkdir uploads
RUN mkdir logs
RUN chown -R www-data:www-data ./

USER www-data:www-data

ENV NODE_ENV=production
ENV PORT=5834
ENV NODE_OPTIONS=--max_old_space_size=8000
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict index.js