describe("index.js", () => {
  const {expect} = require("chai");
  let data = null;
  beforeEach(() => {
    data = {
      transaction: {
        _id: "5c9f8f8f8f8f8f8f8f8f8f8",
      },
      providerPreferences: {
        preferences: {
          timeFormat: "h:MM TT",
          timeZone: {
            name: "(UTC-5:00) New York (United States), Toronto (Canada)",
            daylight: true,
            tz: "America/Toronto"
          },
          dateFormat: "mm/dd/yyyy",
          multiCurrency: true,
          multiline: `something here
and some more here
and some more here`,
          supportedCurrencies: [
            {
              isocode: "USD",
              symbol: "$",
              enabled: true,
              printSymbol: true
            },
            {
              isocode: "CAD",
              symbol: "$",
              enabled: true,
              printSymbol: true

            }
          ]
        }
      }, 
      tickets: [
        {
          fare: "adult",
          total: 2800000
        },
        {
          fare: "child",
        },
        {
          fare: "person",
        }
      ],
      ticket: {
        fare: "adult",
        total: 2800000,
        taxes: [],
        ssrs: [
          {
            subTotal: 2800000,
          },
          {
            subTotal: 3100000,
          }
        ],
        displayCurrency: {
          isocode: "CAD",
          symbol: "$",
          buy: 1,
          sell: 1,
        },
        createdAt: {
          value: "2021-12-21T16:38:00.488Z",
          offset: 0
        }
      },
      localizer: {
        get: (key) => {
          if (key === "html") {
            return `<h1>Hello</h1><br/>
            something
            <b>html</b>
            <i>Italix</i>`;
          }
          return `=>${key}`;
        }
      }
    }
  });


  it("should return a default document definition", () => {
    const pdf = require("../src/index.js");
    const docDef = pdf.defaultDocumentDefinition();
    expect(docDef).to.be.an("object");
    expect(docDef.content).to.be.an("array");
    expect(docDef.content).to.be.eql([]);
    expect(docDef.pageSize.width).to.be.eql(252);
    expect(docDef.pageSize.height).to.be.eql("auto");
    expect(docDef.pageMargins).to.be.eql([10,10,10,10]);
    expect(docDef.pageOrientation).to.be.eql("portrait");
    expect(docDef.defaultStyle).to.be.an("object");
    expect(docDef.defaultStyle).to.be.eql({"font": "Helvetica", "fontSize": 10, "lineHeight": 1.3});
    expect(docDef.styles).to.be.an("object");
    expect(docDef.styles.header).to.be.eql({"bold": true, "fontSize": 16, "margin": [0, 0, 0, 10]});
    expect(docDef.styles.subheader).to.be.eql({"bold": true, "fontSize": 14, "margin": [0, 20, 0, 0]});
    expect(docDef.styles.tableHeader).to.be.eql({"bold": true, "fontSize": 8, "margin": [0, 4, 0, 0]});
    expect(docDef.styles.table).to.be.eql({"fontSize": 8, "margin": [0, 8, 0, 0]});
    expect(docDef.styles.attachedTable).to.be.eql({"fontSize": 8});
    expect(docDef.styles.cell).to.be.eql({"margin": [0, 4, 0, 0]});
    expect(docDef.styles.cellError).to.be.eql({"margin": [0, 4, 0, 0], "color": "#FF0000"});
    expect(docDef.styles.cellMoney).to.be.eql({"margin": [0, 4, 0, 0], "alignment": "right"});
    expect(docDef.styles.cellMoneyError).to.be.eql({"margin": [0, 4, 0, 0], "color": "#FF0000", "alignment": "right"});
    expect(docDef.styles.footer).to.be.eql({"fontSize": 8});
  });

  it("should return an instance of pdf", () => {
    const pdf = require("../src/index");
    expect(pdf).to.be.an.instanceOf(Object);
  });

  it("should return the document as a buffer", async () => {
    const pdf = require("../src/index");
    const template = pdf.defaultDocumentDefinition();
    const doc = await pdf.returnPdfBuffer(JSON.stringify(template), data);
    expect(doc).to.be.an.instanceOf(Buffer);
  });

  it("should merge buffer documents of different page sizes", async () => {
    const pdf = require("../src/index");
    const template1 = JSON.stringify({"content": [{"text": "Hello"}]});
    const template2 = JSON.stringify({"pageSize": {
      "width": 72*3.5,
      "height": 'auto'
    }, "content": [{"text": "Hello"}]});
    const doc1 = await pdf.returnPdfBuffer(template1, data);
    const doc2 = await pdf.returnPdfBuffer(template2, data);
    const result = await pdf.mergePDFBuffers([doc1, doc2]);
    expect(result).to.be.an.instanceOf(Buffer);
  });

  it("should return money even when values is zero", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        "{%- money ticket total -%}",
        "{%- curcySymbol ticket -%}",
        "{%- curcyIso ticket -%}",
        "{%- moneyReduce ticket ssrs subTotal -%}"
      ]
    }`;
    data.ticket.total = 0;
    data.ticket.ssrs[0].subTotal = 0;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "0.00",
        "$",
        "CAD",
        "31.00",
      ]
    });
  });

  it("should return a parsed liquidTemplate", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        "Transaction Id: {{transaction._id}}",
        "{% t 'h' %}",
        {%- for ticket in tickets -%}
        {%- if forloop.last == false -%}
        "{{ticket.fare}} and {%t ticket.fare %}",
        {%- else -%}
        "{{ticket.fare}} and {%t ticket.fare %}",
        {%- endif -%}
        {%- endfor -%}
        {%- hline 356 2 60,60,60 -%},
        {%- hline  -%},
        {%- barcode -%},
        {%- barcode 1234 code128 10 2 2 -%},
        {%- h 'html' -%},
        "{%- money ticket total -%}",
        "{%- curcySymbol ticket -%}",
        "{%- curcyIso ticket -%}",
        "{%- moneyReduce ticket ssrs subTotal -%}",
        "{%- humanDateTime ticket createdAt %}",
        "{%- humanDate ticket createdAt %}",
        "{%- dateTime ticket createdAt %}",
        "{%- dateTime ticket createdAt mm/dd/yyyy hh:MM:ss %}",
        "{%- dateF ticket createdAt %}",
        "{%- timeF ticket createdAt %}",
        {% txt providerPreferences.preferences.multiline %},
        {% txt providerPreferences.preferences.multiline small %}
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "Transaction Id: 5c9f8f8f8f8f8f8f8f8f8f8",
        "=>h",
        "adult and =>adult",
        "child and =>child",
        "person and =>person",
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(60,60,60);stroke-width:2' /></svg>",
          "width": 356
        },
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(0,0,0);stroke-width:1' /></svg>",
          "width": 500
        },
        {
          "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA3gAAAB4CAYAAACghlDTAAAAAklEQVR4AewaftIAAAPmSURBVO3BsW0EQQwEsJH673mcbnSA8ZlAcpI0H9rmNTN5tc2XmcmrbX4xM/nSNr+Ymbza5jUzebXNl5nJq23+Y2byi7Z5zUxebfOambza5svM5Bdt85qZvNrmy8zk1TZfZiZf2uY1M/mPtvkyM3m1zS9mJq+2ec1MvrTNl5nJq23+Y2byi7Z5zUxebfOamXxpm1/MTF5t85qZvNrmy8zk1TZfZia/aJvXzOTVNl9mJq+2ec1MvrTNl5nJq21+MTP50ja/mJm82uY1M3m1zZeZyattvsxMftE2r5nJq22+zExebfNlZvKlbV4zk/9omy8zk1fbfJmZfGmb18zk1Ta/mJm82uYXM5MvbfOambza5svM5Bdt85qZvNrmy8zk1TZfZiavtnnNTL60zZeZyattfjEz+dI2v5iZvNrmNTN5tc2XmcmXtvkyM/nSNl9mJl/a5jUz+dI2/zEz+Y+2ec1MXm3zmpl82QAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACX8+ALXvFMrcDQAAAABJRU5ErkJggg==",
          "width": 200
        },
        {
          "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAAAoCAYAAADufVZCAAAAAklEQVR4AewaftIAAADcSURBVO3BsY0EQRDDQKrzz1nvjrXA4R0ZrApQPrTllYRXW74k4Rdt+ZKEV1teSfjSli9J+EVbviTh1ZZfJOHVllcSvrTlF0l4teVLEl5t+ZKE/2jLKwlf2vKLJPyiLa8kvNrySsKXQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMPxSXLk+8Qj8BAAAAAElFTkSuQmCC",
          "width": 2
        },
        {"style": "header", "text": "Hello"},{"text": ""},{"text": "something"},{"text": ""},{"bold": true, "text": "html"},{"text": ""},{"italics": true, "text": "Italix"},
        "28.00",
        "$",
        "CAD",
        "59.00",
        "Tue Dec 21, 2021 11:38 AM",
        "Tue Dec 21, 2021",
        "12/21/2021 11:38 AM",
        "12/21/2021 11:38:00",
        "12/21/2021",
        "11:38 AM",
        {"text": "something here"},
        {"text": "and some more here"},
        {"text": "and some more here"},
        {"text": "something here", "style": "small"},
        {"text": "and some more here", "style": "small"},
        {"text": "and some more here", "style": "small"}
      ]
    });
  });
});