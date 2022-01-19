const writtenNumber = require("written-number");
const formatter = require("btrz-formatter");
function shortLang(lang) {
  let result = "en";
  if (lang && lang.substring) {
    result = lang.substring(0, 2);
  }
  return result;
}


function ToLetters(engine) {
  this.registerTag("toLetters", {
    parse: function(tagToken, remainTokens) {
      this.item = tagToken.args;
    },
    render: async function(ctx) {
      try {
        const value = await this.liquid.evalValue(this.item, ctx);
        const lang = shortLang(ctx.environments.lang);
        const [whole, cents] = value.toString().split(".");
        let centsNumber = writtenNumber(cents, {lang: "en"});
        if (centsNumber === "zero" || centsNumber === "") {
          return `${formatter.capitalize(writtenNumber(whole, {lang}))}`;
        }
        return formatter.capitalize(`${writtenNumber(whole, {lang})} ${ctx.environments.localizer.get("with")} ${writtenNumber(cents, {lang})} ${ctx.environments.localizer.get("cents")}`);
      } catch (e) {
        return "PNA";
      }
    }
  });
}

module.exports = {
  ToLetters
};

