'use strict';

module.exports = function(grunt) {
    grunt.initConfig({
        clean: {
            build: ['build'],
            release: ['release/**/*', '!release/.git'],
            force: true
        },
        jshint: {
            options: {
                camelcase: true,
                curly: true,
                eqeqeq:true,
                forin: true,
                immed: true,
                indent: 4,
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
                    ignores: ['client/static/**/*.js'],
                    browser: true,
                    globals: {
                        io: false,
                        CanvasRenderingContext2D: false
                    }
                },
                files: {
                    src: ['client/**/*.js']
                }
            },
            tests: {
                options: {
                    node: true,
                    globals: {
                        describe: false,
                        before: false,
                        beforeEach: false,
                        after: false,
                        afterEach: false,
                        it: false
                    }
                },
                files: {
                    src: ['test/**/*.js']
                }
            }
        },
        browserify: {
            main: {
                src: ['client/main.js'],
                dest: 'build/debug/client/bundle.js',
                options: {
                    alias: [
                        'client/views/menu.js:menu',
                        'client/controllers/game.js:controllers/game',
                        'rivets:rivets'
                    ]
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    ui: 'bdd',
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            }
        },
        uglify: {
            all: {
                files: [
                    { expand: true, cwd: 'build/debug', src: ['**/*.js'], dest: 'build/production' }
                ]
            }
        },
        cssmin: {
            minify: {
                src: 'build/debug/client/site.css',
                dest: 'build/production/client/site.css'
            }
        },
        copy: {
            debug: {
                files: [
                    { src: ['client/static/**'], dest: 'build/debug/client/', expand: true, flatten: true, filter: 'isFile' },
                    { src: ['server/**'], dest: 'build/debug/' },
                    { src: ['shared/**'], dest: 'build/debug/' }
                ]
            },
            prod: {
                files: [
                    { src: ['release.package.json'], dest: 'build/production/package.json' },
                    { src: ['npm-shrinkwrap.json'], dest: 'build/production/npm-shrinkwrap.json' },
                    {
                        expand: true,
                        src: ['build/debug/**'],
                        dest: 'build/production/',
                        filter: function(src) { return grunt.file.isFile(src) && src.indexOf('.js') !== src.length - 3; },
                        rename: function(dest, src) { return src.replace('debug', 'production'); }
                    }
                ]
            },
            release: {
                files: [
                    { src: 'Procfile', dest: 'release/' },
                    {
                        expand: true,
                        cwd: 'build/production/',
                        src: ['**'],
                        dest: 'release/'
                    }
                ]
            }
        },
        compress: {
            client: {
                options: {
                    archive: 'build/release/client.zip'
                },
                expand: true,
                cwd: 'build/production/client',
                src: ['**/*']
            },
            server: {
                options: {
                    archive: 'build/release/server.zip'
                },
                expand: true,
                cwd: 'build/production',
                src: ['package.json', 'server/**/*', 'shared/**/*', 'client/**/*']
            }
        },
        watch: {
            files: ['client/**/*.js',
                    'shared/**/*.js',
                    'server/**/*.js',
                    'server/**/*.html',
                    'client/**/*.html',
                    'client/**/*.css'],
            tasks: ['browserify', 'copy'],
            options: {
                livereload: true
            }
        },
        nodemon: {
            dev: {
                options: {
                    file: 'build/debug/server/start.js',
                    watchedFolders: ['build/debug'],
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
        },
        instrument: {
            files: ['client/**/*.js', 'shared/**/*.js', 'server/**/*.js', 'test/**/*.js'],
            lazy: false,
            basePath: 'build/instrument/'
        },
        storeCoverage : {
            options : {
                dir : 'build/reports/coverage'
            }
        },
        makeReport : {
            src : 'build/reports/**/*.json',
            options : {
                type : 'lcov',
                dir : 'build/reports/coverage',
                print : 'detail'
            }
        },
        exec: {
            deploy: {
                cmd: 'jitsu deploy',
                cwd: 'build'
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
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-istanbul');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('setInstrumentedSourceRoot', function() {
        process.env.SOURCE_ROOT = '/build/instrument';
    });

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['test', 'clean:build', 'browserify', 'copy:debug']);
    grunt.registerTask('production', ['default', 'uglify', 'cssmin', 'copy:prod']);
    grunt.registerTask('cover', ['clean:build', 'instrument', 'setInstrumentedSourceRoot', 'test', 'storeCoverage', 'makeReport']);
    grunt.registerTask('run', ['default', 'concurrent']);
    grunt.registerTask('release:zip', ['production', 'compress']);
    grunt.registerTask('release:git', ['clean:release', 'production', 'copy:release']);
};