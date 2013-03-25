module.exports = function (grunt) {
    'use strict';

    // Project configuration.
    //noinspection JSUnresolvedFunction
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*!\n' +
            ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
            ' *\n' +
            ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
            ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
            ' */\n\n',
        concat: {
            options: {
                stripBanners: true,
                banner: '<%= banner %>'
            },
            dist: {
                src: [
                    'node_modules/revalidator/lib/revalidator.js',
                    'node_modules/async/lib/async.js',
                    'lib/<%= pkg.name %>.js'
                ],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: ['<%= concat.dist.dest %>'],
                dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js'
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'lib/**/.js', 'test/**/*.js'],
            junit: 'build/reports/jshint.xml',
            checkstyle: 'build/reports/jshint_checkstyle.xml',
            options: {
                node: true,
                jquery: true,
                es5: true,
                browser: true,
                bitwise: true,
                forin: true,
                curly: true,
                eqeqeq: true,
                immed: true,
                indent: 4,
                latedef: true,
                loopfunc: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                quotmark: 'single',
                sub: true,
                strict: true,
                trailing: true,
                white: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                globals: {
                    exports: true
                }
            }
        },
        watch: {
            files: '<%= jshint.files %>',
            tasks: ['jshint:files']
        },
        jasmine_node: {
            specNameMatcher: './*.spec', // load only specs containing specNameMatcher
            projectRoot: 'test',
            requirejs: false,
            forceExit: true,
            jUnit: {
                report: true,
                savePath: './build/reports/jasmine/',
                useDotNotation: true,
                consolidate: true
            }
        }
    });

    // Load tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task.
    grunt.registerTask('default', ['jshint:files', 'jasmine_node', 'concat', 'uglify']);
    grunt.registerTask('test', ['jshint:files', 'jasmine_node']);
};