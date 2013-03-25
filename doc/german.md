lx-valid
===========
Ein Validator für Node.js und den Browser, basierend auf flatiron revalidator.

## Die Idee
Der Revalidator von Nodejitsu ist ein Json Schema Validator, der seine Arbeit hervorragend macht und die Basis
von lx-valid bildet. In der Praxis benötigt man jedoch häufig einen allgemeinen Validator für einfache Prüfungen
auf dem Client und Server. Die Idee ist, Revalidator zu einem vollständigen Validator mit dem auch einfache Prüfungen
ohne Json Schema, das Filtern von Strings und die Konvertierung von Daten möglich sind, zu erweitern.

## Beispiel
lx-valid verwendet im Kern revalidator und ist zu diesem vollständig kompatibel. Mehr zum revalidator finden
Sie unter [https://github.com/flatiron/revalidator](https://github.com/flatiron/revalidator).
Das Bespiel vom revalidator für die Validierung von Schemen lässt sich genauso in lx-valid verwenden.

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

## Verwendung

### Schema Validierung
lx-valid benötigt dafür ein Json Schema und ein Objekt.

**lx-valid.validate(obj, schema, optionen).**

Das liefert ein Objekt zurück, welches angibt, ob das zu prüfende Objekt dem Schema entspricht.
Wenn dies nicht der Fall ist, enthält das zurückgegebene Objekt die Fehler, welche bei der Validierung aufgetreten sind.

```js
{
  valid: true // oder false
  errors: [/* Array mit Fehlern wenn valid false ist */]
}
```

##### Verfügbare Optionen
* validate formats: Erzwingen von Format Einschränkungen. ( default true )
* validateFormatsStrict: Wenn validate formats: true ist, dann unbekannte Formate wie Prüffehler behandeln. ( default false )
* validateFormatExtensions: Wenn validate formats: true ist, dann sollen auch alle Formate unter validate.formatExtensions
geprüft werden. Diese Option ist für die lx-valid Formate und alle zusätzlichen eigenen Formate wichtig,
da diese genau an dieser Stelle gespeichert werden. ( default true )
* cast: Erzwingen von Typumwandlungen wenn es möglich ist. Wird nur für integer und number unterstützt.
Beispiel für integer:  "42" => 42 aber "forty2" => "forty2"

Der Wert einer Eigenschaft welcher an die Validierung übergeben wird ist dann ein akzeptierter Wert,
wenn er im Schema angegeben wurde und den Regeln entspricht.

##### required
Wenn das true ist muss der Wert vorhanden sein und sollte nicht leer sein.

##### type
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

##### Beispiel für die Typen

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

Der Integer und das Array muss nicht vorhanden sein, weshalb es trotz des Fehlens von IntTest keinen Fehler gibt.
Allerdings schlägt die Validierung wegen boolTest fehl, da der erwartete Typ boolean ist, das Object jedoch einen
String liefert.

#### Die Regeln für die Validierung

##### pattern
Der erwartete Wert muss dem Regex entsprechen

{ pattern: /^[a-z]+$/ }

##### maxLength  ( string und array )
Die Länge des Wertes muss gößer oder gleich des akzeptierten Wertes sein.

{ maxLength: 8 }

##### minLength ( string und array )
Die Länge des Wertes muss kleiner oder gleich des akzeptierten Wertes sein.

{ minLength: 8 }

##### minimum ( number )
Wert muss größer oder gleich des akzeptierten Wertes sein.

{ minimum: 10 }

##### maximum ( number )
Wert muss kleiner oder gleich des akzeptierten Wertes sein.

{ maximum: 10 }

##### exclusiveMinimum ( number )
Wert muss größer als der akzeptierte Wert sein.

{ exclusiveMinimum: 9 }

##### exclusiveMaximum ( number )
Wert muss kleiner als der akzeptierte Wert sein.

{ exclusiveMaximum: 11 }

##### divisibleBy ( number )
Wert muss durch den akzeptierten Wert teilbar sein.

{ divisibleBy: 5 }
{ divisibleBy: 0.5 }

##### minItems ( array )
Anzahl der Einträge muss größer oder gleich sein,  als die akzeptierte Anzahl von Einträgen.

{ minItems: 2 }

##### maxItems ( array )
Anzahl der Einträge muss kleiner oder gleich sein,  als die akzeptierte Anzahl von Einträgen.

{ maxItems: 5 }

##### uniqueItems ( array )
Der Wert muss in dem Array eindeutig sein.

{ uniqueItems: true }

##### enum (array )
Der Wert muss in dem übergebenen Array enthalten sein.

{ enum: ['month', 'year'] }

##### Beispiel für die Regeln

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

Die Validierung ist erfolgreich, da das Array 3 Werte beinhaltet, welche alle vom Typ integer sind.

#### Die Formate für die Validierung
Der Wert muss einem gültigen Format entsprechen.

```js
{ format: 'mongo-id' }
{ format: 'number-format }
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

##### Beispiel für Format

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

Hier werden die Werte auf spezielle Formate geprüft. Der UuidTest muss ein String sein und das Format einer MongoId haben.
Der floatTest muss eine Number sein, welche dem Format eines Float entspricht. Fügt man der Uuid noch ein paar Werte
hinzu, wird die Validierung fehlschlagen.

##### Erweitern mit eigenen Formaten
Man kann die bestehenden Formate auch mit eigenen Formaten erweitern. Folgendes Beispiel zeigt wie:

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

Nach der Erweiterung mit dem eigenen Format, kann dieses nun jederzeit von jedem Schema verwendet werden.
Formate werden nur übernommen, wenn es diese noch nicht gibt. Das wird aktuell noch mit einer Exception realisiert,
soll aber bei einem der kommenden Updates geändert werden.

#### conform benutzerdefinierte Validierung
Wert muss der Bedingung entsprechen. Mit Conform kann man umfangreiche Validatoren realisieren.
Sie bestehen aus einer Funktion, welche den Wert als Parameters übergeben bekommt. Die Rückgabe der Funktion muss
immer true oder false sein.

```js
{ conform: function (v) {
    if (v%3==1) return true;
    return false;
  }
}
```

#### Abhängigkeiten
Der Wert ist nur gültig, wenn der abhängige Wert gültig ist.

```js
{
  town: { required: true, dependencies: 'country' },
  country: { maxLength: 3, required: true }
}
```

#### verschachtelte Schemas
Es sind auch verschachtelte Schemas möglich.

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

#### Benutzerdefinierte Nachrichten
Benutzerdefinierte Nachrichten sind auch für verschiedene Bedingungen möglich.

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

### Schemalose Validierung
Alle Typen, Regeln und Formate der Schema Validierung können Sie auch über eine einfache API ohne ein Schema prüfen.

* lx-valid.formats.<formatname>(value)
* lx-valid.types.<typename>(value)
* lx-valid.rules.<rulename>(value)

Das liefert ein Objekt zurück, welches angibt, ob der zu prüfende Wert der Regel entspricht.
Wenn dies nicht der Fall ist, enthält das zurückgegebene Objekt die Fehler, welche bei der Validierung aufgetreten sind.

```js
{
  valid: true // oder false
  errors: [/* Array mit Fehlern wenn valid false ist */]
}
```

#### Beispiele für die Schemalose Validierung

##### Typen
Die Typen in lx-valid erweitern die Json Schema Typen um die restlichen Javascript Typen.

**lx-valid.types.<typename>(value)**

##### Json Schema Typen

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

##### lx-valid Typen

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

Es werden alle Typen des Json Schema abgedeckt und zusätzlich noch alle Javascript Typen.

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

Mehr Beispiele finden Sie unter test/types.js.

##### Formate
Wie in der Json Schema Validierung können auch Formate geprüft werden.

**lx-valid.formats.<formatname>(value)**

```js
{ format: 'mongo-id' }
{ format: 'number-format }
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

Mehr Beispiele finden Sie unter test/formats.js

##### Regeln
Ach die Regeln können über die API geprüft werden.

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

Mehr Beispiele finden Sie unter test/rules.js

#### Asyncrone Validierung (ab 0.2.0)
Die Asynchrone Validierung besteht aus Registrierung von Validatoren und der Ausführung von Validatoren.

**lx-valid.asyncValidate.register(function, parameter)**
**lx-valid.asyncValidate.exec(validationResult, callback)**

lx-valid.asyncValidate.exec führt die über register hinzugefügten Validatoren parallel aus.

```js
validationResult = {
    valid: true,
    errors: []
};
```

Am besten ist es, die Validierung nach der Schemavalidierung durchzuführen.
Das Ergebnis der Schemavalidierung wird an die asynchrone Validierung übergeben.

```js
// json schema validate
var valResult = val.validate(doc, schema);

// register async validator
val.asyncValidate.register(function1, userName);
val.asyncValidate.register(function2, email);

// async validate
val.asyncValidate.exec(valResult, cb);
```

Mehr Beispiele in test/tests.spec.js

## Entwicklung
Der Validator lx-valid befindet sich noch in der Entwicklung. Die geplanten Funktionen werden nach und nach eingebaut
und können der Change List und Roadmap entnommen werden.

## Roadmap

### v0.3.0

* Änderungen welche sich durch die Integration in ein Produktiv-Projekt ergeben
* Filter und Bereinigung von Strings

## Change List

### v0.2.0 update
* Asynchrone Validierung

### v0.1.4 update
* Aktualisierung von Grunt auf Version v0.4
* Umstellung der Unit-Tests auf jasmine-node

### v0.1.3 update
* Einbau Grunt
* Anpassungen für jsHint

### v0.1.2 update
* Ausnahmen bei Regeln entfernt

### v0.1.1 update

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