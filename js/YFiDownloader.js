(function () {
	window.Stock = window.Stock || {};
	var onQuotesDownloadedCB = null;
	
	// " 119.13 (0.70%)"
	function parseChange(str, quote) {
		var ret = {},
		parts = str.trim().replace(/[ ,\,]/g, "").split("(");
		if (parts.length == 2) {
			ret = {};
			ret.change = parseFloat(parts[0]);
			ret.percent = parseFloat(parts[1].substr(0, parts[1].length - 2));
		}
		return ret;
	}
	function parseRange(str) {
		var ret = {},
		parts = str.trim().replace(/[ ,\,]/g, "").split("-");
		if (parts.length == 2) {
			ret = {};
			ret.low = parseFloat(parts[0]);
			ret.high = parseFloat(parts[1]);
		}
		return ret;
	}
	function convertToDom(html) {
		var el = null;
		if (html) {
			el = document.createElement("DIV");
			// neuter all the image and script tags
			el.innerHTML = html;
		}
		return el;
	}
	function parseDetailedView(response) {
		var quotes = [], range, change,
		el = convertToDom(response);
		if (!el) return { quotes: quotes, news: []};
			
		var entries = el.querySelectorAll(".yfi_summary_table");
		for (var i=0; i < entries.length; i++) {
			entry = entries[i];
			var quote = {};
			quote.name = entry.querySelector(".hd h2").innerText;
			var symbol = entry.querySelector(".hd p").innerText.replace(/[ ,(,)]/g, "").split(":");
			quote.symbol = symbol[1];
			if (symbol[0])
				quote.xchange = symbol[0];
			if (entry.classList.contains("type_index")) {
				var info = entry.querySelectorAll(".bd tr td");
				if (info.length == 7) {
					// 0 - price
					//quote.price = parseFloat(info[0].innerText.replace(/,/g, ""));
					// 1 - trade time
					// 2 - change
					//change = parseChange(info[2].innerText);
					//quote.change = change.change;
					//quote["percent-change"] = change.percent;
					
					// 3 - prev_close
					quote.prev_close = parseFloat(info[3].innerText.replace(/,/g, ""));
					
					// 4 - open                			
					quote.open = parseFloat(info[4].innerText.replace(/,/g, ""));
				
					// 5 - day range
					range = parseRange(info[5].innerText);
					quote.day_lo = range.low;
					quote.day_hi = range.high;
					
					// 6 - yrRange
					quote.yrRange = info[6].innerText.replace(/[ ,\,]/g, "");
					
					quote.type = "INDEX";
				}
			}
			else if (entry.classList.contains("type_mutualfund")) {
				var info = entry.querySelectorAll(".bd tr td");
				if (info.length == 5) {
					//quote.price = parseFloat(info[0].innerText.replace(/,/g, ""));
					quote.prev_close = quote.price;
					// 3 - YTD return
					quote.ytdRet = parseFloat(info[3].innerText.replace(/,/g, ""));
					// 4 - Yield ttm
					quote.yield = parseFloat(info[4].innerText.replace(/,/g, ""));
					if (entry.classList.contains("type_etf"))
						quote.type = "ETF";
					else if (entry.classList.contains("type_mutualfund"))
						quote.type = "MF";
				}
			}
			else if (entry.classList.contains("type_equity") || entry.classList.contains("type_etf")) {
				var isETF = entry.classList.contains("type_etf");
				var info = entry.querySelectorAll(".bd tr td");
				if (info.length == 16) {
					quote.price = parseFloat(info[0].innerText.replace(/,/g, ""));
					
					range = parseRange(info[1].innerText);
					quote.day_lo = range.low;
					quote.day_hi = range.high;
					quote.type = "equity";
					
					range = parseRange(info[3].innerText);
					quote.year_lo = range.low;
					quote.year_hi = range.high;
					
					//change = parseChange(info[4].innerText);
					//quote.change = change.change;
					//quote["percent-change"] = change.percent;
					
					quote.vol = parseFloat(info[5].innerText);
					
					quote.prev_close = parseFloat(info[6].innerText.replace(/,/g, ""));
					quote.open = parseFloat(info[8].innerText.replace(/,/g, ""));
					
					quote.bid = parseFloat(info[10].innerText.split("x")[0]);
					quote.ask = parseFloat(info[12].innerText.split("x")[0]);
					
					if (!isETF) {
						quote.MCap = info[9].innerText.trim();
						quote.pe = parseFloat(info[11].innerText.replace(/,/g, ""));
						quote.eps = parseFloat(info[13].innerText.replace(/,/g, ""));
						quote.YrTarEst = parseFloat(info[14].innerText.replace(/,/g, ""));
						change = parseChange(info[15].innerText);
						quote.dividend = change.change;
						quote.yield = change.percent;
					}
					else {
						quote.ytdRet = parseFloat(info[9].innerText.replace(/,/g, ""));
						quote.nav = parseFloat(info[14].innerText.replace(/,/g, ""));
						quote.yield = parseFloat(info[15].innerText);
					}
				}
			}
			else if (entry.classList.contains("type_option")) {
				var info = entry.querySelectorAll(".bd tr td");
				if (info.length == 8) {
					// No price returned here

					range = parseRange(info[3].innerText);
					quote.day_lo = range.low;
					quote.day_hi = range.high;
					quote.type = "option";
															
					quote.vol = parseFloat(info[4].innerText);
					
					quote.prev_close = parseFloat(info[2].innerText.replace(/,/g, ""));
					quote.open = parseFloat(info[1].innerText.replace(/,/g, ""));
					
					quote.expiration = info[7].innerText.replace(/[ ,\,]/g, "");
					quote.strike = parseFloat(info[6].innerText.replace(/,/g, ""));


					function formatOptionName(quote, noSymbol) {
						var symbol = quote.symbol.substr(0, quote.symbol.length - 15),
							info = quote.symbol.substr(symbol.length),
							expiration = quote.expiration.split("-"),
							isPut = info.charAt(7);

						if (noSymbol)
							return [expiration[1], "'" + expiration[2]%1000, quote.strike, isPut ? "P" : "C" ].join(" ");
						else
							return [symbol, expiration[1], /*expiration[0], */"'" + expiration[2]%1000, quote.strike, isPut ? "P" : "C" ].join(" ");
					}
					quote.name = formatOptionName(quote);
				}
			}
			else {
				
			}
			//console.log("Parsed quote result: " + JSON.stringify(quote));
			quotes.push(quote);
		}
		return { quotes: quotes, news: []};
	}
	function parseNews(elRoot) {
		var news = [], elCite, elTime, elDesc, elTitle, i,j;
		var entries = elRoot.querySelectorAll("#yfi-recent-news tr");
		for (i=0; i < entries.length; i++) {
			entry = entries[i];
			newsItem = { quotes: [], title: "", url: "", cite: "", time: "" };
			var symbols = entry.querySelectorAll("td.symbol ul a");
			for (j=0; j < symbols.length; j++) {
				newsItem.quotes.push(symbols[j].innerText);
			}
			elDesc = entry.querySelector("td:not(.symbol)");
			if (elDesc) {
				elCite = elDesc.querySelector("cite");
				elTime = elDesc.querySelector("span");
				elTitle = elDesc.querySelector("a");
				if (elCite && elTime && elTitle) {
					newsItem.cite = elCite.innerText.trim();
					newsItem.time = elTime.innerText.trim();
					newsItem.title = elTitle.innerText.trim();
					newsItem.link = elTitle.getAttribute("href");
					
					// skip paid article and video
					if (newsItem.title.indexOf("[$$]") == -1 && newsItem.title.indexOf("[video]") == -1) {
						//console.log("Add news item: " + JSON.stringify(newsItem));
						news.push(newsItem);
					}
				}
			}
			
		}
		return news;
	}
	function parseRTView(response) {
		var quotes = [], news = [], range, change, info, quote,
		el = convertToDom(response);
		if (!el) return {quotes: quotes, news: news};
		
		news = parseNews(el);
		var entries = el.querySelectorAll("table.yfi_portfolios_multiquote tr");
		console.log("Downloaded quotes for " + entries.length);
		for (var i=0; i < entries.length; i++) {
			entry = entries[i];
			quote = {};
			info = entry.querySelector("td.col-symbol a");
			if (!info) {
				if (i > 0)	// First line is the header
					console.log("Quote not found: " + entry.innerText.replace(/  /g, ""));
				continue;
			}
			
			quote.symbol = info.innerText;
							
			info = entry.querySelector("td.col-price");
			if (info) quote.price = parseFloat(info.innerText.replace(/,/g, ""));
			
			info = entry.querySelector("td.col-change");
			if (info) quote.change = parseFloat(info.innerText.replace(/,/g, ""));
			
			info = entry.querySelector("td.col-percent_change");
			if (info) quote["percent-change"] = parseFloat(info.innerText.replace(/,/g, ""));
							
			//console.log("Parsed quote result: " + JSON.stringify(quote));
			quotes.push(quote);
		}
		return {quotes: quotes, news: news};
	}
	// sample
	// ETF: IVV, OPTIONS: yhoo150117c00025000, MF: fcntx
	function parseSingleQuoteView(ticker, response) {
		var isUp = false, quotes = [], range, change, info, quote = { symbol: ticker.toUpperCase()}, elInfo,
		elRoot = convertToDom(response), el;
		if (!elRoot) return null;
		el = elRoot.querySelector("#yfi_investing_content .yfi_rt_quote_summary");
		elInfo = el.querySelector(".time_rtq_ticker span");
		if (elInfo) quote.price = parseFloat(elInfo.innerText.replace(/,/g, ""));
		
		elInfo = el.querySelector(".time_rtq_content");
		if (elInfo) {
			change = parseChange(elInfo.innerText.replace(/,/g, ""));
			var isUp = !!elInfo.querySelector(".pos_arrow");
			quote.change = change.change * (isUp ? 1 : -1);
			quote["percent-change"] = change.percent;
		}
		
		// extract AH prices
		var lcTicker = ticker.toLowerCase();
		elInfo = el.querySelector("#yfs_l86_" + lcTicker);
		if (elInfo) quote.priceAH = parseFloat(elInfo.innerText.replace(/,/g, ""));
		elInfo = el.querySelector("#yfs_c85_" + lcTicker);
		if (elInfo) quote.changeAH = parseFloat(elInfo.innerText.replace(/[ ,\,]/g, ""));
		var isUp = !!elInfo.querySelector(".pos_arrow");
		if (!isUp) quote.changeAH *= -1;

		elInfo = el.querySelector("#yfs_c86_" + lcTicker);
		if (elInfo) quote.percent_changeAH = parseFloat(elInfo.innerText.replace(/[(,),\,%]/g, ""));
		
		el = elRoot.querySelectorAll("#yfi_investing_content .yfi_quote_summary tr");
		// Equity
		if (el.length == 15) {
			if (el[6].innerText.indexOf("Earnings") != -1) {
				// Jul 15 - Jul 17 (Est.)
				// "22-Jul-14"
				quote.earningsDate = el[6].querySelector("td").innerText.trim();
				parseEarningsDate(quote);
			}
		}		
		
		console.log("Parsed single quote result: " + JSON.stringify(quote));
		return quote;
	}
	function parseEarningsDate(quote) {
		if (quote.earningsDate.indexOf("Est.") > 0) {
			var date = new Date(quote.earningsDate.split("-")[0] + " " + (new Date()).getFullYear());
			if (!isNaN(date.getTime())) {
				quote.earningsDateObj = date;
			}
			else {
				console.log("Error: couldn't parse earning date");
			}
		}
		else {
			var date = new Date(quote.earningsDate);
			if (!isNaN(date.getTime()))
				quote.earningsDateObj = date;
		}
	}
	
	function requestFile(url, callbackFn) {
		Parse.Cloud.run('getPage', { url: url }, {
			success: function(data) {
				callbackFn.success(data);
			},
			error: function(error) {
				callbackFn.error();
			}
		});
	}
	function requestFileXHR(url, callbackFn) {
		var xmlhttp=new XMLHttpRequest();
		xmlhttp.onreadystatechange=function() {
			if (xmlhttp.readyState==4) {
				if (xmlhttp.status==200 && callbackFn.success)
					callbackFn.success(xmlhttp.responseText);
				else if (xmlhttp.status!=200 && callbackFn.error)
					callbackFn.error();
			}
		};
		xmlhttp.open("GET", url, true);
		xmlhttp.send();
	}
	function downloadDetailedQuotes(tickers) {
		var url;
		if (tickers && tickers.options.length > 0 || tickers.stocks.length > 0) {
			url = window.location.host + window.location.pathname;
			if (url.lastIndexOf("localhost") != -1 || url.lastIndexOf("127.0.0.1") != -1) {
				url = "pair.jimming.com/money/";
			}
			//query = ['use "http://', url, 'yql_page_fetch.xml" as MyTable; select * from MyTable where url="http://finance.yahoo.com/quotes/',
			//		tickers.stocks.join(','), ",", tickers.options.join(","), '/view/dv" and  xpath="//div[@id=\'yfi-main\']"'].join('');
			url = ["http://finance.yahoo.com/quotes/", tickers.stocks.join(','), ",", tickers.options.join(","), "/view/dv"].join('');
			console.log("Downloading detailed quotes.\nQuery: " + url);
			requestFile(url, {
				success: function(response) {
					var quotes = parseDetailedView(response);
					onQuotesDownloadedCB && onQuotesDownloadedCB(quotes);
				}
			});
		}
	}
	function downloadRTQuotes(tickers) {
		console.log("downloadRTQuotes");
		var query, url; 
		if (tickers && tickers.options.length > 0 || tickers.stocks.length > 0) {
			url = window.location.host + window.location.pathname;
			if (url.lastIndexOf("localhost") != -1 || url.lastIndexOf("127.0.0.1") != -1) {
				url = "pair.jimming.com/money/";
			}
			/*query = ['use "http://', url, 'yql_page_fetch.xml" as MyTable; select * from MyTable where url="http://finance.yahoo.com/quotes/',
					tickers.stocks.join(','), ",", tickers.options.join(","), '/view/e" and  xpath="//div[@id=\'yfi-main\']"'].join('');*/
			url = ["http://finance.yahoo.com/quotes/", tickers.stocks.join(','), ",", tickers.options.join(","), "/view/e"].join('');
			console.log("Downloading RT quotes.\nQuery: " + url);
			requestFile(url, {
				success: function(response) {
					var quotes = parseRTView(response);
					onQuotesDownloadedCB && onQuotesDownloadedCB(quotes);
				}
			});
		}
	}
	function downloadSingleQuote(ticker, cb) {
		console.log("downloadSingleQuote for " + ticker);
		var query, url; 
		url = window.location.host + window.location.pathname;
		if (url.lastIndexOf("localhost") != -1 || url.lastIndexOf("127.0.0.1") != -1) {
			url = "pair.jimming.com/money/";
		}
		//query = ['use "http://', url, 'yql_page_fetch.xml" as MyTable; select * from MyTable where url="http://finance.yahoo.com/q?s=',
		//			ticker, '" and  xpath="//div[@id=\'yfi_investing_content\']"'].join('');
		url = "http://finance.yahoo.com/q?s=" + ticker + "&rand=" + (new Date()).getTime();
		requestFile(url, {
				success: function(response) {
					var quote = parseSingleQuoteView(ticker, response);
					//onQuotesDownloadedCB && onQuotesDownloadedCB([quote]);
					cb && cb(quote );
				}
			});
		
	}
	function getTopNews(callback) {
		var query = 'select * from rss where url="http://hosted.ap.org/lineups/BUSINESSHEADS-rss_2.0.xml?SITE=NHPOR&SECTION=HOME"';
		var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json&rand=" + (new Date()).getTime();
		requestFileXHR(url, {
				success: function(response) {
					try {
						var news = JSON.parse(response);
						callback && callback(news.query.results.item);
					}
					catch(e) {
						
					}
				}
			});
	}
	function getNews(stocks, callback) {
		if (stocks) {
			query = ['select * from rss where url="http://finance.yahoo.com/rss/headline?s=', stocks.replace(/\^/gi, "%5E"),'"'].join('');
			var url = "http://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent(query) + "&format=json&rand=" + (new Date()).getTime();
			requestFileXHR(url, {
					success: function(response) {
						try {
							var news = JSON.parse(response);
							callback && callback(news.query.results.item);
						}
						catch(e) {
							
						}
					}
				});
		}
		return false;
	}
	Stock.Downloader = { downloadDetailedQuotes: downloadDetailedQuotes,
		downloadRTQuotes: downloadRTQuotes,
		downloadSingleQuote: downloadSingleQuote,
		getTopNews: getTopNews,
		getNews: getNews,
		setCallback: function(cb) { onQuotesDownloadedCB = cb; }
	};
})();