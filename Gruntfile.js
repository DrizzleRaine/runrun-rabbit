module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: [ 'build' ],
        browserify: {
            main: {
                src: ['client/main.js'],
                dest: 'build/client/bundle.js'
            }
        },
        copy: {
            main: {
                files: [
                    { src: ['client/static/*'], dest: 'build/client/', expand: true, flatten: true },
                    { src: ['client/lib/*'], dest: 'build/client/lib/', expand: true, flatten: true },
                    { src: ['server/**'], dest: 'build/' },
                    { src: ['shared/**'], dest: 'build/' }
                ]
            }
        },
        watch: {
            files: ['client/**/*.js', 'shared/**/*.js', 'client/**/*.html', 'client/**/*.css'],
            tasks: ['browserify', 'copy']
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['clean', 'browserify', 'copy']);
};