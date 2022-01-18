function Localizer(engine) {
  this.registerTag("t", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split("|");
      this.str = (args[0] || "").trim();
      if (args.length > 1) {
        this.tags = args.slice(1);
      }
    },
    render: async function(ctx) {
      let str = await this.liquid.evalValue(this.str, ctx);
      if (ctx && ctx.environments && ctx.environments.localizer && ctx.environments.localizer.get) {
        str = ctx.environments.localizer.get(str);
      }
      if (this.tags) {
        return await this.liquid.evalValue(`'${str}'|${this.tags}`, ctx);
      }
      return str;
    }
});
}

module.exports = {
  Localizer
};