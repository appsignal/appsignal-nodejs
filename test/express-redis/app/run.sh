#!/bin/bash

echo "Giving permission to all users on spans directory"
chmod -R 777 /spans

echo "Install a compatible NPM version"
npm install -g npm@9.7.1

echo "Install, link and build integration"
(
cd /integration
npm install
npm run build
npm link
)

cd /app

echo "Installing app dependencies"
npm install

echo "Linking integration"
npm link @appsignal/nodejs

echo "Starting test app server"
npm run server
