install:
	# Extension package
	cd packages/nodejs-ext && \
		npm install && \
		npm link
	# Core package
	cd packages/nodejs && \
		npm link @appsignal/nodejs-ext && \
		npm install && \
		npm link
	# Integration packages
	cd packages/apollo-server && \
		npm install && \
		npm link
	cd packages/express && \
		npm install && \
		npm link
	cd packages/koa && \
		npm install && \
		npm link
	cd packages/nextjs && \
		npm install && \
		npm link

build:
	cd packages/apollo-server && npm run build
	cd packages/express && npm run build
	cd packages/koa && npm run build
	cd packages/nextjs && npm run build
	cd packages/nodejs-ext && npm run build
	cd packages/nodejs && npm run build

test:
	# Currently only the core package has tests
	cd packages/nodejs && npm run test

clean:
	# Remove links
	cd packages/nodejs-ext && npm unlink
	cd packages/nodejs && npm unlink
	# Clean lock files
	rm -f packages/*/package-lock.json
	# Clean node modules
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
