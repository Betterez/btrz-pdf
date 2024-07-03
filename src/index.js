const {Liquid} = require("liquidjs");
const {Localizer} = require("./localizer.js");
const {HorizontalLine} = require("./lines.js");
const {Barcode} = require("./barcode.js");
const {Html} = require("./html.js");
const {Money, CurcySymbol, CurcyIso, CurcyName, MoneyReduce} = require("./money.js");
const {DateF, TimeF, DateTime, HumanDate, HumanDateTime, ExpDate, HumanArrivalDateTime, HumanDepartureDateTime,
  DepartureDateTime, ArrivalDateTime, DepartureDate, ArrivalDate, DepartureTime, ArrivalTime, HumanArrivalDate,
  HumanDepartureDate
} = require("./dateFormat.js");
const {Text} = require("./text.js");
const {QrString} = require("./qrstr.js");
const {ToLetters} = require("./toletters.js");
const {createPdfBinary, createPdfKitDocument, defaultDocumentDefinition} = require("./pdf.js");
const {HttpImg} = require("./httpimg.js");
const {Keys} = require("./object.js");
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
    const engine = new Liquid({
      layouts: ["/nowhere/"],
      root: ["/nowhere/"],
      partials: ["/nowhere/"],
      extname: ".liquid",
      dynamicPartials: false,
      outputEscape: (val) => {
        if (typeof val === "string") {
          return val.replace(/[\\]/g, '\\\\')
          .replace(/[\"]/g, '\\"')
          .replace(/[\/]/g, '\\/')
          .replace(/[\b]/g, '\\b')
          .replace(/[\f]/g, '\\f')
          .replace(/[\n]/g, '\\n')
          .replace(/[\r]/g, '\\r')
          .replace(/[\t]/g, '\\t');
        }
        return val;
      }
    });
    engine.plugin(Localizer);
    engine.plugin(Html);
    engine.plugin(HorizontalLine);
    engine.plugin(Barcode);
    engine.plugin(Money);
    engine.plugin(CurcySymbol);
    engine.plugin(CurcyIso);
    engine.plugin(CurcyName);
    engine.plugin(MoneyReduce);
    engine.plugin(DateF);
    engine.plugin(TimeF);
    engine.plugin(DateTime);
    engine.plugin(HumanDate);
    engine.plugin(HumanDateTime);
    engine.plugin(HumanArrivalDateTime);
    engine.plugin(HumanDepartureDateTime);
    engine.plugin(DepartureDateTime);
    engine.plugin(ArrivalDateTime);
    engine.plugin(DepartureDate);
    engine.plugin(ArrivalDate);
    engine.plugin(DepartureTime);
    engine.plugin(ArrivalTime);
    engine.plugin(HumanArrivalDate);
    engine.plugin(HumanDepartureDate);
    engine.plugin(Text);
    engine.plugin(ExpDate);
    engine.plugin(QrString);
    engine.plugin(ToLetters);
    engine.plugin(HttpImg);
    engine.plugin(Keys);
    const str = await engine.parseAndRender(liquidTemplate, data);
    try {
      const obj = JSON.parse(str);

      if (obj.headerFn && obj.headerFn.text && obj.headerFn.text.replace) {
        obj.header = function(currentPage, pageCount, pageSize) {
          const txt = obj.headerFn.text
            .replace(/currentPage/g, currentPage)
            .replace(/pageCount/g, pageCount);
          return [
            {
              "text": txt,
              "style": obj.headerFn.style || "header"            
            }
          ];
        }
      }
      if (obj.footerFn && obj.footerFn.text && obj.footerFn.text.replace) {
        obj.footer = function(currentPage, pageCount, pageSize) {
          const txt = obj.footerFn.text
            .replace(/currentPage/g, currentPage)
            .replace(/pageCount/g, pageCount);
          return [
            {
              "text": txt,
              "style": obj.footerFn.style || "footer"          
            }
          ];
        }
      }
      return obj;

    } catch (err) {
      err.data = str;
      throw err;
    }
  },
  defaultDocumentDefinition
};