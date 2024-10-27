#!/bin/bash

# Used by GitHub Codespaces to automatically run postcreate

sudo apt update

sudo apt install mariadb-server -y

sudo service mysql start

mariadb -u root -proot caselist < "/workspaces/caselist/server/v1/db/caselist.sql"