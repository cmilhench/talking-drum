dev:
	grunt watch & DEBUG=http,object.io,slate-irc nodemon index.js
	
test:
	./node_modules/jshint/bin/jshint *.js --config ./.jshintrc

clean:
	rm -fr build
	
.PHONY: clean