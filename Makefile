install:
	npm install

link:
	cd packages/apollo-server && npm link
	cd packages/express && npm link
	cd packages/koa && npm link
	cd packages/nextjs && npm link
	cd packages/nodejs-ext && npm link
	cd packages/nodejs && npm link

build:
	npm run build --workspace=packages/apollo-server
	npm run build --workspace=packages/express
	npm run build --workspace=packages/koa
	npm run build --workspace=packages/nextjs
	npm run build --workspace=packages/nodejs-ext
	npm run build:ext --workspace=packages/nodejs-ext
	npm run build --workspace=packages/nodejs

test:
	# Currently only the core package has tests
	npm run test --workspace=packages/nodejs

clean:
	# Clean lock file
	rm -f package-lock.json
	# Clean node modules
	rm -rf node_modules
	rm -rf packages/node_modules
	rm -rf packages/*/node_modules
	# Clean compiled typescript
	rm -rf packages/*/dist
	# Clean extension
	rm -rf packages/nodejs-ext/build
	rm -f packages/nodejs-ext/ext/appsignal-agent
	rm -f packages/nodejs-ext/ext/appsignal.version
	rm -f packages/nodejs-ext/ext/appsignal.h
	rm -f packages/nodejs-ext/ext/libappsignal.a
	rm -f packages/nodejs-ext/ext/*.tar.gz
