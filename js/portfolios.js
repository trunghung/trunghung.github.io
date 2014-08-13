(function () {
	window.Stock = window.Stock || {};
	var Portfolio = Parse.Object.extend("Portfolio"),
	Lot = Parse.Object.extend("Lot"),
	Lots = Parse.Collection.extend({
		model: Lot
	}),
	Portfolios = Parse.Collection.extend({
		model: Portfolio
	}),
	portfolios = new Portfolios(),
	_lots = new Lots(),
	_lastUpdate = 0,
	_portsFetched = false,
	_lotsFetched = false;
	
	function warn(msg) {
		console.warn("Parse: " + msg)
	}
	function log(msg) {
		console.log("Parse: " + msg)
	}
	function init() {
		Parse.initialize("0MM7BbJJou2MffuPA7mk3f47EezUjCOZP3JoqfRo", "BkCRrIHrLBEGYktT0lDby7IpgV2F0M4RjgxGD20s");
		var currentUser = Parse.User.current();
		if (currentUser) {
			Stock.Portfolios.trigger("login");
			update();
		}
	}

	function update(force) {
		var now = new Date();
		// If we updated less than 10 minutes ago, don't update again
		if (!force && _lastUpdate && now.getTime() - _lastUpdate < 600000)
			return;
		_lastUpdate = now;

		portfolios.fetch({
			success: function(collection) {
				log("Portfolios downloaded");
				//log("Portfolios downloaded: " + JSON.stringify(collection.toJSON()));
				_portsFetched = true;
				if (_lotsFetched)
					Stock.Portfolios.trigger("portsReady");
			},
			error: function(collection, error) {
				warn("Portfolios download failed");
				Stock.Portfolios.trigger("failed");
			}
		});
		_lots.fetch({
			success: function(collection) {
				log("Lots downloaded");
				//log("Lots downloaded: " + JSON.stringify(collection.toJSON()));
				_lotsFetched = true;
				if (_portsFetched)
					Stock.Portfolios.trigger("portsReady");
				Stock.Portfolios.trigger("lotsReady");
			},
			error: function(collection, error) {
				warn("Lots download failed");
				Stock.Portfolios.trigger("failed");
			}
		});
	}
	
	function login(username, password, callback) {
		Parse.User.logIn(username, password, {
			success: function(user) {
				log("Login succeeded: " + username);
				update();
				Stock.Portfolios.trigger("login");
				callback && callback(0, user);
			},
			error: function(user, error) {
				log(["Login failed: ", username, error.code, error.message].join(", "));
				callback && callback(error.code, error.message);
			}
		});
	}
	function logout() {
		Parse.User.logOut();
		_lastUpdate = null;
		_lots.reset();
		portfolios.reset();
		Stock.Portfolios.trigger("logout");
	}
	
	function createAccount(username, password, firstName, lastName, email, callback) {
		var user = new Parse.User();
		user.set("username", username);
		user.set("password", password);
		user.set("email", email);
		user.set("firstName", firstName);
		user.set("lastName", lastName);
		  		  
		user.signUp(null, {
			success: function(user) {
				log("createAccount succeeded " + username);
				callback && callback(0, user);
			},
			error: function(user, error) {
				log(["createAccount failed: ", username, error.code, error.message].join(", "));
				callback && callback(error.code, error.message);
			}
		});
	}
	
	function createPort(name, callback) {
		var currentUser = Parse.User.current();
		if (currentUser) {
			var port = new Portfolio();
			port.setACL(new Parse.ACL(currentUser));
			port.set("name", name);
			port.set("cash", 0);
			port.set("lots", []);
			port.save(null, {
				success: function(port) {
					log("createPort succeeded " + name);
					portfolios.add(port);
					callback && callback(0, port);
				},
				error: function(model, error) {
					log(["createPort failed: ", name, error.code, error.message].join(", "));
					callback && callback("login_failed");
				}
			});
		}
		else {
			callback && callback("not_login");
		}
	}
	
	function addLot(port, lot, callback) {
		var currentUser = Parse.User.current();
		if (currentUser && lot.symbol) {
			var newLot = new Lot();

			newLot.setACL(new Parse.ACL(currentUser));
			
			// Validate the data
			lot.symbol = lot.symbol.toUpperCase();

			newLot.set(lot);
			newLot.set("portId", port.id)
			newLot.set("parent", port);
			newLot.save(null, {
				success: function(obj) {
					log("addLot succeeded " + obj.get("symbol"));
					_lots.add(obj);
					updateCash(port, port.get("cash") - (lot.qty * lot.price + lot.fee));
					callback && callback(0, obj);
				},
				error: function(model, error) {
					log(["addLot failed: ", name, error.code, error.message].join(", "));
					callback && callback(error);
				}
			});
		}
		else {
			callback && callback("not_login");
		}
	}
	function updateCash(port, cashChangeVal, callback) {
		if (port) {
			var oldCash = port.get("cash");
			port.set("cash", parseInt(cashChangeVal));
			port.save({
				success: function () {
					log("updateCash update cash succeeded " + port.get("name") + ". Cash Bal: $" + port.get("cash"));
					callback && callback(error, port);
				},
				error: function (obj, error) {
					port.set("cash", oldCash);
					log("sellLot update cash failed for" + port.get("name"));
					callback && callback(error, port);
				}});
		}
	}
	function removeLot(lot, callback) {
		if (lot) {
			lot.destroy({
				success: function (myObject) {
					log("removeLot succeeded " + lot.get("symbol"));
					_lots.remove(lot);
					callback && callback(0);
				},
				error: function (myObject, error) {
					log("removeLot failed " + sym);
					callback && callback(error, lot);
				}
			});
		}
	}
	function sellLot(lot, qty, price, fee, callback) {
		var currentUser = Parse.User.current(),
			sym = lot ? lot.get("symbol") : null;
		if (currentUser && sym) {
			var proceed = qty * price,
				port = portfolios.get(lot.get("portId"));

			// Whole lot is sold
			if (qty >= lot.get("qty")) {
				lot.destroy({
					success: function (myObject) {
						log("sellLot succeeded " + sym + ". Proceed: " + proceed);
						updateCash(port, port.get("cash") + proceed - fee);
						_lots.remove(lot);
						callback && callback(0);
					},
					error: function (myObject, error) {
						log("sellLot failed " + sym);
						callback && callback(error, lot);
					}
				});
			}
			// Partial lot sale
			else {
				lot.set("qty", lot.get("qty") - qty);
				lot.save({
					success: function (myObject) {
						log("sellLot succeeded. Reduced lot size for " + sym + " to " + lot.get("qty") + ". Proceed: " + proceed);
						updateCash(port, port.get("cash") + proceed - fee);
						callback && callback(0);
					},
					error: function (myObject, error) {
						log("sellLot failed " + sym);
						callback && callback(error, lot);
					}
				});
			}
		}
		else {
			callback && callback("not_login");
		}
	}
		
	function deletePort(port) {
		if (port) {
			port.destroy({
				success: function(obj) {
					log("deletePort succeeded " + port.get("name"));
					portfolios.remove(port);
					callback && callback(0, port);
				},
				error: function(obj, error) {
					log("deletePort failed " + port.get("name"));
					callback && callback("login_failed", port);
				  // The delete failed.
				  // error is a Parse.Error with an error code and description.
				}
			});
		}
	}
	function getStockList () {
		var stocks=[], options = [], 
		added = {}, sym=0;
		// TODO: handle watchlist/indices
		_lots.each(function(lot) {
			sym = lot.get("symbol");
			if (!added[sym]) {
				if (sym.length > 15) {
					options.push(sym);
				}
				else {
					stocks.push(encodeURI(sym));
				}
				added[sym] = true;
			}
		});
		return {
			stocks: stocks,
			options: options
		};
	}
	function prepLotContext(lot) {
		// Convert parse object to json if it's not already converted
		if (lot.toJSON)
			lot = lot.toJSON();
		lot.quote = Stock.QuoteManager.quotes[lot.symbol];
		var qty = lot.qty || 0;

		lot.marketValue = parseInt(lot.quote ? lot.qty * lot.quote.price : 0) || 0;
		lot.cost = parseInt(qty * lot.price) || 0;
		lot.valueDelta = parseInt(lot.quote ? qty * lot.quote.change : 0) || 0;
		lot.valueDeltaPercent = lot.valueDelta*100/lot.marketValue;
		lot.gain = lot.marketValue - lot.cost;
		lot.gainPercent = lot.gain*100/lot.marketValue;
		if (lot.marketValue == 27985.649999999998)
		debugger;
		return lot;
	}
	function prepLotsContext(lots) {
		var output = [];
		lots.forEach(function(lot) {
			output.push(prepLotContext(lot));
		});
		return output;
	}
	function isOptionOfStock(symbol, optionSymbol) {
		return optionSymbol && symbol && optionSymbol.length > 15 &&
			optionSymbol.length == symbol.length + 15 &&
			optionSymbol.indexOf(symbol) == 0;
	}
	function isOption(symbol) {
		return symbol.length > 15;
	}
	function getCombinedLots(params) {
		var combinedLots = [], added = {},
			lots = _lots,
			symbol = params.symbol,
			portId = params.portId;
		if (symbol || portId) {
			lots = _lots.filter(function(lot) {
				// If symbol is provided, we will only return lots for that symbol
				return (!symbol || lot.attributes.symbol == symbol) &&
					// If port is provided, we will only return lots for that port
					(!portId || portId == "all" || lot.attributes.portId == portId);
			});
		}
		lots.forEach(function(lot) {
			sym = lot.get("symbol");
			if (params.ignoreOptions && isOption(sym)) {
				return;
			}
			var qty = lot.get("qty");

			if (!added[sym]) {
				combinedLot = { symbol: sym,
					qty: qty,
					price: lot.get("price") || 0,
					lots: [],
					quote: Stock.QuoteManager.quotes[sym]};
				added[sym] = combinedLot;
			}
			else {
				// calculate average price paid
				var newAvgPricePaid = (added[sym].qty * added[sym].price + qty * (lot.get("price") || 0))/(added[sym].qty + qty);
				added[sym].qty += qty;
				added[sym].price = parseInt(newAvgPricePaid*100)/100; // round to the 2 decimal places
			}
			if (params.getSublots) {
				added[sym].lots.push(prepLotContext(lot));
			}
		});
		for (sym in added) {
			combinedLots.push(prepLotContext(added[sym]));
		}
		return combinedLots;
	}

	function getLotsGroupedByPort(params) {
		var combinedLots = [], portId = 0,
			symbol = params.symbol,
			portId = params.portId,
			portsAdded = {},
			totalMktVal = 0,
			totalGain = 0,
			lots = _lots.filter(function(lot) {
				return (lot.attributes.symbol == symbol || isOptionOfStock(symbol, lot.attributes.symbol)) &&
					// If port is provided, we will only return lots for that port
					(!portId || portId == "all" || lot.attributes.portId == portId);
			});
		lots.forEach(function(lot) {
			portId = lot.get("portId");
			if (!portsAdded[portId]) {
				portsAdded[portId] = [];
			}
			lot = prepLotContext(lot);
			totalMktVal += lot.marketValue;
			totalGain += lot.gain;
			portsAdded[portId].push(lot);
		});
		for (portId in portsAdded) {
			var port = portfolios.get(portsAdded[portId][0].portId);
			portsAdded[portId].sort(function(a, b) {
				// Sort lots by name then value
				return (a.marketValue || b.marketValue) ? b.marketValue - a.marketValue : 0;
			});
			combinedLots.push({ port: port.toJSON(), lots: portsAdded[portId] });
		}
		return {marketValue: totalMktVal, gain: totalGain, portLots: combinedLots};
	}
	
	function getPortLots(portId, combineLots) {
		if (combineLots) {
			return prepLotsContext(getCombinedLots({ portId: portId }));
		}
		else {
			if (portId == "all")
				return prepLotsContext(_lots);

			return prepLotsContext(_lots.filter(function (lot) {
				return lot.get("portId") == portId;
			}));
		}
	}
	function getAllCash() {
		var cash = 0;
		portfolios.each(function(port) {
			cash += port.get("cash");
		});
		return cash;
	}

	
	Stock.Portfolios = {
		init: init,
		isAuthed: function() { return null != Parse.User.current(); },
		lots: _lots,
		portfolios: portfolios,
		getPorts: function() { return portfolios; },
		getAllCash: getAllCash,
		getPortLots: getPortLots,
		login: login,
		logout: logout,
		createAccount: createAccount,
		createPort: createPort,
		updateCash: updateCash,
		addLot: addLot,
		sellLot: sellLot,
		update: update,
		getStocksList: getStockList,
		getCombinedLots: getCombinedLots,
		getLotsGroupedByPort: getLotsGroupedByPort
	};
	_.extend(Stock.Portfolios, Parse.Events);
	init();
})();