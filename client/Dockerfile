FROM node:18.2.0 as base
WORKDIR /app

COPY ./ ./
RUN npm i
RUN npm i -g serve
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

EXPOSE 5835
CMD cd build && serve -s -l 5835
