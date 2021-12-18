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