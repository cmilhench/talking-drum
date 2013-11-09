module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', 'index.js', 'lib/**/*.js', 'public/**/*.js'],
      options: {
        ignores: ['./public/test/lib/*', './public/js/emitter.js', './public/js/knockout-latest.js'],
        jshintrc: './.jshintrc'
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('default', ['jshint']);
};