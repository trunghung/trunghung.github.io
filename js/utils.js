(function() {
window.Stock = window.Stock || {};
var utils = Stock.Utils = {
	timeMoreThan: function(ts, minutes) {
		return !ts || (new Date()).getTime() - ts.getTime() > minutes * 60000;
	}

};
})();