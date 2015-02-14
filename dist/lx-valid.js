/*!
 * lx-valid - v0.4.2 - 2015-02-14
 * https://github.com/litixsoft/lx-valid
 *
 * Copyright (c) 2015 Litixsoft GmbH
 * Licensed MIT
 */

(function (exports) {
    'use strict';

    /**
     * Gets the type of the value in lower case.
     *
     * @param {*} value The value to test.
     * @returns {string}
     */
    function getType (value) {
        // inspired by http://techblog.badoo.com/blog/2013/11/01/type-checking-in-javascript/

        // handle null in old IE
        if (value === null) {
            return 'null';
        }

        // handle DOM elements
        if (value && (value.nodeType === 1 || value.nodeType === 9)) {
            return 'element';
        }

        var s = Object.prototype.toString.call(value);
        var type = s.match(/\[object (.*?)\]/)[1].toLowerCase();

        // handle NaN and Infinity
        if (type === 'number') {
            if (isNaN(value)) {
                return 'nan';
            }
            if (!isFinite(value)) {
                return 'infinity';
            }
        }

        return type;
    }

    //
    // ### function validate (object, schema, options)
    // #### {Object} object the object to validate.
    // #### {Object} schema (optional) the JSON Schema to validate against.
    // #### {Object} options (optional) options controlling the validation
    //      process. See {@link #validate.defaults) for details.
    // Validate <code>object</code> against a JSON Schema.
    // If <code>object</code> is self-describing (i.e. has a
    // <code>$schema</code> property), it will also be validated
    // against the referenced schema. [TODO]: This behaviour bay be
    // suppressed by setting the {@link #validate.options.???}
    // option to <code>???</code>.[/TODO]
    //
    // If <code>schema</code> is not specified, and <code>object</code>
    // is not self-describing, validation always passes.
    //
    // <strong>Note:</strong> in order to pass options but no schema,
    // <code>schema</code> <em>must</em> be specified in the call to
    // <code>validate()</code>; otherwise, <code>options</code> will
    // be interpreted as the schema. <code>schema</code> may be passed
    // as <code>null</code>, <code>undefinded</code>, or the empty object
    // (<code>{}</code>) in this case.
    //
    function validate (object, schema, options) {
        options = mixin({}, validate.defaults, options);

        if (options.hasOwnProperty('deleteUnknownProperties')) {
            console.log('lx-valid: option "deleteUnknownProperties" is deprcated. It will be removed in version 0.5.0! Please use option "unknowProperties" instead.');
        }

        if (options.trim === true) {
            // ensure that trim works in old browsers
            if (!String.prototype.trim) {
                String.prototype.trim = function () {
                    return this.replace(/^\s+|\s+$/g, '');
                };
            }
        }

        var errors = [];

        //// handle array root element
        if (schema.items) {
            validateProperty(object, object, '', schema, options, errors);
        } else {
            validateObject(object, schema, options, errors);
        }

        return {
            valid: !(errors.length),
            errors: errors
        };
    }

    /**
     * Default validation options. Defaults can be overridden by
     * passing an 'options' hash to {@link #validate}. They can
     * also be set globally be changing the values in
     * <code>validate.defaults</code> directly.
     */
    validate.defaults = {
        /**
         * <p>
         * Enforce 'format' constraints.
         * </p><p>
         * <em>Default: <code>true</code></em>
         * </p>
         */
        validateFormats: true,
        /**
         * <p>
         * When {@link #validateFormats} is <code>true</code>,
         * treat unrecognized formats as validation errors.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         *
         * @see validation.formats for default supported formats.
         */
        validateFormatsStrict: false,
        /**
         * <p>
         * When {@link #validateFormats} is <code>true</code>,
         * also validate formats defined in {@link validate.formatExtensions}.
         * </p><p>
         * <em>Default: <code>true</code></em>
         * </p>
         */
        validateFormatExtensions: true,
        /**
         * <p>
         * When {@link #addMissingDefaults} is <code>true</code>,
         * if property is missing and it has a default value it will be added to the object.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         */
        addMissingDefaults: false,
        /**
         * <p>
         * When {@link #unknownProperties} is set to <code>'delete'</code>,
         * if property is not declared in schema it is deleted from object.
         * When set to <code>'error'</code>, the property will not be deleted and an error is created.
         * When set to <code>'ignore'</code>, the property will not be deleted.
         * </p><p>
         * <em>Default: <code>ignore</code></em>
         * </p>
         */
        unknownProperties: 'ignore',
        /**
         * <p>
         * When {@link #trim} is <code>true</code>,
         * all string values are trimmed.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         */
        trim: false,
        /**
         * <p>
         * When {@link #strictRequired} is <code>true</code>,
         * all empty string values ('') which are required will be invalid.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         */
        strictRequired: false,
        /**
         * <p>
         * When {@link #ignoreNullValues} is <code>true</code>,
         * all values which are null (value === null) will not be validated.
         * </p><p>
         * <em>Default: <code>false</code></em>
         * </p>
         */
        ignoreNullValues: false,
        /**
         * <p>
         * When {@link #transform} is a <code>Function</code>,
         * all values are passed to that function after validation and can be processed.
         * </p><p>
         * <em>Default: <code>null</code></em>
         * </p>
         */
        transform: null
    };

    /**
     * Default messages to include with validation errors.
     */
    validate.messages = {
        required: 'is required',
        minLength: 'is too short (minimum is %{expected} characters)',
        maxLength: 'is too long (maximum is %{expected} characters)',
        pattern: 'invalid input',
        minimum: 'must be greater than or equal to %{expected}',
        maximum: 'must be less than or equal to %{expected}',
        exclusiveMinimum: 'must be greater than %{expected}',
        exclusiveMaximum: 'must be less than %{expected}',
        divisibleBy: 'must be divisible by %{expected}',
        minItems: 'must contain more than %{expected} items',
        maxItems: 'must contain less than %{expected} items',
        uniqueItems: 'must hold a unique set of values',
        format: 'is not a valid %{expected}',
        conform: 'must conform to given constraint',
        type: 'must be of %{expected} type',
        additionalProperties: 'must not exist',
        unknown: 'is not defined in schema'
    };
    validate.messages['enum'] = 'must be present in given enumerator';

    /**
     *
     */
    validate.formats = {
        'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
        'ip-address': /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
        'ipv6': /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
        'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/,
        'date': /^\d{4}-\d{2}-\d{2}$/,
        'time': /^\d{2}:\d{2}:\d{2}$/,
        'color': /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow$/i,
        //'style':        (not supported)
        //'phone':        (not supported)
        //'uri':          (not supported)
        'host-name': /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
        'utc-millisec': {
            test: function (value) {
                return typeof(value) === 'number' && value >= 0;
            }
        },
        'regex': {
            test: function (value) {
                try { new RegExp(value); }
                catch (e) { return false; }

                return true;
            }
        }
    };

    /**
     *
     */
    validate.formatExtensions = {
        'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    };

    function mixin (obj) {
        var sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
            var source = sources.shift();
            if (!source) { continue; }

            if (typeof(source) !== 'object') {
                throw new TypeError('mixin non-object');
            }

            for (var p in source) {
                if (source.hasOwnProperty(p)) {
                    obj[p] = source[p];
                }
            }
        }

        return obj;
    }

    function validateObject (object, schema, options, errors) {
        var props, p, allProps = Object.keys(object),
            visitedProps = [];

        // see 5.2
        if (schema.properties) {
            props = schema.properties;
            for (p in props) {
                if (props.hasOwnProperty(p)) {
                    visitedProps.push(p);
                    validateProperty(object, object[p], p, props[p], options, errors);
                }
            }
        }

        // see 5.3
        if (schema.patternProperties) {
            props = schema.patternProperties;
            for (p in props) {
                if (props.hasOwnProperty(p)) {
                    var re = new RegExp(p);

                    // Find all object properties that are matching `re`
                    for (var k in object) {
                        if (object.hasOwnProperty(k)) {
                            if (re.exec(k) !== null) {
                                validateProperty(object, object[k], k, props[p], options, errors);
                                visitedProps.push(k);
                            }
                        }
                    }
                }
            }
        }

        // deleteUnknownProperties
        if (options.deleteUnknownProperties) {
            props = schema.properties ? Object.keys(schema.properties) : [];
            props = props.concat(schema.patternProperties ? Object.keys(schema.patternProperties) : []);
            for (p in object) {
                if (object.hasOwnProperty(p)) {
                    if (props.indexOf(p) === -1) {
                        delete object[p];
                    }
                }
            }
        }

        // unknownProperties
        if (options.unknownProperties) {
            props = schema.properties ? Object.keys(schema.properties) : [];
            props = props.concat(schema.patternProperties ? Object.keys(schema.patternProperties) : []);
            for (p in object) {
                if (object.hasOwnProperty(p)) {
                    if (props.indexOf(p) === -1) {
                        if (options.unknownProperties === 'delete') {
                            delete object[p];
                        } else if (options.unknownProperties === 'error') {
                            error('unknown', p, object[p], schema, errors);
                        }
                    }
                }
            }
        }

        // see 5.4
        if (undefined !== schema.additionalProperties) {
            var i, l;

            var unvisitedProps = allProps.filter(function (k) {
                return -1 === visitedProps.indexOf(k);
            });

            // Prevent additional properties; each unvisited property is therefore an error
            if (schema.additionalProperties === false && unvisitedProps.length > 0) {
                for (i = 0, l = unvisitedProps.length; i < l; i++) {
                    error('additionalProperties', unvisitedProps[i], object[unvisitedProps[i]], false, errors);
                }
            }
            // additionalProperties is a schema and validate unvisited properties against that schema
            else if (typeof schema.additionalProperties === 'object' && unvisitedProps.length > 0) {
                for (i = 0, l = unvisitedProps.length; i < l; i++) {
                    validateProperty(object, object[unvisitedProps[i]], unvisitedProps[i], schema.unvisitedProperties, options, errors);
                }
            }
        }

    }

    function validateProperty (object, value, property, schema, options, errors) {
        var format, valid, spec, i, l;

        function constrain (name, value, assert) {
            if (schema[name] !== undefined && !assert(value, schema[name], object)) {
                error(name, property, value, schema, errors);
            }
        }

        if (options.ignoreNullValues && value === null) {
            return;
        }

        // check for values of type string and option strictRequired
        if (typeof value === 'string' && options.strictRequired === true && schema.required) {
            // perform trim before checking for required
            var valueToTest = options.trim === true ? value.trim() : value;

            if (valueToTest === '') {
                return error('required', property, undefined, schema, errors);
            }
        }

        if (value === undefined) {
            if (schema['default'] !== undefined && options.addMissingDefaults) {
                if (typeof schema['default'] === 'function') {
                    object[property] = value = schema['default']();
                } else {
                    object[property] = value = schema['default'];
                }

                constrain('conform', value, function (a, e, o) { return e(a, o); });
            } else if (schema.required && schema.type !== 'any') {
                return error('required', property, undefined, schema, errors);
            } else {
                constrain('conform', value, function (a, e, o) { return e(a, o); });
                return;
            }
        }

        if (options.cast) {
            if ('integer' === schema.type || 'number' === schema.type || 'float' === schema.type) {
                if (value !== null && typeof value !== 'boolean' && !isNaN(+value)) {
                    value = +value;
                    object[property] = value;
                }
            }

            if ('boolean' === schema.type) {
                if ('true' === value || '1' === value || 1 === value) {
                    value = true;
                    object[property] = value;
                }

                if ('false' === value || '0' === value || 0 === value) {
                    value = false;
                    object[property] = value;
                }
            }
        }

        if (schema.format && options.validateFormats && typeof value === 'string') {
            var formats = isArray(schema.format) ? schema.format : [schema.format];
            valid = false;

            // Go through available formats
            // And find first matching
            for (i = 0, l = formats.length; i < l; i++) {
                format = formats[i].toLowerCase().trim();

                if (options.validateFormatExtensions) {
                    spec = validate.formatExtensions[format];
                }

                if (!spec) {
                    spec = validate.formats[format];
                }

                if (!spec) {
                    if (options.validateFormatsStrict) {
                        valid = false;
                        break;
                    }
                } else {
                    if (!spec.test(value)) {
                        valid = false;
                    } else {
                        if (options.convert && typeof options.convert === 'function') {
                            // try to convert property by schema format
                            if (isArray(object[property]) || isArray(object)) {
                                var arr = isArray(object) ? object : object[property];

                                // convert values in array
                                var index = arr.indexOf(value);
                                arr[index] = options.convert(format, value);
                            } else {
                                object[property] = options.convert(format, value);
                            }
                        }

                        valid = true;
                        break;
                    }
                }
            }

            if (!valid) {
                return error('format', property, value, schema, errors);
            }
        }

        if (schema['enum']) {
            if (schema['type'] === 'array' && isArray(value)) {
                for (i = 0; i < value.length; i++) {
                    if (schema['enum'].indexOf(value[i]) === -1) {
                        error('enum', property, value, schema, errors);
                        break;
                    }
                }
            }
            else if (schema['enum'].indexOf(value) === -1) {
                error('enum', property, value, schema, errors);
            }
        }

        // Dependencies (see 5.8)
        if (typeof schema.dependencies === 'string' &&
            object[schema.dependencies] === undefined) {
            error('dependencies', property, null, schema, errors);
        }

        if (isArray(schema.dependencies)) {
            for (i = 0, l = schema.dependencies.length; i < l; i++) {
                if (object[schema.dependencies[i]] === undefined) {
                    error('dependencies', property, null, schema, errors);
                }
            }
        }

        if (typeof schema.dependencies === 'object') {
            validateObject(object, schema.dependencies, options, errors);
        }

        checkType(value, schema.type, function (err, type) {
            if (err) {
                return error('type', property, getType(value), schema, errors);
            }

            constrain('conform', value, function (a, e, o) { return e(a, o); });

            switch (type || (isArray(value) ? 'array' : typeof value)) {
                case 'string':
                    if (options.trim === true) {
                        if (isArray(object[property])) {
                            // find value in array
                            var index = object[property].indexOf(value);

                            // only trim when value in object is still a string
                            if (typeof object[property][index] === 'string') {
                                object[property][index] = value.trim();
                            }
                        } else if (typeof object[property] === 'string') {
                            object[property] = value.trim();
                        }
                    }

                    constrain('minLength', value.length, function (a, e) { return a >= e; });
                    constrain('maxLength', value.length, function (a, e) { return a <= e; });
                    constrain('pattern', value, function (a, e) {
                        e = typeof e === 'string' ? e = new RegExp(e) : e;
                        return e.test(a);
                    });
                    break;
                case 'integer':
                case 'number':
                    constrain('minimum', value, function (a, e) { return a >= e; });
                    constrain('maximum', value, function (a, e) { return a <= e; });
                    constrain('exclusiveMinimum', value, function (a, e) { return a > e; });
                    constrain('exclusiveMaximum', value, function (a, e) { return a < e; });
                    constrain('divisibleBy', value, function (a, e) {
                        var multiplier = Math.max((a - Math.floor(a)).toString().length - 2, (e - Math.floor(e)).toString().length - 2);
                        multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;
                        return (a * multiplier) % (e * multiplier) === 0;
                    });
                    break;
                case 'array':
                    constrain('items', value, function (a, e) {
                        var nestedErrors;

                        for (var i = 0, l = a.length; i < l; i++) {
                            nestedErrors = [];
                            validateProperty(object, a[i], property, e, options, nestedErrors);
                            nestedErrors.forEach(function (err) {
                                if (isArray(value) && err.property === property) {
                                    err.property = (property ? property + '.' : '') + i;
                                } else {
                                    err.property = (property ? property + '.' : '') + i + (err.property ? '.' + err.property.replace(property + '.', '') : '');
                                }

                            });

                            nestedErrors.unshift(0, 0);
                            Array.prototype.splice.apply(errors, nestedErrors);
                        }

                        return true;
                    });
                    constrain('minItems', value, function (a, e) { return a.length >= e; });
                    constrain('maxItems', value, function (a, e) { return a.length <= e; });
                    constrain('uniqueItems', value, function (a, e) {
                        if (!e) {
                            return true;
                        }

                        var h = {};

                        for (var i = 0, l = a.length; i < l; i++) {
                            var key = JSON.stringify(a[i]);
                            if (h[key]) {
                                return false;
                            }
                            h[key] = true;
                        }

                        return true;
                    });
                    break;
                case 'object':
                    // Recursive validation
                    if (schema.properties || schema.patternProperties || schema.additionalProperties) {
                        var nestedErrors = [];

                        validateObject(value, schema, options, nestedErrors);
                        nestedErrors.forEach(function (e) {
                            e.property = property + '.' + e.property;
                        });
                        nestedErrors.unshift(0, 0);
                        Array.prototype.splice.apply(errors, nestedErrors);
                    }
                    break;
                default:
                    break;
            }

            if (options.transform && typeof options.transform === 'function') {
                options.transform({
                    object: object,
                    value: value,
                    property: property,
                    schema: schema,
                    options: options,
                    errors: errors
                });
            }
        });
    }

    function checkType (val, type, callback) {
        var types = isArray(type) ? type : [type];

        // No type - no check
        if (type === undefined) {
            return callback(null, type);
        }

        // Go through available types
        // And fine first matching
        /*jshint bitwise: false */
        for (var i = 0, l = types.length; i < l; i++) {
            type = types[i].toLowerCase().trim();
            if (type === 'string' ? typeof val === 'string' :
                    type === 'array' ? isArray(val) :
                        type === 'object' ? val && typeof val === 'object' && !isArray(val) :
                            type === 'number' ? typeof val === 'number' :
                                type === 'integer' ? typeof val === 'number' && Math.floor(val) === val :
                                    type === 'float' ? typeof val === 'number' && new RegExp(/^[\-\+]?\b(\d+[.]\d+$)$/).exec(val) :
                                        type === 'null' ? val === null :
                                            type === 'boolean' ? typeof val === 'boolean' :
                                                type === 'date' ? Object.prototype.toString.call(val) === '[object Date]' :
                                                    type === 'regexp' ? Object.prototype.toString.call(val) === '[object RegExp]' :
                                                        type === 'any' ? typeof val !== 'undefined' : false) {
                return callback(null, type);
            }
        }

        callback(true);
    }

    function error (attribute, property, actual, schema, errors) {
        var lookup = {expected: schema[attribute], actual: actual, attribute: attribute, property: property};
        var message = schema.messages && schema.messages[attribute] || schema.message || validate.messages[attribute] || 'no default message';
        message = message.replace(/%\{([a-z]+)\}/ig, function (_, match) { return lookup[match.toLowerCase()] || ''; });
        errors.push({
            attribute: attribute,
            property: property,
            expected: schema[attribute],
            actual: actual,
            message: message
        });
    }

    function isArray (value) {
        var s = typeof value;
        if (s === 'object') {
            if (value) {
                if (typeof value.length === 'number' && !(value.propertyIsEnumerable('length')) &&
                    typeof value.splice === 'function') {
                    return true;
                }
            }
        }
        return false;
    }

    exports.validate = validate;
    exports.mixin = mixin;
})
(typeof(window) === 'undefined' ? module.exports : (window.json = window.json || {}));

