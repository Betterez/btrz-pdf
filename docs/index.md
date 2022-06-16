---
title: Purpose
layout: default
---

Create pdf documents from liquid templates.

This library uses [LiquidJS](https://liquidjs.com/), [Symbology](https://symbology.dev/), [Bz-Date](https://www.npmjs.com/package/bz-date), [btrz-formatter](https://www.npmjs.com/package/btrz-formatter) and [PDFMake](https://pdfmake.github.io/docs/0.1/) and link them together while adding some helpers to easily generate PDFs from templates.

The vesion of PDFMake has been inlined and modified to allow for text rotation.


## Install

```bash
npm i btrz-pdf
```

## Restrictions

The documents generated only uses Helvetica fonts.

## Methods

* returnPdfBuffer

Async method that returns a buffer, best used with Express to return the PDF in the response or to generate documents to be merged later on.

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |

* mergePDFBuffers(buffers)

Async method that combines buffers into PDF documents

Parameters

| name | definition |
|------|------|
| buffers | An array of buffers |

* returnPdfBinary(liquidTemplate, data, cb)

Async method using a cb to return a buffer, best used with Express to return the PDF in the response.

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |
| cb | A callback with the signature (err, buffer)

* returnPdfDocument(liquidTemplate, data)

Async method that returns a promise with a PDF document

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |

* defaultDocumentDefinition

Returns an empty PDFmake document definition with some default styles

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

* toDocumentDefinition(liquidTemplate, data)

Async method that returns a PDFmake document defintion after processing the template and the data

Parameters

| name | definition |
|------|------|
| liquidTemplate | object representing a pdfmake document with valid liquidSyntax |
| data | Object with data needed by the liquid template |


## Usage


```javascript
  const btrzPdf = require("btrz-pdf");

  //Returns a PDF as data with Express
  async returnPDF(req, res) {
    try {
      const buffer = await PDF.returnPdfBuffer(template, data);
      res.setHeader("Content-Disposition", `attachment;filename="${filename}.pdf"`)
      res.setHeader("Content-type", "application/pdf");
      res.write(buffer);
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
  async mergeAndReturnPdf(req, res) {
    try {
      const items = [item1, item2, item3];
      const buffers = Promise.all(items.map((item) => {
        data.item;
        return PDF.returnPdfBuffer(template, data);
      }))
      const result = await PDF.mergePdfBufffers(buffers);
      res.setHeader("Content-Disposition", `attachment;filename="${filename}.pdf"`)
      res.setHeader("Content-type", "application/pdf");
      res.write(result);
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

## Custom document defintions

* ## direction

Default is text not rotated.

You can add `"direction": "rotate-right"` to rotate the text and barcodes in the template 90 degrees.
You can add `"direction": "inverse"` to rotate the text and barcodes in the template 180 degrees.
You can add `"direction": "rotate-left"` to rotate the text and barcodes in the template 270 degrees.

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
| margin | A list of 4 values for the margin | N | 0,0,0,0


It will use the value of ticket.code to generate the barcode with all the defaults

```liquid
{% raw %} {% barcode ticket.code %} {% endraw %}
```

It will use the value given and use generate a 'code11' barcode with a height of 50 and a width of 300

```liquid
{% raw %} {% barcode 1234 code11 50 300 20,20,20,0 %} {% endraw %} 
```

### Supported types

It supports all types supported by [https://symbology.dev/](Symbology).
While symbology supports QRCODE PDFMake also had support for QR natively and we recommend it.


* ## qrstr

Returns the proper str to transform into a QR code to be able to scan items with the drivers app

```liquid
{% raw %} {%- qrstr reservation -%} {% endraw %} //"https://{{ctx.environments.providerPreferences.domain}}/r/t/{{reservation.urlTicketCode}}"
```

```liquid
{% raw %} {%- qrstr ticket -%} {% endraw %} //"https://{{ctx.environments.providerPreferences.domain}}/r/t/{{ticket.urlTicketCode}}"
```

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| type | The type of object we will be generating the string for the qrcode | N | ticket

### Valid types

reservation, ticket, paid_in, parcel, flexpass, ssr, redeemableItem

* ## dateTime

Returns a date formatted by the given format from a property of an object given to the liquid template data.

```liquid
{% raw %} {%- dateTime ticket createdAt -%} {% endraw %} //"12/21/2021 11:38 AM"
```

```liquid
{% raw %} {%- dateTime ticket createdAt mm/dd/yyyy hh:MM:ss -%} {% endraw %} //"12/21/2021 11:38:00"
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
| applyTimeZone | If you want to adjust the date with the account timeZone | N | true

```liquid
{% raw %} {%- dateF ticket createdAt -%} {% endraw %} //"12/21/2021"
```

* ## timeF

Convenience method that will default format to `providerPreferenes.preferences.timeFormat`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item (it should be a BzDate object or a time string) | N | createdAt
| applyTimeZone | If you want to adjust the date with the account timeZone | N | true

```liquid
{% raw %} {%- timeF ticket createdAt -%} {% endraw %} //"11:38 AM"
```

* ## expDate

Convenience method that will calculate the expiration date for a reservation

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| format | A format object | N | providerPreferences defaults (see prereqs)

```liquid
{% raw %} {%- expDate reservation -%} {% endraw %} //"12/21/2021 11:38 AM"
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
| applyTimeZone | If you want to adjust the date with the account timeZone | N | true

```liquid
{% raw %} {%- humanDate ticket createdAt -%} {% endraw %} //"Tue Dec 21, 2021"
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
| applyTimeZone | If you want to adjust the date with the account timeZone | N | true

```liquid
{% raw %} {%- humanDateTime ticket createdAt -%} {% endraw %} //"Tue Dec 21, 2021 11:38 AM"
```

* ## h

This tag will parse "some" HTML code and try to generate compatible PDFmake text objects.

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| property | this will be "evaluated" from the data provided to the liquid template | Y |

```javascript
{% raw %} {% h ticket.lexiconKeys.terms %} {% endraw %} //If will get the string in the property and parse it
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
| rgb | the colour of the line, either a rgb or hex value or read from a data property as hex | N | 0,0,0

```liquid
{% raw %} {%- hline 475 2 255,112,0 - %} {% endraw %} //Generates an svg line with the width, weight and colour given
```

```liquid
{% raw %} {%- hline 475 2 providerPreferences.preferences.colors.brandBackground - %} {% endraw %} //Generates an svg line with the width, weight and colour given
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
{% raw %} {% t 'issued' %} {% endraw %} //Will return the value on the lexicon with the 'issued' key
```

```liquid
{% raw %} {% t fare.lexiconKeys.description %} {% endraw %} //Will return the value on the lexicon with the key stored in the `data.fare.lexiconKeys.description` property
```

* ## txt

Split lines or hardcoded text that may include carriage returns

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| liquid expression | A liquid expression that will be evaluated and each line will be converted on a text node | Y
| style | A style defined in the document to apply to the resulted text nodes | N

```liquid
"{% raw %} {% txt operatingCompany.infoOnPrintedTicket small %} {% endraw %}" //Given that ticket.total is 2800000 returns "28.00"
```

* ## money

Returns a money value

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket
| propName | The name of the property of the item | N | total

```liquid
"{% raw %} {%- money ticket total -%} {% endraw %}" //Given that ticket.total is 2800000 returns "28.00"
```

* ## moneyReduce

Adds the values of a property in objects in a collection and returns the total as a money value

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item.propName | An object in the data given to the liquid template | N | ticket.taxes
| innerPropName | The name of the property in the objects in the collection | N | calculated

```liquid
"{% raw %} {%- moneyReduce ticket.fees subTotal -%} {% endraw %}"
```
* ## curcyName

Returns the currency name based on the displayCurrency of the item provided and the account configuration. If the item provided is a currency, it will just use that currency,

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket

```liquid
{% raw %} {%- curcyName ticket -%} {% endraw %}",
```

* ## curcySymbol

Returns the currency symbol based on the currency used to paid the item or the default currency given in the `providerPreferences.preferences.supportedCurrencies[0]`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket

```liquid
{% raw %} {%- curcySymbol ticket -%} {% endraw %}",
```

* ## curcyIso

Returns the currency ISO code based on the currency used to paid the item or the default currency given in the `providerPreferences.preferences.supportedCurrencies[0]`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| item | An object in the data given to the liquid template | N | ticket

```liquid
{% raw %} {%- curcyIso ticket -%} {% endraw %}
```

* ## toLetters

Returns the amount in letters given in the property (amount should follow US notation, uses "." for cents).
It can translate values using the `lang` and `localizer`

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| stringAmount | A string with the amount | Y |

```liquid
{% raw %} {%- toLetters '100.50' -%} {% endraw %} // One hundred with fifty cents
```

```liquid
{% raw %} {%- toLetters '123' -%} {% endraw %} // One hundred and twenty three
```

* ## httpImg

Given a URL for an image will encode into base64 and return in a consumable way for makePDF, only supports png and jpeg

Parameters

| name | definition | required | default |
|------|------------|----------|---------|
| object.property | The property should have a fully qualified URL to an image | Y |


```liquid
{% raw %} {%- httpImg brand.logos.default -%} {% endraw %} // data:image/png;base64,77+9UE5HDQoaCgAAAA1JSERSAAA...
```