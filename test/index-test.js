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
        "{{ticket.fare}} and {%t ticket.fare %}"
        {%- endif -%}
        {%- endfor -%}
      ]
    }`;
    const documentDefinition = await pdf.toDocumentDefinition(template, data);
    expect(documentDefinition).to.be.eql({
      "content": [
        "Transaction Id: 5c9f8f8f8f8f8f8f8f8f8f8",
        "=>h",
        "adult and =>adult",
        "child and =>child",
        "person and =>person"
      ]
    });
  });
});