---
title: Purpose
layout: default
---

Create pdf documents from liquid templates.

This library uses [btrz-liquid-templates]((https://www.npmjs.com/package/btrz-liquid-templates) and [PDFMake](https://pdfmake.github.io/docs/0.1/) and link them together while adding some helpers to easily generate PDFs from templates.

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

* ## headerFn and footerFn

You can use this new document properties to add headers or footers with page numbers and total pages. The use is the same for both.
This properties need to be declared at the same level as the content property and not inside the content property.


```liquid
"headerFn": {
        "text": "{{providerPreferences.preferences.ticketFields.header.content | strip_newlines }} currentPage of pageCount",
        "style": "headerFooter"
}

"footerFn": {
        "text": "{{providerPreferences.preferences.ticketFields.footer.content | strip_newlines }} currentPage of pageCount",
        "style": "headerFooter"
}
```

In the example below assuming the `header.content` is the text "Page #" it will print something like this for the first page of a document with 5 pages.

```txt

Page # 1 of 5

```
