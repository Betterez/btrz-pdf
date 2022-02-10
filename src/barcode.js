const {SymbologyType, createStream, OutputType} = require("symbology");

function getCode(code) {
  return SymbologyType[code.toUpperCase()];
}

function Barcode(engine) {
  this.registerTag("barcode", {
    parse: function(tagToken, remainTokens) {
      try {
        const args = (tagToken.args || "").split(" ");
        this.content = args[0] || "not-content-given";
        this.type = args[1] || "code128";
        this.height = args[2] || 30;
        this.width = args[3] || 200;
        this.margin = args[4] || "0,0,0,0";
      } catch (err) {
        this.content = "not-content-given";
        this.type = "code128";
        this.height = 30;
        this.width = args[3] || 200;
        this.margin = args[4] || "0,0,0,0";
      }
    },
    render: async function(ctx) {
      let content = await this.liquid.evalValue(this.content, ctx) || this.content;
      let result = await createStream({
        symbology: getCode(this.type),
        height: this.height,
        showHumanReadableText: false,
        scale: 2.0,
      }, String(content), OutputType.PNG);
      let margin = [0,0,0,0];
      try {
        margin = this.margin.split(",").map((i) => {
          return parseInt(i,10);
        });
        if (margin.length !== 4) {
          margin = [0,0,0,0];
        }
      } catch (err) {
        console.log("ERROR:", err);
        margin = [0,0,0,0];
      }
      return `{
        "image": "${result.data}",
        "width": ${this.width || 200},
        "margin": [${margin.join(",")}]
      }`;
    }
});
}

module.exports = {
  Barcode
};

