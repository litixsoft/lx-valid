lx-valid
===========
Ein Validator für Node.js und den Browser, basierend auf [Flatiron Revalidator](https://github.com/flatiron/revalidator).

## Die Idee
Der Revalidator von Nodejitsu ist ein Json Schema Validator, der seine Arbeit hervorragend macht und die Basis
von lx-valid bildet. In der Praxis benötigt man jedoch häufig einen allgemeinen Validator für einfache Prüfungen
auf dem Client und Server. Die Idee ist, Revalidator zu einem vollständigen Validator mit dem auch einfache Prüfungen
ohne Json Schema, das Filtern von Strings und die Konvertierung von Daten möglich sind, zu erweitern.

## Beispiel
lx-valid verwendet im Kern revalidator und ist zu diesem vollständig kompatibel. Mehr zum revalidator finden
Sie unter [https://github.com/flatiron/revalidator](https://github.com/flatiron/revalidator).
Das Beispiel vom revalidator für die Validierung von Schemen lässt sich genauso in lx-valid verwenden.

```js
var val = require('lx-valid'),
    someObject = {
        url: 'http://www.litixsoft.de',
        challenge: 'change the world',
        body: 123
    },
    schema = {
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
    },
    res = val.validate(someObject, schema);

console.log(res);
```

## Installation
``` bash
npm install lx-valid
```

## Schema Validierung
lx-valid benötigt dafür ein JSON Schema und ein Objekt.

`lx-valid.validate(object, schema, optionen)

Als Ergebnis erhält man ein Objekt welches angibt, ob das zu prüfende Objekt dem Schema entspricht.
Wenn dies nicht der Fall ist, enthält das zurückgegebene Objekt die Fehler, welche bei der Validierung aufgetreten sind.

```js
{
    valid: true // oder false
    errors: [/* Array mit Fehlern (wenn valid false ist) */]
}
```

##### Verfügbare Optionen
* __validateFormats__: Erzwingen von Format Einschränkungen. ( __Standardwert: `true`__ )
* __validateFormatsStrict__: Wenn `validateFormats` `true` ist, dann werden unbekannte Formate wie Prüffehler behandelt. ( __Standardwert: `false`__ )
* __validateFormatExtensions__: Wenn `validateFormats` `true` ist, dann sollen auch alle Formate unter `validate.formatExtensions`
geprüft werden. Diese Option ist für die lx-valid Formate und alle zusätzlichen eigenen Formate wichtig, da diese genau an dieser Stelle gespeichert werden. ( __Standardwert: `true`__ )
* __cast__: Erzwingen von Typumwandlungen, wenn es möglich ist. Wird nur für integer und number unterstützt.
Beispiel für integer: `"42" => 42` aber `"forty2" => "forty2"` ( __Standardwert: `undefined`__ )
* __deleteUnknownProperties__: Löscht alle Eigenschaften aus dem zu validierenden Objekt welche nicht im Schema definiert sind. ( __Standardwert: `false`__ )
* __convert__: Konvertiert eine Eigenschaft aus dem zu validierenden Objekt mit dem Format, welches im Schema definiert ist. Dabei wird das zu validierenden Objekt geändert. ( __Standardwert: `undefined`__ )

### Validation nach Typ
Der Wert einer Eigenschaft, welcher an die Validierung übergeben wird, ist dann ein akzeptierter Wert,
wenn er im Schema angegeben wurde und den Regeln entspricht.

#### required
Wenn `true`, dann muss der Wert vorhanden sein und sollte nicht leer sein.

#### type
Der Typ des Wertes sollte dem im Schema angegebenen Wert entsprechen.

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

##### Beispiel für Typ Validierung

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

Der Integer und das Array muss nicht vorhanden sein, weshalb es trotz des Fehlens von IntTest keinen Fehler gibt.
Allerdings schlägt die Validierung wegen boolTest fehl, da der erwartete Typ `boolean` ist, das Object jedoch einen
`string`liefert.

### Die Regeln für die Validierung

#### pattern
Der erwartete Wert muss dem Regex entsprechen

```js
{ pattern: /^[a-z]+$/ }
```

#### maxLength  ( string und array )
Die Länge des Wertes muss größer oder gleich des akzeptierten Wertes sein.

```js
{ maxLength: 8 }
```

#### minLength ( string und array )
Die Länge des Wertes muss kleiner oder gleich des akzeptierten Wertes sein.

```js
{ minLength: 8 }
```

#### minimum ( number )
Wert muss größer oder gleich des akzeptierten Wertes sein.

```js
{ minimum: 10 }
```

#### maximum ( number )
Wert muss kleiner oder gleich des akzeptierten Wertes sein.

```js
{ maximum: 10 }
```

#### exclusiveMinimum ( number )
Wert muss größer als der akzeptierte Wert sein.

```js
{ exclusiveMinimum: 9 }
```

#### exclusiveMaximum ( number )
Wert muss kleiner als der akzeptierte Wert sein.

```js
{ exclusiveMaximum: 11 }
```

#### divisibleBy ( number )
Wert muss durch den akzeptierten Wert teilbar sein.

```js
{ divisibleBy: 5 }
{ divisibleBy: 0.5 }
```

#### minItems ( array )
Anzahl der Einträge muss größer oder gleich sein,  als die akzeptierte Anzahl von Einträgen.

```js
{ minItems: 2 }
```

#### maxItems ( array )
Anzahl der Einträge muss kleiner oder gleich sein,  als die akzeptierte Anzahl von Einträgen.

```js
{ maxItems: 5 }
```

#### uniqueItems ( array )
Der Wert muss in dem Array eindeutig sein.

```js
{ uniqueItems: true }
```

#### enum (array )
Der Wert muss in dem übergebenen Array enthalten sein.

```js
{ enum: ['month', 'year'] }
```

#### Beispiel für die Validierungsregeln

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

Die Validierung ist erfolgreich, da das Array 3 Werte beinhaltet, welche alle vom Typ integer sind.

#### Validierung nach Format
Der Wert muss einem gültigen Format entsprechen.

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

##### Beispiel für Validierung nach Format

```js
var val = require('lx-valid'),
    objForTest = {
        UuidTest: "507f191e810c19729de860ea",
        floatTest: 3.2,
        IntTest: 2
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
            }
        }
    },
    result = val.validate(objForTest, schemaForTest);

