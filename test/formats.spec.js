/*global describe, it, expect */
var val = require('../lib/lx-valid');

describe('Formats', function () {
    'use strict';

    it('should validate an email correctly', function () {
        var res1 = val.formats.email('test@gmail.com');
        var res2 = val.formats.email('test-gmail.com');
        var res3 = val.formats.email('');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);
    });

    it('should validate an ip-address correctly', function () {
        var res1 = val.formats.ipAddress('192.168.1.10');
        var res2 = val.formats.ipAddress('not ip');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate an ipv6-address correctly', function () {
        var res1 = val.formats.ipv6('2001:0db8:85a3:08d3:1319:8a2e:0370:7344');
        var res2 = val.formats.ipv6('ipv6', '192.168.10.20');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a date-time correctly', function () {
        var res1 = val.formats.dateTime('2013-01-09T12:28:03.150Z');
        var res2 = val.formats.dateTime('2013-01-09');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a date correctly', function () {
        var res1 = val.formats.date('2013-01-09');
        var res2 = val.formats.date('09.01.2013');
        var res3 = val.formats.date('234');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);
    });

    it('should validate a time correctly', function () {
        var res1 = val.formats.time('13:57:12');
        var res2 = val.formats.time('test');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a color correctly', function () {
        var res1 = val.formats.color('#deb887');
        var res2 = val.formats.color('test');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a host-name correctly', function () {
        var res1 = val.formats.hostName('google.de');
        var res2 = val.formats.hostName('');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate an utc-millisec correctly', function () {
        var res1 = val.formats.utcMillisec(1234);
        var res2 = val.formats.utcMillisec('');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a regex correctly', function () {
        var res1 = val.formats.regex(/^hello$/);
        var res2 = val.formats.regex(1);

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate an url correctly', function () {
        var res1 = val.formats.url('http://google.de');
        var res2 = val.formats.url('google');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);
    });

    it('should validate a mongo-id correctly', function () {
        var ObjectID = require('bson').ObjectID;
        var res1 = val.formats.mongoId(new ObjectID());
        var res2 = val.formats.mongoId('511106fc574d81d815000001');
        var res3 = val.formats.mongoId('google');

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(true);
        expect(res2.errors.length).toBe(0);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);
    });

    it('should validate a float number correctly', function () {
        var res1 = val.formats.numberFloat(2.66);
        var res2 = val.formats.numberFloat(3);
        var res3 = val.formats.numberFloat('2.88');
        var res4 = val.formats.numberFloat('2,88');

        expect(res1.valid).toBe(false);
        expect(res1.errors.length).toBe(1);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(true);
        expect(res3.errors.length).toBe(0);

        expect(res4.valid).toBe(false);
        expect(res4.errors.length).toBe(1);

        expect(val.formats.float(2.66).valid).toBeFalsy();
        expect(val.formats.float(3).valid).toBeFalsy();
        expect(val.formats.float('2.88').valid).toBeTruthy();
        expect(val.formats.float('2,88').valid).toBeFalsy();
        expect(val.formats.float('2').valid).toBeFalsy();
    });

    it('should validate a integer number correctly', function () {
        expect(val.formats.integer(2).valid).toBeFalsy();
        expect(val.formats.integer(-3).valid).toBeFalsy();
        expect(val.formats.integer(+3).valid).toBeFalsy();
        expect(val.formats.integer('2').valid).toBeTruthy();
        expect(val.formats.integer('-3').valid).toBeTruthy();
        expect(val.formats.integer('+3').valid).toBeTruthy();
    });

    it('should validate an empty string correctly', function () {
        var res1 = val.formats.empty('');
        var res2 = val.formats.empty(null);
        var res3 = val.formats.empty(undefined);
        var res4 = val.formats.empty('test');
        var res5 = val.formats.empty(123);

        expect(res1.valid).toBe(true);
        expect(res1.errors.length).toBe(0);

        expect(res2.valid).toBe(false);
        expect(res2.errors.length).toBe(1);

        expect(res3.valid).toBe(false);
        expect(res3.errors.length).toBe(1);

        expect(res4.valid).toBe(false);
        expect(res4.errors.length).toBe(1);

        expect(res5.valid).toBe(false);
        expect(res5.errors.length).toBe(1);
    });
});
