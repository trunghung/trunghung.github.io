(function() {
	
	
	function init() {
		var cachedEarnings = JSON.parse(localStorage.getItem("earnings"));
		if (cachedEarnings) {
			earnings = cachedEarnings;
			var quotes = [];
			for (var sym in earnings) {
				var earning = earnings[sym];
				var quote = {symbol: sym, earningsDate: earning.date };
				parseEarningsDate(quote);
				// Update the earnings info once a week or if the date is in the past
				var timeToUpdate = timeToUpdateEarnings(quote, earning.lastUpdated);
				if (timeToUpdate > 0) {
					quotes.push(quote);
					console.log("Earnings: Time to update: " + sym + " : " + Math.round(timeToUpdate/(24*60*60*1000)) + "days");
				}
				else {
					delete earnings[sym];	 // clear it from cache
					console.log("Clear outdated earnings date for " + sym);
				}
			}
			parseResults(quotes);
		}
	}
	
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
	
	init();
	Stock.Earnings = {
		
	};
})();