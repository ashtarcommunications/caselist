# Caselist

## Overview

This document describes the architecture for the openCaselist collaborative disclosure site for the college and high school debate community.

The production site is hosted at [opencaselist.com](https://opencaselist.com)

The application is made up of three parts:
Server - a NodeJS/Express backend hosted at [api.opencaselist.com](https://api.opencaselist.com)

Search - a more or less off-the-shelf deployment of Apache Solr and Apache Tika, to support indexing and searching the full text of cite and open source document content. Solr itself is only accessible to the API backend.

Client - A React frontend client built with Create React App, hosted in production in its own Docker container using Serve

The docker-compose.yml file at the root of the project will build and deploy all the containers below.

## Server
More extensive developer documentation is auto-generated according to the OpenAPI spec at: https://api.opencaselist.com

That URL is running Swagger UI, pointing to https://api.opencaselist.com/v1/docs, which is the raw version of the spec.

### Toolchain

It's a pretty standard NodeJS Express app using an OpenAPI middleware for request validation. All the route specifications are descibed in the `/v1/routes` folder.

It ties in to the Tabroom LDAP server for authentication. In development, it sets up a mock that authorizes anything.

Database access is with the mysql2 driver and uses `sql-template-strings` as a lightweight query builder.

It implements a number of rate limiters to avoid abuse.

### Database schema

The `/v1/db` directory contains a MySQL Workbench file with the database schema, as well as caselist.sql, which can be used to set up a clean database. It also contains some utility SQL scripts to populate or clean test data.

### Development

1. Create a MySQL database with the caselist.sql schema

2. Git clone this repository

3. Add a .env file to the server directory with any config overrides for your environment, e.g. DB credentials. A full list of config variables is in config.js

4. `npm install`

5. `npm run dev`

That will spin up a development server on localhost.

### Testing

Run the test suite with `npm run test` or `npm run test-cover` if you want code coverage metrics.

### Production

Production docker container can be built with

`docker build -t caselist-api .`

and then deployed with

`docker-compose up -d`

Ensure the following 3 mounted volumes exist and are writeable:

`/var/log/caselist` - server logs

`/var/www/caselist` - uploads, preferably simlinked to NFS

`/var/solr` - solr index and data

### Environment variables

The Express app also runs a cron job using node-cron to add newly uploaded cites and documents to the Solr index every hour.

You can optionally rebuild the Solr index from scratch by setting the `REBUILD_SOLR` environment variable to true before starting the server. That option should be used sparingly and left off in normal production. There are also several other variables for Solr and Tika setup that need to point to the URL's where the search component is deployed.

The `TABROOM_CASELIST_KEY` environment variable has to match the `CASELIST_KEY` on Tabroom servers for the Tabroom integrations to work.

The `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` variables must be set for weekly archive uploads to work. These are kicked off by node-cron at midnight on Tuesdays.

### Migration

The `v1/migration` folder contains scripts designed to migrate data from the old XWiki site into the new database schema. It has to be manually edited to run one caselist at a time.

## Client

### Toolchain

This is a standard React front-end bundled with Vite. It uses Vite's built-in support for CSS modules for locally scoping CSS, and uses PureCSS for some baseline styles.

### Development

`npm run start` will start the Vite dev server with hot reloading. Make sure the server is started on localhost as well.

### Testing

Run the test suite with vitest using `npm run test` or `npm run test-cover` if you want code coverage metrics.

### Production

Set up a `.env` or `.env.production` file with environment variable overrides if necessary.

Create a docker container with a minified production build with:

`docker build -t caselist-client .`

Start a production container serving the minified bundle using serve with:

`docker-compose up -d`

The docker-compose makes assumptions about where a production .env file is stored, make sure to modify if necessary.

## Search

A standard Docker deployment of Apache Solr and Apache Tika. Solr is used for indexing and search, Tika is used to extract full-text contents from Word documents before ingestion to the index.

To run, set the `SOLR_DIR` environment variable in .env to a location that the container will have write access to. Then start up Solr and Tika with:

`docker-compose up -d`
