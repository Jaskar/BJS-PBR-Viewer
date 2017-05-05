module.exports = function (grunt) {

    require('time-grunt')(grunt);

    // load all grunt tasks
    require('jit-grunt')(grunt);

    // electron
    const os = require('os');

    grunt.initConfig({

        // Clean dist folder (all except lib folder)
        clean: {
            css: ["dist/css/index.css", "!dist/css/lib/*.css"],
            js: ["dist/js/*.js", "!dist/js/libraries/*.js", "dist/js/.baseDir.js"],
            map: ["dist/js/*.map", "dist/css/*.map"],
            dist:["dist/js/*.js", "!dist/js/libraries/*.js", "!dist/js/index.min.js"]
        },
        // Compilation from TypeScript to ES5²
        ts: {
            dev: {
                src : ['ts/**/*.ts', 'ts/typings/*.ts'],
                outDir: "dist/js",
                options:{
                    module: 'amd',
                    target: 'es5',
                    declaration: false,
                    sourceMap:true,
                    removeComments:false
                }
            },
            dist: {
                src : ['ts/**/*.ts', 'ts/typings/*.ts'],
                outDir: "dist/js",
                options:{
                    module: 'amd',
                    target: 'es5',
                    declaration: false,
                    sourceMap:false,
                    removeComments:true
                }
            }
        },
        // Watches content related changes
        watch : {
            js : {
                files: ['ts/**/*.ts'],
                tasks: ['ts:dev']
            },
            sass : {
                files: ['sass/**/*.scss'],
                tasks: ['sass','postcss:debug']
            }
        },
        // Build dist version
        uglify : {
            dist: {
                options: {
                    compress:true,
                    beautify: false
                },
                files: {
                    'dist/js/index.min.js': ['dist/js/**/*.js', '!dist/js/libraries/*.js']
                }
            }
        },
        // HTML minifier
        htmlmin : {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'dist/index.html',

                }
            }
        },
        // Sass compilation. Produce an extended css file in css folder
        sass : {
            options: {
                sourcemap:'none',
                style: 'expanded'
            },
            dist : {
                files: {
                    'dist/css/index.css': 'sass/index.scss'
                }
            }
        },
        // Auto prefixer css
        postcss : {
            debug : {
                options: {
                    processors: [
                        require('autoprefixer')({browsers: ['last 2 versions']})
                    ]
                },
                src: ['dist/css/index.css']
            },
            dist: {
                options: {
                    processors: [
                        require('autoprefixer')({browsers: 'last 2 versions'}),
                        require('cssnano')()
                    ]
                },
                src: ['dist/css/index.css']
            }
        },
        //Server creation
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: '.'
                }
            },
            test: {
                options: {
                    port: 3000,
                    base: '.',
                    keepalive:true
                }
            }
        },
        // Open default browser
        open: {
            local: {
                path: 'http://localhost:3000/dist'
            }
        }
    });

    grunt.registerTask('default', 'Compile and watch source files', [
        'dev',
        'connect:server',
        'open',
        'watch'
    ]);

    grunt.registerTask('run', 'Run the webserver and watch files', [
        'connect:server',
        'open',
        'watch'
    ]);

    grunt.registerTask('dev', 'build dev version', [
        'clean:js',
        'clean:css',
        'clean:map',
        'ts:dev',
        'sass',
        'postcss:debug'
    ]);

    grunt.registerTask('test', 'test dist version', [
        'open',
        'connect:test'
    ]);

    grunt.registerTask('dist', 'build dist version', [
        'clean:js',
        'clean:css',
        'clean:map',
        'ts:dist',
        'sass',
        'postcss:dist',
        'uglify',
        'clean:dist'
    ]);

};