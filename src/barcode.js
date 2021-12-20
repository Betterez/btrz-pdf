const {SymbologyType, createStream, OutputType} = require("symbology");

function getCode(code) {
  switch (code) {
    case "code11":  
      return SymbologyType.CODE11;
    case "code128":
      return SymbologyType.CODE128;
    case "code39":
      return SymbologyType.CODE39;
    case "code93":
      return SymbologyType.CODE93;
    case "ean13":
      return SymbologyType.EAN13;
    case "ean8":
      return SymbologyType.EAN8;
    case "upca":
      return SymbologyType.UPCA;
    case "upce":
      return SymbologyType.UPCE;
    case "qrcode":
      return SymbologyType.QRCODE;
    default:
      return SymbologyType.CODE128;
  }
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

