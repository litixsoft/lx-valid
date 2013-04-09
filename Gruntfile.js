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
        // Before generating any new files, remove any previously-created files.
        clean: {
            build: ['build']
        },
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
                bitwise: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                nonew: true,
                regexp: true,
                undef: true,
                unused: true,
                strict: true,
                indent: 4,
                quotmark: 'single',
                es5: true,
                loopfunc: true,
                browser: true,
                node: true
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
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-jasmine-node');

    // Default task.
    grunt.registerTask('default', ['clean', 'jshint:files', 'jasmine_node', 'concat', 'uglify']);
    grunt.registerTask('test', ['clean', 'jshint:files', 'jasmine_node']);
};