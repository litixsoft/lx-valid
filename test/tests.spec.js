/*global describe, it, expect, runs */
var val = require('../lib/lx-valid');

var typeForTest = {
    UuidTest: '507f191e810c19729de860ea',
    stringTest: '3.31',
    floatTest: 3.2,
    IntTest: 2,
    arrayTest: [1, 2, 3],
    boolTest: true,
    objectTest: {name: 'xenia'},
    nullTest: null,
    dateTest: new Date(),
    urlTest: 'http://google.de'
};

var schemaForTest = {
    'type': 'object',
    '$schema': 'http://json-schema.org/draft-03/schema',
    'id': '#',
    'required': false,
    'properties': {
        'UuidTest': {
            'type': 'string',
            'id': 'UuidTest',
            'required': true,
            'format': 'mongo-id'
        },
        'IntTest': {
            'type': 'integer',
            'id': 'IntTest',
            'required': false
        },
        'arrayTest': {
            'type': 'array',
            'id': 'arrayTest',
            'required': false,
            'maxItems': 3,
            'items':
            {
                'type': 'integer',
                'id': '0',
                'required': false
            }
        },
        'boolTest': {
            'type': 'boolean',
            'id': 'boolTest',
            'required': false
        },
        'dateTest': {
            'type': 'string',
            'id': 'dateTest',
            'required': false,
            'format': 'date-time'
        },
        'floatTest': {
            'type': 'number',
            'id': 'floatTest',
            'required': false,
            'format': 'number-float'

        },
        'nullTest': {
            'type': 'null',
            'id': 'nullTest',
            'required': false
        },
        'objectTest': {
            'type': 'object',
            'id': 'objectTest',
            'required': false,
            'properties': {
                'name': {
                    'type': 'string',
                    'id': 'name',
                    'required': false,
                    'minLength': 1,
                    'pattern': 'xen?.a'
                }
            }
        },
        'stringTest': {
            'type': 'string',
            'id': 'stringTest',
            'required': false
        },
        'urlTest' : {
            'type': 'string',
            'id': 'urlTest',
            'required': false,
            'format': 'url'
        }
    }
};

function convertJson(val) {
    'use strict';

    // json
    var toJsonTypeTest = JSON.stringify(val);
    return JSON.parse(toJsonTypeTest);
}

describe('Validator', function () {
    'use strict';

    it('validate() should return true when type conform schema', function () {
        var result = val.validate(convertJson(typeForTest), schemaForTest);

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    it('validate() should validate an int correctly', function () {
        var oldIntTest = typeForTest.IntTest;
        typeForTest.IntTest = '12973219837';

        var result = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(1);

        typeForTest.IntTest = oldIntTest;

        var result2 = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result2.valid).toBe(true);
        expect(result2.errors.length).toBe(0);
    });

    it('validate() should validate an object correctly', function () {
        var old = typeForTest.objectTest;
        typeForTest.objectTest = {name: 'timo'};

        var result = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(1);

        typeForTest.objectTest = old;

        var result2 = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result2.valid).toBe(true);
        expect(result2.errors.length).toBe(0);
    });

    it('validate() should validate a string correctly', function () {
        var oldType = typeForTest.stringTest,
            oldSchema = schemaForTest.properties.stringTest,
            stringTest = 'Test24Test',
            wrongStringTest = 'TestTest',
            testFormat = /^Test[0-9]{2}Test$/;

        schemaForTest.properties.stringTest.format = 'test-format';

        expect(function () { val.extendFormat(); }).toThrow();
        expect(function () { val.extendFormat(1); }).toThrow();
        expect(function () { val.extendFormat('test'); }).toThrow();
        expect(function () { val.extendFormat('test', 'test'); }).toThrow();
        expect(function () { val.extendFormat('email', 'test'); }).toThrow();

        // set new format
        val.extendFormat('test-format', testFormat);

        // test wrong value
        typeForTest.stringTest = wrongStringTest;
        var result = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBe(1);

        // valid test
        typeForTest.stringTest = stringTest;
        var result2 = val.validate(convertJson(typeForTest), schemaForTest);
        expect(result2.valid).toBe(true);
        expect(result2.errors.length).toBe(0);

        typeForTest.stringTest = oldType;
        schemaForTest.properties.stringTest = oldSchema;
    });

    it('asyncValidate() should find already existing values ​​and properly validate', function () {

        // test mock
        var testDb = [
            {userName: 'user1', email: 'user1@test.de'},
            {userName: 'user2', email: 'user2@test.de'}
        ];

        // checkUser validator
        function checkUserName(userName, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].userName === userName) {
                    result.valid = false;
                    result.errors.push({attribute: 'checkUserName',
                        property: 'userName', expected: false, actual: true,
                        message: 'userName already exists'});
                }
            }

            cb(null, result);
        }

        // checkEmail validator
        function checkEmail(email, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].email === email) {
                    result.valid = false;
                    result.errors.push({attribute: 'checkEmail',
                        property: 'email', expected: false, actual: true,
                        message: 'email already exists'});
                }
            }

            cb(null, result);
        }

        var valResult = {valid: true, errors: []},
            flag, value;

        // register async validator
        val.asyncValidate.register(checkUserName, 'user1');
        val.asyncValidate.register(checkEmail, 'user1@test.de');

        // async validate
        runs(function () {
            flag = false;
            val.asyncValidate.exec(valResult, function (err, res) {
                if (err) {
                    value = err;
                }
                else {
                    value = res;
                }

                flag = true;
            });
        });

        runs(function () {
            expect(value.valid).toBe(false);
            expect(value.errors.length).toBe(2);
        });
    });

    it('asyncValidate() should not validate existing values ​​correctly', function () {

        // test mock
        var testDb = [
            {userName: 'user33', email: 'user33@test.de'}
        ];

        // checkUser validator
        function checkUserName(userName, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].userName === userName) {
                    result.valid = false;
                    result.errors.push({attribute: 'checkUserName',
                        property: 'userName', expected: false, actual: true,
                        message: 'userName already exists'});
                }
            }

            cb(null, result);
        }

        // checkEmail validator
        function checkEmail(email, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].email === email) {
                    result.valid = false;
                    result.errors.push({attribute: 'checkEmail',
                        property: 'email', expected: false, actual: true,
                        message: 'email already exists'});
                }
            }

            cb(null, result);
        }

        var valResult = {valid: true, errors: []},
            flag, value;

        // register async validator
        val.asyncValidate.register(checkUserName, 'user1');
        val.asyncValidate.register(checkEmail, 'user1@test.de');

        // async validate
        runs(function () {
            flag = false;
            val.asyncValidate.exec(valResult, function (err, res) {
                if (err) {
                    value = err;
                }
                else {
                    value = res;
                }

                flag = true;
            });
        });

        runs(function () {
            expect(value.valid).toBe(true);
            expect(value.errors.length).toBe(0);
        });
    });
});