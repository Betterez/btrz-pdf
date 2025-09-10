const {createPdfBinary, createPdfKitDocument, defaultDocumentDefinition} = require("./pdf.js");
const pdfjs = require("pdfjs");
const tpl = require("btrz-liquid-templates");

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
  sanitizeJsonString(str) {
    if (typeof str !== "string") {
      throw new Error("INVALID_STRING");
    }

    return str
      .replace(/(\r\n|\n|\r)/g, "  ") 
      .replace(/[\u0000-\u001F]+/g, ""); 
  },
  async toDocumentDefinition(liquidTemplate, data) {
    const str = await tpl.processToString(liquidTemplate, data);
    const cleanStr = this.sanitizeJsonString(str);

    try {
      const obj = JSON.parse(cleanStr);

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