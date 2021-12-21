function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _padWith(origStr, padStr, maxLength, leftNotRight) {
  // If numbers are passed in, convert them
  origStr += '';
  padStr += '';
  var size = origStr.length;
  var diff = maxLength - size;
  var totalPad = '';
  var i = 0;

  for (i = 0; i < diff; i += 1) {
    totalPad += padStr;
  }

  if (leftNotRight) {
    return totalPad + origStr;
  } else {
    return origStr + totalPad;
  }
}

const formatter = {
  money: function money(_money) {
    _money = Math.round(_money / 1000) / 100;
    var parts = String(_money).split('.');
    var whole = parts[0] || '0';
    var dec = this.padRightWith(parts[1] || '', 0, 2);
    return whole + '.' + dec;
  },
  padRightWith: function padRightWith(origStr, padStr, maxLength) {
    return _padWith(origStr, padStr, maxLength, false);
  },
};

var validatePreferences = function validatePreferences(preferences) {
  if (!preferences || !Array.isArray(preferences.supportedCurrencies) || !preferences.supportedCurrencies[0] || !preferences.supportedCurrencies[0].isocode || !preferences.supportedCurrencies[0].symbol) {
    throw new Error("currenciesForAccount expected account preferences with supportedCurrencies array");
  }
};

var forAccount = function forAccount(preferences) {
  validatePreferences(preferences);
  var _preferences$multiCur = preferences.multiCurrency,
      multiCurrency = _preferences$multiCur === void 0 ? false : _preferences$multiCur,
      supportedCurrencies = preferences.supportedCurrencies;
  var currencies = supportedCurrencies;

  if (multiCurrency) {
    currencies = currencies.filter(function (c) {
      return c.enabled;
    });
  }

  var defaultChannels = multiCurrency ? [] : null;
  currencies = currencies.map(function (sc) {
    var isocode = sc.isocode,
        symbol = sc.symbol,
        _sc$channels = sc.channels,
        channels = _sc$channels === void 0 ? defaultChannels : _sc$channels,
        exchangeRates = sc.exchangeRates;
    var buy = 1;
    var sell = 1;

    if (Array.isArray(exchangeRates) && exchangeRates.length > 0) {
      buy = exchangeRates[0].buy;
      sell = exchangeRates[0].sell;
    } else if (exchangeRates && exchangeRates.buy && exchangeRates.sell) {
      buy = exchangeRates.buy;
      sell = exchangeRates.sell;
    }

    return {
      isocode: isocode,
      symbol: symbol,
      buy: buy,
      sell: sell,
      channels: channels,
      printSymbol: sc.printSymbol || false
    };
  });
  var baseCurrency = currencies[0];
  var currencyCodes = currencies.map(function (_ref) {
    var isocode = _ref.isocode;
    return isocode;
  });

  var currencyForCode = function currencyForCode(isocode, userOptions) {
    var defaultOptions = {
      defaultToBase: false
    };

    var options = _objectSpread(_objectSpread({}, defaultOptions), userOptions);

    var currency = currencies.find(function (currency) {
      return currency.isocode === isocode;
    }) || null;

    if (!currency && options.defaultToBase) {
      currency = baseCurrency;
    }

    return currency;
  };

  var baseCurrencyCode = baseCurrency.isocode;
  var baseCurrencySymbol = baseCurrency.symbol;
  return {
    multiCurrency: multiCurrency,
    currencies: currencies,
    currencyForCode: currencyForCode,
    currencyCodes: currencyCodes,
    baseCurrency: baseCurrency,
    baseCurrencyCode: baseCurrencyCode,
    baseCurrencySymbol: baseCurrencySymbol,
    forStation: function forStation(station) {
      if (!multiCurrency) {
        return {
          displayedCurrencies: null,
          acceptedCurrencies: null,
          primaryCurrencyCode: null
        };
      }

      var pcc = station.primaryCurrencyCode,
          dc = station.displayedCurrencies,
          ac = station.acceptedCurrencies;
      var displayedCurrencies = dc && dc.length ? _toConsumableArray(dc) : [baseCurrencyCode];
      var acceptedCurrencies = ac && ac.length ? _toConsumableArray(ac) : [baseCurrencyCode];
      var primaryCurrencyCode = pcc || displayedCurrencies[0];

      if (!displayedCurrencies.includes(primaryCurrencyCode)) {
        throw new Error("primaryCurrencyCode must belong to displayedCurrencies");
      }

      return {
        primaryCurrencyCode: primaryCurrencyCode,
        displayedCurrencies: displayedCurrencies,
        acceptedCurrencies: acceptedCurrencies
      };
    },
    forItem: function forItem(item) {
      var _ref2;

      var displayCurrency = baseCurrency;
      var acceptedCurrency = baseCurrency;
      var displayCurrencySymbol = baseCurrency.symbol;
      var acceptedCurrencySymbol = baseCurrency.symbol;
      var displayCurrencyCode = baseCurrency.isocode;
      var acceptedCurrencyCode = baseCurrency.isocode;

      if (multiCurrency) {
        displayCurrency = item && item.displayCurrency && item.displayCurrency.isocode ? item.displayCurrency : baseCurrency;
        acceptedCurrency = item && item.acceptedCurrency && item.acceptedCurrency.isocode ? item.acceptedCurrency : baseCurrency;
        displayCurrencySymbol = displayCurrency.symbol;
        acceptedCurrencySymbol = acceptedCurrency.symbol;
        displayCurrencyCode = displayCurrency.isocode;
        acceptedCurrencyCode = acceptedCurrency.isocode;
      }

      var getCurrencyValue = function getCurrencyValue(propName) {
        var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var defaultOptions = {
          prefix: "displayCurrency"
        };
        var options = Object.assign({}, defaultOptions, userOptions);
        var prefix = options.prefix;

        if (!propName || !prefix || typeof propName !== "string" || typeof prefix !== "string") {
          throw new Error("getCurrencyValue: propName and prefix must be strings");
        }

        if (multiCurrency) {
          var prefixedPropName = propName.replace(/^./, "".concat(prefix).concat(propName[0].toUpperCase()));
          return item[prefixedPropName] || item[propName];
        }

        return item[propName];
      };

      var getCurrencyString = function getCurrencyString(value) {
        var userOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var defaultOptions = {
          raw: false,
          prefix: "displayCurrency"
        };
        var options = Object.assign({}, defaultOptions, userOptions);
        var prefix = options.prefix,
            raw = options.raw;
        var finalValue = raw ? value : formatter.money(getCurrencyValue(value, {
          prefix: prefix
        }));
        var displayString = "".concat(displayCurrencySymbol, " ").concat(finalValue);

        if (multiCurrency) {
          displayString = "".concat(displayString, " ").concat(displayCurrencyCode);
        }

        return displayString;
      };

      return _ref2 = {
        multiCurrency: multiCurrency,
        displayCurrency: displayCurrency,
        acceptedCurrency: acceptedCurrency
      }, _defineProperty(_ref2, "acceptedCurrency", acceptedCurrency), _defineProperty(_ref2, "displayCurrencySymbol", displayCurrencySymbol), _defineProperty(_ref2, "acceptedCurrencySymbol", acceptedCurrencySymbol), _defineProperty(_ref2, "displayCurrencyCode", displayCurrencyCode), _defineProperty(_ref2, "acceptedCurrencyCode", acceptedCurrencyCode), _defineProperty(_ref2, "getCurrencyValue", getCurrencyValue), _defineProperty(_ref2, "getCurrencyString", getCurrencyString), _defineProperty(_ref2, "getDisplayCurrencyValue", function getDisplayCurrencyValue(propName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return getCurrencyValue(propName, Object.assign({}, {
          prefix: "displayCurrency"
        }));
      }), _defineProperty(_ref2, "getAcceptedCurrencyValue", function getAcceptedCurrencyValue(propName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return getCurrencyValue(propName, Object.assign({}, {
          prefix: "acceptedCurrency"
        }));
      }), _defineProperty(_ref2, "getDisplayCurrencyString", function getDisplayCurrencyString(propName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return getCurrencyString(propName, Object.assign({}, {
          prefix: "displayCurrency"
        }));
      }), _defineProperty(_ref2, "getAcceptedCurrencyString", function getAcceptedCurrencyString(propName) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return getCurrencyString(propName, Object.assign({}, {
          prefix: "acceptedCurrency"
        }));
      }), _ref2;
    }
  };
};

