(function(){
	dust.helpers.formatField = function(chunk, context, bodies, params) {
		var field = context.get(params.field),
			format = params.format ? params.format : params.field;
		if (field) {
			chunk.write(formatTagValue(field, format, undefined, 0, params.longVal));
		}
		
		return chunk.write("");
     };
	dust.helpers.quoteField = function(chunk, context, bodies, params) {
		var symbol = context.get("symbol"),
			field = params.field,
			quote = Stock.QuoteManager.quotes[symbol],
			format = params.format ? params.format : field;

		if (quote && quote[field]) {
			return chunk.write(formatTagValue(quote[field], format));
		}
		else if (field == "name") {
			return chunk.write(symbol);
		}
		return chunk.write("");
     };
	dust.helpers.changeClass = function(chunk, context, bodies, params) {
		if (params.type == "quote") {
			var symbol = context.get("symbol"),
				quote = Stock.QuoteManager.quotes[symbol];
			return chunk.write(quote.change >= 0 ? "positive" : "negative");
		}
		else if (params.type == "port") {

		}
		return chunk.write("");
	};
	dust.helpers.getLotInfo = function(chunk, context, bodies, params) {
		var field = params.field,
			symbol = context.get("symbol"),
			paid = context.get("price"),
			qty = context.get("qty"),
			quote = context.get("quote"),
			portId = context.get("portId"),
			format = params.format ? params.format : field;
		if (quote) {
			if (field == "gain") {
				return chunk.write(formatTagValue(qty * (quote.price - paid), format));
			}
			else if (field == "value-delta") {
				return chunk.write(formatTagValue(qty * quote.change, format));
			}
			else if (field == "market-value") {
				return chunk.write(formatTagValue(qty * quote.price, format));
			}
			else if (field == "port-name") {
				var port = Stock.Portfolios.portfolios.get(portId);
				if (port)
					return chunk.write(port.get("name"));
			}
		}
		return chunk.write("");
     };
	function tallyLotsValue(lots, field) {
		var val = 0;
		if (lots) {
			lots.forEach(function(lot) {
				var symbol = lot.symbol,
				qty = lot.qty,
				quote = Stock.QuoteManager.quotes[symbol];
				
				if (qty && quote && quote[field]) {
					val += qty * quote[field];
				}
				else if (Stock.QuoteManager.ready()) {
					console.log("Warning: Info not available " + symbol);
				}
			});
		}
		return val;
	}
	function tallyLotsCost(lots) {
		var val = 0;
		if (lots) {
			lots.forEach(function(lot) {
				var symbol = lot.symbol,
					qty = lot.qty,
					paid = lot.price;

				if (qty && paid) {
					val += qty * paid;
				}
			});
		}
		return val;
	}
	dust.helpers.getPortInfo = function(chunk, context, bodies, params) {
		var field = params.field,
			portId = params.portId ? params.portId : context.get("objectId"),
			port = Stock.Portfolios.portfolios.get(portId),
			lots = Stock.Portfolios.getPortLots(portId),
			format = params.format ? params.format : field,
			cash = port ? port.get("cash") : Stock.Portfolios.getAllCash();

		if (field == "marketValue") {
			chunk.write(formatTagValue(cash + tallyLotsValue(lots, "price"), format, true));
		}
		else if (field == "valueDelta") {
			chunk.write(formatTagValue(tallyLotsValue(lots, "change"), format, true));
		}
		else if (field == "gain") {
			chunk.write(formatTagValue(tallyLotsValue(lots, "price") - tallyLotsCost(lots), format, true));
		}
		return chunk.write("");
    };
	dust.helpers.formatEarningDate = function(chunk, context, bodies, params) {
		var dateStr = context.get(params.dateStr),
		isEstimated = dateStr && dateStr.indexOf("Est") != -1;
		
		if (isEstimated)
			return chunk.write(dateStr);
	
		return dust.helpers.formatDate(chunk, context, bodies, params);
    };
	dust.helpers.formatDate = function(chunk, context, bodies, params) {
		var date = context.get(params.dateObj), str = "";
		if (date && date.iso) {
			date = new Date(date.iso);
		}
		
		if (date && date.getDay) {
			if (params.formInput) {
				str = date.toISOString().slice(0,10);
			}
			else if (params.shortDate) {
				str = [date.getMonth()+1, date.getDate(), date.getFullYear()%1000].join("/");
			}
			else {
				var dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
					month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
				str = [dayOfWeek[date.getDay()], month[date.getMonth()], date.getDate()].join(" ");
			}
		}
		return chunk.write(str);
    };
	

})();

