describe("index.js", () => {
  const {expect} = require("chai");
  let data = null;
  beforeEach(() => {
    data = {
      transaction: {
        _id: "5c9f8f8f8f8f8f8f8f8f8f8",
      },
      tickets: [
        {
          fare: "adult",
        },
        {
          fare: "child",
        },
        {
          fare: "person", 
        }
      ],
      localizer: {
        get: (key) => {
          return `=>${key}`;
        }
      }
    }
  });


  it.only("should return a default document definition", () => {
    const pdf = require("../src/index.js");
    const docDef = pdf.defaultDocumentDefinition();
    expect(docDef).to.be.an("object");
    expect(docDef.content).to.be.an("array");
    expect(docDef.content).to.be.eql([]);
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
        {%- hline 356 '60,60,60' -%},
        {%- hline  -%}
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
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(undefined);stroke-width:'60,60,60'' /></svg>",
          "width": 356
        },
        {
          "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(undefined);stroke-width:undefined' /></svg>",
          "width": 500
        }
      ]
    });
  });
});