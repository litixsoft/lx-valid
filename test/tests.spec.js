/*global describe, it, expect, runs, beforeEach */
'use strict';

var val = require('../lib/lx-valid');
var typeForTest, dataForConvertTest;
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
            'items': {
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
        'urlTest': {
            'type': 'string',
            'id': 'urlTest',
            'required': false,
            'format': 'url'
        },
        'emailTest': {
            'type': 'string',
            'id': 'emailTest',
            'format': 'email'
        },
        'emptyEmailTest': {
            'type': 'string',
            'id': 'emptyemailTest',
            'format': ['empty', 'email']
        },
        'shortDate': {
            'type': 'string',
            'id': 'shortDateTest',
            'format': 'date'
        },
        'testDate': {
            'type': 'string',
            'id': 'testDateTest',
            'format': ['empty', 'date']
        }
    }
};
var schemaForConvertTest = {
    'properties': {
        '_id': {
            'type': 'string',
            'required': false,
            'format': 'mongo-id'
        },
        'myObject': {
            type: 'object',
            'required': false,
            'properties': {
                '_id1': {
                    'type': 'string',
                    'required': false,
                    'format': 'mongo-id'
                },
                'myObject2': {
                    type: 'object',
                    'required': false,
                    'properties': {
                        '_id2': {
                            'type': 'string',
                            'required': false,
                            'format': 'mongo-id'
                        },
                        'myArray2': {
                            type: 'array',
                            'required': false,
                            items: {
                                'type': 'string',
                                'required': false,
                                'format': 'mongo-id'
                            }
                        }
                    }
                }
            }
        },
        'myArray': {
            type: 'array',
            'required': false,
            items: {
                type: 'object',
                'required': false,
                'properties': {
                    '_id3': {
                        'type': 'string',
                        'required': false,
                        'format': 'mongo-id'
                    },
                    'myObject3': {
                        type: 'object',
                        'required': false,
                        'properties': {
                            '_id4': {
                                'type': 'string',
                                'required': false,
                                'format': 'mongo-id'
                            },
                            'myArray3': {
                                type: 'array',
                                'required': false,
                                'items': {
                                    type: 'object',
                                    'required': false,
                                    properties: {
                                        '_id5': {
                                            'type': 'string',
                                            'required': false,
                                            'format': 'mongo-id'
                                        },
                                        'myArray4': {
                                            type: 'array',
                                            'required': false,
                                            items: {
                                                'type': 'string',
                                                'required': false,
                                                'format': 'mongo-id'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};

function convertJson (val) {
    // json
    var toJsonTypeTest = JSON.stringify(val);
    return JSON.parse(toJsonTypeTest);
}

function convert (format, value) {
    if (typeof value !== 'string') {
        return value;
    }

    if (format === 'mongo-id') {
        return {oid: value};
    }

    if (format === 'date-time') {
        return new Date(value);
    }

    return value;
}

beforeEach(function () {
    typeForTest = {
        UuidTest: '507f191e810c19729de860ea',
        stringTest: '3.31',
        floatTest: 3.2,
        IntTest: 2,
        arrayTest: [1, 2, 3],
        boolTest: true,
        objectTest: {name: 'xenia'},
        nullTest: null,
        dateTest: '1973-06-01T15:49:00.000Z',
        urlTest: 'http://google.de',
        emailTest: 'info@litixsoft.de',
        emptyEmailTest: '',
        shortDate: '1973-06-01',
        testDate: '1973-06-01'
    };

    dataForConvertTest = {
        _id: '507f191e810c19729de860ea',
        myObject: {
            _id1: '507f191e810c19729de860ea',
            myObject2: {
                _id2: '507f191e810c19729de860ea',
                myArray2: [
                    '507f191e810c19729de860ea',
                    '507f191e810c19729de860ea',
                    '507f191e810c19729de860ea'
                ]
            }
        },
        myArray: [
            {
                _id3: '507f191e810c19729de860ea',
                myObject3: {
                    _id4: '507f191e810c19729de860ea',
                    myArray3: [
                        {
                            _id5: '507f191e810c19729de860ea',
                            myArray4: [
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea'
                            ]
                        }
                    ]
                }
            },
            {
                _id3: '507f191e810c19729de860ea',
                myObject3: {
                    _id4: '507f191e810c19729de860ea',
                    myArray3: [
                        {
                            _id5: '507f191e810c19729de860ea',
                            myArray4: [
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea'
                            ]
                        }
                    ]
                }
            },
            {
                _id3: '507f191e810c19729de860ea',
                myObject3: {
                    _id4: '507f191e810c19729de860ea',
                    myArray3: [
                        {
                            _id5: '507f191e810c19729de860ea',
                            myArray4: [
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea',
                                '507f191e810c19729de860ea'
                            ]
                        }
                    ]
                }
            }
        ]
    };
});

describe('Validator', function () {
    it('validate() should return true when type conform schema', function () {
        //typeForTest.arrayTest = [1, 'a', 4];

        var result = val.validate(convertJson(typeForTest), schemaForTest);

        //console.log('result.errors');
        //console.log(result.errors);

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

    describe('validates an array and', function () {
        it('should return valid true when the data is correct', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            };

            var result = val.validate({arr: ['1', '2', '3']}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate({}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate({arr: []}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);
        });

        it('should return valid false when the data is not correct', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            };

            var result = val.validate({arr: [1, 2, 3]}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(3);
            expect(result.errors).toEqual([
                {
                    attribute: 'type',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type',
                    property: 'arr.2'
                },
                {
                    attribute: 'type',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type',
                    property: 'arr.1'
                },
                {
                    attribute: 'type',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type',
                    property: 'arr.0'
                }
            ]);

            result = val.validate({arr: 10}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(1);
            expect(result.errors).toEqual([
                {
                    attribute: 'type',
                    property: 'arr',
                    expected: 'array',
                    actual: 'number',
                    message: 'must be of array type'
                }
            ]);

            schema.properties.arr.required = true;

            result = val.validate([], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(1);
            expect(result.errors).toEqual([
                {attribute: 'required', property: 'arr', expected: true, actual: undefined, message: 'is required'}
            ]);
        });

        it('should validate an array with multipe different values', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: [
                            {
                                type: 'string'
                            },
                            {
                                type: 'number'
                            }
                        ]
                    }
                }
            };

            var result = val.validate({arr: [1, 2, 3]}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate({arr: [1, '2', 3]}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate({arr: [1, '2', true]}, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);
        });

        it('should validate an array when the array is the root element', function () {
            var schema = {
                type: 'array',
                items: {
                    type: 'string'
                }
            };

            var result = val.validate(['1', '2', '3'], schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate([1, 2, 3], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(3);
            expect(result.errors).toEqual([
                {
                    attribute: 'type',
                    property: '2',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type'
                },
                {
                    attribute: 'type',
                    property: '1',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type'
                },
                {
                    attribute: 'type',
                    property: '0',
                    expected: 'string',
                    actual: 'number',
                    message: 'must be of string type'
                }
            ]);
        });

        it('should return the array index in the error message when single array', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            };

            var result = val.validate({arr: ['2', 1, '3', 4, '5']}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(2);
            expect(result.errors[0].property).toBe('arr.3');
            expect(result.errors[1].property).toBe('arr.1');
        });

        it('should return the array index in the error message when array in array', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'array',
                            items: {
                                type: 'string'
                            }
                        }
                    }
                }
            };

            var result = val.validate({arr: [['2', 1, '3'], [4, '5']]}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(2);
            expect(result.errors[0].property).toBe('arr.1.0');
            expect(result.errors[1].property).toBe('arr.0.1');
        });

        it('should return the array index in the error message when object in array', function () {
            var schema = {
                properties: {
                    arr: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: {
                                    type: 'string'
                                },
                                lang: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            name: {
                                                type: 'string'
                                            },
                                            code: {
                                                type: 'integer'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var result = val.validate({
                arr: [
                    {
                        name: '1', lang: [{name: 'de', code: 128}]
                    },
                    {
                        name: '2', lang: [{name: 'en', code: 88}]
                    }
                ]
            }, schema);
            expect(result.valid).toBeTruthy();
            expect(result.errors.length).toBe(0);

            result = val.validate({arr: [{name: 1}, {name: '2'}]}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(1);
            expect(result.errors[0].property).toBe('arr.0.name');

            result = val.validate({
                arr: [
                    {name: '1', lang: [{name: 'de', code: 128}]},
                    {name: '2', lang: [{name: 'en', code: '88'}]}
                ]
            }, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(1);
            expect(result.errors[0].property).toBe('arr.1.lang.0.code');
        });

        it('should return the array index in the error message when array in complex object', function () {
            var schema = {
                properties: {
                    person: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string'
                            },
                            codes: {
                                type: 'array',
                                items: {
                                    type: 'integer'
                                }
                            },
                            addresses: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        street: {
                                            type: 'string'
                                        },
                                        users: {
                                            type: 'array',
                                            items: {
                                                type: 'string'
                                            }
                                        },
                                        frogs: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    name: {
                                                        type: 'string'
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    arrayWithArrays: {
                        type: 'array',
                        items: {
                            type: 'array',
                            items: {
                                type: 'integer'
                            }
                        }
                    }
                }
            };

            var result = val.validate({person: {name: 'wayne', codes: [1, 2, 3]}}, schema);
            expect(result.valid).toBeTruthy();

            result = val.validate({person: {name: 55, codes: [1, 2, 3]}}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('person.name');

            result = val.validate({person: {name: 'wayne', codes: [1, '2', 3]}}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('person.codes.1');

            result = val.validate({
                person: {
                    name: 'wayne',
                    addresses: [{street: '1'}, {street: 2}, {street: '3'}]
                }
            }, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('person.addresses.1.street');

            result = val.validate({
                person: {
                    name: 'wayne',
                    addresses: [{street: '1'}, {street: 2, users: ['a', 'b']}, {street: '3', users: ['a', 5, 'c']}]
                }
            }, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[1].property).toBe('person.addresses.1.street');
            expect(result.errors[0].property).toBe('person.addresses.2.users.1');

            result = val.validate({arrayWithArrays: [[1, 2, 3], [4, '5', 6], ['7', 8, 9]]}, schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('arrayWithArrays.2.0');
            expect(result.errors[1].property).toBe('arrayWithArrays.1.1');

        });

        it('should return the array index in the error message when array in complex object and the array is on root', function () {
            var schema = {
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        codes: {
                            type: 'array',
                            items: {
                                type: 'integer'
                            }
                        },
                        addresses: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    street: {
                                        type: 'string'
                                    },
                                    users: {
                                        type: 'array',
                                        items: {
                                            type: 'string'
                                        }
                                    },
                                    frogs: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: {
                                                    type: 'string'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        arrayWithArrays: {
                            type: 'array',
                            items: {
                                type: 'array',
                                items: {
                                    type: 'integer'
                                }
                            }
                        }
                    }
                }
            };

            var result = val.validate([{name: 'wayne', codes: [1, 2, 3]}], schema);
            expect(result.valid).toBeTruthy();

            result = val.validate([{name: 55, codes: [1, 2, 3]}], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('0.name');

            result = val.validate([{name: 'wayne', codes: [1, '2', 3]}, {
                name: 'wayne',
                codes: [1, 2, 3]
            }, {name: 'wayne', codes: [1, 2, '3', 4]}], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[1].property).toBe('0.codes.1');
            expect(result.errors[0].property).toBe('2.codes.2');

            result = val.validate([{
                name: 'wayne',
                addresses: [{street: '1'}, {street: 2}, {street: '3'}]
            }
            ], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[0].property).toBe('0.addresses.1.street');

            result = val.validate([{
                name: 'wayne',
                addresses: [{street: '1'}, {street: 2, users: ['a', 'b']}, {street: '3', users: ['a', 5, 'c']}]
            }
            ], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[1].property).toBe('0.addresses.1.street');
            expect(result.errors[0].property).toBe('0.addresses.2.users.1');

            result = val.validate([{arrayWithArrays: [[1, 2, 3], [4, '5', 6], ['7', 8, 9]]}, {arrayWithArrays: [[1, 2, 3], [4, 5, 6], ['7', 8, 9]]}], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors[1].property).toBe('0.arrayWithArrays.2.0');
            expect(result.errors[2].property).toBe('0.arrayWithArrays.1.1');
            expect(result.errors[0].property).toBe('1.arrayWithArrays.2.0');

        });

        it('should return the array index in the error message when array in array and the array is in root', function () {
            var schema = {
                items: {
                    type: 'array',
                    items: {
                        type: 'string'
                    }
                }
            };

            var result = val.validate([['2', 1, '3'], [4, '5']], schema);
            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(2);
            expect(result.errors[1].property).toBe('0.1');
            expect(result.errors[0].property).toBe('1.0');
        });
    });

    it('getValidationFunction() should return the validation function', function () {
        var valFn = val.getValidationFunction();
        var data = convertJson(typeForTest);
        var result = valFn(data, schemaForTest);

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);

        // delete required property
        delete data.UuidTest;
        result = valFn(data, schemaForTest, {isUpdate: true});

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);

        result = valFn(null, schemaForTest, {isUpdate: true});

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
    });

    it('validate() should convert if convert function is defined', function () {
        var convertFn = function (format, value) {
            if (format === 'mongo-id') {
                return 'convertedMongoId';
            }

            if (format === 'date-time' || format === 'date') {
                return new Date(value);
            }

            return value;
        };
        var data = convertJson(typeForTest);

        var result = val.validate(data, schemaForTest, {convert: convertFn});
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(data.UuidTest).toBe('convertedMongoId');
        expect(typeof data.dateTest).toBe('object');
        expect(data.dateTest.getFullYear()).toBe(1973);
        expect(data.dateTest).toEqual(new Date('1973-06-01T15:49:00.000Z'));
        expect(data.shortDate).toEqual(new Date('1973-06-01'));
        expect(data.testDate).toEqual(new Date('1973-06-01'));
    });

    it('validate() should convert if convert function and trim option is defined', function () {
        var convertFn = function (format, value) {
            if (format === 'mongo-id') {
                return {oid: 'convertedMongoId'};
            }

            if (format === 'date-time' || format === 'date') {
                return new Date(value);
            }

            return value;
        };
        var data = convertJson(typeForTest);

        var result = val.validate(data, schemaForTest, {convert: convertFn, trim: true});
        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(data.UuidTest).toEqual({oid: 'convertedMongoId'});
        expect(typeof data.dateTest).toBe('object');
        expect(data.dateTest.getFullYear()).toBe(1973);
        expect(data.dateTest).toEqual(new Date('1973-06-01T15:49:00.000Z'));
        expect(data.shortDate).toEqual(new Date('1973-06-01'));
        expect(data.testDate).toEqual(new Date('1973-06-01'));
    });

    it('validate() should not convert if no convert function is defined', function () {
        var result = val.validate(convertJson(typeForTest), schemaForTest);

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(result.convertedObject).toBeUndefined();
    });

    it('validate() should remove properties in object which are no properties of the schema', function () {
        var data = {
            UuidTest: '507f191e810c19729de860ea',
            stringTest: '3.31',
            floatTest: 3.2,
            IntTest: 2,
            arrayTest: [1, 2, 3],
            boolTest: true,
            objectTest: {name: 'xenia'},
            nullTest: null,
            dateTest: '1973-06-01T15:49:00.000Z',
            urlTest: 'http://google.de'
        };

        data.someUnknownProperty = 'wayne';
        data.someUnknownObject = {
            id: 1,
            name: 'wayne'
        };

        var result = val.validate(data, schemaForTest, {deleteUnknownProperties: true});

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(data.someUnknownProperty).toBeUndefined();
        expect(data.someUnknownObject).toBeUndefined();
    });

    it('validate() should override the default validation options with the current options', function () {
        var data = {
            UuidTest: '507f191e810c19729de860ea',
            stringTest: '3.31',
            floatTest: 3.2,
            IntTest: 2,
            arrayTest: [1, 2, 3],
            boolTest: true,
            objectTest: {name: 'xenia'},
            nullTest: null,
            dateTest: '1973-06-01T15:49:00.000Z',
            urlTest: 'http://google.de'
        };

        data.someUnknownProperty = 'wayne';
        data.someUnknownObject = {
            id: 1,
            name: 'wayne'
        };

        var valFunction = val.getValidationFunction({deleteUnknownProperties: true});
        var result = valFunction(data, schemaForTest, {deleteUnknownProperties: false});

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(data.someUnknownProperty).toBe('wayne');
        expect(data.someUnknownObject).toEqual({id: 1, name: 'wayne'});

        result = valFunction(data, schemaForTest);

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);
        expect(data.someUnknownProperty).toBeUndefined();
        expect(data.someUnknownObject).toBeUndefined();
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

    it('validate() should trim the string values when option trim is true', function () {
        var schema = {
                properties: {
                    name: {
                        type: 'string'
                    },
                    names: {
                        type: 'array',
                        items: {
                            type: 'string'
                        }
                    }
                }
            },
            data = {
                name: ' wayne ',
                names: ['wayne', ' chuck', 'norris ', ' wat ']
            };

        var result = val.validate(data, schema);

        expect(result.valid).toBeTruthy();
        expect(data.name).toBe(' wayne ');
        expect(data.names).toEqual(['wayne', ' chuck', 'norris ', ' wat ']);

        result = val.validate(data, schema, {trim: true});

        expect(result.valid).toBeTruthy();
        expect(data.name).toBe('wayne');
        expect(data.names).toEqual(['wayne', 'chuck', 'norris', 'wat']);
    });

    it('validate() should trim the string values when option trim is true', function () {
        var schema = {
                properties: {
                    name: {
                        type: 'string'
                    }
                }
            },
            data = {
                name: null
            };

        var result = val.validate(data, schema);

        expect(result.valid).toBeFalsy();
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toBe('must be of string type');
        expect(result.errors[0].actual).toBe('null');
    });

    it('validate() should validate multiple types and formats', function () {
        var schema = {
            properties: {
                date: {
                    type: ['null', 'string'],
                    format: 'date'
                }
            }
        };

        var result = val.validate({date: '2013-01-09'}, schema);
        var result2 = val.validate({date: null}, schema);
        var result3 = val.validate({date: 'abc'}, schema);
        var result4 = val.validate({date: 123}, schema);

        expect(result.valid).toBeTruthy();
        expect(result2.valid).toBeTruthy();
        expect(result3.valid).toBeFalsy();
        expect(result4.valid).toBeFalsy();
    });

    it('validate() should validate a date type', function () {
        var schema = {
            properties: {
                date: {
                    type: 'date'
                }
            }
        };

        var result = val.validate({date: new Date()}, schema);
        var result2 = val.validate({date: null}, schema);
        var result3 = val.validate({date: 'abc'}, schema);
        var result4 = val.validate({date: 123}, schema);

        expect(result.valid).toBeTruthy();
        expect(result2.valid).toBeFalsy();
        expect(result3.valid).toBeFalsy();
        expect(result4.valid).toBeFalsy();
    });

    it('validate() should validate a regexp type', function () {
        var schema = {
            properties: {
                data: {
                    type: 'regexp'
                }
            }
        };

        var result = val.validate({data: new RegExp('ab+c', 'i')}, schema);
        var result2 = val.validate({data: new RegExp('\\w+')}, schema);
        var result3 = val.validate({data: null}, schema);
        var result4 = val.validate({data: 'abc'}, schema);
        var result5 = val.validate({data: 123}, schema);
        var result6 = val.validate({data: /^b/}, schema);

        expect(result.valid).toBeTruthy();
        expect(result2.valid).toBeTruthy();
        expect(result3.valid).toBeFalsy();
        expect(result4.valid).toBeFalsy();
        expect(result5.valid).toBeFalsy();
        expect(result6.valid).toBeTruthy();
    });

    it('validate() should validate to false when the string values are empty and the option strictRequired is true', function () {
        var schema = {
                properties: {
                    name: {
                        type: 'string',
                        required: true
                    },
                    names: {
                        type: 'array',
                        items: {
                            type: 'string',
                            required: true
                        }
                    }
                }
            },
            data = {
                name: '',
                names: ['wayne', ' chuck', 'norris ', '']
            };

        var result = val.validate(data, schema);

        expect(result.valid).toBeTruthy();

        result = val.validate(data, schema, {strictRequired: true});

        expect(result.valid).toBeFalsy();
        expect(result.errors[0].property).toBe('names.3');
        expect(result.errors[0].message).toBe('is required');
        expect(result.errors[1].property).toBe('name');
        expect(result.errors[1].message).toBe('is required');
    });

    it('validate() should validate to false when the string values are empty and the option strictRequired is true', function () {
        var schema = {
                properties: {
                    name: {
                        type: 'string'
                    },
                    verifiedName: {
                        type: 'string',
                        conform: function (actual, original) {
                            if (actual === original.name) {
                                return true;
                            }

                            return false;
                        }

                    }
                }
            },
            data = {
                name: 'wayne',
                verifiedName: 'wayne'
            },
            data2 = {
                name: 'wayne',
                verifiedName: 'fail'
            };

        var result = val.validate(data, schema);
        var result2 = val.validate(data2, schema);

        expect(result.valid).toBeTruthy();
        expect(result2.valid).toBeFalsy();
    });

    it('asyncValidate() should find already existing values ​​and properly validate', function () {

        // test mock
        var testDb = [
            {userName: 'user1', email: 'user1@test.de'},
            {userName: 'user2', email: 'user2@test.de'}
        ];

        // checkUser validator
        function checkUserName (userName, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].userName === userName) {
                    result.valid = false;
                    result.errors.push({
                        attribute: 'checkUserName',
                        property: 'userName', expected: false, actual: true,
                        message: 'userName already exists'
                    });
                }
            }

            cb(null, result);
        }

        // checkEmail validator
        function checkEmail (email, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].email === email) {
                    result.valid = false;
                    result.errors.push({
                        attribute: 'checkEmail',
                        property: 'email', expected: false, actual: true,
                        message: 'email already exists'
                    });
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
        function checkUserName (userName, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].userName === userName) {
                    result.valid = false;
                    result.errors.push({
                        attribute: 'checkUserName',
                        property: 'userName', expected: false, actual: true,
                        message: 'userName already exists'
                    });
                }
            }

            cb(null, result);
        }

        // checkEmail validator
        function checkEmail (email, cb) {
            var i, max,
                result = {valid: true, errors: []};
            for (i = 0, max = testDb.length; i < max; i += 1) {
                if (testDb[i].email === email) {
                    result.valid = false;
                    result.errors.push({
                        attribute: 'checkEmail',
                        property: 'email', expected: false, actual: true,
                        message: 'email already exists'
                    });
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

    it('should convert the data if convert function is set', function () {
        var result = val.validate(dataForConvertTest, schemaForConvertTest, {convert: convert});
        var convertedMongoId = JSON.stringify({oid: '507f191e810c19729de860ea'});

        expect(result.valid).toBe(true);
        expect(result.errors.length).toBe(0);

        expect(JSON.stringify(dataForConvertTest._id)).toBe(convertedMongoId);
        expect(JSON.stringify(dataForConvertTest.myObject._id1)).toBe(convertedMongoId);
        expect(JSON.stringify(dataForConvertTest.myObject._id1)).toBe(convertedMongoId);
        expect(JSON.stringify(dataForConvertTest.myObject.myObject2._id2)).toBe(convertedMongoId);
        expect(dataForConvertTest.myObject.myObject2.myArray2.length).toBe(3);
        expect(JSON.stringify(dataForConvertTest.myObject.myObject2.myArray2[0])).toBe(convertedMongoId);
        expect(dataForConvertTest.myArray.length).toBe(3);
        expect(JSON.stringify(dataForConvertTest.myArray[0]._id3)).toBe(convertedMongoId);
        expect(JSON.stringify(dataForConvertTest.myArray[0].myObject3._id4)).toBe(convertedMongoId);
        expect(dataForConvertTest.myArray[0].myObject3.myArray3.length).toBe(1);
        expect(JSON.stringify(dataForConvertTest.myArray[0].myObject3.myArray3[0]._id5)).toBe(convertedMongoId);
        expect(dataForConvertTest.myArray[0].myObject3.myArray3[0].myArray4.length).toBe(3);
        expect(JSON.stringify(dataForConvertTest.myArray[0].myObject3.myArray3[0].myArray4[1])).toBe(convertedMongoId);

    });

    describe('.validate()', function () {
        it('should ignore null values when the option "ignoreNullValues" enabled', function () {
            var schema = {
                    properties: {
                        name: {
                            type: 'string'
                        },
                        names: {
                            type: 'array',
                            items: {
                                type: 'number'
                            }
                        },
                        arr: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: {
                                        type: 'string'
                                    },
                                    name1: {
                                        type: 'boolean'
                                    }
                                }
                            }
                        }
                    }
                },
                data = {
                    name: null,
                    names: null
                };

            var result = val.validate(data, schema);

            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(2);

            result = val.validate(data, schema, {ignoreNullValues: true});

            expect(result.valid).toBeTruthy();

            data.name = undefined;
            result = val.validate(data, schema, {ignoreNullValues: true});

            expect(result.valid).toBeTruthy();

            data.arr = [{name: 'test', name1: true}, null, {name: 'test1', name1: false}];
            result = val.validate(data, schema, {ignoreNullValues: true});

            expect(result.valid).toBeTruthy();

            result = val.validate(data, schema);

            expect(result.valid).toBeFalsy();
            expect(result.errors.length).toBe(2);
        });

        it('should call the transform function when "options.transform" is a function', function () {
            var schema = {
                    properties: {
                        name: {
                            type: 'string'
                        },
                        names: {
                            type: 'array',
                            items: {
                                type: 'number'
                            }
                        }
                    }
                },
                data = {
                    name: 'test',
                    names: [1, 2, 3]
                };

            var keys = [];

            function transform (data) {
                keys.push(data.property);
            }

            var result = val.validate(data, schema, {transform: transform});

            expect(result.valid).toBeTruthy();
            expect(keys).toEqual(['name', 'names', 'names', 'names', 'names']);
        });

        it('should validate multiple types and also check for the format if one of the types is "string"', function () {
            var schema = {
                properties: {
                    num: {
                        type: ['string', 'integer'],
                        format: ['number-float']
                    }
                }
            };

            expect(val.validate({num: 3}, schema).valid).toBeTruthy();
            expect(val.validate({num: '3.55'}, schema).valid).toBeTruthy();
            expect(val.validate({num: '3'}, schema).valid).toBeFalsy();
            expect(val.validate({num: 'test'}, schema).valid).toBeFalsy();
        });
    });
});