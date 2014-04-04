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
    });

    it('should validate a number correctly', function () {
        // number
        var res = val.types.number(1);
        var res2 = val.types.number('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a boolean correctly', function () {
        // boolean
        var res = val.types.boolean(true);
        var res2 = val.types.boolean('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate an object correctly', function () {
        // object
        var res = val.types.object({});
        var res2 = val.types.object('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate undefined correctly', function () {
        // undefined
        var res = val.types.undefined();
        var res2 = val.types.undefined('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate an integer correctly', function () {
        // integer
        var res = val.types.integer(123);
        var res2 = val.types.integer(12.3);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
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
    });

    it('should validate an array correctly', function () {
        // array
        var res = val.types.array([]);
        var res2 = val.types.array({});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a date correctly', function () {
        // date
        var res = val.types.date(new Date());
        var res2 = val.types.date({});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a regex correctly', function () {
        // regex
        var res = val.types.regexp(/^hello/);
        var res2 = val.types.regexp('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate null correctly', function () {
        // null
        var res = val.types.null(null);
        var res2 = val.types.null('');

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a mongoId correctly', function () {
        // null
        var res = val.types.mongoId('507f191e810c19729de860ea');
        var res2 = val.types.mongoId(123);
        var res3 = val.types.mongoId(null);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);
    });
});