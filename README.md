lx-valid [![Build Status](https://travis-ci.org/litixsoft/lx-valid.png?branch=master)](https://travis-ci.org/litixsoft/lx-valid)
===========
A validator for Node.js and the client, based on Flatiron Revalidator.

### available languages:
* english
* [german](https://github.com/litixsoft/lx-valid/blob/master/doc/german.md)

## The concept
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
var val = require('lx-valid');
console.dir(val.validate(someObject,
{
    properties: {
      url: {
        description: 'the url the object should be stored at',
        type: 'string',
        pattern: '^/[^#%&*{}\\:<>?\/+]+$',
        required: true
      },
      challenge: {
        description: 'a means of protecting data (insufficient for production, used as example)',
        type: 'string',
        minLength: 5
      },
      body: {
        description: 'what to store at the url',
        type: 'any',
        default: null
      }
    }
  }));
```

## Installation

``` bash
npm install lx-valid
```

## Usage

### Schema validation
For schema validation lx-valid requires an object to be validated and a JSON schema.

**lx-valid.validate(obj, schema, optionen).**

The validate method returns an object with information on the tested object matching the rules from the JSON schema.
In case the validation failed (rules are violated), the returned object also contains an array with the validation errors.

```js
{
  valid: true // or false
  errors: [/* in case valid: false, an array with validation rule violations */]
}
```

##### Available Options
* validateFormats: Enforce format constraints (_default true_)
* validateFormatsStrict: When validateFormats is true treat unrecognized formats as validation errors (_default false_)
* validateFormatExtensions: When validateFormats is true also validate formats defined in validate.formatExtensions.
This option is used for lx-valid format extensions and additional custom formats. Those are stored in here. (_default true_)
* cast: Enforce casting of some types (for integers/numbers are only supported) when it's possible,
e.g. "42" => 42, but"forty2" => "forty2" for the integer type.
* __deleteUnknownProperties__: Deletes all properties from object which are not declared in the schema. (_default false_)
* __convert__: Converts a property by the format defined in the schema. Modifies the original object. (_default undefined_)

For a property an  value  is that which is given as input for validation where as an  expected value  is the value
of the below fields.

##### required
If true, the value should not be empty.

##### type
The type of value should be equal to the expected value.

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

##### Example for types

```js
var typeTest = {
    stringTest:"test",
    arrayTest:[1,2,3],
    boolTest:"test"
};
var schemaTest = {
   "properties":{
        "IntTest": {
            "type":"integer",
            "id": "IntTest",
            "required":false
        },
        "arrayTest": {
            "type":"array",
            "id": "arrayTest",
            "required":false,
            "maxItems":3,
            "items":
            {
                "type":"integer",
                "id": "0",
                "required":false
            }
        },
        "boolTest": {
            "type":"boolean",
            "id": "boolTest",
            "required":true
        },
        "stringTest": {
            "type":"string",
            "id": "stringTest",
            "required":true
        }
    }
};
var val = require('lx-valid');
var res = val.validate(typeTest,schemaTest);
console.log(res);
```

The integer value and the array are not required to be present in the tested object,
so there will be no errors concerning the missing intTest property. The boolTest however will fail since the
the expected type is boolean while the property contains a string.

### Validation rules

#### pattern
The expected value regex needs to be satisfied by the value.

```js
{ pattern: /^[a-z]+$/ }
```

#### maxLength  ( string und array )
The length of value must be greater than or equal to expected value.

```js
{ maxLength: 8 }
```

#### minLength ( string und array )
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
var typeTest = {
    stringTest:"test",
    arrayTest:[1,2,3],
    boolTest:"test"
};
var schemaTest = {
   "properties":{
        "arrayTest": {
            "type":"array",
            "required":false,
            "maxItems":3,
            "items":
            {
                "type":"integer",
                "id": "0",
                "required":false
            }
        }
    }
};

var val = require('lx-valid');
var res = val.validate(typeTest,schemaTest);
console.log(res);
```

Validation will be successful, since the array contains 3 values, all of integer type.

#### Validation formats
The value should match a valid format.

```js
{ format: 'mongo-id' }
{ format: 'number-format' }
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
```

##### Example for format

```js
var val = require('lx-valid');
var objForTest = {
    UuidTest:"507f191e810c19729de860ea",
    floatTest:3.2,
    IntTest:2
};
var schemaForTest = {
    "properties":{
        "UuidTest": {
            "type":'string',
            "required":true,
            "format":'mongo-id'
        },
        "IntTest": {
            "type":"integer",
            "required":false
        },
        "floatTest": {
            "type":"number",
            "required":false,
            "format":'number-float'
        }
    }
}
var result = val.validate(objForTest, schemaForTest);
console.log(result);
```

In this case values will be tested against predefined formats. The UuidTest property's value should be a string
matching the format of a MongoDB ObjectId. The floatTest value should be a number matching a float.
If additional characters are added to UuidTest's value, validation fails.

##### Extension by custom formats
Additionally the predefined formats can be extended by custom ones as the following example shows:

```js
var val = require('lx-valid'),
    testFormat = /^Test[0-9]{2}Test$/;
try {
    val.extendFormat('test-format',testFormat);
}
catch (e) {
    console.log(e);
}
var objForTest = {
    OwnFormatTest:"Test24Test"
};
var schemaForTest = {
    "properties":{
        "OwnFormatTest": {
            "type":'string',
            "required":true,
            "format":'test-format'
        }
    }
}
var result = val.validate(objForTest, schemaForTest);
console.log(result);
```

After extending the validator with the custom format it's accessible by any schema anytime.
Custom formats can be registered with the validator only once. At this point an exception will be thrown in case
a format already exists with the same key. This will be subject to change in future versions.

#### "Conform" custom validation
Value must conform to constraint denoted by expected value. Conform allows for extensive validation.
A conform validator is a function accepting the value to the validated as single parameter.
The return value of the function must be boolean true or false.

```js
{ conform: function (v) {
    if (v%3==1) return true;
    return false;
  }
}
```

#### Dependencies
Value is valid only if the dependent value is valid.

```js
{
  town: { required: true, dependencies: 'country' },
  country: { maxLength: 3, required: true }
}
```

#### Nested Schema
We also allow nested schema.

```js
{
  properties: {
    title: {
      type: 'string',
      maxLength: 140,
      required: true
    },
    author: {
      type: 'object',
      required: true,
      properties: {
        name: {
          type: 'string',
          required: true
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

#### Custom Messages
We also allow custom message for different constraints.

```js
{
  type: 'string',
  format: 'url'
  messages: {
    type: 'Not a string type',
    format: 'Expected format is a url'
  }
{
  conform: function () { ... },
  message: 'This can be used as a global message'
}
```

### Convert option
Converts a property by the format defined in the schema. Modifies the original object.

```js
var data = {
  birthdate: '1979-03-01T15:55:00.000Z'
};

var schema = {
  properties: {
    birthdate: {
      type: 'string',
      format: 'date-time'
    }
  }
};

var convertFn = function(format, value) {
  if (format === 'date-time') {
    return new Date(value);
  }

  return value;
};

var result = validate(data, schema, {convert: convertFn});

// birthdate was converted
typeof data.birthdate === 'object';

```
### Schema validation when updating data
When working with db's, you often update data. Sometimes you send just a part of the data and the the schema validation will be false because some required fields may be missing.
To prevent this there is an option `isUpdate`. When set to `true` all required fields in the schema which are not part of the data are set to `required: false`.
There is a helper function to get the validate function with this update check.

```js
var val = require('lx-valid');
var data = {name: 'wayne'};
var schema = {
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
}

var valFn = val.getValidationFunction();
var result = valFn(data, schema, {isUpdate: true});

expect(result.valid).toBe(true);
expect(result.errors.length).toBe(0);
```

### Validation without schema
There is a simple API allowing for testing types, rules and formats without having to define a schema.

* lx-valid.formats.<formatname>(value)
* lx-valid.types.<typename>(value)
* lx-valid.rules.<rulename>(value)

An object is returned that contains information on the tested value matching the rule.
In case of rule violation the returned object contains an array with the validation errors.

```js
{
  valid: true // oder false
  errors: [/* Array mit Fehlern wenn valid false ist */]
}
```

#### Examples for validation without schema

##### Types
The types in lx-valid are additions to the JSON schema types to support all JavaScript value types.

**lx-valid.types.<typename>(value)**

##### JSON schema types

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

##### lx-valid types

```js
{ type: 'string' }
{ type: 'number' }
{ type: 'boolean' }
{ type: 'object' }
{ type: 'undefined' } *
{ type: 'integer' }
{ type: 'float' } *
{ type: 'array' }
{ type: 'date' } *
{ type: 'regexp' } *
{ type: 'null' } *
```

All JSON schema types are supported and additionally all JavaScript types.

##### integer

```js
var res = val.types.integer(123);
```

##### float

```js
var res = val.types.float(12.3);
```

##### regexp
```js
var res = val.types.regexp(/^hello/);
```

##### date

```js
var res = val.types.date(new Date());
```

There are more examples to be found in test/types.js.

##### Formats
Just like in JSON schema validation, values can be tested against predefined formats.

**lx-valid.formats.<formatname>(value)**

```js
{ format: 'mongo-id' }
{ format: 'number-format' }
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
```

##### ipAddress

```js
var res1 = val.formats.ipAddress("192.168.1.10");
```

##### ipv6

```js
var res1 = val.formats.ipv6("2001:0db8:85a3:08d3:1319:8a2e:0370:7344");
```

##### dateTime

```js
var res1 = val.formats.dateTime("2013-01-09T12:28:03.150Z");
```

More examples can be found in test/formats.js

##### Rules
Of course the API also supports testing against rules.

**lx-valid.rules.<rulename>(value,ruleValue)**

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

##### maxLength

```js
var res = val.rules.maxLength("test",4);
```

##### minLength

```js
var res = val.rules.minLength("test",2);
```

##### divisibleBy

```js
var res = val.rules.divisibleBy(6,3);
```

More examples are to be found in test/rules.js

#### Asyncrone Validierung (ab 0.2.0)
The Asynchronous validation consists of registration of validators and the execution of validators.

**lx-valid.asyncValidate.register(function, parameter)**
**lx-valid.asyncValidate.exec(validationResult, callback)**

lx-valid.asyncValidate.exec leads the added about validators register in parallel.

```js
validationResult = {
    valid: true,
    errors: []
};
```

It is best to carry out the validation by schema validation.
The result of schema validation is passed to the asynchronous validation.

```js
// json schema validate
var valResult = val.validate(doc, schema);

// register async validator
val.asyncValidate.register(function1, userName);
val.asyncValidate.register(function2, email);

// async validate
val.asyncValidate.exec(valResult, cb);
```

More examples are to be found in test/tests.spec.js

## Development
The lx-valid validator is currently under development. Scheduled functions are implemented step by step.
Please refer to the change list and roadmap for further information on development progress.

## Roadmap

### v0.3.0

* Changes through the integration into a production project
* filtering and sanitising of string

## Change List

### v0.2.3 update
* add type mongoId

### v0.2.2 update
* add helper function to get validation function

### v0.2.1 update
* update revalidator dependency
* add option for removing properties from object which are not defined in the schema
* add option to convert properties by the format defined in the schema

### v0.2.0 update
* asynchronous validation

### v0.1.4 update
* update grunt to v0.4
* rewrite unit test with jasmine-node

### v0.1.3 update
* integrate grunt
* refactor for jsHint

### v0.1.2 update
* remove exceptions in rules

### v0.1.1 update

* updated documentation
* german documentation

### v0.1.0 initial

* JSON schema validation
* simple API for accessing all validation function without JSON schema
* additional validation formats mongo-id and number-float
* functionality for extending validation formats with custom ones

(The MIT License)

Copyright (C) 2013 Litixsoft GmbH info@litixsoft.de

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
