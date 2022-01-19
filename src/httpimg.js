const axios = require("axios");

function getPrefix(url) {
  const extention = url.split(".").pop();
  if (extention.toLowerCase() === "png") {
    return "data:image/png;base64,";
  }
  return "data:image/jpeg;base64,";
}

function HttpImg(engine) {
  this.registerTag("httpImg", {
    parse: function(tagToken, remainTokens) {
      this.str = tagToken.args
    },
    render: async function(ctx) {
      const url = await this.liquid.evalValue(this.str, ctx);
      try {
        const response = await axios.get(url, {
          responseType: "arraybuffer"
        });
        return `${getPrefix(url)}${Buffer.from(response.data, "binary").toString("base64")}`;
      } catch (e) {
        console.log(e);
        return "";
      }
    }
});
}

module.exports = {
  HttpImg
};

