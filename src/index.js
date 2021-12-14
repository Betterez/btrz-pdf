const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");

module.exports = {
  async toDocumentDefinition(liquidTemplate, data) {
    const engine = new Liquid();
    engine.plugin(Localizer);

    const str = await engine.parseAndRender(liquidTemplate, data);
    return JSON.parse(str);
  }
};