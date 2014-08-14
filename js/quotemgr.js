(function(){
	window.Stock = window.Stock || {};
	
	var  _quotesInfo = {},
	_topNews = [],
	_news = [],
	_stockNews = {},
	_earnings = {},
	_lastTopNewsUpdatedHour = undefined,
	yqlNewsQuery = null,
	updatingQuote = false,
	quoteDownloaded = false,
	_lastFullFetch = 0;
	
    Stock.QuoteManager = quoteMgr = {
		news: _news,
		quotes: _quotesInfo,
		ready: isQuotesReady,
		lastFullDownload: function () { return _lastFullFetch; },
		update: refreshQuotes,
	    downloadSingleQuote: downloadSingleQuote,
		
		getInfo: getInfo,
		getEarnings: getEarnings,
		getTopNews: getTopNews,
		getNews: getNews
    };
	_.extend(Stock.QuoteManager, Parse.Events);
        
	function isQuotesReady () {
		return quoteDownloaded;
	};
	function getInfo(sym, key) {
		var ret = 0;    
		if (sym && key) {
			if (key == "symbol")
				return sym;
			if (_quotesInfo[sym])
				ret = _quotesInfo[sym][key];
			else {
				ret = 0;
				//fetchQuote(sym); // TODO need to implement
			}
		}
		return ret;
	};
	
	function parseResults(quotes) {
		var i=0, field=0;
		
		// Note: fork the process so it doens't block UI
		for (i in quotes) {
			quote = quotes[i];
			if (!_quotesInfo[quote.symbol])
				_quotesInfo[quote.symbol] = {};
			info = _quotesInfo[quote.symbol];
			for (field in quote)
				info[field] = quote[field];
			if (quote.earningsDate && (!_earnings[quote.symbol] || _earnings[quote.symbol].date != quote.earningsDate)) {
				_earnings[quote.symbol] = { date: quote.earningsDate, lastUpdated: (new Date()).getTime()};
				localStorage.setItem("earnings", JSON.stringify(_earnings));
			}
		}
		quoteMgr.trigger("quotesUpdated", quotes);
	};
	
	function onQueryResult(quotes) {
		console.log("QuoteMgr: onQueryResult");
		if (quotes && quotes.length > 0) { 
			quoteDownloaded = true;
			quoteMgr.trigger('quotesInfoUpdated');
			console.log("QuoteMgr: Quote info downloaded");
		}
		else {
			console.log("QuoteMgr: Error in query for stock quote " + quotes);
		}
		updatingQuote = false;
	};
	function downloadSingleQuote(symbol) {
		Stock.Downloader.downloadSingleQuote(symbol, function(quote) {
			if (quote) {
				parseResults([quote]);
			}
		});
	}
	function downloadQuotes () {
		var info = Stock.Portfolios.getStocksList();
		
		if (info.options.length > 0 || info.stocks.length > 0) {
			var downloaded = 1;
			Stock.Downloader.setCallback(function(results) {
				parseResults(results.quotes);
				downloaded++;
				if (downloaded >= 2) {
					onQueryResult(results.quotes);
				}
				if (results.news.length > 0) {
					_news = results.news;
					quoteMgr.trigger('newsDownloaded', _news);
				}
			});
			// do a full fetch once an hour
			if (!_lastFullFetch || (new Date()).getTime() - _lastFullFetch.getTime() > 3600000) {
				_lastFullFetch = new Date();
				downloaded = 0;
				Stock.Downloader.downloadDetailedQuotes(info);
				Stock.Downloader.downloadRTQuotes(info);
			}
			else {
				Stock.Downloader.downloadRTQuotes(info);
			}
		}
		else {
			quoteDownloaded = true;
			// if there isn't any quotes to retrieve just fire update now
			quoteMgr.trigger('quotesInfoUpdated');    // TODO: may need to rework this so it's more logic in a design sense
		}
	}
	function refreshQuotes() {
		// Make sure we are not already updating
		if (updatingQuote !== true) {
			downloadQuotes();
			//getYqlQuery();
			updatingQuote = true;
			// Reset the flag after x seconds
			setTimeout(function() {
				updatingQuote = false;
			}, 10000);
		}
	};
	function refreshNews () {    
		if (yqlNewsQuery) {
			yqlNewsQuery.send();
		}
		else {
			downloadQuotes();
		}
	};
	function init () {
		// When there is a new stock or portfolio added, we see if there was a change to the cached stock list
		Stock.Portfolios.lots.on("add", function(obj, collection, index) {
			newLotAdded = true;
		});
		Stock.Portfolios.on("portsReady", function(obj, collection, index) {
			console.log("QuoteMgr: portsReady: received");
			//refreshQuotes();
		});
		Stock.Portfolios.on("lotsReady", function(obj, collection, index) {
			console.log("QuoteMgr: lotsReady: received. Downloading quotes");
			refreshQuotes();
		});
		var cachedEarnings = JSON.parse(localStorage.getItem("earnings"));
		if (cachedEarnings) {
			_earnings = cachedEarnings;
			var quotes = [];
			for (var sym in _earnings) {
				var earning = _earnings[sym];
				var quote = {symbol: sym, earningsDate: earning.date };
				parseEarningsDate(quote);
				// Update the earnings info once a week or if the date is in the past
				var timeToUpdate = timeToUpdateEarnings(quote, earning.lastUpdated);
				if (timeToUpdate > 0) {
					quotes.push(quote);
					//console.log("Earnings: Time to update: " + sym + " : " + Math.round(timeToUpdate/(24*60*60*1000)) + "days");
				}
				else {
					delete _earnings[sym];	 // clear it from cache
					console.log("Clear outdated earnings date for " + sym);
				}
			}
			parseResults(quotes);
		}
	};
        
	
	function parseEarningsDate(quote) {
		if (quote.earningsDate.indexOf("Est.") > 0) {
			var date = new Date(quote.earningsDate.split("-")[0] + " " + (new Date()).getFullYear());
			if (!isNaN(date.getTime())) {
				quote.earningsDateObj = date;
				quote.earningsDateEst = true;
			}
			else {
				console.log("Error: couldn't parse earning date");
			}
		}
		else {
			var date = new Date(quote.earningsDate);
			if (!isNaN(date.getTime())) {
				quote.earningsDateObj = date;
				quote.earningsDateEst = false;
			}
		}
	}
	function timeToUpdateEarnings(quote, lastUpdated) {
		var now = new Date();
		// If it's an estimate or the time is in the past
		if (quote.earningsDateEst || !quote.earningsDateObj || (quote.earningsDateObj && quote.earningsDateObj.getTime() < now.getTime())) {
			// As we get closer to the earning estimate date, we will check more frequently
			var timeDiff = 0, checkInterval = 2419200000;
			if (quote.earningsDateObj) {
				timeDiff = quote.earningsDateObj.getTime() - now.getTime();
				// check every day if the earning is less than 2 weeks away
				if (timeDiff < 2419200000)
					checkInterval = 24*60*60*1000;
				else
					checkInterval = timeDiff/4;
			}
			return (checkInterval - (now.getTime() - lastUpdated));
		}
		return 1;
	}
	function getEarnings() {
		updateEarnings();
		var sym, quote, earnings = [], curDate = new Date();
		for (sym in _quotesInfo) {
			quote = _quotesInfo[sym];
			// Only show the next 4 weeks 
			if (quote.earningsDate && quote.earningsDateObj &&
				quote.earningsDateObj.getTime() + 86400000 - curDate.getTime() > 0 &&	// don't show past earnings
				quote.earningsDateObj.getTime() - curDate.getTime() < 2409600000) {
				earnings.push(quote);
			}
		}
		earnings.sort(function(a, b) {
			if (a.earningsDateObj && b.earningsDateObj) {
				return a.earningsDateObj.getTime() > b.earningsDateObj.getTime() ? 1 : -1;
			}
			return 1;
		});
		return earnings;
	}
	function updateEarnings() {
		var count = 0;
		for (sym in _quotesInfo) {
			quote = _quotesInfo[sym];
			if (count > 4) break;	// download 5 each time to avoid hitting the server too much
			if (quote.type == "equity") {
				if (!quote.earningsDate) {
					Stock.Downloader.downloadSingleQuote(quote.symbol, function(quote) {
						if (quote) {
							parseResults([quote]);
						}
					});
					count++;
				}
			}
		}
	}
	function getTopNews(callback) {
		var date = new Date(),
		hour = date.getHours();
		if (_lastTopNewsUpdatedHour != hour) { 
			_lastTopNewsUpdatedHour = hour;
			Stock.Downloader.getTopNews(function(news) {
				if (news)
					_topNews = news;
				quoteMgr.trigger('topNews', _topNews);
				callback && callback(_topNews);
			});
		}
		return _topNews;
	}
	
	function onNewsQueryResult(results) {
		quoteMgr.trigger('newsDownloaded', results);
	};
	function queryForNews(stocks, callback) {
		
	};
	
	function getNews(stock, callback) {
		if (stock && !_stockNews[stock]) {
			Stock.Downloader.getNews(stock, function (news) {
				_stockNews[stock] = news;
				// clear the news after 5 min
				setTimeout(function() {
					delete _stockNews[stock];
				}, 300000);
				callback && callback(news);
				quoteMgr.trigger('news', news);
			});
		}
		return _stockNews[stock];
	}
	init();
	_.extend(Stock.QuoteManager, Parse.Events);
})();