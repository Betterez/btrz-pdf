function QrString(engine) {
  this.registerTag("qrstr", {
    parse: function(tagToken, remainTokens) {
      this.str = tagToken.args || "ticket";
    },
    render: async function(ctx) {
      if (this.str === "reservation" || this.str === "ticket") {
        return `https://${ctx.environments.providerPreferences.domain}/r/t/${ctx.environments[this.str].urlTicketCode}`;
      }
      if (this.str === "paid_in") {
        return `PI-${ctx.environments.paidIn._id.toString()}`;
      }
      if (this.str === "parcel") {
        return `${ctx.environments.parcel.accountId}-PA-${ctx.environments.parcel._id.toString()}`;
      }
      if (this.str === "flexpass") {
        return `${ctx.environments.flexpass.ticketNumber}`;
      }
      if (this.str === "ssr") {
        return `${ctx.environments.ssr.ssrsInstanceId}`;
      }
      if (this.str === "redeemableItem") {
        return `RI-${ctx.environments.redeemableItem._id.toString()}`;
      }
      return ""
    }
});
}

module.exports = {
  QrString
};