var isCurrency = function isCurrency(maybeCurrency) {
  return Boolean(maybeCurrency && maybeCurrency.isocode && maybeCurrency.symbol && typeof maybeCurrency.buy === "number");
};

var isCurrencyWithCode = function isCurrencyWithCode(maybeCurrency, isocode) {
  return Boolean(isCurrency(maybeCurrency) && isocode && maybeCurrency.isocode === isocode);
};

function ceilFloat(value, decimals) {
  var checkRoundingDecimal = decimals + 1;
  var shouldCeil = Math.floor(value * Math.pow(10, checkRoundingDecimal) % 10) > 0;

  if (shouldCeil) {
    return Math.ceil(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  return Number(value.toFixed(decimals));
}

var convert = function convert(figure) {
  var currency = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var userOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var defaultOptions = {
    sell: false,
    inverse: false,
    round: true,
    ceil: false
  };
  var options = Object.assign({}, defaultOptions, userOptions);

  if (!currency || !currency.buy || !currency.sell) {
    return figure;
  }

  var buy = currency.buy,
      sell = currency.sell;
  var operand = options.sell ? sell : buy;
  operand = options.inverse ? 1 / operand : operand;
  var converted = figure * operand;

  if (options.round) {
    converted = Math.round(converted);
  } else if (options.ceil) {
    converted = ceilFloat(converted, 2);
  } else {
    converted = Number(converted.toFixed(2));
  }

  return converted;
};

var currenciesMatch = function currenciesMatch(currency1, currency2) {
  return Boolean(currency1 && currency2 && currency1.isocode && currency2.isocode && currency1.isocode === currency2.isocode);
};

var fixedAmountsMatchForCurrency = function fixedAmountsMatchForCurrency(baseAmount, targetCurrencyAmount, targetCurrency) {
  if (typeof baseAmount !== "number" || typeof targetCurrencyAmount !== "number") {
    throw new Error("two numeric amounts must be provided to multiCurrency.fixedAmountsMatchForCurrency");
  }

  if (!isCurrency(targetCurrency)) {
    throw new Error("a valid currency object must be provided to multiCurrency.fixedAmountsMatchForCurrency");
  }

  var baseToCurrencyAmount = convert(baseAmount, targetCurrency, {
    round: false,
    ceil: true
  });
  return targetCurrencyAmount === baseToCurrencyAmount;
};

function getCurrencySymbol(isocode, currencies) {
  const trimIsocode = isocode ? isocode.trim() : "";
  const curcy = currencies.find((cur) => {
    return cur.isocode === trimIsocode;
  });
  return curcy && curcy.printSymbol ? curcy.symbol : " ";
}

function Money(engine) {
  this.registerTag("money", {
    parse: function(tagToken, remainTokens) {
        const args = tagToken.args.split(" ");
        this.item = args[0] || "ticket";
        this.propName = args[1] || "total";
    },
    render: async function(ctx) {
        let mc = null;
        if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences) {
          mc = forAccount(ctx.environments.providerPreferences.preferences);
        }

        if (mc && ctx && ctx.environments && ctx.environments[this.item] && ctx.environments[this.item][this.propName]) {
          const mcForItem = mc.forItem(ctx.environments[this.item]);
          return formatter.money(mcForItem.getCurrencyValue(this.propName, {prefix: "display"}));
        }
        return "PNA";
    }
  });
}

function CurcySymbol(engine) {
  this.registerTag("curcySymbol", {
    parse: function(tagToken, remainTokens) {
      this.item = tagToken.args || "ticket";
    },
    render: async function(ctx) {
      let mc = null
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences) {
        mc = forAccount(ctx.environments.providerPreferences.preferences);
      }
      if (mc && ctx && ctx.environments && ctx.environments[this.item]) {
        const mcForItem = mc.forItem(ctx.environments[this.item]);
        const isocode = mcForItem.displayCurrencyCode || " ";
        return getCurrencySymbol(isocode, mc.currencies)
      }
      return "";
    }
  });
}

function CurcyIso(engine) {
  this.registerTag("curcyIso", {
    parse: function(tagToken, remainTokens) {
      this.item = tagToken.args || "ticket";
    },
    render: async function(ctx) {
      let mc = null;
      if (ctx && ctx.environments && ctx.environments.providerPreferences && ctx.environments.providerPreferences.preferences) {
        mc = forAccount(ctx.environments.providerPreferences.preferences);
      }
      if (mc && ctx && ctx.environments && ctx.environments[this.item]) {
        const mcForItem = mc.forItem(ctx.environments[this.item]);
        return mcForItem.displayCurrencyCode || "";
      }
      return "";
    }
  });
}

module.exports = {
  CurcyIso,
  CurcySymbol,
  Money
};