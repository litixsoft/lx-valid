<a name"0.5.4"></a>
### 0.5.4 (2015-06-25)


#### Bug Fixes

* Proper support for patternProperties used with unknownProperties ([37c29993](https://github.com/litixsoft/lx-valid/commit/37c29993))


<a name"0.5.3"></a>
### 0.5.3 (2015-05-15)


#### Features

* add format uuid ([c5a5fd9a](https://github.com/litixsoft/lx-valid/commit/c5a5fd9a))
* add format integer ([5f3e5746](https://github.com/litixsoft/lx-valid/commit/5f3e5746))


<a name="0.5.2"></a>
### 0.5.2 (2015-02-27)

#### Features

* Add format integer ([210d8a5](https://github.com/litixsoft/lx-valid/commit/210d8a5eba9af4352f697da7bbc2213fe8bd3470))


<a name="0.5.1"></a>
### 0.5.1 (2015-02-27)


#### Features

* Save nested error messages in correct order ([058dad77](https://github.com/litixsoft/lx-valid/commit/058dad7791b7ea8b3371162857564d659a57b24a))


<a name="0.5.0"></a>
## 0.5.0 (2015-02-18)


#### Features

* add type mongoId to validate a MongoDB ObjectID in the schema ([d7db65cd](https://github.com/litixsoft/lx-valid/commit/d7db65cdb7f18f306631a5304c7e4bcf6790a588))
* add support for bower ([e072a5f3](https://github.com/litixsoft/lx-valid/commit/e072a5f316454af113c04cf8a552124943a0cd3c))


#### Bug Fixes

* validate.formats.numberFloat() handled a number as valid ([d7db65cd](https://github.com/litixsoft/lx-valid/commit/d7db65cdb7f18f306631a5304c7e4bcf6790a588))


#### Breaking Changes

* The option "deleteUnknownProperties" is removed. Use option "unknownProperties" instead. ([d7db65cd](https://github.com/litixsoft/lx-valid/commit/d7db65cdb7f18f306631a5304c7e4bcf6790a588))


<a name="0.4.3"></a>
### 0.4.3 (2015-02-18)


#### Bug Fixes

* type "mongoId" is now detected correctly ([0f99abe9](https://github.com/litixsoft/lx-valid/commit/0f99abe9c2719ce5d95719d20dd78e116bbcd0ca))


<a name="0.4.2"></a>
### 0.4.2 (2015-02-14)


#### Bug Fixes

* remove option "deleteUnknownProperties" from default options ([a039964a](https://github.com/litixsoft/lx-valid/commit/a039964a94516b1703de78cfab6182d87086c5b4), closes [#5](https://github.com/litixsoft/lx-valid/issues/5))


<a name="0.4.1"></a>
### 0.4.1 (2015-01-28)


#### Bug Fixes

* convert function is now working correctly for arrays which are at root level ([24cf5a78](https://github.com/litixsoft/lx-valid/commit/24cf5a78763d8765ae3c2634c5e9301dbcfbb70b))


<a name="0.4.0"></a>
## 0.4.0 (2015-01-17)


#### Features

* add option "unknownProperties" which replaces option deleteUnknownProperties ([8b07288c](https://github.com/litixsoft/lx-valid/commit/8b07288c59264ba95a36b82f249072ae22117d91), closes [#3](https://github.com/litixsoft/lx-valid/issues/3))


#### Breaking Changes

* The option "deleteUnknownProperties" is now deprecated and will be removed in v0.5.0
 ([8b07288c](https://github.com/litixsoft/lx-valid/commit/8b07288c59264ba95a36b82f249072ae22117d91))


<a name="0.3.0"></a>
## 0.3.0 (2015-01-16)

Merge some pull request from the [revalidator](https://github.com/flatiron/revalidator) repo. Thanks to all the contributors there.


#### Bug Fixes

* handle uniqueItems is false for array correctly ([a8c523e5](https://github.com/litixsoft/lx-valid/commit/a8c523e5c25c679b56bb2e707519001c6220cd06))
* patternProperties subjected to additionalProperties constraint ([c8138da3](https://github.com/litixsoft/lx-valid/commit/c8138da3a6acf6e2ca4dd3e2e1a812e79bc84a4e))


#### Features

* patternProperties that provide errors now provide the property name rather than  ([5be31575](https://github.com/litixsoft/lx-valid/commit/5be31575d802f73e49cb236a57b68883d554d3f4))
* use Math.floor() instead of ~~ for integer type check ([31dc62a2](https://github.com/litixsoft/lx-valid/commit/31dc62a2ff7e347f64ff35710876e1616931f523))
* errors use dot notation for properties ([51f42f4e](https://github.com/litixsoft/lx-valid/commit/51f42f4ed24e78faf5fa2f86b36035ab427566d0))
* Make 'actual' available to custom error messages ([87415f6e](https://github.com/litixsoft/lx-valid/commit/87415f6e0db78ca03dacb14c40467896a90e613a))


<a name="0.2.18"></a>
### 0.2.18 (2015-01-05)


### Bug Fixes

* add dist folder to git


<a name="0.2.17"></a>
### 0.2.17 (2014-12-10)


#### Features

* add option ignoreNullValues ([548ab06a](https://github.com/litixsoft/lx-valid/commit/548ab06a512e6a38a72a0f24a8a1e3e4be99b6d4))
* add optional function transform to options ([548ab06a](https://github.com/litixsoft/lx-valid/commit/548ab06a512e6a38a72a0f24a8a1e3e4be99b6d4))


<a name="0.2.16"></a>
### 0.2.16 (2014-11-17)


#### Bug Fixes

* type validator for mongoId now returns false if the value is an array ([3a7587b1](https://github.com/litixsoft/lx-valid/commit/3a7587b14c1b1c8525cd191ba02d87e1571e127f))


#### Features

* export validator.types function for shorter syntax ([974f6867](https://github.com/litixsoft/lx-valid/commit/974f68672628d41e7a0d9b88cb531065f47540df))


<a name="0.2.15"></a>
### 0.2.15 (2014-07-23)


#### Features

* add type regexp to schema validation ([d40293df](https://github.com/litixsoft/lx-valid/commit/d40293dfdc36681e0b2277137c235f02e8aeda51))


<a name="0.2.14"></a>
### 0.2.14 (2014-04-04)


#### Bug Fixes

* test for type mongoid can now handle null and undefined values ([b898a00a](https://github.com/litixsoft/lx-valid/commit/b898a00a0323115798d15a9acc263adba8641d79))


<a name="0.2.13"></a>
### 0.2.13 (2014-04-01)


#### Bug Fixes

* enum validation when type is array ([0f0ca957](https://github.com/litixsoft/lx-valid/commit/0f0ca95784eae37ef4130d413b3c6254d6fe3a38))
* show the correct type of tha actual value in the validation error message ([7a23f225](https://github.com/litixsoft/lx-valid/commit/7a23f225500a79bc4a423b81f862fe33cf55f4b5))


#### Features

* add support for arrays as root element ([47608b88](https://github.com/litixsoft/lx-valid/commit/47608b8834d5d9875b6d0dd3ebe4ca350be65eaa))


<a name="0.2.12"></a>
### 0.2.12 (2014-02-19)


#### Bug Fixes

* change handling of validation options in getValidationFunction() so that now the ([7cbc70d1](https://github.com/litixsoft/lx-valid/commit/7cbc70d1da858c514baf3a3de4b6258ebf0f6da1))


<a name="0.2.11"></a>
### 0.2.11 (2014-02-18)


#### Bug Fixes

* fix error in getValidationFunction() that the options are not merged ([c9f42ec0](https://github.com/litixsoft/lx-valid/commit/c9f42ec0675dab2afd36120b6217a9914c1a5e6e))


<a name="v0.2.10"></a>
### v0.2.10 (2013-12-13)


#### Features

* add support for type date in schema ([24bda29d](https://github.com/litixsoft/lx-valid/commit/24bda29d6c7c904204c2fcc36f00e9ce9aba9d43))

### v0.2.9
* Allow multiple types and format validation

### v0.2.8
* Include revalidator in project
* Improve code style
* Execute conform function when value is undefined
* Data object is updated when cast option is true and a value is casted
* Add more tests
* Update devDependencies

### v0.2.7
* Update revalidator dependency
* Update .gitignore and .npmignore

### v0.2.6
* Update revalidator dependency
* Add tests

### v0.2.5
* Fix error in IE when using the javascript keywords null and enum (pub.null is now pub['null'])

### v0.2.4
* add new format 'empty'
* update dependency revalidator
* add support to validate an array of formats

### v0.2.3
* add type mongoId

### v0.2.2
* add helper function to get validation function

### v0.2.1
* update revalidator dependency
* add option for removing properties from object which are not defined in the schema
* add option to convert properties by the format defined in the schema

### v0.2.0
* asynchronous validation

### v0.1.4
* update grunt to v0.4
* rewrite unit test with jasmine-node

### v0.1.3
* integrate grunt
* refactor for jsHint

### v0.1.2
* remove exceptions in rules

### v0.1.1
* updated documentation
* german documentation

### v0.1.0 initial
* JSON schema validation
* simple API for accessing all validation function without JSON schema
* additional validation formats mongo-id and number-float
* functionality for extending validation formats with custom ones