/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };
    
    async.priorityQueue = function (worker, concurrency) {
        
        function _compareTasks(a, b){
          return a.priority - b.priority;
        };
        
        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
            var mid = beg + ((end - beg + 1) >>> 1);
            if (compare(item, sequence[mid]) >= 0) {
              beg = mid;
            } else {
              end = mid - 1;
            }
          }
          return beg;
        }
        
        function _insert(q, data, priority, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };
              
              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }
        
        // Start with a normal queue
        var q = async.queue(worker, concurrency);
        
        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
          _insert(q, data, priority, callback);
        };
        
        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

//noinspection JSUnresolvedVariable
(function (exports, revalidator, async) {
    'use strict';

    // add formats to revalidator
    revalidator.validate.formatExtensions['mongo-id'] = /^[0-9a-fA-F]{8}[0-9a-fA-F]{6}[0-9a-fA-F]{4}[0-9a-fA-F]{6}$/;
    revalidator.validate.formatExtensions['number-float'] = /^[\-\+]?\b(\d+[.]\d+$)$/;
    revalidator.validate.formatExtensions['empty'] = /^$/;

    /**
     * Extend revalidator format extensions
     * @param extensionName
     * @param extensionValue
     */
    function extendFormatExtensions (extensionName, extensionValue) {
        if (typeof extensionName !== 'string' || !(extensionValue instanceof RegExp)) {
            throw new Error('extensionName or extensionValue undefined or not correct type');
        }

        if (revalidator.validate.formats.hasOwnProperty(extensionName) ||
            revalidator.validate.formats.hasOwnProperty(extensionName)) {
            var msg = 'extensionName: ' + extensionName + ' already exists in formatExtensions.';
            throw  new Error(msg);
        }

        revalidator.validate.formatExtensions[extensionName] = extensionValue;
    }

    /**
     * Get Message from messages
     * @param msgTyp
     * @param replacement
     * @return {String}
     */
    function getMsg (msgTyp, replacement) {
        return String(revalidator.validate.messages[msgTyp].replace('%{expected}', replacement));
    }

    /**
     * Get an error object
     * @param type
     * @param expected
     * @param actual
     * @return {Object}
     */
    function getError (type, expected, actual) {
        var error = {
            attribute: '',
            expected: '',
            actual: '',
            message: ''
        };

        error.attribute = type;
        error.expected = expected;
        error.actual = actual;
        error.message = getMsg(type, expected);

        return error;
    }

    /**
     * Get an validation result
     * @param err
     * @return {object}
     */
    function getResult (err) {
        var res = {
            valid: true,
            errors: []
        };

        if (err !== null) {
            res.valid = false;
            res.errors.push(err);
        }

        return res;
    }

    /**
     * Check if array is unique
     * @param val
     * @return {Boolean}
     */
    function uniqueArrayHelper (val) {
        var h = {};

        for (var i = 0, l = val.length; i < l; i++) {
            var key = JSON.stringify(val[i]);
            if (h[key]) {
                return false;
            }
            h[key] = true;
        }

        return true;
    }

    /**
     * Check formats
     * @return {Object}
     */
    function formats () {
        var pub = {};

        pub.email = function (val) {
            if (!revalidator.validate.formats.email.test(val)) {
                return getResult(getError('format', 'email', val));
            }

            return getResult(null);
        };
        pub.ipAddress = function (val) {
            if (!revalidator.validate.formats['ip-address'].test(val)) {
                return getResult(getError('format', 'ip-address', val));
            }

            return getResult(null);
        };
        pub.ipv6 = function (val) {
            if (!revalidator.validate.formats.ipv6.test(val)) {
                return getResult(getError('format', 'ipv6', val));
            }

            return getResult(null);
        };
        pub.dateTime = function (val) {
            if (!revalidator.validate.formats['date-time'].test(val)) {
                return getResult(getError('format', 'date-time', val));
            }

            return getResult(null);
        };
        pub.date = function (val) {
            if (!revalidator.validate.formats.date.test(val)) {
                return getResult(getError('format', 'date', val));
            }

            return getResult(null);
        };
        pub.time = function (val) {
            if (!revalidator.validate.formats.time.test(val)) {
                return getResult(getError('format', 'time', val));
            }

            return getResult(null);
        };
        pub.color = function (val) {
            if (!revalidator.validate.formats.color.test(val)) {
                return getResult(getError('format', 'color', val));
            }

            return getResult(null);
        };
        pub.hostName = function (val) {
            if (!revalidator.validate.formats['host-name'].test(val)) {
                return getResult(getError('format', 'host-name', val));
            }

            return getResult(null);
        };
        pub.utcMillisec = function (val) {
            if (!revalidator.validate.formats['utc-millisec'].test(val)) {
                return getResult(getError('format', 'utc-millisec', val));
            }

            return getResult(null);
        };
        pub.regex = function (val) {
            if (!(val instanceof RegExp)) {
                return getResult(getError('format', 'regex', val));
            }

            return getResult(null);
        };
        pub.url = function (val) {
            if (!revalidator.validate.formatExtensions.url.test(val)) {
                return getResult(getError('format', 'url', val));
            }

            return getResult(null);
        };
        pub.mongoId = function (val) {
            if (!revalidator.validate.formatExtensions['mongo-id'].test(val)) {
                return getResult(getError('format', 'mongoId', val));
            }

            return getResult(null);
        };
        pub.numberFloat = function (val) {
            if (!revalidator.validate.formatExtensions['number-float'].test(val)) {
                return getResult(getError('format', 'float', val));
            }

            return getResult(null);
        };
        pub.empty = function (val) {
            if (!revalidator.validate.formatExtensions['empty'].test(val)) {
                return getResult(getError('format', 'empty', val));
            }

            return getResult(null);
        };

        return pub;
    }

    /**
     * Check types
     * @return {Object}
     */
    function types () {
        var pub = {};

        pub.string = function (val) {
            if (typeof val !== 'string') {
                return getResult(getError('type', 'string', val));
            }

            return getResult(null);
        };
        pub.number = function (val) {
            if (typeof val !== 'number') {
                return getResult(getError('type', 'number', val));
            }

            return getResult(null);
        };
        pub['boolean'] = function (val) {
            if (typeof val !== 'boolean') {
                return getResult(getError('type', 'boolean', val));
            }

            return getResult(null);
        };
        pub.object = function (val) {
            if (typeof val !== 'object') {
                return getResult(getError('type', 'object', val));
            }

            return getResult(null);
        };
        pub['undefined'] = function (val) {
            if (typeof val !== 'undefined') {
                return getResult(getError('type', 'undefined', val));
            }

            return getResult(null);
        };
        pub.integer = function (val) {

            /*jshint bitwise: false */
            if (!(typeof val === 'number' && ~~val === val)) {
                return getResult(getError('type', 'integer', val));
            }

            return getResult(null);
        };
        pub['float'] = function (val) {
            //noinspection JSValidateTypes
            if (typeof val !== 'number' || !new RegExp(/^[\-\+]?\b(\d+[.]\d+$)$/).exec(val)) {
                return getResult(getError('type', 'float', val));
            }

            return getResult(null);
        };
        pub.array = function (val) {
            if (!Array.isArray(val)) {
                return getResult(getError('type', 'array', val));
            }

            return getResult(null);
        };
        pub.date = function (val) {
            if (!(val instanceof Date)) {
                return getResult(getError('type', 'Date', val));
            }

            return getResult(null);
        };
        pub.regexp = function (val) {
            if (!(val instanceof RegExp)) {
                return getResult(getError('type', 'RegExp', val));
            }

            return getResult(null);
        };
        pub['null'] = function (val) {
            if (val !== null) {
                return getResult(getError('type', 'null', val));
            }

            return getResult(null);
        };
        pub.mongoId = function (val) {
            if (Array.isArray(val) || !revalidator.validate.formatExtensions['mongo-id'].test((val || '').toString())) {
                return getResult(getError('type', 'mongoId', val));
            }

            return getResult(null);
        };

        return pub;
    }

    /**
     * Check rules
     * @return {Object}
     */
    function rules () {
        var pub = {};
        pub.maxLength = function (val, max) {

            if (!Array.isArray(val) && typeof val !== 'string' || typeof max !== 'number') {
                return getResult(new Error('rules.maxLength(fail): value must be a string or array, max must be a number'));
            }

            if (val.length > max) {
                return getResult(getError('maxLength', max, val));
            }

            return getResult(null);
        };
        pub.minLength = function (val, min) {

            if (!Array.isArray(val) && typeof val !== 'string' || typeof min !== 'number') {
                return getResult(new Error('rules.minLength(fail): value must be a string or array, min must be a number'));
            }

            if (val.length < min) {
                return getResult(getError('minLength', min, val));
            }

            return getResult(null);
        };
        pub.minimum = function (val, min) {

            if (typeof val !== 'number' || typeof min !== 'number') {
                return getResult(new Error('rules.minimum(fail): value must be a number, min must be a number'));
            }

            if (val < min) {
                return getResult(getError('minimum', min, val));
            }

            return getResult(null);
        };
        pub.maximum = function (val, max) {

            if (typeof val !== 'number' || typeof max !== 'number') {
                return getResult(new Error('rules.maximum(fail): value must be a number, max must be a number'));
            }

            if (val > max) {
                return getResult(getError('maximum', max, val));
            }

            return getResult(null);
        };
        pub.exclusiveMinimum = function (val, min) {

            if (typeof val !== 'number' || typeof min !== 'number') {
                return getResult(new Error('rules.exclusiveMinimum(fail): value must be a number, min must be a number'));
            }

            if (val <= min) {
                return getResult(getError('exclusiveMinimum', min, val));
            }

            return getResult(null);
        };
        pub.exclusiveMaximum = function (val, max) {

            if (typeof val !== 'number' || typeof max !== 'number') {
                return getResult(new Error('rules.exclusiveMaximum(fail): value must be a number, max must be a number'));
            }

            if (val >= max) {
                return getResult(getError('exclusiveMinimum', max, val));
            }

            return getResult(null);
        };
        pub.divisibleBy = function (val, div) {

            if (typeof val !== 'number' || typeof div !== 'number') {
                return getResult(new Error('rules.divisibleBy(fail): value must be a number, div must be a number'));
            }

            var multiplier = Math.max((val - Math.floor(val)).toString().length - 2,
                (div - Math.floor(div)).toString().length - 2);
            multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;

            if ((val * multiplier) % (div * multiplier) !== 0) {
                return getResult(getError('divisibleBy', div, val));
            }

            return getResult(null);
        };
        pub.minItems = function (val, min) {

            if (!Array.isArray(val) || typeof min !== 'number') {
                return getResult(new Error('rules.minItems(fail): value must be a array, min must be a number'));
            }

            if (val.length < min) {
                return getResult(getError('minItems', min, val.length));
            }

            return getResult(null);
        };
        pub.maxItems = function (val, max) {

            if (!Array.isArray(val) || typeof max !== 'number') {
                return getResult(new Error('rules.maxItems(fail): value must be a array, max must be a number'));
            }

            if (val.length > max) {
                return getResult(getError('maxItems', max, val.length));
            }

            return getResult(null);
        };
        pub.uniqueItems = function (val) {

            if (!Array.isArray(val)) {
                return getResult(new Error('rules.uniqueItems(fail): value must be a array'));
            }

            if (!(uniqueArrayHelper(val))) {
                return getResult(getError('uniqueItems', val, true));
            }

            return getResult(null);
        };
        pub['enum'] = function (val, en) {

            if (typeof val === 'undefined' || !Array.isArray(en)) {
                return getResult(new Error('rules.enum(fail): value must be a defined and enum mus be a array'));
            }

            if (en.indexOf(val) === -1) {
                return getResult(getError('enum', en, val));
            }

            return getResult(null);
        };

        return pub;
    }

    function asyncValidate () {
        var pub = {},
            validators = [];

        pub.register = function (func, params) {
            validators.push(function (callback) {
                func(params, callback);
            });
        };

        pub.exec = function (valResult, cb) {
            async.parallel(validators,
                function (err, results) {
                    validators = [];
                    if (err) {
                        cb(err);
                    }
                    else {
                        var i, max;
                        for (i = 0, max = results.length; i < max; i += 1) {
                            if (!results[i].valid) {
                                valResult.valid = false;
                                valResult.errors.push(results[i].errors[0]);
                            }
                        }
                        cb(null, valResult);
                    }
                });
        };

        return pub;
    }

    /**
     * Gets the validate function and encapsulates some param checks
     *
     * @param {object=} validationOptions The validation options for revalidator.
     * @return {function(doc, schema, options)}
     */
    function getValidationFunction (validationOptions) {
        validationOptions = validationOptions || {};

        return function (doc, schema, options) {
            doc = doc || {};
            options = options || {};
            options.isUpdate = options.isUpdate || false;

            // check is update
            if (options.isUpdate) {
                var i,
                    keys = Object.keys(schema.properties),
                    length = keys.length;

                for (i = 0; i < length; i++) {
                    if (!doc.hasOwnProperty(keys[i])) {
                        schema.properties[keys[i]].required = false;
                    }
                }
            }

            // add default validation options to options object
            for (var key in validationOptions) {
                // only add options, do not override
                if (validationOptions.hasOwnProperty(key) && !options.hasOwnProperty(key)) {
                    options[key] = validationOptions[key];
                }
            }

            // json schema validate
            return exports.validate(doc, schema, options);
        };
    }

    exports.validate = revalidator.validate;
    exports.mixin = revalidator.mixin;
    exports.extendFormat = extendFormatExtensions;
    exports.formats = formats();
    exports.types = types();
    exports.rules = rules();
    exports.asyncValidate = asyncValidate();
    exports.getValidationFunction = getValidationFunction;

    function getValidationFunctionByKey (key, functions) {
        return function(value) {
            return functions[key](value).valid;
        };
    }

    function getValidationFunctionName (functionName) {
        return 'is' + functionName[0].toUpperCase() + functionName.substr(1);
    }

    // export type function
    var i;
    var keys = Object.keys(exports.types);
    var length = keys.length;

    for (i = 0; i < length; i++) {
        exports[getValidationFunctionName(keys[i])] = getValidationFunctionByKey(keys[i], exports.types);
    }
})(
        typeof(window) === 'undefined' ? module.exports : (window.lxvalid = window.lxvalid || {}),
        typeof(window) === 'undefined' ? require('./revalidator') : (window.json),
        typeof(window) === 'undefined' ? require('async') : (window.async)
    );
