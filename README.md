# btrz-pdf

Create pdf documents from liquid templates.

This library uses [https://liquidjs.com/](LiquidJs), [https://symbology.dev/](Symbology), [https://www.npmjs.com/package/bz-date](BzDate), [https://www.npmjs.com/package/btrz-formatter](btrz-formatter) and [https://pdfmake.github.io/docs/0.1/](PDFmake) and link them togethers while adding some helpers to easily generate PDFs from templates.

## Install

```bash
npm i btrz-pdf
```

## Restrictions

The documents generated only use Helvetica fonts.

## Methods

* returnPdfBuffer(liquidTemplate, data)

Async method that returns a buffer can be used to return PDF with Express or to generate documents that will be merged togheter.


Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |

* returnPdfBinary(liquidTemplate, data, cb)

Async method using a cb to return a binary, best used with Express to return the PDF in the response as a plugin.

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |
| cb | A callback with the signature (err, binary)

* returnPdfDocument(liquidTemplate, data)

Async method that returns a promise with a PDF document

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |

* defaultDocumentDefinition

Returns an empty PDFmake document definition with some default styles

* toDocumentDefinition(liquidTemplate, data)

Async method that returns a PDFmake document defintion after processing the template and the data

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |

Response

```json
{
  "defaultStyle": {
    "font": "Helvetica",
    "fontSize": 10,
    "lineHeight": 1.3
  },
  "styles": {
    "header": {
      "fontSize": 16,
      "bold": true,
      "margin": [0, 0, 0, 10]
    },
    "subheader": {
      "fontSize": 14,
      "bold": true,
      "margin": [0, 20, 0, 0]
    },
    "innerheader": {
      "fontSize": 12,
      "bold": true
    },
    "tableHeader": {
      "fontSize": 8,
      "bold": true,
      "margin": [0, 4, 0, 0]
    },
    "table": {
      "fontSize": 8,
      "margin": [0, 8, 0, 0]
    },
    "attachedTable": {
      "fontSize": 8
    },
    "cell": {
      "margin": [0, 4, 0, 0]
    },
    "cellError": {
      "margin": [0, 4, 0, 0],
      "color": "#FF0000"
    },
    "cellMoney": {
      "margin": [0, 4, 0, 0],
      "alignment": "right"
    },
    "cellMoneyError": {
      "margin": [0, 4, 0, 0],
      "color": "#FF0000",
      "alignment": "right"
    },
    "footer": {
      "fontSize": 8
    }
  },
  "content": []
}
```

## Usage

```javascript
  const btrzPdf = require("btrz-pdf");

  //Returns a PDF as data with Express
  async returnPdf(req, res) {
    try {
      const buffer = await PDF.returnPdfBuffer(template, data);
      const filename = "document.pdf"; //you can generate this name to something relevant
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.write(buffer);
      res.send();
      return; 
    } catch (err) {
      res.status(500).send(error);
    }
  }

  async combinePdfs(req, res) {
    try {
      const items = [item1, item2, item3];
      const pdfPromises = items.map((item) => {
        data.item;
        return PDF.returnPdfBuffer(template, data);
      });
      const buffers = await Promise.all(pdfPromises);
      const combined = await PDF.mergePDFBuffers(buffers);
      const filename = "document.pdf"; //you can generate this name to something relevant
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.write(combined);
      res.send();
      return; 
    } catch (err) {
      res.status(500).send(error);
    }
  }
```

```javascript
  const btrzPdf = require("btrz-pdf");

  //Returns a PDF as data with Express
  async previewPdf(req, res) {
    try {
      PDF.returnPdfBinary(template, data, (error, binary) => {
        if (error) {
          res.status(500).send(error);
        } else {
          res.contentType("application/pdf");
          res.send(binary);
        }
      });
      return; 
    } catch (err) {
      res.status(500).send(error);
    }
  }

```

```javascript
  const btrzPdf = require("btrz-pdf");

  //Returns a PDFmake document defintion from the template and the data
  async getLiquid(req, res) {
    try {
      const document = await PDF.toDocumentDefinition(template, data);
      res.send(document);
    } catch (err) {
      res.status(500).send(error.message);
    }
  }
```

## Custom tags

* ## barcode

Generates a barcode based on some data

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| data | The string to use to generate the barcode, it can be hardcoded or some of the 'data' given to the template | Y | |
| type | The barcode type | N | code128
| height | The barcode height | N | 30
| width | The barcode width | N | 200

It will use the value of ticket.code to generate the barcode with all the defaults

```liquid
{% barcode ticket.code %} 
```

It will use the value given and use generate a 'code11' barcode with a height of 50 and a width of 300

```liquid
{% barcode 1234 code11 50 300 %} 
```

### Supported types

It supports all types supported by [https://symbology.dev/](Symbology).
While symbology supports QRCODE PDFMake also had support for QR natively and we recommend it.

* ## dateTime

Returns a date formatted by the given format from a property of an object given to the liquid template data.

```liquid
{%- dateTime ticket createdAt %} //"12/21/2021 11:38 AM"
```

```liquid
{%- dateTime ticket createdAt mm/dd/yyyy hh:MM:ss %} //"12/21/2021 11:38:00"
```

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object) | N | createdAt
| format | A format object | N | providerPreferences defaults (see prereqs)

Prerequisites

There are some prerequisites to use any of the Date helpers. The data given to the liquid template requires the following object to be present

```json
{
  "providerPreferences": {
    "preferences": {
      "dateFormat": "mm/dd/yyyy", //any date format string will do
      "timeFormat": "h:MM TT", //any time format string will do
      "timeZone": {
        "name": "(UTC-5:00) New York (United States), Toronto (Canada)",
        "daylight": true,
        "tz": "America/Toronto"
      } //any timezone as defined in BzDate will do
    }
  }
}

```

* ## dateF

Convenience method that will default format to `providerPreferenes.preferences.dateFormat`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object) | N | createdAt

