function QrString(engine) {
  this.registerTag("qrstr", {
    parse: function(tagToken, remainTokens) {
      this.str = (tagToken.args || "ticket").toLowerCase();
    },
    render: async function(ctx) {
      if (this.str === "reservation" || this.str === "ticket") {
        return `https://${ctx.environments.providerPreferences.domain}/r/t/${ctx.environments[this.str].urlTicketCode}`;
      }
      if (this.str === "solditem") {
        return `PI-${ctx.environments.soldItem._id.toString()}`;
      }
      if (this.str === "parcel") {
        return `${ctx.environments.parcel.accountId}-PA-${ctx.environments.parcel._id.toString()}`;
      }
      if (this.str === "flexpass") {
        return `${ctx.environments.flexPass.ticketNumber}`;
      }
      if (this.str === "ssr") {
        return `${ctx.environments.ssr.ssrsInstanceId}`;
      }
      if (this.str === "redeemableitem") {
        return `RI-${ctx.environments.redeemableItem._id.toString()}`;
      }
      return ""
    }
});
}

module.exports = {
  QrString
};

