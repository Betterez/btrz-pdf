function HorizontalLine(engine) {
  this.registerTag("hline", {
    parse: function(tagToken, remainTokens) {
      //width = 500, weight = 1, rgb = "0,0,0"
      try {
        const args = (tagToken.args || "").split(" ");
        this.width = args[0] || 500;
        this.weight = args[1] || 1;
        this.rgb = args[2] || "0,0,0";
      } catch (err) {
        this.width = 500;
        this.weight = 1;
        this.rgb = "0,0,0";
      }
    },
    render: async function(ctx) {
      return `{
        "svg": "<svg height='2' width='100'><line x1='0' y1='0' x2='1000' y2='0' style='stroke:rgb(${this.rgb});stroke-width:${this.weight}' /></svg>",
        "width": ${this.width}
      }`;
    }
});
}

module.exports = {
  HorizontalLine
};

