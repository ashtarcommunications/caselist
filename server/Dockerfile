FROM node:18.2.0 AS base
WORKDIR /api
COPY ./ ./

RUN npm i

ENV NODE_ENV=production
ENV PORT=3579
ENV NODE_OPTIONS=--max_old_space_size=8000
CMD NODE_OPTIONS=${NODE_OPTIONS} node --use_strict --experimental-specifier-resolution=node index.js