const {timezones, BzDate} = require("bz-date");
const formatter = require("btrz-formatter");
function shortLang(lang) {
  let result = "en";
  if (lang && lang.substring) {
    result = lang.substring(0, 2);
  }
  return result;
}
function getFriendlyFormat(humanDate) {
  return (humanDate === "mm") ? "ddd mmm dd, yyyy" : "ddd dd mmm, yyyy"
}

function getDate(envs, item, propName, format) {
  const timeFormat = envs.providerPreferences.preferences.timeFormat;
  const timeZone = envs.providerPreferences.preferences.timeZone;
  const lang = shortLang(envs.lang);
  const date = new BzDate(envs[item][propName]);
  const offset = timezones.getOffset(timeZone, date);
  const createdLocal = date.addMinutes(offset);
  return `${formatter.dateFormat(createdLocal.toString(`'yyyy-mm-dd' ${timeFormat}`), `${format}`, false, lang)}`;
}

function HumanDateTime(engine) {
  this.registerTag("humanDateTime", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
    },
    render: async function(ctx) {
     
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = `${getFriendlyFormat(ctx.environments.humanDate || "mm")} ${ ctx.environments.providerPreferences.preferences.timeFormat}`;
        return getDate(ctx.environments, this.item, this.propName, format);
      }
      return "PNA";
    }
  });
}

function HumanDate(engine) {
  this.registerTag("humanDate", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
    },
    render: async function(ctx) {
     
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = getFriendlyFormat(ctx.environments.humanDate || "mm");
        return getDate(ctx.environments, this.item, this.propName, format);
      }
      return "PNA";
    }
  });
}

function DateTime(engine) {
  this.registerTag("dateTime", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
      if (args.length > 2) {
        this.format = args.slice(2).join(" ") || "";
      }
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = this.format || `${ctx.environments.providerPreferences.preferences.dateFormat} ${ctx.environments.providerPreferences.preferences.timeFormat}`;
        return getDate(ctx.environments, this.item, this.propName, format);
      }
      return "PNA";
    }
  });
}

function DateF(engine) {
  this.registerTag("dateF", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = ctx.environments.providerPreferences.preferences.dateFormat;
        return getDate(ctx.environments, this.item, this.propName, format);
      }
      return "PNA";
    }
  });
}

function TimeF(engine) {
  this.registerTag("timeF", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = ctx.environments.providerPreferences.preferences.timeFormat;
        return getDate(ctx.environments, this.item, this.propName, format);
      }
      return "PNA";
    }
  });
}

module.exports = {
  DateF,
  DateTime,
  HumanDate,
  HumanDateTime,
  TimeF
};