```liquid
{%- dateF ticket createdAt %} //"12/21/2021"
```

* ## timeF

Convenience method that will default format to `providerPreferenes.preferences.timeFormat`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object) | N | createdAt

```liquid
{%- timeF ticket createdAt %} //"11:38 AM"
```

* ## humanDate

Convenience method that will default format based on the  `humanDate` property given to the template as part of the data object. `humanDate` can be either 'mm' or 'dd'

```javascript
(humanDate === "mm") ? "ddd mmm dd, yyyy" : "ddd dd mmm, yyyy"
```

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object) | N | createdAt

```liquid
{%- humanDate ticket createdAt %} //"Tue Dec 21, 2021"
```

* ## humanDateTime

Convenience method that will default format based on the `humanDate` property given to the template as part of the data object. `humanDate` can be either 'mm' or 'dd' plus the `providerPreferenes.preferences.timeFormat`

```javascript
(humanDate === "mm") ? "ddd mmm dd, yyyy" : "ddd dd mmm, yyyy"
```

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object) | N | createdAt

```liquid
{%- humanDateTime ticket createdAt %} //"Tue Dec 21, 2021 11:38 AM"
```

* ## h

This tag will parse "some" HTML code and try to generate compatible PDFmake text objects.

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| property | this will be "evaluated" from the data provided to the liquid template | Y |

```javascript
{% h ticket.lexiconKeys.terms %} //If will get the string in the property and parse it
```

### Supported html tags

 **h1** - will generate a text node with "style": "header"
 **h2** - will generate a text node with "style": "subheader"
 **h3** - will generate a text node with "style": "innerheader"
 **b** - will generate a text node with "bold": true
 **i** - will generate a text node with "italics'": true

* ## hline

This tag generates an horizontal line

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| width | the width of the line | N | 500
| weight | the weight of the line | N | 1
| rgb | the colour of the line | N | 0,0,0

```liquid
{%- hline 475 2 255,112,0 -%} //Generates an svg line with the width, weight and colour given
```

```json
{
  "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(255,112,0);stroke-width:2' /></svg>",
  "width": 475
}
```

* ## t

Returns a translation based on a key, it can use a string or variables from the data given to the liquid template

Prerequisites

There are some prerequisites to use the **t** tag. The data given to the liquid template requires a `localizer` object with a `.get(key)` method that can return the translation. The implementation is up to you.

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| property | the key for the lexicon | Y |

```liquid
{% t 'issued' %} //Will return the value on the lexicon with the 'issued' key
```

```liquid
{% t fare.lexiconKeys.description %} //Will return the value on the lexicon with the key stored in the `data.fare.lexiconKeys.description` property
```

* ## money

Returns a money value

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item | N | total

```liquid
"{%- money ticket total -%}" //Given that ticket.total is 2800000 returns "28.00"
```

* ## moneyReduce

Adds the values of a property in objects in a collection and returns the total as a money value

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item that is a collection of objects | N | taxes
| innerPropName | The name of the property in the objects in the collection | N | calculated

```liquid
"{%- money ticket fees subTotal -%}"
```

* ## curcySymbol

Returns the currency symbol based on the currency used to paid the item or the default currency given in the `providerPreferences.preferences.supportedCurrencies[0]`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket

```liquid
{%- curcySymbol ticket -%}",
```

* ## curcyIso

Returns the currency ISO code based on the currency used to paid the item or the default currency given in the `providerPreferences.preferences.supportedCurrencies[0]`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket

```liquid
{%- curcyIso ticket -%}
```
