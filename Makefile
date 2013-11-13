dev:
	grunt watch & DEBUG=app,slate-irc nodemon app.js
	
test:
	./node_modules/jshint/bin/jshint **/*.js --config ./.jshintrc --exclude ./public/test/lib/**/*

clean:
	rm -fr build
	
.PHONY: clean