
(function () {
	window.Stock = window.Stock || {};

	function init() {

		renderDashboard();

		var location = window.location.hash;
		//if (location.hash == "#Dashboard")
		//	$.mobile.changePage("#Dashboard");
		//else
		//	$.mobile.navigate("#Dashboard");

		if (location != "#Dashboard") {
			window.location.hash = "#Dashboard";
			// If we load the page with a dynamic page that doesn't exist, just clear the history and redirect to dashboard
			$.mobile.navigate.history.stack.splice(0, 1);
			$.mobile.navigate.history.initialDst = "Dashboard"
		}
		$.mobile.loading( "hide" );

		function onLoginOrOut() {
			render();
			if (Stock.Portfolios.isAuthed())
				$(".nav-panel").addClass("authed");
			else
				$(".nav-panel").removeClass("authed");
		}
		Stock.Portfolios.on("login", onLoginOrOut);
		Stock.Portfolios.on("logout", onLoginOrOut);
		Stock.Portfolios.on("portsReady", render);
		Stock.QuoteManager.on("quotesUpdated", render);
		Stock.QuoteManager.on("topNews", render);
		Stock.QuoteManager.on("news", render);
		Stock.Portfolios.portfolios.on("change", render);
		Stock.Portfolios.portfolios.on("add", render);
		Stock.Portfolios.portfolios.on("remove", render);
		Stock.Portfolios.lots.on("change", render);
		Stock.Portfolios.lots.on("add", render);
		Stock.Portfolios.lots.on("remove", render);

		bindUI();

		// Set a max-height to make large images shrink to fit the screen.
		$( document ).on( "pagebeforeshow", function() {
			$('.ui-header').trigger('resize');
		});
		$.mobile.document.on( "pagebeforechange", function( event, data ) {
			return;
			if (data.absUrl === undefined) {
				$.mobile.changePage("#Dashboard");
				event.preventDefault();
				console.log("pagebeforechange: Go to Dashboard")
			}
			console.log("pagebeforechange: " + data.absUrl);
			console.log(data.toPage);
		});
		// Remove the popup after it has been closed to manage DOM size
		$( document ).on( "popupafterclose", ".ui-popup", function(e) {
			setTimeout(function() {
				$(e.currentTarget ).remove();
			}, 1000);
		});

		$( document ).on( "swipeleft", ".fixed-column-container", function( event ) {
			$(document).find(".fixed-column-container").scrollLeft($(document).find(".fixed-column-container").scrollLeft() + 100);

		});
		$( document ).on( "swiperight", ".fixed-column-container", function( event ) {
			$(document).find(".fixed-column-container").scrollLeft($(document).find(".fixed-column-container").scrollLeft() - 100);
		});

		setInterval(function() {
			Stock.QuoteManager.update();
		}, 300000);     // update quote once every 5 minutes
	}
	function getDataAction(el, levelUp) {
		return getDataset(el, "action", levelUp);
	}
	/********************************************************************************************************
	 * Find and extract the dataset attribute from the provided element or it parents (default look up 1 level up)
	 */
	function getDataset(el, key, levelUp) {
		levelUp = levelUp || 1;
		var i = 0, ret = {};
		while (el && i <= levelUp) {
			if (el.dataset && el.dataset[key]) {
				ret.el = el;
				ret.action = el.dataset[key];
				break;
			}
			i++; el = el.parentNode;	// step up
		}
		return ret;
	}
	function onAddPortSubmit(e) {
		var name = $("#AddPort .name").val();
		if (name.length > 0) {
			console.log("Create new Port: " + name);
			Stock.Portfolios.createPort(name, function(err, port) {
				if (!err) {
					console.log("Add port succeeded");
					render();
				}
				else {
					console.log("Add port failed");
				}
			});
		}
		else {
			console.log("Invalid name");
			e.preventDefault();
		}
	}

	function extractLotFormInfo(el, edit) {
		var time = new Date(),
			expiration = new Date((new Date(el.find(".expiration").val())).getTime() + time.getTimezoneOffset()*60*1000),
			port = Stock.Portfolios.portfolios.get(el.find(".portfolios").val()),
			transType = el.find(".trans-type").val(),
			lot = { symbol:  el.find(".symbol").val().toUpperCase(),
				type: parseInt(el.find(".equity-type").val()) || 0,
				qty: parseFloat(el.find(".qty").val()) || 0,
				fee: parseFloat(el.find(".fee").val()) || 0,
				transDate: new Date((new Date(el.find(".date").val())).getTime() + time.getTimezoneOffset()*60*1000),
				price: parseFloat(el.find(".price").val()) || 0,
				expiration: !isNaN(expiration.getTime()) ? expiration : undefined,
				note: el.find(".note").val()
			};

		return {
			//!isNaN(lot.expiration.getTime())
			result: (port && (edit || transType) && !isNaN(lot.type) && lot.symbol && !isNaN(lot.qty) && !isNaN(lot.price) &&
				!isNaN(lot.transDate.getTime())),
			transType: transType,
			port: port,
			lot: lot
		};
	}
	function handleEditTrans(e) {
		var root = $("#AddTrans"), field,
			lot = Stock.Portfolios.lots.get(root.data().lot),
			info = extractLotFormInfo(root, true),
			port = info.port,
			lotInfo = info.lot;
		if (lot && info.result) {
			for (field in lotInfo) {
				if (lot.get(field) != lotInfo[field]) {
					lot.set(field, lotInfo[field]);
				}
			}
			lot.save({
				success: function () {
					console.log("Edit lot succeeded");
					render();
				},
				error: function (obj, error) {
					console.log("Edit lot failed");
					// TODO: revert change
				}});
		}
		else {
			console.log("Invalid transaction info");
			e.preventDefault();
		}
	}

	function handleAddTrans(e) {
		var root = $("#AddTrans"),
			info = extractLotFormInfo(root),
			port = info.port,
			lot = info.lot;
		if (info.result) {
			if (info.transType == "buy") {
				Stock.Portfolios.addLot(port, lot, function (err, lot) {
					if (!err) {
						console.log("Add lot succeeded");
						render();
					}
					else {
						console.log("Add lot failed");
					}
				});
			}
		}
		else {
			console.log("Invalid transaction info");
			e.preventDefault();
		}
	}

	function getAncestor(el, selector, stopAt)
	{
		if (!el)
			return null;

		stopAt = stopAt || document.body;

		var t = el;

		while (t != stopAt)
		{
			if (elMatchesSelector(t, selector))
				return t;
			t = t.parentNode;
		}

		function elMatchesSelector(el, selector)
		{
			var p = el.parentNode,
				selected = p.querySelectorAll(p.tagName + " > " + selector);

			for (i = 0; i < selected.length; i++)
			{
				if (selected[i] == el)
					return true;
			}
		}
	}


	function bindUI() {
		$(document).on("click", function(e) {
			var info = getDataAction(e.target, 2),
				handled = true;
			switch(info.action) {
				case "login":
					renderPopup("Login", "Login", {});
					$("#Login").popup("open").enhanceWithin();
					$('#Login form').on('submit', function (e) {
						$("#Login").popup("close");
						Stock.Portfolios.login($("#Login .un").val(), $("#Login .pw").val(), function(err) {
							if (err) {
								alert("Login failed. Please try again.")
							}
						});
						e.preventDefault();
					});
					break;
				case "logout":
					Stock.Portfolios.logout();
					break;
				case "showSignup":
					renderPage("Signup", "Signup", {});
					$.mobile.navigate("#Signup");
					var page = $("#Signup");

					page.find('form').on('submit', function (e) {
						var username = page.find(".un").val(),
							pass = page.find(".pw").val(),
							pass2 = page.find(".pw2").val(),
							fn = page.find(".fn").val(),
							ln = page.find(".ln").val(),
							email = page.find(".em").val();
						if (pass == pass2) {
							if (fn && ln && email) {
								Stock.Portfolios.createAccount(username, pass, fn, ln, email, function (err, msg) {
									if (err) {
										alert("Registration failed. Please try again. " + msg);
									}
									else {
										$.mobile.navigate("#Dashboard");
										alert("Welcome " + fn);
										page.remove();
									}
								});
							}
							else {
								alert("Please fill out all the information");
							}
						}
						else {
							alert("Password doesn't match");
						}
						e.preventDefault();
					});
					break;
				case "viewPort":
					if (renderViewPort(info.el.dataset.id)) {
						$.mobile.navigate("#ViewPort");
					}
					break;
				case "viewPorts":
					if (renderViewPorts())
						$.mobile.navigate("#ViewPorts");
					break;
				case "viewStock":
					if (renderViewStock(info.el.dataset.symbol, info.el.dataset.lot)) {
						Stock.QuoteManager.downloadSingleQuote(info.el.dataset.symbol);
						$.mobile.navigate("#ViewStock");
					}
					break;
				case "viewNewsArticle":
					$.mobile.loading( "show" );
					Stock.Downloader.getNewsContent(info.el.dataset.link, function(newsItem) {
						renderPage("ViewNewsArticle", "ViewNewsArticle", newsItem);
						$.mobile.navigate("#ViewNewsArticle");
						$.mobile.loading( "hide" );
					});
					break;
				case "viewNews":
					if (renderViewNews()) {
						$.mobile.navigate("#ViewNews");
					}
					break;
				case "viewDashboard":
					$.mobile.navigate("#Dashboard");
					break;
				case "viewPorts":
					$.mobile.navigate("#Portfolios");
					break;
				case "viewAddPort":
					renderPopup("AddPort", "AddPort", {});
					$("#AddPort").popup("open");
					break;
				case "viewAddTrans":
					// Refresh the portfolio to prevent stale info
					Stock.Portfolios.update();
					renderPopup("AddTrans", "AddTrans", { ports: Stock.Portfolios.portfolios.toJSON(), transDate: new Date() });
					$("#AddTrans").popup("open");
					break;
				case "viewEditTrans":
					var lot = Stock.Portfolios.lots.get(info.el.dataset.lot);
					if (lot) {
						renderPopup("AddTrans", "AddTrans", { edit: true, ports: Stock.Portfolios.portfolios.toJSON(), lot: lot.toJSON(), transDate: lot.get("transDate") });
						$("#AddTrans").popup("open");
					}
					break;
				case "editLot":
					handleEditTrans(e);
					break;
				case "addTrans":
					handleAddTrans(e);
					break;
				case "toggleAlt":
					var el = getAncestor(e.target, ".summary-list-container");
					if (el) {
						if (el.classList.contains("show-alt"))
							el.classList.remove("show-alt");
						else
							el.classList.add("show-alt");
					}
					break;
				case "AddPort":
					onAddPortSubmit(e);
					break;
				case "refresh":
					Stock.Portfolios.update();
					Stock.QuoteManager.update();
					break;
				case "sellLot":
					var lot = Stock.Portfolios.lots.get(info.el.dataset.lot);
					if (lot) {
						var price = prompt("What was the sell price for " + lot.get("symbol") + "?");
						if (price > 0) {
							var qty = prompt("How many shares to sell?", lot.get("qty"));
							if (qty > 0) {
								Stock.Portfolios.sellLot(lot, qty, price, 0);
							}
						}

					}
					break;
				case "setPortCash":
					var port = Stock.Portfolios.portfolios.get(info.el.dataset.id);
					if (port) {
						var cash = prompt("What's the cash balance for " + port.get("name") + "?");
						if (cash)
							cash = cash.replace(",", "");
						if (cash >= 0) {
							Stock.Portfolios.updateCash(port, cash);
						}
					}
					else {
						alert("Can't find the portfolio");
					}
					break;
				default:
					handled = false;
					break;
			}
			if (handled)
				e.preventDefault();
		});
	}

	function renderViewStock(symbol, portId) {
		if (symbol) {
			var start = new Date();
			var context = {
				portLotsInfo : Stock.Portfolios.getLotsGroupedByPort({symbol: symbol, portId: portId }),
				quote : Stock.QuoteManager.quotes[symbol],
				headlines : Stock.QuoteManager.getNews(symbol)
			};

			renderPage("ViewStock", "ViewStock", context);

			var page = document.querySelector("#ViewStock");
			if (page) {
				if (portId)
					page.dataset.port_id = portId;
				else
					delete page.dataset.port_id;

				page.dataset.symbol = symbol;
			}

			//alert("Render time: " + ((new Date()).getTime() - start.getTime()) + "ms");
			return true;
		}
		return false;
	}

	function renderViewPort(portId) {
		var start = new Date();
		var port = null,
			lots = Stock.Portfolios.getCombinedLots({ portId: portId, getSublots: true });

		if (portId == "all") {
			port = { objectId: "all", name: "All Portfolios", cash: Stock.Portfolios.getAllCash()};
		}
		else {
			port = Stock.Portfolios.portfolios.get(portId);
		}
		if (port) {
			var context = { port: port.toJSON ? port.toJSON() : port, lots: lots };

			context.lots.sort(function(a, b) {
				// Sort lots by name then value
				if (a.symbol == b.symbol) {
					return (a.marketValue || b.marketValue) ? b.marketValue - a.marketValue : 0;
				}
				else
					return a.symbol > b.symbol ? 1 : -1;
			});

			renderPage("ViewPort", "ViewPort", context);

			var page = document.querySelector("#ViewPort");
			if (page) {
				page.dataset.port_id = portId;
			}

			//alert("Render time: " + ((new Date()).getTime() - start.getTime()) + "ms");
			return true;
		}
		return false;
	}
	function renderPopup(template, pageId, context) {
		var cssSel = "#" + pageId,
			page = document.querySelector(cssSel);
		if (page)
			page.remove();
		if (!page) {
			context.pageId = pageId;
			var html = Stock.Template.render(template, context);
			var el = document.createElement("div");
			el.innerHTML = html;
			document.body.appendChild(el.firstChild);
			$(cssSel).popup();
		}
	}
	function renderPage(template, pageId, context) {
		var cssSel = "#" + pageId,
			page = document.querySelector(cssSel);
		context.authenticated = Stock.Portfolios.isAuthed();
		if (!page) {
			context.pageId = pageId;
			var html = Stock.Template.render("Page", context);
			var el = document.createElement("div");
			el.innerHTML = html;
			document.body.appendChild(el.firstChild);
		}
		else if (page.dataset.temp == 1) {
			page.dataset.temp = 0;
			context.noPageDiv = true;
			Stock.Template.renderInto("Page", context, page);
		}
		page = document.querySelector(cssSel);
		if (page) {
			Stock.Template.renderInto(template, context, page.querySelector("[data-role='main']"));
			$(cssSel).trigger('create');
		}
	}

	function getPortContext(portId) {
		var context = null,
			port = Stock.Portfolios.portfolios.get(portId),
			lots = Stock.Portfolios.getPortLots(portId, true, true);
		if (port) {
			context = port.toJSON();
		}
		else if (portId == "all")
			context = { cash: Stock.Portfolios.getAllCash() };

		if (context) {
			context.marketValue = 0;
			context.valueDelta = 0;
			context.gain = 0;
			context.cost = 0;
			lots.forEach(function (lot) {
				if (!isNaN(lot.marketValue))
					context.marketValue += lot.marketValue;
				if (!isNaN(lot.cost))
					context.cost += lot.cost;
				if (!isNaN(lot.valueDelta))
					context.valueDelta += lot.valueDelta;
				if (!isNaN(lot.gain))
					context.gain += lot.gain;
			});
			context.marketValue += context.cash;
			context.valueDeltaPercent = context.valueDelta*100/context.marketValue;
			context.gainPercent = context.gain*100/context.marketValue;

			context.cost = context.cost.toFixed(2);
			context.valueDelta = context.valueDelta.toFixed(0);
			context.gain = context.gain.toFixed(0);
			context.marketValue = context.marketValue.toFixed(0);
			context.valueDeltaPercent = context.valueDeltaPercent.toFixed(2);
			context.gainPercent = context.gainPercent.toFixed(2);

		}
		return context;
	}

	function renderViewPorts() {
		var context = { myPorts: [] };
		var portContext = getPortContext("all");
		if (portContext)
			context.allPorts = portContext;
		Stock.Portfolios.portfolios.forEach(function(port) {
			portContext = getPortContext(port.id);
			if (portContext)
				context.myPorts.push(portContext);
		});
		context.myPorts.sort(function(a, b) {
			if (a.marketValue || b.marketValue)
				return b.marketValue - a.marketValue;
			else
				return a.name > b.name ? 1 : (a.name == b.name ? 0 : -1);
		});
		renderPage("ViewPorts", "ViewPorts", context);
		return true;
	}
	function renderViewNews() {
		var context = { headlines: Stock.QuoteManager.getStocksNews() };
		renderPage("News", "ViewNews", context);
		return true;
	}
	function renderDashboard() {
		var context = { };
		context.myStocks = Stock.Portfolios.getCombinedLots({ ignoreOptions: true });
		context.earnings = Stock.QuoteManager.getEarnings();
		var news = Stock.QuoteManager.getTopNews();
		if (news.length > 0)
			context.headlines = news;
		context.myPorts = [];
		var portContext = getPortContext("all");
		if (portContext)
			context.allPorts = portContext;
		Stock.Portfolios.portfolios.forEach(function(port) {
			portContext = getPortContext(port.id);
			if (portContext)
				context.myPorts.push(portContext);
		});
		context.myStocks.sort(function(a, b) {
			return a.symbol > b.symbol ? 1 : (a.symbol == b.symbol ? 0 : -1);
		});
		context.myPorts.sort(function(a, b) {
			if (a.marketValue || b.marketValue)
				return b.marketValue - a.marketValue;
			else
				return a.name > b.name ? 1 : (a.name == b.name ? 0 : -1);
		});
		renderPage("Dashboard", "Dashboard", context);
	}

	function render() {
		var page = document.querySelector(".ui-page-active");
		switch(page ? page.dataset.url : location.hash) {
			case "Dashboard":
				renderDashboard();
				break;
			case "ViewStock":
				renderViewStock(page.dataset.symbol, page.dataset.port_id);
				break;
			case "ViewPort":
				renderViewPort(page.dataset.port_id);
				break;
			case "ViewPorts":
				renderViewPorts();
				break;
			case "ViewNews":
				renderViewNews();
				break;
		}
	}
	//var _lots = [{"symbol":"EXXI","qty":92,"fee":9.99,"note":"","price":30.96,"type":0,"transDate":{"__type":"Date","iso":"2013-10-14T07:00:00.000Z"},"portId":"db36lnpeAT","parent":{"__type":"Pointer","className":"Portfolio","objectId":"db36lnpeAT"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"0N9YZf6Nr7","createdAt":"2014-07-11T06:32:14.965Z","updatedAt":"2014-07-11T06:32:14.965Z"},{"symbol":"FB","qty":100,"fee":9.99,"note":"","price":68.756,"type":0,"transDate":{"__type":"Date","iso":"2014-03-13T07:00:00.000Z"},"portId":"db36lnpeAT","parent":{"__type":"Pointer","className":"Portfolio","objectId":"db36lnpeAT"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"16uquM93L7","createdAt":"2014-07-11T06:32:14.975Z","updatedAt":"2014-07-11T06:32:14.975Z"},{"symbol":"YHOO150117C00035000","qty":500,"fee":9.99,"note":"","price":8.8,"type":0,"transDate":{"__type":"Date","iso":"2013-12-26T08:00:00.000Z"},"portId":"db36lnpeAT","parent":{"__type":"Pointer","className":"Portfolio","objectId":"db36lnpeAT"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"AiGcxmEDBS","createdAt":"2014-07-11T06:32:15.110Z","updatedAt":"2014-07-11T06:32:15.110Z"},{"symbol":"FCNTX","qty":104,"fee":9.99,"note":"","price":97,"type":0,"transDate":{"__type":"Date","iso":"2014-03-05T08:00:00.000Z"},"portId":"2MW95axkza","parent":{"__type":"Pointer","className":"Portfolio","objectId":"2MW95axkza"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"fEAMaP7FFP","createdAt":"2014-07-11T06:34:44.129Z","updatedAt":"2014-07-11T06:34:44.129Z"},{"symbol":"FCNTX","qty":652,"fee":10,"note":"","price":96.78,"type":0,"transDate":{"__type":"Date","iso":"2014-02-24T08:00:00.000Z"},"portId":"2MW95axkza","parent":{"__type":"Pointer","className":"Portfolio","objectId":"2MW95axkza"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"e2cBoWDpKk","createdAt":"2014-07-11T06:34:44.132Z","updatedAt":"2014-07-11T06:34:44.132Z"},{"symbol":"FCNTX","qty":3,"fee":0,"note":"","price":97.88,"type":0,"transDate":{"__type":"Date","iso":"2014-03-18T07:00:00.000Z"},"portId":"2MW95axkza","parent":{"__type":"Pointer","className":"Portfolio","objectId":"2MW95axkza"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"s1Uv2HjCHD","createdAt":"2014-07-11T06:34:44.308Z","updatedAt":"2014-07-11T06:34:44.308Z"},{"symbol":"VBTIX","qty":8110,"fee":9.99,"note":"","price":10.7,"type":0,"transDate":{"__type":"Date","iso":"2014-03-05T08:00:00.000Z"},"portId":"2MW95axkza","parent":{"__type":"Pointer","className":"Portfolio","objectId":"2MW95axkza"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"yc8U2r3rmN","createdAt":"2014-07-11T06:34:44.310Z","updatedAt":"2014-07-11T06:34:44.310Z"},{"symbol":"VBTIX","qty":227,"fee":9.99,"note":"","price":10.7,"type":0,"transDate":{"__type":"Date","iso":"2014-03-18T07:00:00.000Z"},"portId":"2MW95axkza","parent":{"__type":"Pointer","className":"Portfolio","objectId":"2MW95axkza"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"IlTg3ydyjp","createdAt":"2014-07-11T06:34:44.328Z","updatedAt":"2014-07-11T06:34:44.328Z"},{"symbol":"EXXI","qty":92,"fee":9.99,"note":"","price":30.96,"type":0,"transDate":{"__type":"Date","iso":"2013-10-14T07:00:00.000Z"},"portId":"SEilhNegwH","parent":{"__type":"Pointer","className":"Portfolio","objectId":"SEilhNegwH"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"R3sPcUWFjM","createdAt":"2014-07-11T06:35:55.275Z","updatedAt":"2014-07-11T06:35:55.275Z"},{"symbol":"FB","qty":100,"fee":9.99,"note":"","price":68.836,"type":0,"transDate":{"__type":"Date","iso":"2014-03-13T07:00:00.000Z"},"portId":"SEilhNegwH","parent":{"__type":"Pointer","className":"Portfolio","objectId":"SEilhNegwH"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"LqaSTViTCZ","createdAt":"2014-07-11T06:35:55.413Z","updatedAt":"2014-07-11T06:35:55.413Z"},{"symbol":"YHOO150117C00035000","qty":500,"fee":9.99,"note":"","price":8.8,"type":0,"transDate":{"__type":"Date","iso":"2013-12-26T08:00:00.000Z"},"portId":"SEilhNegwH","parent":{"__type":"Pointer","className":"Portfolio","objectId":"SEilhNegwH"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"ff5z9c2mIg","createdAt":"2014-07-11T06:35:55.465Z","updatedAt":"2014-07-11T06:35:55.465Z"},{"symbol":"LULU150117C00060000","qty":1000,"fee":18,"note":"","price":9.8,"type":0,"transDate":{"__type":"Date","iso":"2013-12-12T08:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"kVECEfKMZZ","createdAt":"2014-07-11T06:36:09.695Z","updatedAt":"2014-07-11T06:36:09.695Z"},{"symbol":"FB150117C00067500","qty":500,"fee":9.99,"note":"","price":12.45,"type":0,"transDate":{"__type":"Date","iso":"2014-03-13T07:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"JEK9nifuNp","createdAt":"2014-07-11T06:36:09.695Z","updatedAt":"2014-07-11T06:36:09.695Z"},{"symbol":"YHOO150117C00037000","qty":200,"fee":25,"note":"","price":6.25,"type":0,"transDate":{"__type":"Date","iso":"2014-02-13T08:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"8HXiZyXHXv","createdAt":"2014-07-11T06:36:09.825Z","updatedAt":"2014-07-11T06:36:09.825Z"},{"symbol":"YHOO150117C00037000","qty":2000,"fee":9.99,"note":"","price":6.25,"type":0,"transDate":{"__type":"Date","iso":"2014-02-13T08:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"wPxMzUYk4c","createdAt":"2014-07-11T06:36:09.848Z","updatedAt":"2014-07-11T06:36:09.848Z"},{"symbol":"YHOO140719C00040000","qty":2000,"fee":9.99,"note":"","price":3.05,"type":0,"transDate":{"__type":"Date","iso":"2014-02-13T08:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"P7i0FFOWQT","createdAt":"2014-07-11T06:36:09.906Z","updatedAt":"2014-07-11T06:36:09.906Z"},{"symbol":"YHOO150117C00037000","qty":1000,"fee":9.99,"note":"","price":5.75,"type":0,"transDate":{"__type":"Date","iso":"2014-03-10T07:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"WFRLakRrkx","createdAt":"2014-07-11T06:36:09.963Z","updatedAt":"2014-07-11T06:36:09.963Z"},{"symbol":"YHOO150117C00037000","qty":1000,"fee":9.99,"note":"","price":5.2,"type":0,"transDate":{"__type":"Date","iso":"2014-03-13T07:00:00.000Z"},"portId":"f8KnQ6MduF","parent":{"__type":"Pointer","className":"Portfolio","objectId":"f8KnQ6MduF"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"Vaimmg6qeH","createdAt":"2014-07-11T06:36:09.991Z","updatedAt":"2014-07-11T06:36:09.991Z"},{"symbol":"YHOO","qty":183,"fee":0,"note":"","price":29.808,"type":0,"transDate":{"__type":"Date","iso":"2014-02-10T08:00:00.000Z"},"portId":"Ggea5NdHD9","parent":{"__type":"Pointer","className":"Portfolio","objectId":"Ggea5NdHD9"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"KSChLQ9JBR","createdAt":"2014-07-11T06:36:41.094Z","updatedAt":"2014-07-11T06:36:41.094Z"},{"symbol":"YHOO","qty":3348,"fee":0,"note":"","price":40.01,"type":0,"transDate":{"__type":"Date","iso":"2014-01-24T08:00:00.000Z"},"portId":"Ggea5NdHD9","parent":{"__type":"Pointer","className":"Portfolio","objectId":"Ggea5NdHD9"},"ACL":{"zFhwETr67B":{"read":true,"write":true}},"objectId":"bn3Mrw9ev7","createdAt":"2014-07-11T06:36:41.099Z","updatedAt":"2014-07-11T06:36:41.099Z"}];
	Stock.App = {
		init: init
	};
	if (window.Parse && Parse.Events)
		_.extend(Stock.Portfolios, Parse.Events);


})();

