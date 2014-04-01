/*global describe, it, expect, beforeEach */
'use strict';

var val = require('../lib/lx-valid'),
    schema, data;

describe('revalidator', function () {

    describe('.validate()', function () {

        describe('can have an option cast which', function () {

            describe('can cast an integer when set to true and', function () {
                beforeEach(function () {
                    schema = {
                        properties: {
                            value: {
                                type: 'integer'
                            }
                        }
                    };
                });

                it('should cast to an integer when the value is an integer as string', function () {
                    data = {value: '10'};

                    expect(val.validate({value: 10}, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(10);

                    data = {value: '0'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(0);
                });

                it('should not cast to an integer when the value is a string', function () {
                    data = {value: 'aaa'};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'string',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toBe('aaa');
                });

                it('should not cast to an integer when the value is a float', function () {
                    data = {value: 10.44};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'number',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toBe(10.44);
                });

                it('should not cast to an integer when the value is a boolean', function () {
                    data = {value: true};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'boolean',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toBe(true);
                });

                it('should not cast to an integer when the value is an object', function () {
                    data = {value: {}};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'object',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toEqual({});
                });

                it('should not cast to an integer when the value is a function', function () {
                    var func = function () {};
                    data = {value: func};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'function',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toEqual(func);
                });

                it('should not cast to an integer when the value is null', function () {
                    data = {value: null};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'integer',
                                actual: 'null',
                                message: 'must be of integer type'
                            }
                        ]
                    });
                    expect(data.value).toBeNull();
                });

                it('should not cast to an integer when the value is undefined', function () {
                    data = {value: undefined};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBeUndefined();
                });
            });

            describe('can cast a float when set to true and', function () {
                beforeEach(function () {
                    schema = {
                        properties: {
                            value: {
                                type: 'float'
                            }
                        }
                    };
                });

                it('should cast to a float when the value is a float as string', function () {
                    data = {value: '10.1'};

                    expect(val.validate({value: 10.11}, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(10.1);

                    data = {value: '0.11'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(0.11);
                });

                it('should not cast to a float when the value is a string', function () {
                    data = {value: 'aaa'};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'string',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toBe('aaa');
                });

                it('should not cast to a float when the value is an integer', function () {
                    data = {value: 10};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'number',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toBe(10);
                });

                it('should not cast to a float when the value is a boolean', function () {
                    data = {value: true};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'boolean',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toBe(true);
                });

                it('should not cast to a float when the value is an object', function () {
                    data = {value: {}};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'object',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toEqual({});
                });

                it('should not cast to a float when the value is a function', function () {
                    var func = function () {};
                    data = {value: func};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'function',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toEqual(func);
                });

                it('should not cast to a float when the value is null', function () {
                    data = {value: null};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'float',
                                actual: 'null',
                                message: 'must be of float type'
                            }
                        ]
                    });
                    expect(data.value).toBeNull();
                });

                it('should not cast to a float when the value is undefined', function () {
                    data = {value: undefined};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBeUndefined();
                });
            });

            describe('can cast a number when set to true and', function () {
                beforeEach(function () {
                    schema = {
                        properties: {
                            value: {
                                type: 'number'
                            }
                        }
                    };
                });

                it('should cast to an number when the value is an integer as string', function () {
                    data = {value: '10'};

                    expect(val.validate({value: 10}, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(10);

                    data = {value: '0'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(0);

                    data = {value: '5.88'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(5.88);
                });

                it('should not cast to a number when the value is a string', function () {
                    data = {value: 'aaa'};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'number',
                                actual: 'string',
                                message: 'must be of number type'
                            }
                        ]
                    });
                    expect(data.value).toBe('aaa');
                });

                it('should not cast to a number when the value is a boolean', function () {
                    data = {value: true};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'number',
                                actual: 'boolean',
                                message: 'must be of number type'
                            }
                        ]
                    });
                    expect(data.value).toBe(true);
                });

                it('should not cast to a number when the value is an object', function () {
                    data = {value: {}};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'number',
                                actual: 'object',
                                message: 'must be of number type'
                            }
                        ]
                    });
                    expect(data.value).toEqual({});
                });

                it('should not cast to a number when the value is a function', function () {
                    var func = function () {};
                    data = {value: func};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'number',
                                actual: 'function',
                                message: 'must be of number type'
                            }
                        ]
                    });
                    expect(data.value).toEqual(func);
                });

                it('should not cast to a number when the value is null', function () {
                    data = {value: null};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'number',
                                actual: 'null',
                                message: 'must be of number type'
                            }
                        ]
                    });
                    expect(data.value).toBeNull();
                });

                it('should not cast to a number when the value is undefined', function () {
                    data = {value: undefined};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBeUndefined();
                });
            });

            describe('can cast a boolean when set to true and', function () {
                beforeEach(function () {
                    schema = {
                        properties: {
                            value: {
                                type: 'boolean'
                            }
                        }
                    };
                });

                it('should cast to a boolean when the value is "true" or "false"', function () {
                    data = {value: 'true'};

                    expect(val.validate({value: true}, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(val.validate({value: false}, schema, {cast: true})).toEqual({valid: true, errors: []});

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(true);

                    data = {value: 'false'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(false);
                });

                it('should cast to a boolean when the value is 0 or 1', function () {
                    data = {value: 1};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(true);

                    data = {value: 0};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(false);
                });

                it('should cast to a boolean when the value is "0" or "1"', function () {
                    data = {value: '1'};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(true);

                    data = {value: '0'};
                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBe(false);
                });

                it('should not cast to a boolean when the value is a string', function () {
                    data = {value: 'aaa'};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'boolean',
                                actual: 'string',
                                message: 'must be of boolean type'
                            }
                        ]
                    });
                    expect(data.value).toBe('aaa');
                });

                it('should not cast to a boolean when the value is a float', function () {
                    data = {value: 10.44};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'boolean',
                                actual: 'number',
                                message: 'must be of boolean type'
                            }
                        ]
                    });
                    expect(data.value).toBe(10.44);
                });

                it('should not cast to a boolean when the value is an object', function () {
                    data = {value: {}};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'boolean',
                                actual: 'object',
                                message: 'must be of boolean type'
                            }
                        ]
                    });
                    expect(data.value).toEqual({});
                });

                it('should not cast to a boolean when the value is a function', function () {
                    var func = function () {};
                    data = {value: func};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'boolean',
                                actual: 'function',
                                message: 'must be of boolean type'
                            }
                        ]
                    });
                    expect(data.value).toEqual(func);
                });

                it('should not cast to a boolean when the value is null', function () {
                    data = {value: null};

                    expect(val.validate(data, schema, {cast: true})).toEqual({
                        valid: false,
                        errors: [
                            {
                                attribute: 'type',
                                property: 'value',
                                expected: 'boolean',
                                actual: 'null',
                                message: 'must be of boolean type'
                            }
                        ]
                    });
                    expect(data.value).toBeNull();
                });

                it('should not cast to a boolean when the value is undefined', function () {
                    data = {value: undefined};

                    expect(val.validate(data, schema, {cast: true})).toEqual({valid: true, errors: []});
                    expect(data.value).toBeUndefined();
                });
            });

            it('should not cast when the option is set to false', function () {
                schema = {
                    properties: {
                        int: {
                            type: 'integer'
                        },
                        number: {
                            type: 'number'
                        },
                        boolean: {
                            type: 'boolean'
                        },
                        float: {
                            type: 'float'
                        }
                    }
                };
                data = {int: '10', number: '1.00', boolean: 'true', float: '3.33'};
                var res = val.validate(data, schema);

                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(4);
                expect(data.int).toBe('10');
                expect(data.number).toBe('1.00');
                expect(data.float).toBe('3.33');
                expect(data.boolean).toBe('true');
            });
        });

        describe('.conform()', function () {
            it('should check if a property conforms a condition', function () {
                schema = {
                    properties: {
                        name: {
                            type: 'string'
                        },
                        verifiedName: {
                            type: 'string',
                            conform: function (actual, original) {
                                return actual !== '' && original.name !== '' && !!actual;
                            }
                        }
                    }
                };

                data = {name: 'wayne', verifiedName: 'wayne'};
                expect(val.validate(data, schema)).toEqual({valid: true, errors: []});
                data = {name: undefined, verifiedName: undefined};
                var res = val.validate(data, schema);
                expect(res.valid).toBeFalsy();
            });
        });
    });

});