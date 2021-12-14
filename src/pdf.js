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
  return printer.createPdfKitDocument(docDefinition);
}

function defaultStyle() {
  return {
    font: "Helvetica",
    fontSize: 10,
    lineHeight: 1.3
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
		callback("data:application/pdf;base64," + result.toString("base64"));
	});
	doc.end();
}

module.exports = {
  createPdfBinary
}