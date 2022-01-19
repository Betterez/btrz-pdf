describe("index.js", () => {
  const {expect} = require("chai");
  let data = null;
  beforeEach(() => {
    data = {
      brand: {
        logos: {
          default: "https://s3.amazonaws.com/btrz-images-test2/b5416770-795b-11ec-b752-8b6ef2019164.png"
        }
      },
      transaction: {
        _id: "5c9f8f8f8f8f8f8f8f8f8f8",
        payments: [
          {
            provider: "inperson",
            type: "cash",
            displayName: "Cash",
            status: "success",
            amount: 3.86,
            rollbackPayload: null,
            acceptedCurrency: {
              isocode:"GTQ",
              symbol:"Q",
              buy:7.77,
              sell:7.57,
              channels:[]
            },
            displayAmount: "30.00",
            displayCurrency: {
              isocode:"GTQ",
              symbol:"Q",
              buy:7.77,
              sell:7.57
            },
            acceptedCurrencyAmount: 30,
            exchangeDetails: {
              exchangeCurrency:{},
              acceptedCurrencyAmount: 3000000,
              acceptedCurrencyAmountReceived: 3000000,
              acceptedCurrencyAmountReturned: 0,
              exchangeCurrencyAmount: 386100,
              exchangeCurrencyAmountReceived: 386100,
              exchangeCurrencyAmountReturned: 0
            }
          },
          {
            amount: 20,
            displayCurrency: {
              isocode:"USD",
              symbol:"$",
              buy:7.77,
              sell:7.57
            },
          },
          {
            amount: 30
          }
        ]
      },
      providerPreferences: {
        preferences: {
          colors: {
            brandBackground: "#ee732f"
          },
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
        total: 2836000,
        displayTotalStr: "28.36",
        "displayTotalStr2": "289",
        "displayTotalStr3": "289.00",
        arrivalTimestamp: "2022-01-19T13:00:00.000Z",
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
          if (key === "text") {
            return "text here please";
          }
          return `=>${key}`;
        }
      },
      lang: "es-ar"
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

  it("should load images via https", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        {
          "image" : "{% httpImg brand.logos.default %}"
        }
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        {
          "image": "data:image/png;base64,77+9UE5HDQoaCgAAAA1JSERSAAAA77+9AAAAHgQDAAAA77+9Fx7vv70AAAAbUExURe+/ve+/ve+/vT/vv70/X++/vV/vv73vv73fv9+/f++/vX/vv73Pnx/vv70fAO+/vQDvv71AXu+/vQAAAAF0Uk5TAEDvv73vv71mAAAACXBIWXMAAA7vv70AAA7vv70B77+9Kw4bAAAC77+9SURBVEjvv73Flj1v77+9MBDvv71pU++/vTsabe+/vWrvv70QBB7vv70P77+9GtWgaDV6yKBRQe+/vXp0Uu+/ve+/vVjvv71JdD/vv73vv707UjpKDRrvv702zIHvv71e77+977+9UO+/ve+/ve+/vSnvv71K77+977+9W11277+977+9OGvvv71TNUfvv73vv73vv70c77+977+9Pzkd77+9zpPvv73vv73Fie+/vRjvv73vv70177+977+9bHTvv73vv70z0ofvv707Iz3vv73vv71+Fx/vv73vv73vv73vv71tVV/vv73vv71877+9Lu+/vdKBdO+/ve+/ve+/ve+/vX0RZe+/vVfvv70THO+/vWlbfCPvv73vv73vv71yJu+/ve+/ve+/ve+/vTrvv70e77+977+977+9bu+/ve+/ve+/vQHvv71fEe+/vSfvv71b77+9CO+/vSFteBvvv73vv73vv73vv71x77+9CTnvv71NJu+/vSPvv71z77+9K++/ve+/ve+/vU4tKnjvv73vv71mPe+/ve+/ve+/ve+/vVDvv70ibO+/ve+/vRJSQ++/ve+/ve+/vVvvv73vv73vv73vv71Q77+977+9KO+/vci677+977+977+977+9Ke+/vWvvv70H77+977+9bQ3vv70D77+9PRLvv73vv73vv705IgXvv73vv70s77+977+9eWrvv71BSu+/ve+/vTzvv71AOn7vv70fCSvvv70eAwXvv73vv717ee+/vTzvv73auhlHCO+/ve+/vdy877+977+9SO+/ve+/ve+/vVYUf3Pvv71kKe+/vTBCbO+/vT1lZu+/vVHvv73vv73vv73vv73vv73vv70B35kq77+9S++/ve+/vU7vv702OjLvv70Y77+9fO+/vW/vv73Yp++/vWHvv70SBu+/vWjvv73vv73vv70U77+9FO+/ve+/vSvvv73vv71P77+977+9X++/vXwN77+9G++/vSbvv71uPn12ED01xLXvv70+SRfvv73vv73vv71777+977+9Mu+/vWk877+9xKRN77+9eu+/ve+/vXUiNu+/vSMfFwc4Te+/ve+/vWLvv73vv73vv73vv70ldkvvv70k77+9EwFO77+977+9U++/vRYT77+9be+/vVfvv73vv73vv70rLu+/ve+/vcOd77+9e++/ve+/ve+/vX0QXGbvv73vv704LX9D77+977+977+9OS1N77+9AE8xS++/ve+/vTDvv71pJO+/vSTvv70U77+977+9aOS0pe+/vX0KOxzVnO+/ve+/ve+/vVIqQkxW77+9FzHvv71/DnDvv70nLO+/ve+/vXxmUW/vv73vv73vv71x77+9ae+/vUIa77+977+977+9dFrvv73vv73vv73vv73vv71vMe+/vVsn77+9d29lDV1I77+9NO+/vVA6bjZtK++/vVIpCu+/ve+/ve+/vRPvv70v77+977+977+977+9Me+/vVQyclUJF++/vXJley4hd++/ve+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vd6b77+977+977+977+9L++/vVVY77+9cu+/ve+/ve+/vXvvv73vv73vv71G77+9P++/vS9EeO+/vULamO+/vQAAAABJRU5E77+9QmDvv70="
        }
      ]
    });
  });

  it("should apply tag after translations", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        "{% t 'text' | upcase %}"
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "TEXT HERE PLEASE"
      ]
    });
  });

  it("should return money even when values is zero", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        {%for payment in transaction.payments %}
        "{%- curcySymbol payment -%}",
        "{%- curcyIso payment -%}",
        {% endfor %}
        "{%- money ticket total -%}",
        "{%- curcySymbol ticket -%}",
        "{%- curcyIso ticket -%}",
        "{%- moneyReduce ticket.ssrs subTotal -%}"
      ]
    }`;
    data.ticket.total = 0;
    data.ticket.ssrs[0].subTotal = 0;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "Q",
        "GTQ",
        "$",
        "USD",
        "$",
        "USD",
        "0.00",
        "$",
        "CAD",
        "31.00",
      ]
    });
  });

  it("should return currency in letters", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        "{% toLetters ticket.displayTotalStr %}",
        "{% toLetters ticket.displayTotalStr2 %}",
        "{% toLetters ticket.displayTotalStr3 %}",
        "{% curcyName ticket %}"
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "Veintiocho =>with treinta y seis =>cents",
        "Doscientos ochenta y nueve",
        "Doscientos ochenta y nueve",
        "=>CAD"
      ]
    })
  });

  it("should return alines with the correct colour", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        {%- hline 356 2 60,60,60 -%},
        {%- hline 356 2 #404040 -%},
        {%- hline  -%},
        {%- hline 100 2 providerPreferences.preferences.colors.brandBackground -%}
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(60,60,60);stroke-width:2' /></svg>",
          "width": 356
        },
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(64,64,64);stroke-width:2' /></svg>",
          "width": 356
        },
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(0,0,0);stroke-width:1' /></svg>",
          "width": 500
        },
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(238,115,47);stroke-width:2' /></svg>",
          "width": 100
        }
      ]
    });
  });

  it("should parse dates from ISO dates", async () => {
    const pdf = require("../src/index");
    const template = `{
      "content": [
        "{%- humanDateTime ticket arrivalTimestamp %}",
        "{%- humanDate ticket arrivalTimestamp %}",
        "{%- dateTime ticket arrivalTimestamp %}",
        "{%- dateTime ticket arrivalTimestamp mm/dd/yyyy hh:MM:ss %}",
        "{%- dateF ticket arrivalTimestamp %}",
        "{%- timeF ticket arrivalTimestamp %}"
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "Mié Ene 19, 2022 8:00 AM",
        "Mié Ene 19, 2022",
        "01/19/2022 8:00 AM",
        "01/19/2022 08:00:00",
        "01/19/2022",
        "8:00 AM"
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
        "{%- moneyReduce ticket.ssrs subTotal -%}",
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
        "=>h","adult and =>adult","child and =>child","person and =>person",{
        "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(60,60,60);stroke-width:2' /></svg>",
        "width": 356
      },{
        "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(0,0,0);stroke-width:1' /></svg>",
        "width": 500
      },{
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA3gAAAB4CAYAAACghlDTAAAAAklEQVR4AewaftIAAAPmSURBVO3BsW0EQQwEsJH673mcbnSA8ZlAcpI0H9rmNTN5tc2XmcmrbX4xM/nSNr+Ymbza5jUzebXNl5nJq23+Y2byi7Z5zUxebfOambza5svM5Bdt85qZvNrmy8zk1TZfZiZf2uY1M/mPtvkyM3m1zS9mJq+2ec1MvrTNl5nJq23+Y2byi7Z5zUxebfOamXxpm1/MTF5t85qZvNrmy8zk1TZfZia/aJvXzOTVNl9mJq+2ec1MvrTNl5nJq21+MTP50ja/mJm82uY1M3m1zZeZyattvsxMftE2r5nJq22+zExebfNlZvKlbV4zk/9omy8zk1fbfJmZfGmb18zk1Ta/mJm82uYXM5MvbfOambza5svM5Bdt85qZvNrmy8zk1TZfZiavtnnNTL60zZeZyattfjEz+dI2v5iZvNrmNTN5tc2XmcmXtvkyM/nSNl9mJl/a5jUz+dI2/zEz+Y+2ec1MXm3zmpl82QAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACRsAAABO2AAAAHDCBgAAgBM2AAAAnLABAADghA0AAAAnbAAAADhhAwAAwAkbAAAATtgAAABwwgYAAIATNgAAAJywAQAA4IQNAAAAJ2wAAAA4YQMAAMAJGwAAAE7YAAAAcMIGAACAEzYAAACcsAEAAOCEDQAAACdsAAAAOGEDAADACX8+ALXvFMrcDQAAAABJRU5ErkJggg==",
        "width": 200
      },{
        "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAAAoCAYAAADufVZCAAAAAklEQVR4AewaftIAAADcSURBVO3BsY0EQRDDQKrzz1nvjrXA4R0ZrApQPrTllYRXW74k4Rdt+ZKEV1teSfjSli9J+EVbviTh1ZZfJOHVllcSvrTlF0l4teVLEl5t+ZKE/2jLKwlf2vKLJPyiLa8kvNrySsKXQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMQ9KMPxSXLk+8Qj8BAAAAAElFTkSuQmCC",
        "width": 2
      },{"style": "header", "text": "Hello"},{"text": ""},{"text": "something"},{"text": ""},{"bold": true, "text": "html"},{"text": ""},{"italics": true, "text": "Italix"},
        "28.36",
        "$",
        "CAD",
        "59.00",
        "Mar Dic 21, 2021 11:38 AM",
        "Mar Dic 21, 2021",
        "12/21/2021 11:38 AM",
        "12/21/2021 11:38:00",
        "12/21/2021",
        "11:38 AM",
        {"text": "something here"},{"text": "and some more here"},{"text": "and some more here"},
        {"text": "something here", "style": "small"},{"text": "and some more here", "style": "small"},{"text": "and some more here", "style": "small"}
      ]
    });
  });
});