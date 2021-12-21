function getBoldToken(token) {
  const txt = token.replace(/<\/b>/ig, '<b>').replace(/<b>/ig, '');
  return `{"bold": "true", "text": "${txt}"}`;
}

function getItalicToken(token) {
  const txt = token.replace(/<\/i>/ig, '<i>').replace(/<i>/ig, '');
  return `{"style": "italic", "text": "${txt}"}`;
}

function getHeaderToken(token, size) {
  const txt = token.replace(/<\/h1>/ig, '<h>')
    .replace(/<\/h2>/ig, '<h>')
    .replace(/<\/h3>/ig, '<h>')
    .replace(/<h1>/ig, '<h>')
    .replace(/<h2>/ig, '<h>')
    .replace(/<h3>/ig, '<h>')
    .replace(/<h>/ig, '');
  return `{"style": "header${size}", "text": "${txt}"}`;
}

function getTokenInfo(token) {
  if (token.indexOf('<b>') !== -1) { return getBoldToken(token); }
  if (token.indexOf('<i>') !== -1) { return getItalicToken(token); }
  if (token.indexOf('<h1>') !== -1) { return getHeaderToken(token, '1'); }
  if (token.indexOf('<h2>') !== -1) { return getHeaderToken(token, '2'); }
  if (token.indexOf('<h3>') !== -1) { return getHeaderToken(token, '3'); }
  return `{"text": "${token.trim()}"}`;
}

function parseLine(line) {
  if (!line) { return [getTokenInfo(line)]; }
  const htmls = line.match(/<.>.*?<\/.>/ig);
  const parsed = [];
  let parts = [];

  if (htmls) {
    htmls.forEach((token) => {
      parts = line.split(token);
      parsed.push(getTokenInfo(parts[0]));
      parsed.push(getTokenInfo(token));
      if (parts.length > 1) {
        line = parts[1];
      }
    });
  }
  if (line) {
    parsed.push(getTokenInfo(line));
  }
  return parsed;
}

function getLines(str) {
  const parsed = [];
  if (!str.replace) {
    return parsed;
  }
  const lines = str.replace(/\r\n/g, '<br/>')
    .replace(/\n/g, '<br/>')
    .replace(/\r/g, '<br/>')
    .replace(/<br>/ig, '<br/>')
    .split('<br/>');
  return lines.map((line) => {
    return parseLine(line);
  }).join(",");
}

function Html(engine) {
  this.registerTag("h", {
    parse: function(tagToken, remainTokens) {
      this.str = tagToken.args;
    },
    render: async function(ctx) {
      let str = await this.liquid.evalValue(this.str, ctx);
      
      if (ctx && ctx.environments && ctx.environments.localizer && ctx.environments.localizer.get) {
        return getLines(ctx.environments.localizer.get(str));
      }
      return getLines(str);
    }
});
}

module.exports = {
  Html
};


