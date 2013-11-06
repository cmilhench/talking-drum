dev:
	DEBUG=http,socket nodemon index.js
	
test:
	./node_modules/jshint/bin/jshint *.js --config ./.jshintrc

clean:
	rm -fr build
	
.PHONY: clean