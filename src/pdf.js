const PdfPrinter = require("pdfmake");
const fonts = {
  Helvetica: {
    normal: "Helvetica",
    bold: "Helvetica-Bold",
    italics: "Helvetica-Oblique",
    bolditalics: "Helvetica-BoldOblique"
  }
};

function _pageBreakBefore(currentNode, followingNodesOnPage, _nodesOnNextPage, _previousNodesOnPage) {
  return currentNode.headlineLevel === 1 &&
    followingNodesOnPage.length === 0;
}
function createPdfKitDocument(docDefinition) {
  const printer = new PdfPrinter(fonts);
  if (!docDefinition.pageBreakBefore) {
    // eslint-disable-next-line no-param-reassign
    docDefinition.pageBreakBefore = _pageBreakBefore;
  }
  if (!docDefinition.defaultStyle) {
    docDefinition.defaultStyle = defaultStyle();
  }
  return printer.createPdfKitDocument(docDefinition);
}

function defaultStyle() {
  return {
    font: "Helvetica",
    fontSize: 10,
    lineHeight: 1.3
  };
}

function styles() {
  return {
    "header": {
      fontSize: 16,
      bold: true,
      margin: [0, 0, 0, 10]
    },
    "subheader": {
      fontSize: 14,
      bold: true,
      margin: [0, 20, 0, 0]
    },
    "tableHeader": {
      fontSize: 8,
      bold: true,
      margin: [0, 4, 0, 0]
    },
    "table": {
      fontSize: 8,
      margin: [0, 8, 0, 0]
    },
    "attachedTable": {
      fontSize: 8
    },
    "cell": {
      margin: [0, 4, 0, 0]
    },
    "cellError": {
      margin: [0, 4, 0, 0],
      color: "#FF0000"
    },
    "cellMoney": {
      margin: [0, 4, 0, 0],
      alignment: "right"
    },
    "cellMoneyError": {
      margin: [0, 4, 0, 0],
      color: "#FF0000",
      alignment: "right"
    },
    "footer": {
      fontSize: 8
    }
  };
}

function createPdfBinary(pdfDoc, callback) {
  if (!pdfDoc.defaultStyle) {
    pdfDoc.defaultStyle = defaultStyle();
  }
	const doc = createPdfKitDocument(pdfDoc);

	const chunks = [];
	let result = null;

	doc.on("data", function (chunk) {
		chunks.push(chunk);
	});
	doc.on("end", function () {
		result = Buffer.concat(chunks);
		callback(null, "data:application/pdf;base64," + result.toString("base64"));
	});
	doc.end();
}

function defaultDocumentDefinition() {
  return {
    defaultStyle: defaultStyle(),
    styles: styles(),
    content: []
  };
}

module.exports = {
  createPdfBinary,
  createPdfKitDocument,
  defaultDocumentDefinition
}