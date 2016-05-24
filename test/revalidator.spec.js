/*global describe, it, expect, beforeEach */
'use strict';

var val = require('../lib/lx-valid'),
    schema, data;

describe('revalidator', function () {

    describe('.validate()', function () {

        it('should handle a custom error message', function () {
            schema = {
                properties: {
                    name: {
                        type: 'string',
                        messages: {
                            type: '%{property}:%{attribute} Not a %{expected} type'
                        }
                    }
                }
            };

            var res = val.validate({name: 5}, schema);
            expect(res.valid).toBeFalsy();
            expect(res.errors[0].message).toBe('name:type Not a string type');

            schema.properties.name.messages.type += ', actual: %{actual}';

            res = val.validate({name: 5}, schema);
            expect(res.valid).toBeFalsy();
            expect(res.errors[0].message).toBe('name:type Not a string type, actual: number');
        });

        it('should handle uniqueItems', function () {
            schema = {
                properties: {
                    tags: {
                        type: 'array',
                        uniqueItems: true,
                        items: {
                            type: 'string'
                        }
                    }
                }
            };

            var res = val.validate({tags: ['a', 'b', 'c']}, schema);
            expect(res.valid).toBeTruthy();

            res = val.validate({tags: ['a', 'b', 'b']}, schema);
            expect(res.valid).toBeFalsy();

            schema.properties.tags.uniqueItems = false;

            res = val.validate({tags: ['a', 'b', 'b']}, schema);
            expect(res.valid).toBeTruthy();
        });

        it('should handle convert function in arrays', function () {
            schema = {
                properties: {
                    demo: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'mongo-id'
                        }
                    }
                }
            };

            var data = {demo: ['511106fc574d81d815000001', '511106fc574d81d815000001', '511106fc574d81d815000001']};

            function convert (format, value) {
                if (format === 'mongo-id') {
                    return 1;
                }

                return value;
            }

            var res = val.validate(data, schema, {convert: convert});

            expect(res.valid).toBeTruthy();
            expect(data.demo[0]).toBe(1);
            expect(data.demo[1]).toBe(1);
            expect(data.demo[2]).toBe(1);
            expect(data.demo.length).toBe(3);
        });

        it('should handle convert function in arrays when array is root element ', function () {
            schema = {
                type: 'array',
                items: {
                    type: 'string',
                    format: 'mongo-id'
                }
            };

            var data = ['511106fc574d81d815000001', '511106fc574d81d815000001', '511106fc574d81d815000001'];

            function convert (format, value) {
                if (format === 'mongo-id') {
                    return 1;
                }

                return value;
            }

            var res = val.validate(data, schema, {convert: convert});

            expect(res.valid).toBeTruthy();
            expect(data[0]).toBe(1);
            expect(data[1]).toBe(1);
            expect(data[2]).toBe(1);
            expect(data.length).toBe(3);
        });

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
                    var func = function () {
                    };
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
                    var func = function () {
                    };
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
                    var func = function () {
                    };
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
                    var func = function () {
                    };
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

        describe('can have an option "unknownProperties" which', function () {
            it('should ignore properties not defined in schema when set to "ignore"', function () {
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
                data = {int: 10, a: 3, b: '4'};
                var res = val.validate(data, schema);

                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.a).toBe(3);
                expect(data.b).toBe('4');

                res = val.validate(data, schema, {unknownProperties: 'ignore'});

                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.a).toBe(3);
                expect(data.b).toBe('4');
            });

            it('should delete properties not defined in schema when set to "delete"', function () {
                schema = {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: true,
                        properties: {
                            name: {
                                type: 'string',
                                maxLength: 10
                            },
                            id: {
                                type: 'integer'
                            }
                        }
                    }
                };
                data = [{id: 1, name: 'a'}, {id: 2, name: 'b', pwd: 33}, {id: 3, name: 'c', aaa: 'eee'}];
                var res = val.validate(data, schema, {unknownProperties: 'delete'});

                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data[0].id).toBe(1);
                expect(data[0].name).toBe('a');
                expect(data[1].id).toBe(2);
                expect(data[1].name).toBe('b');
                expect(data[1].pwd).toBeUndefined();
                expect(data[2].id).toBe(3);
                expect(data[2].name).toBe('c');
                expect(data[2].aaa).toBeUndefined();
            });

            it('should delete properties not defined in schema when set to "delete"', function () {
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
                data = {int: 10, a: 3, b: '4'};
                var res = val.validate(data, schema, {unknownProperties: 'delete'});

                expect(res.valid).toBeTruthy();
                expect(res.errors.length).toBe(0);
                expect(data.a).not.toBeDefined();
                expect(data.b).not.toBeDefined();
            });

            it('should return errors when properties not defined in schema when set to "error"', function () {
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
                data = {int: 10, a: 3, b: '4'};
                var res = val.validate(data, schema, {unknownProperties: 'error'});

                expect(res.valid).toBeFalsy();
                expect(res.errors.length).toBe(2);
                expect(res.errors[0]).toEqual({
                    attribute: 'unknown',
                    property: 'a',
                    expected: undefined,
                    actual: 3,
                    message: 'is not defined in schema'
                });
                expect(res.errors[1]).toEqual({
                    attribute: 'unknown',
                    property: 'b',
                    expected: undefined,
                    actual: '4',
                    message: 'is not defined in schema'
                });
                expect(data.a).toBe(3);
                expect(data.b).toBe('4');
            });
        });

        it('should not return errors when properties not defined in schema but defined in patternProperties when set to "error"', function () {
            schema = {
                patternProperties: {
                    '^\\d+$': {
                        type: 'integer'
                    }
                }
            };
            data = {'42': 5, '43': 'a', foo: 5};
            var res = val.validate(data, schema, {unknownProperties: 'error'});

            expect(res.valid).toBeFalsy();
            expect(res.errors.length).toBe(2);
            expect(res.errors[0]).toEqual({
                attribute: 'type',
                property: '43',
                expected: 'integer',
                actual: 'string',
                message: 'must be of integer type'
            });
            expect(res.errors[1]).toEqual({
                attribute: 'unknown',
                property: 'foo',
                expected: undefined,
                actual: 5,
                message: 'is not defined in schema'
            });
        });

        it('should validate properties when schema itself has properties which are not of type object', function () {
            schema = {
                properties: {
                    a: undefined,
                    b: {type: 'string'}
                }
            };
            data = {a: 'a', b: 'b', c: 'c'};
            var res = val.validate(data, schema, {});

            expect(res.valid).toBeTruthy();
            expect(Object.keys(data).length).toBe(3);
        });

        it('should validate properties when schema itself has properties which are not of type object and remove properties which have schema with invalid properties', function () {
            schema = {
                properties: {
                    a: undefined,
                    b: {type: 'string'},
                    d: []
                }
            };
            data = {a: 'a', b: 'b', c: 'c', d: 'd'};
            var res = val.validate(data, schema, {unknownProperties: 'delete'});

            expect(res.valid).toBeTruthy();
            expect(Object.keys(data).length).toBe(1);
        });

        it('should allow to extends the formats', function () {
            var validator = require('../lib/lx-valid');
            var data = {
                validISO8601: '5'
            };
            var schema = {
                properties: {
                    validISO8601: {
                        type: 'string',
                        format: 'iso8601-date'
                    }
                }
            };
            var options = {
                convert: function (format, value) {
                    if (format === 'iso8601-date') {
                        return new Date(value);
                    }
                    return value;
                }
            };

            // add format iso-date
            validator.formats['iso8601-date'] = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
            validator.extendFormat('iso8601-date', /^[0-9]$/);

            var result = validator.validate(data, schema, options);

            expect(result.valid).toBeTruthy();
            expect(data.validISO8601 instanceof Date).toBeTruthy();
        });

        it('should handle the required array', function () {
            var schema = {
                '$schema': 'http://json-schema.org/draft-04/schema#',
                'description': '',
                'type': 'object',
                'properties': {
                    'Id': {
                        'type': 'string',
                        'minLength': 1
                    },
                    'Name': {
                        'type': 'string',
                        'minLength': 1
                    },
                    'Location': {
                        'type': 'object',
                        'properties': {
                            'Name': {
                                'type': 'string',
                                'minLength': 1
                            },
                            'Latitude': {
                                'type': 'number'
                            },
                            'Longitude': {
                                'type': 'number'
                            },
                            'Elevation': {
                                'type': 'number'
                            }
                        },
                        'required': ['Name', 'Longitude']
                    },
                    'Metadata': {
                        'type': 'object',
                        'properties': {}
                    },
                    'Tags': {
                        'type': 'array',
                        'items': {
                            'properties': {
                                'Name': {
                                    'type': 'string',
                                    'minLength': 1
                                },
                                'Id': {
                                    'type': 'number'
                                }
                            },
                            'required': ['Name', 'Id']
                        }
                    }
                },
                'required': [
                    'Name',
                    'Location'
                ]
            };
            var data = {Id: '1', Location:{}, Tags:[{}]};

            var res = val.validate(data, schema);

            expect(res.valid).toBeFalsy();
            expect(res.errors.length).toBe(5);
            expect(res.errors[0].attribute).toBe('required');
            expect(res.errors[0].property).toBe('Name');
            expect(res.errors[1].attribute).toBe('required');
            expect(res.errors[1].property).toBe('Location.Name');
            expect(res.errors[2].attribute).toBe('required');
            expect(res.errors[2].property).toBe('Location.Longitude');
            expect(res.errors[3].attribute).toBe('required');
            expect(res.errors[3].property).toBe('Tags.0.Name');
            expect(res.errors[4].attribute).toBe('required');
            expect(res.errors[4].property).toBe('Tags.0.Id');
        });
    });
});