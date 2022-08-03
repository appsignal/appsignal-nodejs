cd /integration

npm run build
npm install
npm link

cd /app

npm install
npm link @appsignal/nodejs
npm run server
