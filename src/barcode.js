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
      } catch (err) {
        this.content = "not-content-given";
        this.type = "code128";
        this.height = 30;
        this.width = args[3] || 200;
      }
    },
    render: async function(ctx) {
      // console.log(this.content);
      let content = await this.liquid.evalValue(this.content, ctx) || this.content;
      // console.log("content", content);
      let result = await createStream({
        symbology: getCode(this.type),
        height: this.height,
        showHumanReadableText: false,
        scale: 2.0,
      }, String(content), OutputType.PNG);
      // console.log("RESULT:", result);
      return `{
        "image": "${result.data}",
        "width": ${this.width || 200}
      }`;
    }
});
}

module.exports = {
  Barcode
};

