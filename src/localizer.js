function Localizer(engine) {
  this.registerTag("t", {
    parse: function(tagToken, remainTokens) {
      this.str = tagToken.args;
    },
    render: async function(ctx) {
      let str = await this.liquid.evalValue(this.str, ctx);
      if (ctx && ctx.environments && ctx.environments.localizer && ctx.environments.localizer.get) {
        return ctx.environments.localizer.get(str);
      }
      return str;
    }
});
}

module.exports = {
  Localizer
};