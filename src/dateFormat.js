const {timezones, BzDate} = require("bz-date");
const formatter = require("btrz-formatter");
const moment = require("moment");
require("moment-timezone");
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

function formatBzDate(bzDate, format, envs) {
  const lang = shortLang(envs.lang);
  const timeFormat = envs.providerPreferences.preferences.timeFormat;
  const timeZone = envs.providerPreferences.preferences.timeZone;
  const offset = timezones.getOffset(timeZone, bzDate);
  const createdLocal = bzDate.addMinutes(offset);
  return `${formatter.dateFormat(createdLocal.toString(`'yyyy-mm-dd' ${timeFormat}`), `${format}`, false, lang)}`;
}

function formatMoment(date, format, envs, applyTimeZone) {
  const lang = shortLang(envs.lang);
  const timeFormat = envs.providerPreferences.preferences.timeFormat;
  const timeZone = envs.providerPreferences.preferences.timeZone;
  const timeFormatCompatibleWithMomentJS = timeFormat.replace("TT", "A").replace(/M/g, "m");
  let strDate = "";
  if (applyTimeZone) {
    strDate = moment(date).tz(timeZone.tz)
      .format(`'YYYY-MM-DD' ${timeFormatCompatibleWithMomentJS}`);
  } else {
    strDate = moment(date)
      .format(`'YYYY-MM-DD' ${timeFormatCompatibleWithMomentJS}`);
  }
  return `${formatter.dateFormat(strDate, `${format}`, false, lang)}`;
}

function formatBzDate2(bzDate, format, envs) {
  const lang = shortLang(envs.lang);
  const timeFormat = envs.providerPreferences.preferences.timeFormat;
  return `${formatter.dateFormat(bzDate.toString(`'yyyy-mm-dd' ${timeFormat}`), `${format}`, false, lang)}`;
}

function getDate(envs, item, propName, format, applyTimeZone) {
  let dateObjOrString = envs[item][propName];
  if (dateObjOrString && dateObjOrString.toUpperCase) {
    return formatMoment(dateObjOrString, format, envs, applyTimeZone);
  }
  const date = new BzDate(dateObjOrString);
  if (applyTimeZone == false) {
    return formatBzDate2(date, format, envs);
  }
  return formatBzDate(date, format, envs);
}

function getTimeFromString(timeString, format) {
  return formatter.timeFormat(timeString, format);
};

function HumanDateTime(engine) {
  this.registerTag("humanDateTime", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      this.propName = args[1] || "createdAt";
      this.applyTimeZone = true;
      if (args.length > 2) {
        this.applyTimeZone = args[2] === "true"
      }
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = `${getFriendlyFormat(ctx.environments.humanDate || "mm")} ${ ctx.environments.providerPreferences.preferences.timeFormat}`;
        return getDate(ctx.environments, this.item, this.propName, format, this.applyTimeZone);
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
      this.applyTimeZone = true;
      if (args.length > 2) {
        this.applyTimeZone = args[2] === "true"
      }
    },
    render: async function(ctx) {
     
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = getFriendlyFormat(ctx.environments.humanDate || "mm");
        return getDate(ctx.environments, this.item, this.propName, format, this.applyTimeZone);
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
      if (args.length > 2) {
        this.applyTimeZone = args[2] === "true"
      }
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = ctx.environments.providerPreferences.preferences.dateFormat;
        return getDate(ctx.environments, this.item, this.propName, format, this.applyTimeZone);
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
      if (args.length > 2) {
        this.applyTimeZone = args[2] === "true"
      }
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
        const format = ctx.environments.providerPreferences.preferences.timeFormat;
        if (ctx.environments[this.item][this.propName].toUpperCase && ctx.environments[this.item][this.propName].indexOf("T") === -1){ 
          return getTimeFromString(ctx.environments[this.item][this.propName], format);
        }
        return getDate(ctx.environments, this.item, this.propName, format, this.applyTimeZone);
      }
      return "PNA";
    }
  });
}

function ExpDate(engine) {
  this.registerTag("expDate", {
    parse: function(tagToken, remainTokens) {
      const args = tagToken.args.split(" ");
      this.item = args[0] || "ticket";
      if (args.length > 1) {
        this.format = args.slice(2).join(" ") || "";
      }
    },
    render: async function(ctx) {
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences &&
        ctx.environments[this.item] && ctx.environments[this.item].expirationDate) {
        const item = ctx.environments[this.item];
        let expireDate = new BzDate(item.expirationDate);
        if (item.departureTime) {
          const timeParts = item.departureTime.split(":");
          expireDate.addHours(timeParts[0]);
          expireDate.addMinutes(timeParts[1]);
        }
        if (item.expire && item.expire > 0) {
          if (item.expireUnit === "minutes") {
            expireDate = expireDate.addMinutes(item.expire);
          } else {
            expireDate = expireDate.addDays(item.expire);
          }
        }
        const format = this.format || `${ctx.environments.providerPreferences.preferences.dateFormat} ${ctx.environments.providerPreferences.preferences.timeFormat}`;
        return formatBzDate2(expireDate, format, ctx.environments);
      }
      return "PNA";
    }
  });
}

module.exports = {
  DateF,
  DateTime,
  ExpDate,
  HumanDate,
  HumanDateTime,
  TimeF
};

