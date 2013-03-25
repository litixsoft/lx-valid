/*global describe, it, expect */
var val = require('../lib/lx-valid');

describe('Rules', function () {
    'use strict';

    it('should validate the max length correctly', function () {
        // param check
        var paramCheck = val.rules.maxLength();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.maxLength('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.maxLength([]);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.maxLength('', '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.maxLength('test', 4);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.maxLength('test', 2);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the min length correctly', function () {
        // param check
        var paramCheck = val.rules.minLength();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.minLength('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.minLength([]);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.minLength('', '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.minLength('test', 4);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.minLength('test', 5);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the minimum correctly', function () {
        // param check
        var paramCheck = val.rules.minimum();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.minimum('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.minimum(2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.minimum(2, '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.minimum(5, 5);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.minimum(5, 6);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the maximum correctly', function () {
        // param check
        var paramCheck = val.rules.maximum();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.maximum('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.maximum(2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.maximum(2, '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.maximum(4, 5);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.maximum(5, 4);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the exclusive minimum correctly', function () {
        // param check
        var paramCheck = val.rules.exclusiveMinimum();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.exclusiveMinimum('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.exclusiveMinimum(2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.exclusiveMinimum(2, '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.exclusiveMinimum(5, 4);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.exclusiveMinimum(5, 5);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the exclusive maximum correctly', function () {
        // param check
        var paramCheck = val.rules.exclusiveMaximum();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.exclusiveMaximum('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.exclusiveMaximum(2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.exclusiveMaximum(2, '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.exclusiveMaximum(4, 5);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.exclusiveMaximum(5, 5);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the divisibleBy correctly', function () {
        // param check
        var paramCheck = val.rules.divisibleBy();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.divisibleBy('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.divisibleBy(2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.divisibleBy(2, '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.divisibleBy(6, 3);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.divisibleBy(5, 2);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the min items correctly', function () {
        // param check
        var paramCheck = val.rules.minItems();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.minItems('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.minItems([]);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.minItems([], '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.minItems([1, 2, 3], 2);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.minItems([1, 2, 3], 4);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the max items correctly', function () {
        // param check
        var paramCheck = val.rules.maxItems();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.maxItems('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.maxItems([]);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        var paramCheck4 = val.rules.maxItems([], '');
        expect(paramCheck4.valid).toBe(false);
        expect(paramCheck4.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.maxItems([1, 2, 3], 4);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.maxItems([1, 2, 3], 2);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the unique items correctly', function () {
        // param check
        var paramCheck = val.rules.uniqueItems();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.uniqueItems('');
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.uniqueItems([1, 2, 3]);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.uniqueItems([1, 2, 3, 3]);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });

    it('should validate the enum correctly', function () {
        // param check
        var paramCheck = val.rules.enum();
        expect(paramCheck.valid).toBe(false);
        expect(paramCheck.errors.length).toBe(1);

        var paramCheck2 = val.rules.enum(1);
        expect(paramCheck2.valid).toBe(false);
        expect(paramCheck2.errors.length).toBe(1);

        var paramCheck3 = val.rules.enum(1, 2);
        expect(paramCheck3.valid).toBe(false);
        expect(paramCheck3.errors.length).toBe(1);

        // validate check

        // ok
        var valCheck = val.rules.enum(3, [1, 2, 3]);
        expect(valCheck.valid).toBe(true);
        expect(valCheck.errors.length).toBe(0);

        // error
        var valCheck2 = val.rules.enum(4, [1, 2, 3]);
        expect(valCheck2.valid).toBe(false);
        expect(valCheck2.errors.length).toBe(1);
    });
});