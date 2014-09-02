/**
 * Created by hnguyen on 8/31/14.
 */
(function() {
	var urlAuthorMap = {
		"thestreet.com": {
			name: "TheStreet",
			xpath: "//div[@id=\'story\']",
			title: "#titleBar h1",
			author: "#titleBar #storyAuthorLink span a",
			paragraphs: ".virtualpage p" },
		"cnbc.com": {
			name: "CNBC",
			xpath: "//div[@id=\'cnbc-contents\']",
			title: "h1.title",
			author: ".source a[rel=author]",
			remove: ["#article_body .embed-container", "#article_body .group-container img"],
			paragraphs: "#article_body .group-container" },
		/*"businessweek.com": {
			name: "Business Week",
			xpath: "//div[contains(@class, \'article_content\')]",
			title: "h1",
			author: "[itemprop=author]",
			paragraphs: ".body_inner > p" }*/
		"forbes.com": {
			name: "Forbes",
			xpath: "//div[contains(@class, \'article_content\')]",
			title: "h1",
			author: "[itemprop=author]",
			paragraphs: ".body_inner > p" },
		/*"ft.com": {
			name: "Financial Times",
			xpath: "//div[contains(@class, \'article_content\')]",
			title: "h1.title",
			publisher: ".source a[rel=author]",
			remove: ["#article_body .embed-container", "#article_body .group-container img"],
			paragraphs: "#article_body .group-container" }*/
		//"bloomberg.com": "Bloomberg",
		//"wsj.com": "Wallstreet Journal",
		"investors.com": {
			name: "Investor's Business Daily",
			xpath: "//div[@id=\'main\']",
			title: "h1.am-title",
			author: "[itemprop=author]",
			paragraphs: ".newsStory p" },
		/*"finance.yahoo.com": {
				//name: "Investor's Business Daily",
				xpath: "//div[@id=\'Main\']",
				title: "h1.headline",
				author: ".credit cite",
				paragraphs: "body > p" }*/
		"barrons.com": {
			name: "Barrons.com",
			xpath: "//div[contains(@class, \'mastertextCenter\')]",
			title: "h1",
			author: "h3.byline",
			paragraphs: ".articlePage > p, .articlePage > b, .articlePage ul, .articlePage blockquote" }
		},
		xPathMap = {
			"thestreet.com": "//div[@id=\'story\']",
			"cnbc.com": "//div[@id=\'cnbc-contents\']"
		};


	function extractContent(item, elContent) {
		var i, nodes, el, newsContent = [];
		var info = urlAuthorMap[item.source];
		if (info) {
			item.symbols = item.symbols || [];
			if (!item.author && info.author) {
				el = elContent.querySelector(info.author);
				item.author = el && el.innerText.trim();
			}

			for (var j=0; info.remove && j < info.remove.length; j++) {
				// Remove images and videos, and charts
				nodes = elContent.querySelectorAll(info.remove[i]);
				for (i = 0; i < nodes.length; i++) {
					el = nodes[i];
					el.remove();
				}
			}

			// replace all the <a> tags
			nodes = elContent.querySelectorAll(info.paragraphs + " a");
			for(i=0; i < nodes.length; i++) {
				el = nodes[i];
				replaceAnchorTag(el);
			}

			nodes = elContent.querySelectorAll(info.paragraphs);
			for (i = 0; i < nodes.length; i++) {
				el = nodes[i];
				newsContent.push(el.outerHTML);
			}
			item.content = newsContent.join("");
			return item;
		}
		return null;
	}
	function replaceAnchorTag(el) {
		var elChild = document.createElement("b");
		elChild.innerText = el.innerText.trim();
		el.parentNode.replaceChild(elChild, el);
	}
	function extractTheStreet(item, elContent) {
		var item = { symbols: [] },
			i, nodes, el, newsContent = [];

		el = elContent.querySelector("#titleBar h1");
		item.title = el && el.innerText.trim();
		el = elContent.querySelector("#titleBar #storyAuthorLink span a");
		item.publisher = el && el.innerText.trim();
		el = elContent.querySelector("#titleBar #storyAuthorLink > span:nth-child(4)");
		item.pubDate = el && el.innerText.trim();
		if (item.pubDate)
			item.date = new Date(item.pubDate);

		nodes = elContent.querySelectorAll(".virtualpage p a");
		for(i=0; i < nodes.length; i++) {
			el = nodes[i];
			replaceAnchorTag(el);
		}
		nodes = elContent.querySelectorAll(".virtualpage p");
		for(i=0; i<nodes.length; i++) {
			el = nodes[i];
			// if the paragraph content is too small it's either a chart
			if (el.innerText.replace(/[\t,\n, ]/g, "").length > 30) {
				newsContent.push(el.outerHTML);
			}
		}
		item.content = newsContent.join("");
		return item;
	}
	function extractCNBC(item, elContent) {
		var item = { symbols: [] },
			i, nodes, el, newsContent = [];

		el = elContent.querySelector("h1.title");
		item.title = el && el.innerText.trim();
		el = elContent.querySelector(".source a[rel=author]");
		item.publisher = el && el.innerText.trim();
		el = elContent.querySelector(".datestamp");
		item.pubDate = el && el.innerText.trim();
		if (item.pubDate)
			item.date = new Date(item.pubDate);

		// Remove images and videos, and charts
		nodes = elContent.querySelectorAll("#article_body .embed-container");
		for(i=0; i < nodes.length; i++) {
			el = nodes[i];
			el.remove();
		}
		nodes = elContent.querySelectorAll("#article_body .group-container img");
		for(i=0; i < nodes.length; i++) {
			el = nodes[i];
			el.remove();
		}
		nodes = elContent.querySelectorAll("#article_body .group-container");
		for(i=0; i<nodes.length; i++) {
			el = nodes[i];
			newsContent.push(el.outerHTML);
		}
		item.content = newsContent.join("");
		return item;
	}
	function parseItem(item) {
		if (item && item.link) {
			var info, source, url = item.link.toLowerCase();

			for (source in urlAuthorMap) {
				if (url.indexOf(source) > 0)
					item.source = source;
			}
			if (!item.source) {
				console.log("News: Ignore source: " + item.link);
			}
			/*
			if (url.indexOf("thestreet.com") > 0)
				item.source = "thestreet.com";
			else if (url.indexOf("cnbc.com") > 0)
				item.source = "cnbc.com";
			else if (url.indexOf("businessweek.com") > 0)
				item.source = "businessweek.com";
			else if (url.indexOf("forbes.com") > 0)
				item.source = "forbes.com";
			else if (url.indexOf("ft.com") > 0)
				item.source = "ft.com";
			else if (url.indexOf("bloomberg.com") > 0)
				item.source = "bloomberg.com";
			else if (url.indexOf("wsj.com") > 0)
				item.source = "wsj.com";
			else if (url.indexOf("investors.com") > 0)
				item.source = "investors.com";
			else if (url.indexOf("barrons.com") > 0)
				item.source = "barrons.com";
			else if (url.indexOf("finance.yahoo.com") > 0)
				item.source = "finance.yahoo.com";
			*/
			if (item.source) {
				if (item.description) {
					var description = item.description.split("] - "),
						publisher = description[0],
						marker = "[";
					if (publisher.indexOf("[at ") >= 0) {
						marker = "[at ";
					}
					item.publisher = publisher.split(marker)[1];
					item.description = description[1];
				}
				item.publisher = urlAuthorMap[item.source].name;
			}
		}
		return item && item.source;
	}
	function getNewsStoryXpath(item) {
		var xpath = null;
		if (item && item.source) {
			xpath = urlAuthorMap[item.source].xpath;
		}
		return xpath;
	}
	function extractNewsContent(item, elContent) {
		extractContent(item, elContent);
		item.link = url;
	}
	Stock.News = {
		parseItem: parseItem,
		getXPath: getNewsStoryXpath,
		extractNewsContent: extractNewsContent
	};

})();