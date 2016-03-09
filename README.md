# lx-valid
> A JSON schema validator for Node.js/io.js and the client, based on [Flatiron Revalidator](https://github.com/flatiron/revalidator).

> [![NPM version](https://badge.fury.io/js/lx-valid.svg)](http://badge.fury.io/js/lx-valid)
[![Bower version](https://badge.fury.io/bo/lx-valid.svg)](http://badge.fury.io/bo/lx-valid)
[![Build Status](https://secure.travis-ci.org/litixsoft/lx-valid.svg?branch=master)](https://travis-ci.org/litixsoft/lx-valid)
[![david-dm](https://david-dm.org/litixsoft/lx-valid.svg?theme=shields.io)](https://david-dm.org/litixsoft/lx-valid)
[![david-dm](https://david-dm.org/litixsoft/lx-valid/dev-status.svg?theme=shields.io)](https://david-dm.org/litixsoft/lx-valid#info=devDependencies&view=table)

## The idea
Nodejitsu's Revalidator is a great JSON schema validator and therefore the backbone of lx-valid.
But in practice there is often a need for a more general validator for simple checks that works on the client as
well as on the server. The basic concept is to extend Revalidator and create a more complete validation framework
that allows for simple checks without the need of defining a JSON schema and that also supports string filtering and
data type conversion.

## An example
Since lx-valid's core is based on Revalidator, lx-valid is fully compatible to the latter.
You can find more information about Revalidator here: [https://github.com/flatiron/revalidator](https://github.com/flatiron/revalidator).
The Revalidator example showing schema validation works exactly the same with lx-valid:

```js
var val = require('lx-valid'),
    someObject = {
        url: 'http://www.litixsoft.de',
        mission: 'change the world',
        body: 'Chuck Norris'
    },
    schema = {
        properties: {
            url: {
                description: 'Company url',
                type: 'string',
                pattern: '^/[^#%&*{}\\:<>?\/+]+$',
                required: true
            },
            mission: {
                description: 'Company mission',
                type: 'string',
                minLength: 5
            },
            body: {
                description: 'WAT',
                type: 'any',
                default: null
            }
        }
    },
    res = val.validate(someObject, schema);

console.log(res);
```

## Installation

``` bash
npm install lx-valid
```

## Schema validation

For schema validation lx-valid requires an `object` to be validated and a JSON schema.

`lx-valid.validate(obj, schema, options)`

The validate method returns an object with information on the tested object matching the rules from the JSON schema.
In case the validation failed (rules are violated), the returned object also contains an array with the validation errors.

```js
{
    valid: true // or false
    errors: [/* in case valid: false, an array with validation rule violations */]
}
```

##### Available Options
* __validateFormats__: Enforce format constraints ( __default: `true`__ )
* __validateFormatsStrict__: When `validateFormats` is `true` treat unrecognized formats as validation errors ( __default `false`__ )
* __validateFormatExtensions__: When `validateFormats` is `true` also validate formats defined in `validate.formatExtensions`.
This option is used for lx-valid format extensions and additional custom formats. Those are stored in here. ( __default: `true`__ )
* __cast__: Enforce casting of some types (for integers/numbers are only supported) when it's possible,
e.g. `"42" => 42`, but `"forty2" => "forty2"` for the integer type. Modifies the original object. ( __default: `undefined`__ )
* __unknownProperties__: Defines how properties which are not declared in the schema should be handled. ( __default: `ignore`__ )
    * `ignore`: The properties are ignored in validation and are not deleted.
    * `delete`: The properties are deleted.
    * `error`: The properties are treated as error and are not deleted.
* __convert__: Converts a property by the format defined in the schema. Modifies the original object. ( __default: `undefined`__ )
* __trim__: Trims all properties of type `string`. Modifies the original object. ( __default: `false`__ )
* __strictRequired__: Sets validity of empty `string` to `false`. ( __default: `false`__ )
* __ignoreNullValues__: Do not validate properties of type `null`. ( __default: `false`__ )
* __transform__: A `function` that runs for each property. ( __default: `null`__ ) It has one parameter "data" which looks like this:
    * data.object `{object}` - The object which is validated.
    * data.value `{*}` - The value of the current property.
    * data.property `{string}` - The name of the current property.
    * data.schema `{object}` - The schema of the current property.
    * data.options `{object}` - The options of the validation function.
    * data.errors `{array}` - The array with the validation errors which encountered until yet.

### Validation types
For a property an `value` is that which is given as input for validation where as an `expected value` is the value
of the below fields.

#### required
If `true`, the value should not be empty.

#### type
The type of value should be equal to the expected value.

```js
{ type: 'string' }
{ type: 'number' }
{ type: 'integer' }
{ type: 'float' }
{ type: 'array' }
{ type: 'boolean' }
{ type: 'object' }
{ type: 'null' }
{ type: 'regexp' }
{ type: 'any' }
{ type: 'undefined' }
{ type: 'mongoId' }
{ type: 'dbRef' }
{ type: 'minKey' }
{ type: 'maxKey' }
{ type: 'code' }
{ type: ['boolean', 'string'] }
```

#### Example for types

```js
var val = require('lx-valid'),
    typeTest = {
        stringTest: "test",
        arrayTest: [1, 2, 3],
        boolTest: "test"
    },
    schemaTest = {
        "properties": {
            "IntTest": {
                "type": "integer",
                "id": "IntTest",
                "required": false
            },
            "arrayTest": {
                "type": "array",
                "id": "arrayTest",
                "required": false,
                "maxItems": 3,
                "items": {
                    "type": "integer",
                    "id": "0",
                    "required": false
                }
            },
            "boolTest": {
                "type": "boolean",
                "id": "boolTest",
                "required": true
            },
            "stringTest": {
                "type": "string",
                "id": "stringTest",
                "required": true
            }
        }
    },
    res = val.validate(typeTest, schemaTest);

console.log(res);
```

The integer value and the array are not required to be present in the tested object,
so there will be no errors concerning the missing intTest property. The boolTest however will fail since the
the expected type is `boolean` while the property contains a `string`.

### Validation rules

#### pattern
The expected value regex needs to be satisfied by the value.

```js
{ pattern: /^[a-z]+$/ }
```

#### maxLength  ( string and array )
The length of value must be greater than or equal to expected value.

```js
{ maxLength: 8 }
```

#### minLength ( string and array )
The length of value must be lesser than or equal to expected value.

```js
{ minLength: 8 }
```

#### minimum ( number )
Value must be greater than or equal to the expected value.

```js
{ minimum: 10 }
```

#### maximum ( number )
Value must be lesser than or equal to the expected value.

```js
{ maximum: 10 }
```

#### exclusiveMinimum ( number )
Value must be greater than expected value.

```js
{ exclusiveMinimum: 9 }
```

#### exclusiveMaximum ( number )
Value must be lesser than expected value.

```js
{ exclusiveMaximum: 11 }
```

#### divisibleBy ( number )
Value must be divisible by expected value.

```js
{ divisibleBy: 5 }
{ divisibleBy: 0.5 }
```

#### minItems ( array )
Value must contain more then expected value number of items.

```js
{ minItems: 2 }
```

#### maxItems ( array )
Value must contains less then expected value number of items.

```js
{ maxItems: 5 }
```

#### uniqueItems ( array )
Value must hold a unique set of values.

```js
{ uniqueItems: true }
```

#### enum (array )
Value must be present in the array of expected value.

```js
{ enum: ['month', 'year'] }
```

#### Example for rules

```js
var val = require('lx-valid'),
    typeTest = {
        stringTest: "test",
        arrayTest: [1, 2, 3],
        boolTest: "test"
    },
    schemaTest = {
        "properties": {
            "arrayTest": {
                "type": "array",
                "required": false,
                "maxItems": 3,
                "items": {
                    "type": "integer",
                    "id": "0",
                    "required": false
                }
            }
        }
    },
    res = val.validate(typeTest, schemaTest);

console.log(res);
```

Validation will be successful, since the array contains 3 values, all of integer type.

#### Validation formats
The value should match a valid format. The format is only validated when the value is of type `string`.

```js
{ format: 'mongo-id' }
{ format: 'number-float' }
{ format: 'float' }
{ format: 'integer' }
{ format: 'url' }
{ format: 'email' }
{ format: 'ip-address' }
{ format: 'ipv6' }
{ format: 'date-time' }
{ format: 'date' }
{ format: 'time' }
{ format: 'color' }
{ format: 'host-name' }
{ format: 'utc-millisec' }
{ format: 'regex' }
{ format: 'empty' }
{ format: 'uuid' }
{ format: 'luuid' }
{ format: 'timestamp' }
```

#### Example for format
```js
var val = require('lx-valid'),
    objForTest = {
        UuidTest: "507f191e810c19729de860ea",
        floatTest: 3.2,
        IntTest: 2,
        EmptyEmailTest: ''
    },
    schemaForTest = {
        "properties": {
            "UuidTest": {
                "type": 'string',
                "required": true,
                "format": 'mongo-id'
            },
            "IntTest": {
                "type": "integer",
                "required": false
            },
            "floatTest": {
                "type": "number",
                "required": false,
                "format": 'number-float'
            },
            "ip": {
                "type": "string",
                "format": ['ip-address', 'ipv6']
            },
            "emptyMail": {
                "type": "string",
                "format": ['empty', 'email']
            }
        }
    },
    result = val.validate(objForTest, schemaForTest);

console.log(result);
```

In this case values will be tested against predefined formats. The UuidTest property's value should be a string
matching the format of a MongoDB ObjectId. The floatTest value should be a number matching a float.
If additional characters are added to UuidTest's value, validation fails.
It is also supported to validate an array of formats.

#### Extension by custom formats
Additionally the predefined formats can be extended by custom ones as the following example shows:

```js
var val = require('lx-valid'),
    testFormat = /^Test[0-9]{2}Test$/,
    objForTest = {
        OwnFormatTest: "Test24Test"
    },
    schemaForTest = {
        "properties": {
            "OwnFormatTest": {
                "type": 'string',
                "required": true,
                "format": 'test-format'
            }
        }
    };

try {
    val.extendFormat('test-format', testFormat);
}
catch (e) {
    console.log(e);
}

var res = val.validate(objForTest, schemaForTest);
console.log(res);
```

After extending the validator with the custom format it's accessible by any schema anytime.
Custom formats can be registered with the validator only once. At this point an exception will be thrown in case
a format already exists with the same key. This will be subject to change in future versions.

### "Conform" custom validation
Value must conform to constraint denoted by expected value. Conform allows for extensive validation.
A conform validator is a function accepting the value to the validated as single parameter.
The return value of the function must be boolean `true` or `false`. The conform function is also executed for undefined values.

```js
{
    conform: function (v) {
        if (v % 3 == 1) {
            return true;
        }
        return false;
    }
}
```

```js
{
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
```

### Dependencies
Value is valid only if the dependent value is valid.

```js
{
    town: {
        required: true,
        dependencies: 'country'
    },
    country: {
        required: true,
        maxLength: 3
    }
}
```

### Nested Schema
We also allow nested schema.

```js
{
    properties: {
        title: {
            required: true,
            type: 'string',
            maxLength: 140
        },
        author: {
            type: 'object',
            required: true,
            properties: {
                name: {
                    required: true,
                    type: 'string'
                },
                email: {
                    type: 'string',
                    format: 'email'
                }
            }
        }
    }
}
```

### Custom Messages
We also allow custom message for different constraints.

```js
{
    type: 'string',
    format: 'url',
    conform: function (value, instance) { ... },
    messages: {
        type: 'Not a string type',
        format: 'Expected format is a url',
        conform: 'Failed to pass custom validation',
        message: 'This can be used as a global message'
    }
}
```

### Convert option
Converts a property by the format defined in the schema. Modifies the original object.

```js
var data = {
        birthdate: '1979-03-01T15:55:00.000Z'
    },
    schema = {
        properties: {
            birthdate: {
                type: 'string',
                format: 'date-time'
            }
        }
    },
    convertFn = function (format, value) {
        if (format === 'date-time') {
            return new Date(value);
        }

        return value;
    },
    res = validate(data, schema, {convert: convertFn});

// birthdate was converted
console.log(typeof data.birthdate === 'object'); // true
```
### Schema validation when updating data
When working with db's, you often update data. Sometimes you send just a part of the data and the the schema validation will be false because some required fields may be missing.
To prevent this there is an option `isUpdate`. When set to `true` all required fields in the schema which are not part of the data are set to `required: false`.
There is a helper function to get the validate function with this update check.

```js
var val = require('lx-valid'),
    data = {name: 'wayne'},
    schema = {
        properties: {
            id: {
                type: 'int',
                required: true
            },
            name: {
                type: 'string',
                required: false
            }
        }
    },

    valFn = val.getValidationFunction(),
    res = valFn(data, schema, {isUpdate: true});

console.log(res.valid); // true
console.log(res.errors.length); // 0
```

## Validation without schema
There is a simple API allowing for testing types, rules and formats without having to define a schema.

* `lx-valid.formats.<formatname>(value)`
* `lx-valid.types.<typename>(value)`
* `lx-valid.rules.<rulename>(value)`

An object is returned that contains information on the tested value matching the rule.
In case of rule violation the returned object contains an array with the validation errors.

```js
{
    valid: true // or false
    errors: [/* in case valid: false, an array with validation rule violations */]
}
```

### Types
The types in lx-valid are additions to the JSON schema types to support all JavaScript value types.

`lx-valid.types.<rulename>(value)` // returns the full validation object

or

`lx-valid.isType(value)` // returns boolean

#### JSON schema types
```js
{ type: 'string' }
{ type: 'number' }
{ type: 'integer' }
{ type: 'array' }
{ type: 'boolean' }
{ type: 'object' }
{ type: 'null' }
{ type: 'any' }
{ type: ['boolean', 'string'] }
```

#### lx-valid types
```js
{ type: 'string' }
{ type: 'number' }
{ type: 'boolean' }
{ type: 'object' }
{ type: 'undefined' }
{ type: 'integer' }
{ type: 'float' }
{ type: 'array' }
{ type: 'date' }
{ type: 'regexp' }
{ type: 'null' }
{ type: 'mongoId' }
{ type: 'dbRef' }
{ type: 'minKey' }
{ type: 'maxKey' }
{ type: 'code' }
```

All JSON schema types are supported and additionally all JavaScript types.

#### integer
```js
var res = val.types.integer(123);
val.isInteger(123);
```

#### float
```js
var res = val.types.float(12.3);
val.isFloat(12.3);
```

#### regexp
```js
var res = val.types.regexp(/^hello/);
val.isRegexp(/^hello/);
```

#### date
```js
var res = val.types.date(new Date());
is.isDate(new Date());
```

There are more examples to be found in [test/types.spec.js](test/types.spec.js).

### Formats
Just like in JSON schema validation, values can be tested against predefined formats.

`lx-valid.formats.<formatname>(value)`

```js
{ format: 'mongoId' }
{ format: 'numberFloat' }
{ format: 'float' }
{ format: 'integer' }
{ format: 'url' }
{ format: 'email' }
{ format: 'ipAddress' }
{ format: 'ipv6' }
{ format: 'dateTime' }
{ format: 'date' }
{ format: 'time' }
{ format: 'color' }
{ format: 'hostName' }
{ format: 'utcMillisec' }
{ format: 'regex' }
{ format: 'empty' }
{ format: 'uuid' }
{ format: 'luuid' }
{ format: 'timestamp' }
```

#### ipAddress
```js
var res1 = val.formats.ipAddress("192.168.1.10");
```

#### ipv6
```js
var res1 = val.formats.ipv6("2001:0db8:85a3:08d3:1319:8a2e:0370:7344");
```

#### dateTime
```js
var res1 = val.formats.dateTime("2013-01-09T12:28:03.150Z");
```

More examples can be found in [test/formats.spec.js](test/formats.spec.js)

### Rules
Of course the API also supports testing against rules.

`lx-valid.rules.<rulename>(value,ruleValue)`

```js
{ pattern: /^[a-z]+$/ }
{ maxLength: 8 }
{ minLength: 8 }
{ minimum: 10 }
{ maximum: 10 }
{ exclusiveMinimum: 9 }
{ exclusiveMaximum: 11 }
{ divisibleBy: 5 }
{ minItems: 2 }
{ maxItems: 5 }
{ uniqueItems: true }
{ enum: ['month', 'year'] }
```

#### maxLength
```js
var res = val.rules.maxLength("test",4);
```

#### minLength
```js
var res = val.rules.minLength("test",2);
```

#### divisibleBy
```js
var res = val.rules.divisibleBy(6,3);
```

More examples are to be found in [test/rules.spec.js](test/rules.spec.js)

## Asynchronous validation
The Asynchronous validation consists of registration of validators and the execution of validators.

* `lx-valid.asyncValidate.register(function, value)`
* `lx-valid.asyncValidate.exec(validationResult, callback)`

`lx-valid.asyncValidate.exec` executes the registered validators in parallel.

It is best practice to first execute the schema validation and than execute the asynchronous validation.
The result of schema validation is passed to the asynchronous validation.

```js
// json schema validate
var val = require('lx-valid'),
    valResult = val.validate(doc, schema);

// register async validator
val.asyncValidate.register(function1, value1);
val.asyncValidate.register(function2, value2);

// async validate
val.asyncValidate.exec(valResult, callback);
```

More examples are to be found in [test/tests.spec.js](test/tests.spec.js)

## Development
The lx-valid validator is currently under development. Scheduled functions are implemented step by step.
Please refer to the changelog and roadmap for further information on development progress.

## Author
[Litixsoft GmbH](http://www.litixsoft.de)

## License
(The MIT License)

Copyright (C) 2013-2016 Litixsoft GmbH info@litixsoft.de

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
