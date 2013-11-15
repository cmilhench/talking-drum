dev:
	grunt watch & DEBUG=app,slate-irc nodemon app.js
	
test:
	@./node_modules/.bin/mocha \
		--require should \
		--bail \
		test/lib/plugins/*

clean:
	rm -fr build
	
.PHONY: test