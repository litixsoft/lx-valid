'use strict';
var fs = require('fs');

module.exports = function (grunt) {
    // load grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint_files_to_test: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
        banner: '/*!\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' *\n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
        ' * Licensed <%= _.map(pkg.licenses, "type").join(", ") %>\n' +
        ' */\n\n',
        // Before generating any new files, remove any previously-created files.
        clean: {
            jasmine: ['build/reports/jasmine'],
            coverage: ['build/coverage'],
            dist: ['dist']
        },
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= banner %>'
            },
            dist: {
                src: [
                    'lib/revalidator.js',
                    'node_modules/async/lib/async.js',
                    'lib/<%= pkg.name %>.js'
                ],
                dest: '<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>',
                sourceMap: true
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: '<%= pkg.name %>.min.js'
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: 'dist/<%= pkg.name %>.zip'
                },
                src: ['dist/<%= pkg.name %>.js', 'dist/<%= pkg.name %>.min.js']
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            test: '<%= jshint_files_to_test %>',
            jslint: {
                options: {
                    reporter: 'jslint',
                    reporterOutput: 'build/reports/jshint.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            },
            checkstyle: {
                options: {
                    reporter: 'checkstyle',
                    reporterOutput: 'build/reports/jshint_checkstyle.xml'
                },
                files: {
                    src: '<%= jshint_files_to_test %>'
                }
            }
        },
        bgShell: {
            coverage: {
                cmd: 'node node_modules/istanbul/lib/cli.js cover --dir build/coverage node_modules/jasmine/bin/jasmine.js -- JASMINE_CONFIG_PATH=test/jasmine.json'
            },
            cobertura: {
                cmd: 'node node_modules/istanbul/lib/cli.js report --root build/coverage --dir build/coverage/cobertura cobertura'
            }
        },
        open: {
            file: {
                path: 'build/coverage/lcov-report/index.html'
            }
        },
        jasmine_nodejs: {
            options: {
                specNameSuffix: 'spec.js', // also accepts an array
                reporters: {
                    console: {
                        cleanStack: 1,
                        verbosity: 3,
                        listStyle: 'indent'
                    }
                }
            },
            test: {
                specs: ['test/**']
            },
            ci: {
                specs: ['test/**'],
                options: {
                    reporters: {
                        junit: {
                            savePath: './build/reports/jasmine/'
                        },
                        console: {
                            cleanStack: 1,
                            verbosity: 3,
                            listStyle: 'indent',
                            activity: false
                        }
                    }
                }
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    preset: 'angular'
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: ['pkg'],
                commitFiles: ['-a'],
                commitMessage: 'chore: release v%VERSION%',
                push: false
            }
        }
    });

    // Register tasks.
    grunt.registerTask('git:commitHook', 'Install git commit hook', function () {
        grunt.file.copy('validate-commit-msg.js', '.git/hooks/commit-msg');
        fs.chmodSync('.git/hooks/commit-msg', '0755');
        grunt.log.ok('Registered git hook: commit-msg');
    });

    grunt.registerTask('test', ['git:commitHook', 'clean:jasmine', 'jshint:test', 'jasmine_nodejs:test']);
    grunt.registerTask('cover', ['clean:coverage', 'jshint:test', 'bgShell:coverage', 'open']);
    grunt.registerTask('build', ['test', 'concat', 'uglify']);
    grunt.registerTask('ci', ['clean:coverage', 'clean:jasmine', 'jshint:jslint', 'jshint:checkstyle', 'bgShell:coverage', 'bgShell:cobertura', 'jasmine_nodejs:ci']);
    grunt.registerTask('release', 'Bump version, update changelog and tag version', function (version) {
        grunt.task.run([
            'bump:' + (version || 'patch') + ':bump-only',
            'build',
            'conventionalChangelog:release',
            'bump-commit'
        ]);
    });

    // Default task.
    grunt.registerTask('default', ['build']);
};