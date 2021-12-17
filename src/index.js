const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");
const {createPdfBinary, createPdfKitDocument} = require("./pdf.js");

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
    const documentDefinition = await this.toDocumentDefinition(liquidTemplate, data);
    return createPdfKitDocument(documentDefinition);
  },
  async toDocumentDefinition(liquidTemplate, data) {
    const engine = new Liquid();
    engine.plugin(Localizer);

    const str = await engine.parseAndRender(liquidTemplate, data);
    return JSON.parse(str);
  }
};