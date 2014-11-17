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
            if (!revalidator.validate.formatExtensions['mongo-id'].test((val || '').toString())) {
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
