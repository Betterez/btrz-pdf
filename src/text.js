function getLines(str, style) {
  if (!str || !str.replace) { return ""; }
  const lines = str.replace(/\r\n/g, '<br/>')
    .replace(/\n/g, '<br/>')
    .replace(/\r/g, '<br/>')
    .replace(/<br>/ig, '<br/>')
    .replace(/"/ig, '``')
    .split('<br/>');
  return lines.map((line) => {
    if (style) {
      return `{"text": "${line}", "style": "${style}"}`;
    }
    return `{"text": "${line}"}`;
  }).join(",");
}

function Text(engine) {
  this.registerTag("txt", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.str = args[0];
      this.style = args[1];
    },
    render: async function(ctx) {
      let str = await this.liquid.evalValue(this.str, ctx);
      return getLines(str, this.style);
    }
});
}

module.exports = {
  Text
};


