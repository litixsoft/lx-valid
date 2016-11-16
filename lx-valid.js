/*!
 * lx-valid - v1.2.4 - 2016-11-16
 * https://github.com/litixsoft/lx-valid
 *
 * Copyright (c) 2016 Litixsoft GmbH
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
    function getType(value) {
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
    function validate(object, schema, options) {
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

        // handle array root element
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
                return typeof (value) === 'number' && value >= 0;
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
        'luuid': /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
        'number-float': /^[\-\+]?\b(\d+[.]\d+$)$/,
        'float': /^[\-\+]?\b(\d+[.]\d+$)$/,
        'integer': /^[\-\+]?[0-9]+$/,
        'timestamp': /^[0-9-]+,[\s]*[0-9-]+/,
        'empty': /^$/
    };

    /**
     *
     */
    validate.formatExtensions = {
        'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
    };

    validate.types = {
        string: function (value) {
            return getType(value) === 'string';
        },
        number: function (value) {
            return getType(value) === 'number';
        },
        boolean: function (value) {
            return getType(value) === 'boolean';
        },
        date: function (value) {
            return getType(value) === 'date';
        },
        regexp: function (value) {
            return getType(value) === 'regexp';
        },
        array: function (value) {
            return getType(value) === 'array';
        },
        object: function (value) {
            return getType(value) === 'object';
        },
        integer: function (value) {
            return getType(value) === 'number' && Math.floor(value) === value;
        },
        float: function (value) {
            return getType(value) === 'number' && new RegExp(validate.formats.float).exec(value);
        },
        null: function (value) {
            return getType(value) === 'null';
        },
        undefined: function (value) {
            return getType(value) === 'undefined';
        },
        any: function (value) {
            return value !== undefined;
        },
        mongoId: function (value) {
            return value && typeof value === 'object' && value._bsontype === 'ObjectID' && validate.formats['mongo-id'].test(value);
        },
        dbRef: function (value) {
            return value && typeof value === 'object' && value._bsontype === 'DBRef' && !!value.namespace && validate.types.string(value.namespace) && !!value.oid;
        },
        minKey: function (value) {
            return value && typeof value === 'object' && value._bsontype === 'MinKey';
        },
        maxKey: function (value) {
            return value && typeof value === 'object' && value._bsontype === 'MaxKey';
        },
        code: function (value) {
            return value && typeof value === 'object' && value._bsontype === 'Code' && !!value.code && validate.types.string(value.code) && !!value.scope && typeof value.scope === 'object';
        },
        infinity: function (value) {
            return getType(value) === 'infinity';
        },
        nan: function (value) {
            return getType(value) === 'nan';
        }
    };

    function setValueInArray(data, oldValue, newValue) {
        if (getType(data) === 'array') {
            // find item in array
            var index = data.indexOf(oldValue);

            if (index > -1) {
                // set value directly
                data[data.indexOf(oldValue)] = newValue;
            } else {
                var i = 0;
                var length = data.length;

                // set value recursively
                for (i; i < length; i++) {
                    setValueInArray(data[i], oldValue, newValue);
                }
            }
        }
    }

    function getTypeCheckFunction(type) {
        var result = validate.types[type];

        if (!result) {
            result = validate.types[type.toLowerCase()];
        }

        return result;
    }

    function mixin(obj) {
        var sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
            var source = sources.shift();
            if (!source) { continue; }

            if (typeof (source) !== 'object') {
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

    function validateObject(object, schema, options, errors) {
        var props, p, allProps = Object.keys(object),
            visitedProps = [], requiredArray = [];

        // required array (schema draft 4)
        if (getType(schema.required) === 'array') {
            requiredArray = schema.required;
        } else if (getType(schema._required) === 'array') {
            requiredArray = schema._required;
        }

        // see 5.2
        if (schema.properties) {
            props = schema.properties;

            for (p in props) {
                if (props.hasOwnProperty(p) && getType(props[p]) === 'object') {
                    var propertySchema = props[p];

                    if (requiredArray.indexOf(p) > -1) {
                        // save required array of current property
                        propertySchema._required = propertySchema.required || [];

                        // set required to true for validation
                        propertySchema.required = true;
                    }

                    visitedProps.push(p);
                    validateProperty(object, object[p], p, props[p], options, errors);
                } else {
                    console.log('Schema invalid. Property ' + p + ' is not of type object, actual type: ' + getType(props[p]));
                }
            }
        }

        // see 5.3
        if (schema.patternProperties) {
            props = schema.patternProperties;
            for (p in props) {
                if (props.hasOwnProperty(p) && getType(props[p]) === 'object') {
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
                } else {
                    console.log('Schema invalid. Property ' + p + ' is not of type object, actual type: ' + getType(props[p]));
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

    function validateProperty(object, value, property, schema, options, errors) {
        var format, valid, spec, i, l;
        var isRequired = schema.required === true;

        function constrain(name, value, assert) {
            if (schema[name] !== undefined && !assert(value, schema[name], object)) {
                error(name, property, value, schema, errors);
            }
        }

        if (options.ignoreNullValues && value === null && !isRequired) {
            return;
        }

        // check for values of type string and option strictRequired
        if (typeof value === 'string' && options.strictRequired === true && isRequired) {
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
            } else if (isRequired && schema.type !== 'any') {
                return error('required', property, undefined, schema, errors);
            } else {
                constrain('conform', value, function (a, e, o) { return e(a, o); });
                return;
            }
        }

        if (options.cast) {
            if ('integer' === schema.type || 'number' === schema.type || 'float' === schema.type) {
                if (value !== null && typeof value !== 'boolean' && !isNaN(+value)) {
                    if (getType(object[property]) === 'array') {
                        setValueInArray(object[property], value, +value);
                    } else {
                        object[property] = +value;
                    }

                    value = +value;
                }
            }

            if ('boolean' === schema.type) {
                if ('true' === value || '1' === value || 1 === value) {
                    if (getType(object[property]) === 'array') {
                        setValueInArray(object[property], value, true);
                    } else {
                        object[property] = true;
                    }

                    value = true;
                }

                if ('false' === value || '0' === value || 0 === value) {
                    if (getType(object[property]) === 'array') {
                        setValueInArray(object[property], value, false);
                    } else {
                        object[property] = false;
                    }

                    value = false;
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

        /* jshint ignore:start */
        if (schema['enum']) {
            if (value === null && isArray(schema.type) && schema.type.indexOf('null') > -1) {
                // is allowed
            } else if (schema['type'] === 'array' && isArray(value)) {
                for (i = 0; i < value.length; i++) {
                    if (schema['enum'].indexOf(value[i]) === -1) {
                        error('enum', property, value, schema, errors);
                        break;
                    }
                }
            } else if (schema['enum'].indexOf(value) === -1) {
                error('enum', property, value, schema, errors);
            }
        }
        /* jshint ignore:end */

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

    function checkType(val, type, callback) {
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

    function error(attribute, property, actual, schema, errors) {
        var lookup = { expected: schema[attribute], actual: actual, attribute: attribute, property: property };
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

    function isArray(value) {
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
    (typeof (window) === 'undefined' ? module.exports : (window.json = window.json || {}));

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
        pub.luuid = function (val) {
            if (!revalidator.validate.formats['luuid'].test(val)) {
                return getResult(getError('format', 'luuid', val));
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
        pub.timestamp = function (val) {
            if (!revalidator.validate.formats['timestamp'].test(val)) {
                return getResult(getError('format', 'timestamp', val));
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
                        // set property required to false
                        schema.properties[keys[i]].required = false;

                        // remove property from required array
                        if (Array.isArray(schema.required) && schema.required.indexOf(keys[i]) > -1) {
                            schema.required.splice(schema.required.indexOf(keys[i]), 1);
                        }
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
