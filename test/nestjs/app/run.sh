#!/bin/bash

set -eu

echo "Giving permission to all users on span directory"
chmod -R 777 /spans

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

echo "Build Nestjs app"
npm run build

echo "Starting test app server"
npm run start:prod
