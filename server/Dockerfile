FROM node:18.2.0 AS base
WORKDIR /api
COPY ./ ./

RUN apt-get update && apt-get install vim -y

RUN npm i

RUN mkdir uploads
RUN chown www-data:www-data uploads

RUN mkdir logs
RUN chown www-data:www-data logs

USER www-data:www-data

ENV NODE_ENV=production
ENV PORT=5834
ENV NODE_OPTIONS=--max_old_space_size=8000
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict --experimental-specifier-resolution=node index.js