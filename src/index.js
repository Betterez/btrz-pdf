const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");
const {HorizontalLine} = require("./lines.js");
const {Barcode} = require("./barcode.js");
const {Html} = require("./html.js");
const {Money, CurcySymbol, CurcyIso} = require("./money.js");
const {createPdfBinary, createPdfKitDocument, defaultDocumentDefinition} = require("./pdf.js");

module.exports = {
  async returnPdfBinary(liquidTemplate, data, cb) {
    try {
      const documentDefinition = await this.toDocumentDefinition(liquidTemplate, data);
      createPdfBinary(documentDefinition, cb);
    } catch (err) {
      cb(err, null);
    }
  },
  async returnPdfDocument(liquidTemplate, data) {
    try {
      const documentDefinition = await this.toDocumentDefinition(liquidTemplate, data);
      return createPdfKitDocument(documentDefinition);
    } catch (err) {
      throw err;
    }
  },
  async toDocumentDefinition(liquidTemplate, data) {
    const engine = new Liquid();
    engine.plugin(Localizer);
    engine.plugin(Html);
    engine.plugin(HorizontalLine);
    engine.plugin(Barcode);
    engine.plugin(Money);
    engine.plugin(CurcySymbol);
    engine.plugin(CurcyIso);
    const str = await engine.parseAndRender(liquidTemplate, data);
    console.log(str);
    return JSON.parse(str);
  },
  defaultDocumentDefinition
};