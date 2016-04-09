/*global describe, it, expect */
var val = require('../lib/lx-valid');
var bson = require('bson');

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
        var ObjectID = require('bson').ObjectID;
        var res = val.formats.mongoId(new ObjectID());
        var res1 = val.types.mongoId('507f191e810c19729de860ea');
        var res2 = val.types.mongoId(123);
        var res3 = val.types.mongoId(null);
        var res4 = val.types.mongoId({id: '123', _bsontype: 'ObjectID'});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res1.valid).toBe(false);
        expect(res1.errors.length).toBe(1);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(false);
        expect(res4.errors.length).toBe(1);

        expect(val.isMongoId(new ObjectID())).toBeTruthy();
        expect(val.isMongoId('507f191e810c19729de860ea')).toBeFalsy();
        expect(val.isMongoId(123)).toBeFalsy();
        expect(val.isMongoId(null)).toBeFalsy();
        expect(val.isMongoId(['507f191e810c19729de860ea'])).toBeFalsy();
        expect(val.isMongoId(['507f191e810c19729de860ea', '507f191e810c19729de860ea'])).toBeFalsy();
        expect(val.isMongoId({a: '507f191e810c19729de860ea'})).toBeFalsy();
    });

    it('should validate a DBRef correctly', function () {
        // mongoId
        var ref1 = new bson.DBRef('testCollection', new bson.ObjectID());
        var ref2 = new bson.DBRef('testCollection', new bson.ObjectID(), 'testdb');

        var res = val.types.dbRef(ref1);
        var res1 = val.types.dbRef(ref2);
        var res2 = val.types.dbRef(123);
        var res3 = val.types.dbRef(null);
        var res4 = val.types.dbRef({id: '123', _bsontype: 'DBRef'});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(false);
        expect(res4.errors.length).toBe(1);

        expect(val.isDbRef(ref1)).toBeTruthy();
        expect(val.isDbRef(ref2)).toBeTruthy();
        expect(val.isDbRef('507f191e810c19729de860ea')).toBeFalsy();
        expect(val.isDbRef(ref1.toString())).toBeFalsy();
        expect(val.isDbRef(123)).toBeFalsy();
        expect(val.isDbRef(null)).toBeFalsy();
        expect(val.isDbRef([ref1])).toBeFalsy();
        expect(val.isDbRef([ref1, ref2])).toBeFalsy();
        expect(val.isDbRef({a: ref1})).toBeFalsy();
    });

    it('should validate a MinKey correctly', function () {
        // mongoId
        var ref1 = new bson.MinKey();

        var res = val.types.minKey(ref1);
        var res1 = val.types.minKey('123');
        var res2 = val.types.minKey(123);
        var res3 = val.types.minKey(null);
        var res4 = val.types.minKey({id: '123', _bsontype: 'MinKey'});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res1.valid).toBe(false);
        expect(res1.errors.length).toBe(1);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(true);
        expect(res4.errors.length).toBe(0);

        expect(val.isMinKey(ref1)).toBeTruthy();
        expect(val.isMinKey('507f191e810c19729de860ea')).toBeFalsy();
        expect(val.isMinKey(ref1.toString())).toBeFalsy();
        expect(val.isMinKey(123)).toBeFalsy();
        expect(val.isMinKey(null)).toBeFalsy();
        expect(val.isMinKey([ref1])).toBeFalsy();
        expect(val.isMinKey([ref1, ref1])).toBeFalsy();
        expect(val.isMinKey({a: ref1})).toBeFalsy();
    });

    it('should validate a MinKey correctly', function () {
        // mongoId
        var ref1 = new bson.MaxKey();

        var res = val.types.maxKey(ref1);
        var res1 = val.types.maxKey('123');
        var res2 = val.types.maxKey(123);
        var res3 = val.types.maxKey(null);
        var res4 = val.types.maxKey({id: '123', _bsontype: 'MaxKey'});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res1.valid).toBe(false);
        expect(res1.errors.length).toBe(1);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(true);
        expect(res4.errors.length).toBe(0);

        expect(val.isMaxKey(ref1)).toBeTruthy();
        expect(val.isMaxKey('507f191e810c19729de860ea')).toBeFalsy();
        expect(val.isMaxKey(ref1.toString())).toBeFalsy();
        expect(val.isMaxKey(123)).toBeFalsy();
        expect(val.isMaxKey(null)).toBeFalsy();
        expect(val.isMaxKey([ref1])).toBeFalsy();
        expect(val.isMaxKey([ref1, ref1])).toBeFalsy();
        expect(val.isMaxKey({a: ref1})).toBeFalsy();
    });

    it('should validate a Code correctly', function () {
        // mongoId
        var ref1 = new bson.Code('this.x= 1', {});

        var res = val.types.code(ref1);
        var res1 = val.types.code('123');
        var res2 = val.types.code(123);
        var res3 = val.types.code(null);
        var res4 = val.types.code({id: '123', _bsontype: 'Code'});

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res1.valid).toBe(false);
        expect(res1.errors.length).toBe(1);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(false);
        expect(res4.errors.length).toBe(1);

        expect(val.isCode(ref1)).toBeTruthy();
        expect(val.isCode('507f191e810c19729de860ea')).toBeFalsy();
        expect(val.isCode(ref1.toString())).toBeFalsy();
        expect(val.isCode(123)).toBeFalsy();
        expect(val.isCode(null)).toBeFalsy();
        expect(val.isCode([ref1])).toBeFalsy();
        expect(val.isCode([ref1, ref1])).toBeFalsy();
        expect(val.isCode({a: ref1})).toBeFalsy();
    });

    it('should validate nan correctly', function () {
        // float
        var res = val.types.nan(Number.NaN);
        var res2 = val.types.nan(NaN);
        var res3 = val.types.nan(12.34);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(true);
        expect(res2.errors.length).toBe(0);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(val.isNan(NaN)).toBeTruthy();
        expect(val.isNan(12.34)).toBeFalsy();
    });

    it('should validate infinity correctly', function () {
        // float
        var res = val.types.infinity(Infinity);
        var res2 = val.types.infinity(123);
        var res3 = val.types.infinity(12.34);

        expect(res.valid).toBe(true);
        expect(res.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(val.isInfinity(Infinity)).toBeTruthy();
        expect(val.isInfinity(12.34)).toBeFalsy();
    });
});