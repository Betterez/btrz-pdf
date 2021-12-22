const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");
const {HorizontalLine} = require("./lines.js");
const {Barcode} = require("./barcode.js");
const {Html} = require("./html.js");
const {Money, CurcySymbol, CurcyIso, MoneyReduce} = require("./money.js");
const {DateF, TimeF, DateTime, HumanDate, HumanDateTime} = require("./dateFormat.js");
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
    engine.plugin(MoneyReduce);
    engine.plugin(DateF);
    engine.plugin(TimeF);
    engine.plugin(DateTime);
    engine.plugin(HumanDate);
    engine.plugin(HumanDateTime);
    const str = await engine.parseAndRender(liquidTemplate, data);
    console.log(str);
    return JSON.parse(str);
  },
  defaultDocumentDefinition
};