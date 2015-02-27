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