console.log(result);
```

Hier werden die Werte auf spezielle Formate geprüft. Der UuidTest muss ein String sein und das Format einer MongoId haben.
Der floatTest muss eine Number sein, welche dem Format eines Float entspricht. Fügt man der Uuid noch ein paar Werte
hinzu, wird die Validierung fehlschlagen.

#### Erweitern mit eigenen Formaten
Man kann die bestehenden Formate auch mit eigenen Formaten erweitern. Folgendes Beispiel zeigt wie:

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

Nach der Erweiterung mit dem eigenen Format kann dieses nun jederzeit von jedem Schema verwendet werden.
Formate werden nur übernommen, wenn es diese noch nicht gibt. Dass wird aktuell noch mit einer Exception realisiert,
soll aber bei einem der kommenden Updates geändert werden.

### Benutzerdefinierte Validierung mit conform
Wert muss der Bedingung entsprechen. Mit Conform kann man umfangreiche Validatoren realisieren.
Sie bestehen aus einer Funktion, welche den Wert als Parameters übergeben bekommt. Die Rückgabe der Funktion muss
immer `true` oder `false` sein.

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

### Abhängigkeiten
Der Wert ist nur gültig, wenn der abhängige Wert gültig ist.

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

### Verschachtelte Schemas
Es sind auch verschachtelte Schemas möglich.

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

### Benutzerdefinierte Nachrichten
Benutzerdefinierte Nachrichten sind auch für verschiedene Bedingungen möglich.

```js
{
    type: 'string',
    format: 'url',
    messages: {
        type: 'Not a string type',
        format: 'Expected format is a url'
    },
    {
        conform: function () { ... },
        message: 'This can be used as a global message'
    }
}
```

### Konvertierung
Konvertiert eine Eigenschaft aus dem zu validierenden Objekt mit dem Format, welches im Schema definiert ist. Dabei wird das zu validierenden Objekt geändert.

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

### Schema Validierung beim Update
Wenn man mit einer Datenbank arbeitet, sollten die hinzugefügten und aktualisierten Daten validiert werden. Dabei wird manchmal nur ein Teil der Daten zur Validierung gesendet, und nicht das komplette Objekt.
Dabei würde die Validierung Fehler zurückgeben, wenn die required Eigenschaften fehlen. Um dies zu verhindern gibt es die Option `isUpdate`. Wird diese auf `true` gesetzt werden alle Eigenschaften aus dem Schema,
welche nicht im zu validierenden Objekt sind, auf `required: false` gesetzt. Es gibt eine Funktion, welche die validate Funktion zurückgibt und `isUpdate` auf `true` gesetzt ist.

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

## Schemalose Validierung
Alle Typen, Regeln und Formate der Schema Validierung können auch über eine einfache API ohne ein Schema geprüft werden.

* `lx-valid.formats.<formatname>(value)`
* `lx-valid.types.<typename>(value)`
* `lx-valid.rules.<rulename>(value)`

Als Ergebnis erhält man ein Objekt welches angibt, ob das zu prüfende Objekt dem Schema entspricht.
Wenn dies nicht der Fall ist, enthält das zurückgegebene Objekt die Fehler, welche bei der Validierung aufgetreten sind.

```js
{
    valid: true // oder false
    errors: [/* Array mit Fehlern (wenn valid false ist) */]
}
```

### Typen
Die Typen in lx-valid erweitern die JSON Schema Typen um die restlichen Javascript Typen.

`lx-valid.types.<typename>(value)`

#### JSON Schema Typen
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

#### lx-valid Typen
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
```

