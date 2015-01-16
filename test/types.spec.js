/*global describe, it, expect */
var val = require('../lib/lx-valid');

describe('Types', function () {
    'use strict';

    it('should validate a string correctly', function () {
        // string
        var res = val.types.string('test');
        var res2 = val.types.string(1);
        var res3 = val.types.string(null);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);
        expect(res3.errors[0].message).toBe('must be of string type');

        expect(val.isString('test')).toBeTruthy();
        expect(val.isString(1)).toBeFalsy();
        expect(val.isString(null)).toBeFalsy();
    });

    it('should validate a number correctly', function () {
        // number
        var res = val.types.number(1);
        var res2 = val.types.number('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isNumber(1)).toBeTruthy();
        expect(val.isNumber('1')).toBeFalsy();
    });

    it('should validate a boolean correctly', function () {
        // boolean
        var res = val.types.boolean(true);
        var res2 = val.types.boolean('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isBoolean(true)).toBeTruthy();
        expect(val.isBoolean('false')).toBeFalsy();
    });

    it('should validate an object correctly', function () {
        // object
        var res = val.types.object({});
        var res2 = val.types.object('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isObject({})).toBeTruthy();
        expect(val.isObject('{}')).toBeFalsy();
    });

    it('should validate undefined correctly', function () {
        // undefined
        var res = val.types.undefined();
        var res2 = val.types.undefined('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isUndefined()).toBeTruthy();
        expect(val.isUndefined('undefined')).toBeFalsy();
    });

    it('should validate an integer correctly', function () {
        // integer
        var res = val.types.integer(123);
        var res2 = val.types.integer(12.3);
        var res3 = val.types.integer(10000000000.5);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(val.isInteger(123)).toBeTruthy();
        expect(val.isInteger('123')).toBeFalsy();
    });

    it('should validate a float correctly', function () {
        // float
        var res = val.types.float(12.34);
        var res2 = val.types.float(123);
        var res3 = val.types.float('12.34');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(val.isFloat(12.34)).toBeTruthy();
        expect(val.isFloat('12.34')).toBeFalsy();
    });

    it('should validate an array correctly', function () {
        // array
        var res = val.types.array([]);
        var res2 = val.types.array({});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isArray([])).toBeTruthy();
        expect(val.isArray('[]')).toBeFalsy();
    });

    it('should validate a date correctly', function () {
        // date
        var res = val.types.date(new Date());
        var res2 = val.types.date({});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isDate(new Date())).toBeTruthy();
        expect(val.isDate('10.10.1999')).toBeFalsy();
    });

    it('should validate a regex correctly', function () {
        // regex
        var res = val.types.regexp(/^hello/);
        var res2 = val.types.regexp('');
        var res3 = val.types.regexp(new RegExp('\\w+'));

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(true);
        expect(res3.errors.length).toBe(0);

        expect(val.isRegexp(/^hello/)).toBeTruthy();
        expect(val.isRegexp(new RegExp('\\w+'))).toBeTruthy();
        expect(val.isRegexp('')).toBeFalsy();
    });

    it('should validate null correctly', function () {
        // null
        var res = val.types.null(null);
        var res2 = val.types.null('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(val.isNull(null)).toBeTruthy();
        expect(val.isNull('null')).toBeFalsy();
    });

    it('should validate a mongoId correctly', function () {
        // mongoId
        var res = val.types.mongoId('507f191e810c19729de860ea');
        var res2 = val.types.mongoId(123);
        var res3 = val.types.mongoId(null);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(val.isMongoId('507f191e810c19729de860ea')).toBeTruthy();
        expect(val.isMongoId(123)).toBeFalsy();
        expect(val.isMongoId(null)).toBeFalsy();
        expect(val.isMongoId(['507f191e810c19729de860ea'])).toBeFalsy();
        expect(val.isMongoId(['507f191e810c19729de860ea', '507f191e810c19729de860ea'])).toBeFalsy();
        expect(val.isMongoId({a: '507f191e810c19729de860ea'})).toBeFalsy();
    });
});