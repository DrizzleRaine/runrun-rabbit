'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        clean: [ 'build', 'release' ],
        jshint: {
            options: {
                camelcase: true,
                curly: true,
                eqeqeq:true,
                forin: true,
                immed: true,
                indent: 4,
                latedef: true,
                newcap: true,
                noarg:true,
                noempty: true,
                nonew: true,
                quotmark: true,
                undef: true,
                unused: true,
                strict: true,
                trailing: true,
                node: true
            },
            build: ['*.js'],
            server: ['server/**/*.js'],
            shared: ['shared/**/*.js'],
            client: {
                options: {
                    ignores: ['client/lib/**/*.js'],
                    browser: true,
                    globals: {
                        $: false,
                        io: false,
                        CanvasRenderingContext2D: false
                    }
                },
                files: {
                    src: ['client/**/*.js']
                }
            }
        },
        browserify: {
            main: {
                src: ['client/main.js'],
                dest: 'build/client/bundle.js'
            }
        },
        uglify: {
            all: {
                files: [
                    { expand: true, cwd: 'build/', src: ['**/*.js'], dest: 'build/' }
                ]
            }
        },
        compress: {
            client: {
                options: {
                    archive: 'release/client.zip'
                },
                expand: true,
                cwd: 'build/client',
                src: ['**/*']
            },
            server: {
                options: {
                    archive: 'release/server.zip'
                },
                expand: true,
                cwd: 'build',
                src: ['package.json', 'server/**/*', 'shared/**/*']
            }
        },
        copy: {
            main: {
                files: [
                    { src: ['release.package.json'], dest: 'build/package.json' },
                    { src: ['client/static/*'], dest: 'build/client/', expand: true, flatten: true },
                    { src: ['server/**'], dest: 'build/' },
                    { src: ['shared/**'], dest: 'build/' }
                ]
            }
        },
        watch: {
            files: ['client/**/*.js', 'shared/**/*.js', 'server/**/*.js', 'client/**/*.html', 'client/**/*.css'],
            tasks: ['browserify', 'copy'],
            options: {
                livereload: true
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'build/server/start.js',
                    watchedFolders: ['build'],
                    delayTime: 1
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['nodemon', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-compress');

    grunt.registerTask('default', ['test', 'clean', 'browserify', 'copy']);
    grunt.registerTask('release', ['default', 'uglify', 'compress']);
    grunt.registerTask('test', ['jshint']);
};