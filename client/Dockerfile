FROM node:22.11.0 as base
WORKDIR /app

COPY ./ ./
RUN npm i
RUN npm i -g serve
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

EXPOSE 5836
CMD cd build && serve -s -l 5836