Es werden alle Typen des JSON Schema abgedeckt und zusätzlich noch alle Javascript Typen.

#### integer
```js
var res = val.types.integer(123);
```

#### float
```js
var res = val.types.float(12.3);
```

#### regexp
```js
var res = val.types.regexp(/^hello/);
```

#### date
```js
var res = val.types.date(new Date());
```

Mehr Beispiele findet man unter [test/types.spec.js](../test/types.spec.js).

### Formate
Wie in der Json Schema Validierung können auch Formate geprüft werden.

`lx-valid.formats.<formatname>(value)`

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

Mehr Beispiele findet man unter [test/formats.spec.js](../test/formats.spec.js).

### Regeln
Ach die Regeln können über die API geprüft werden.

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

Mehr Beispiele findet man unter [test/rules.spec.js](../test/rules.spec.js).

#### Asynchrone Validierung
Die Asynchrone Validierung besteht aus Registrierung von Validatoren und der Ausführung dieser Validatoren.

* `lx-valid.asyncValidate.register(funktion, parameter)`
* `lx-valid.asyncValidate.exec(validationResult, callback)`

`lx-valid.asyncValidate.exec` führt die über register hinzugefügten Validatoren parallel aus.

Am besten ist es, die Validierung nach der Schemavalidierung durchzuführen.
Das Ergebnis der Schemavalidierung wird an die asynchrone Validierung übergeben.

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

Mehr Beispiele findet man in [test/tests.spec.js](../test/tests.spec.js).

## Entwicklung
Der Validator lx-valid befindet sich noch in der Entwicklung. Die geplanten Funktionen werden nach und nach eingebaut
und können dem Changelog und Roadmap entnommen werden.

## Roadmap

### v0.3.0

* Änderungen welche sich durch die Integration in ein Produktiv-Projekt ergeben
* Filter und Bereinigung von Strings

## Changelog

### v0.2.3
* Neuer Typ mongoId

### v0.2.2
* Neue Funktion, welche die Validierung-Funktion mit der Option `isUpdate` zurückliefert

### v0.2.1
* Modul revalidator aktualisiert
* Neue Option zum Entfernen von Eigenschaften aus dem zu validieren Objekt, welche nicht im Schema definiert sind
* Neue Option zum Konvertieren von Eigenschaften mit dem Format, welches im Schema angegeben ist

### v0.2.0
* Asynchrone Validierung

### v0.1.4
* Aktualisierung von Grunt auf Version v0.4
* Umstellung der Unit-Tests auf jasmine-node

### v0.1.3
* Einbau Grunt
* Anpassungen für jsHint

### v0.1.2
* Ausnahmen bei Regeln entfernt

### v0.1.1

* Dokumentation angepasst
* Dokumentation in Deutsch übersetzt

### v0.1.0 initial

* Json Schema Validierung
* Komplette Validierungs-Funktionalität über einfache API ohne Json Schema
* Erweiterung der Validierungs-Formate um mongo-id und number-float
* Methode zum Hinzufügen eigener Formate

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