function addCommas(nStr) {
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
function prefixCurrency(val) {
	if (val) {
		val = addCommas(val);
		var firstChar = val.charAt(0);
		if (firstChar == "-" || firstChar == "+") {
			return [firstChar, "$", val.slice(1)].join('');
		}
		return "$" + val;
	}
	return "$0";
}

function appendPercentSign(val) {
	if (val) {
		return addCommas(val) + "%";
	}
	return "0%";
}

var TAG_FORMATTER = {
	"change": 				{ decimal: 2, dollarSign: false, percentSign: false , label: "Change"},
	"percent-change": 		{ decimal: 1, dollarSign: false, percentSign: true, label: "Change %" },
	"valueDelta": 			{ decimal: 0, dollarSign: true, percentSign: false, label: "Day's Change" },
	"valueDeltaPercent": 	{ decimal: 1, dollarSign: false, percentSign: true, label: "Day's Change %" },
	"marketValue": 		{ decimal: 0, dollarSign: true, percentSign: false, label: "Market Value" },
	"gain": 				{ decimal: 0, dollarSign: true, percentSign: false, label: "Gain/Loss" },
	"gainPercent": 		{ decimal: 1, dollarSign: false, percentSign: true, label: "Gain/Loss %" },
	"price": 				{ decimal: 2, dollarSign: false, percentSign: false, label: "Last" },
	"pf-percent":           { decimal: 0.2, dollarSign: false, percentSign: true, label: "Position" },
	"shares":               { decimal: 0, dollarSign: false, percentSign: false, label: "Shares" }
};
function formatTagValue(tagValue, tag, noDollarSign, maxLength, addComma) {
	if (!tagValue)
		tagValue = "";
	else {
		if (addComma) {
			tagValue = addCommas(tagValue);
		}
		else {
			// Normalize large values
			if (tagValue > 999999999) {
				tagValue = (tagValue / 1000000000).toFixed(1) + "B";
			}
			else if (tagValue > 999999) {
				tagValue = (tagValue / 1000000).toFixed(1) + "M";
			}
		}
		if (TAG_FORMATTER[tag]) {
			if(tagValue.toFixed) {
				var decimal = TAG_FORMATTER[tag].decimal;
				if (decimal >= 0) {
					// This is the optional decimal for smaller numbers
					if (decimal < 1) {
						if (tagValue >= 10)
							decimal = 0;
						else
							decimal = parseInt(decimal * 10);
					}
					tagValue = tagValue.toFixed(decimal);
				}
			}
			if (TAG_FORMATTER[tag].dollarSign) {
				if (noDollarSign !== true)
					tagValue = prefixCurrency(tagValue);
			}
			else if (TAG_FORMATTER[tag].percentSign)
				tagValue = appendPercentSign(tagValue);
		}
	}
	if (maxLength && tagValue.length > maxLength)
		tagValue = tagValue.substr(0, maxLength);
	return tagValue;
}

function getTagInfo (stockInfo, port_id, tag) {
	var t = this,
		shares = stockInfo.shares, value = 0,
		stock = stockInfo.symbol;
	if (tag === "shares") {
		return shares ? shares : 0;
	}
	else if (tag === 'market-value') {
		if (shares != 0)
			value = shares * t.getFloatInfo(stock, 'price');
		return value ? value : 0;
	}
	else if (tag === 'value-delta') {
		if (shares != 0)
			value = shares * t.getFloatInfo(stock, 'change');
		return value ? value : 0;
	}
	else if (tag === 'gain') {
		if (shares != 0)
			value = shares * (t.getInfo(stock, 'price') - stockInfo.buy);
		return value ? value : 0;
	}
	else if (tag === 'gain-percent') {
		if (shares != 0)
			value = computeDeltaPercent(t.getTagInfo(stockInfo, port_id, 'gain'),
				t.getTagInfo(stockInfo, port_id, 'market-value'));
		return value ? value : 0;
	}
	else if (tag === 'pf-percent') {
		if (shares != 0) {
			var marketVal = t.getTagInfo(stockInfo, port_id, 'market-value'),
				port = Stock.portMgr.getPortfolio(port_id),
				pfVal = port ? port.totalValue : 0;
			value = pfVal != 0 ? (marketVal * 100 / pfVal) : "-";
		}
		return value ? value : 0;
	}
	return t.getInfo(stock, tag);
};
