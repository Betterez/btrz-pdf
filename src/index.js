const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");
const {HorizontalLine} = require("./lines.js");
const {Barcode} = require("./barcode.js");
const {Html} = require("./html.js");
const {Money, CurcySymbol, CurcyIso, MoneyReduce} = require("./money.js");
const {DateF, TimeF, DateTime, HumanDate, HumanDateTime, ExpDate} = require("./dateFormat.js");
const {Text} = require("./text.js");
const {QrString} = require("./qrstr.js");
const {createPdfBinary, createPdfKitDocument, defaultDocumentDefinition} = require("./pdf.js");
const pdfjs = require("pdfjs");

module.exports = {
  async mergePDFBuffers(buffers) {
    const merged = new pdfjs.Document({
      // won't be used, pdfjs just requires a font
      font: require("pdfjs/font/Helvetica")
    });

    for (const buffer of buffers) {
      const ext = new pdfjs.ExternalDocument(buffer);
      merged.addPagesOf(ext);
    }

    return merged.asBuffer();
  },
  async returnPdfBuffer(liquidTemplate, data ) {
    try {
      const documentDefinition = await this.toDocumentDefinition(liquidTemplate, data);
      const doc = createPdfKitDocument(documentDefinition);
      const p = new Promise((resolve, reject) => {
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("error", reject);
        doc.on("end", () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
      });
      doc.end();
      return p;
    } catch (err) {
      throw err;
    }
  },
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
    engine.plugin(Text);
    engine.plugin(ExpDate);
    engine.plugin(QrString);
    const str = await engine.parseAndRender(liquidTemplate, data);
    // console.log(str);
    return JSON.parse(str);
  },
  defaultDocumentDefinition
};