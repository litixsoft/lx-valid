<a name="0.2.17"></a>
### 0.2.17 (2014-12-10)


#### Features

* add option ignoreNullValues ([548ab06a](https://github.com/litixsoft/lx-valid/commit/548ab06a512e6a38a72a0f24a8a1e3e4be99b6d4))


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