/*!
 * lx-valid - v0.5.5 - 2015-08-11
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
        },
        'mongo-id': /^[0-9a-fA-F]{8}[0-9a-fA-F]{6}[0-9a-fA-F]{4}[0-9a-fA-F]{6}$/,
        'uuid': /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
        'number-float': /^[\-\+]?\b(\d+[.]\d+$)$/,
        'float': /^[\-\+]?\b(\d+[.]\d+$)$/,
        'integer': /^[\-\+]?[0-9]+$/,
        'empty': /^$/
    };

    /**
     *
     */
    validate.formatExtensions = {
        'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    };

    validate.types = {
        string: function(value) {
            return getType(value) === 'string';
        },
        number: function(value) {
            return getType(value) === 'number';
        },
        boolean: function(value) {
            return getType(value) === 'boolean';
        },
        date: function(value) {
            return getType(value) === 'date';
        },
        regexp: function(value) {
            return getType(value) === 'regexp';
        },
        array: function(value) {
            return getType(value) === 'array';
        },
        object: function(value) {
            return getType(value) === 'object';
        },
        integer: function(value) {
            return getType(value) === 'number' && Math.floor(value) === value;
        },
        float: function(value) {
            return getType(value) === 'number' && new RegExp(validate.formats.float).exec(value);
        },
        null: function(value) {
            return getType(value) === 'null';
        },
        undefined: function(value) {
            return getType(value) === 'undefined';
        },
        any: function(value) {
            return value !== undefined;
        },
        mongoId: function(value) {
            return value && typeof value === 'object' && value._bsontype === 'ObjectID' && validate.formats['mongo-id'].test(value);
        }
    };

    function getTypeCheckFunction(type) {
        var result = validate.types[type];

        if (!result) {
            result = validate.types[type.toLowerCase()];
        }

        return result;
    }

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
            for (p in object) {
                if (object.hasOwnProperty(p)) {
                    if (visitedProps.indexOf(p) === -1) {
                        delete object[p];
                    }
                }
            }
        }

        // unknownProperties
        if (options.unknownProperties) {
            for (p in object) {
                if (object.hasOwnProperty(p)) {
                    if (visitedProps.indexOf(p) === -1) {
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

        if (options.ignoreNullValues && value === null && !schema.required) {
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

                            nestedErrors.unshift(errors.length, 0);
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
                        nestedErrors.unshift(errors.length, 0);
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
        for (var i = 0, l = types.length; i < l; i++) {
            type = types[i].trim();

            // get function to check type
            var typeCheckFunction = getTypeCheckFunction(type);

            if (!typeCheckFunction) {
                return callback(true);
            }

            if (typeCheckFunction(val)) {
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
(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(fn, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
            if (err) {
                callback(err);
            }
            else {
                completed += 1;
                if (completed >= size) {
                    callback(null);
                }
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.nextTick(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

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
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback(null);
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = q.payload ?
                            q.tasks.splice(0, q.payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
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
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

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
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
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
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
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
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
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
        return (revalidator.validate.messages[msgTyp] || '').replace('%{expected}', replacement);
    }

    /**
     * Get an error object
     * @param type
     * @param expected
     * @param actual
     * @return {Object}
     */
    function getError (type, expected, actual) {
        return {
            attribute: type,
            expected: expected,
            actual: actual,
            message: getMsg(type, expected)
        };
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
            if (!revalidator.validate.formats['mongo-id'].test(val)) {
                return getResult(getError('format', 'mongoId', val));
            }

            return getResult(null);
        };
        pub.uuid = function (val) {
            if (!revalidator.validate.formats['uuid'].test(val)) {
                return getResult(getError('format', 'uuid', val));
            }

            return getResult(null);
        };
        pub.numberFloat = function (val) {
            if (typeof val !== 'string' || !revalidator.validate.formats['number-float'].test(val)) {
                return getResult(getError('format', 'float', val));
            }

            return getResult(null);
        };
        pub.float = function (val) {
            if (typeof val !== 'string' || !revalidator.validate.formats['float'].test(val)) {
                return getResult(getError('format', 'float', val));
            }

            return getResult(null);
        };
        pub.integer = function (val) {
            if (typeof val !== 'string' || !revalidator.validate.formats['integer'].test(val)) {
                return getResult(getError('format', 'integer', val));
            }

            return getResult(null);
        };
        pub.empty = function (val) {
            if (!revalidator.validate.formats['empty'].test(val)) {
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

        var i;
        var keys = Object.keys(revalidator.validate.types);
        var length = keys.length;

        for (i = 0; i < length; i++) {
            pub[keys[i]] = getValidationFunctionForTypesByKey(keys[i]);
        }

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
        return function (value) {
            return functions[key](value).valid;
        };
    }

    function getValidationFunctionForTypesByKey (key) {
        return function (value) {
            if (revalidator.validate.types[key](value)){
                return getResult(null);
            } else {
                return getResult(getError('type', key, value));
            }
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
