(function(){dust.register("AddPort",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"popup\" id=\"AddPort\" data-theme=\"a\" class=\"ui-corner-all\"><form><div><h3>Add a new portfolio</h3><label for=\"name\" class=\"ui-hidden-accessible\">Portfolio name:</label><input type=\"text\" name=\"name\" class=\"name\" value=\"\" placeholder=\"Name\" data-theme=\"a\"><a data-action=\"AddPort\" href=\"#\" data-rel=\"back\" class=\"ui-btn ui-corner-all ui-btn-a\">Save</a><a href=\"#\" data-rel=\"back\" class=\"ui-btn ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext ui-btn-right\">Cancel</a></div></form></div>");}return body_0;})();

(function(){dust.register("AddTrans",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"popup\" id=\"AddTrans\" data-theme=\"a\" class=\"ui-corner-all\" data-lot=\"").reference(ctx.getPath(false, ["lot","objectId"]),ctx,"h").write("\"><form><div><h3>Add a new transaction</h3><select class=\"portfolios\" data-mini=\"true\" data-inline=\"true\"><option >Select a portfolio</option>").section(ctx.get(["ports"], false),ctx,{"block":body_1},{}).write("</select><select class=\"equity-type\" data-mini=\"true\" data-inline=\"true\"><option value=\"0\">Stock</option><option value=\"1\">Options</option><option value=\"2\">Employee Stock Options</option></select><select class=\"trans-type\" data-mini=\"true\" data-inline=\"true\" ").exists(ctx.get(["edit"], false),ctx,{"block":body_4},{}).write("><option value=\"\">Transaction Type</option><option value=\"buy\">Buy</option><option value=\"sell\">Sell</option><option value=\"short\">Sell Short</option><option value=\"cover\">Buy Cover</option><option value=\"options\">Options</option><option value=\"stock-options\">Employee Stock Options</option></select><input type=\"text\" name=\"symbol\" class=\"symbol\" value=\"").reference(ctx.getPath(false, ["lot","symbol"]),ctx,"h").write("\" placeholder=\"Symbol\" data-theme=\"a\"><input type=\"number\" name=\"qty\" class=\"qty\" value=\"").reference(ctx.getPath(false, ["lot","qty"]),ctx,"h").write("\" placeholder=\"Shares\" data-theme=\"a\"><input type=\"number\" class=\"price\" value=\"").reference(ctx.getPath(false, ["lot","price"]),ctx,"h").write("\" placeholder=\"Price\" data-theme=\"a\"><input type=\"number\" class=\"fee\" value=\"").reference(ctx.getPath(false, ["lot","fee"]),ctx,"h").write("\" placeholder=\"Commission\" data-theme=\"a\"><input type=\"date\" name=\"date\" class=\"date\" value=\"").helper("formatDate",ctx,{},{"dateObj":"transDate","formInput":"1"}).write("\" data-theme=\"a\"><!--Employee Stock Option--><input type=\"date\" name=\"expiration\" class=\"expiration\" value=\"").helper("formatDate",ctx,{},{"dateObj":"lot.expiration","formInput":"1"}).write("\" data-theme=\"a\"><a href=\"#\" data-rel=\"back\" class=\"ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check\" data-action=\"").exists(ctx.get(["edit"], false),ctx,{"else":body_5,"block":body_6},{}).write("\">Save</a></div></form></div>");}function body_1(chk,ctx){return chk.write("<option value=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" ").helper("if",ctx,{"block":body_2},{"cond":body_3}).write(" >").reference(ctx.get(["name"], false),ctx,"h").write("</option>");}function body_2(chk,ctx){return chk.write("selected");}function body_3(chk,ctx){return chk.write("'").reference(ctx.get(["objectId"], false),ctx,"h").write("' == '").reference(ctx.getPath(false, ["lot","portId"]),ctx,"h").write("'");}function body_4(chk,ctx){return chk.write("hidden");}function body_5(chk,ctx){return chk.write("addTrans");}function body_6(chk,ctx){return chk.write("editLot");}return body_0;})();

(function(){dust.register("Dashboard",body_0);function body_0(chk,ctx){return chk.write("<div class=\"my_portfolios\" ").notexists(ctx.get(["myPorts"], false),ctx,{"block":body_1},{}).write(">").section(ctx.get(["allPorts"], false),ctx,{"block":body_2},{}).write("</div><div class=\"earnings\" ").notexists(ctx.get(["earnings"], false),ctx,{"block":body_7},{}).write("><h3>Upcoming Earnings</h3><div>").section(ctx.get(["earnings"], false),ctx,{"block":body_8},{}).write("</div></div><div class=\"my_stocks\" ").notexists(ctx.get(["myStocks"], false),ctx,{"block":body_9},{}).write("><h3>Watchlist</h3><div class=\"fixed-column-container\"><table class=\"draw-border\"><thead><tr><th class=\"headcol\">Symbol</th><th>Price</th><th colspan=\"2\">Day's Change</th></tr></thead><tbody>").section(ctx.get(["myStocks"], false),ctx,{"block":body_10},{}).write("</tbody></table></div></div><div class=\"headlines\" ").notexists(ctx.get(["headlines"], false),ctx,{"block":body_18},{}).write("><h3>Headlines</h3><ul data-role=\"listview\">").section(ctx.get(["headlines"], false),ctx,{"block":body_19},{}).write("</ul></div>");}function body_1(chk,ctx){return chk.write("hidden");}function body_2(chk,ctx){return chk.write("<div class=\"heading\">").helper("formatField",ctx,{},{"field":"marketValue","longVal":"true"}).write("</div><div>Day's Change: <span class=\"change ").helper("gte",ctx,{"else":body_3,"block":body_4},{"key":ctx.get(["valueDelta"], false),"value":0}).write("\">").reference(ctx.get(["valueDelta"], false),ctx,"h").write(" (").reference(ctx.get(["valueDeltaPercent"], false),ctx,"h").write("%)</span></div><div>Total Gain: <span class=\"change ").helper("gte",ctx,{"else":body_5,"block":body_6},{"key":ctx.get(["gain"], false),"value":0}).write("\">").reference(ctx.get(["gain"], false),ctx,"h").write(" (").reference(ctx.get(["gainPercent"], false),ctx,"h").write("%)</span></div><div>Cash balance: $").reference(ctx.get(["cash"], false),ctx,"h").write("</div>");}function body_3(chk,ctx){return chk.write("negative");}function body_4(chk,ctx){return chk.write("positive");}function body_5(chk,ctx){return chk.write("negative");}function body_6(chk,ctx){return chk.write("positive");}function body_7(chk,ctx){return chk.write("hidden");}function body_8(chk,ctx){return chk.write("<div>").reference(ctx.get(["symbol"], false),ctx,"h").write(" - <span class=\"date\">").helper("formatEarningDate",ctx,{},{"dateStr":"earningsDate","dateObj":"earningsDateObj"}).write("</span></div>");}function body_9(chk,ctx){return chk.write("hidden");}function body_10(chk,ctx){return chk.write("<tr class=\"\" data-symbol=\"").reference(ctx.get(["symbol"], false),ctx,"h").write("\" data-action=\"viewStock\"><td class=\"symbol headcol\">").helper("if",ctx,{"else":body_11,"block":body_12},{"cond":body_13}).write("</td><td class=\"price\">").reference(ctx.getPath(false, ["quote","price"]),ctx,"h").write("</td><td class=\"change ").helper("gte",ctx,{"else":body_14,"block":body_15},{"key":ctx.getPath(false, ["quote","change"]),"value":0}).write("\">").reference(ctx.getPath(false, ["quote","change"]),ctx,"h").write("</td><td class=\"change ").helper("gte",ctx,{"else":body_16,"block":body_17},{"key":ctx.getPath(false, ["quote","change"]),"value":0}).write("\">").reference(ctx.getPath(false, ["quote","percent-change"]),ctx,"h").write("%</td></tr>");}function body_11(chk,ctx){return chk.reference(ctx.get(["symbol"], false),ctx,"h");}function body_12(chk,ctx){return chk.reference(ctx.getPath(false, ["quote","name"]),ctx,"h");}function body_13(chk,ctx){return chk.write("'").reference(ctx.get(["symbol"], false),ctx,"h").write("'.length > 15 && '").reference(ctx.getPath(false, ["quote","name"]),ctx,"h").write("'");}function body_14(chk,ctx){return chk.write("negative");}function body_15(chk,ctx){return chk.write("positive");}function body_16(chk,ctx){return chk.write("negative");}function body_17(chk,ctx){return chk.write("positive");}function body_18(chk,ctx){return chk.write("hidden");}function body_19(chk,ctx){return chk.write("<li><a href=\"").reference(ctx.get(["link"], false),ctx,"h").write("\" target=\"_blank\">").reference(ctx.get(["title"], false),ctx,"h").write("</a></li>");}return body_0;})();

(function(){dust.register("Footer",body_0);function body_0(chk,ctx){return chk.write("<div id=\"footer\" data-role=\"footer\" data-position=\"fixed\" data-tap-toggle=\"false\" data-theme=\"b\"><a href=\"#Dashboard\" class=\"ui-btn ui-btn-inline ui-icon-home ui-btn-icon-top\">Home</a><a href=\"#\" class=\"ui-btn ui-btn-inline ui-icon-bullets ui-btn-icon-top\" data-action=\"viewNews\">News</a><a href=\"#\" class=\"ui-btn ui-btn-inline ui-icon-shop ui-btn-icon-top\" data-action=\"viewPorts\">Portfolios</a><a href=\"#\" class=\"ui-btn ui-btn-inline ui-icon-heart ui-btn-icon-top\" data-action=\"viewWatchlist\">Watchlist</a><a href=\"#\" class=\"ui-btn ui-btn-inline ui-icon-refresh ui-btn-icon-top\" data-action=\"refresh\">Refresh</a></div>");}return body_0;})();

(function(){dust.register("Header",body_0);function body_0(chk,ctx){return chk.write("<div id=\"header\" data-role=\"header\" data-position=\"fixed\" data-tap-toggle=\"false\" data-theme=\"b\"><h1 class=\"header-title\">Stock Stalker</h1><a href=\"#nav-panel-").reference(ctx.get(["pageId"], false),ctx,"h").write("\" data-icon=\"bars\" data-iconpos=\"notext\">Toolbar</a><a href=\"#right-panel-").reference(ctx.get(["pageId"], false),ctx,"h").write("\" data-icon=\"gear\" data-iconpos=\"notext\">Watch List</a></div>");}return body_0;})();

(function(){dust.register("Login",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"popup\" id=\"Login\" data-theme=\"a\" class=\"ui-corner-all\"><form><div class=\"login container\"><h3>Log in</h3><input type=\"text\" name=\"user\" class=\"un\" value=\"\" placeholder=\"Username\" data-theme=\"a\"><input type=\"password\" name=\"pass\" class=\"pw\" value=\"\" placeholder=\"Password\" data-theme=\"a\"><label for=\"remember\">Remember me</label><input type=\"checkbox\" name=\"remember\" id=\"remember\"><button type=\"submit\" class=\"ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check\">Log in</button><a href=\"\" data-rel=\"back\" data-action=\"showSignup\">Create a account</button></div></form></div>");}return body_0;})();

(function(){dust.register("NavPanel",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"panel\" id=\"nav-panel-").reference(ctx.get(["pageId"], false),ctx,"h").write("\" class=\"nav-panel ").exists(ctx.get(["authenticated"], false),ctx,{"block":body_1},{}).write("\" data-theme=\"b\" data-position=\"left\" data-display=\"push\" data-position-fixed=\"true\" data-animate=\"true\" ><ul data-role=\"listview\"><li><a data-rel=\"close\" class=\"login\" data-action=\"login\">Log in</a></li><li><a data-rel=\"close\" class=\"login\" data-action=\"showSignup\">Register</a></li><li><a href=\"#Dashboard\" data-rel=\"close\" class=\"ui-btn\">Dashboard</a></li><li><a data-rel=\"close\" data-action=\"refresh\">Refresh</a></li><li><a data-rel=\"close\" data-action=\"viewAddPort\">Add a new portfolio</a></li><li><a data-rel=\"close\" data-action=\"viewAddTrans\">Add a transaction</a></li><li><a data-rel=\"close\" data-action=\"viewWatchlist\">Watchlist</a></li><li><a data-rel=\"close\" class=\"logout\" data-action=\"logout\">Log out</a></li></ul></div>");}function body_1(chk,ctx){return chk.write("authed");}return body_0;})();

(function(){dust.register("News",body_0);function body_0(chk,ctx){return chk.write("<div class=\"headlines\"><ul>").section(ctx.get(["headlines"], false),ctx,{"block":body_1},{}).write("</ul></div>");}function body_1(chk,ctx){return chk.helper("if",ctx,{"block":body_2},{"cond":body_6});}function body_2(chk,ctx){return chk.write("<li class=\"news-item\" data-action=\"viewNewsArticle\" data-link=\"").reference(ctx.get(["link"], false),ctx,"h").write("\" data-title=\"").reference(ctx.get(["title"], false),ctx,"h").write("\" data-date=\"").reference(ctx.get(["pubDate"], false),ctx,"h").write("\" onclick=\"\"><div class=\"title\">").reference(ctx.get(["title"], false),ctx,"h",["s"]).write("</div><div class=\"source\">").exists(ctx.get(["publisher"], false),ctx,{"block":body_3},{}).write("<span class=\"pubDate\">").helper("formatDate",ctx,{},{"dateObj":"date","timeElapsed":1}).write("</span></div>").section(ctx.get(["description"], false),ctx,{"block":body_4},{}).write("<div class=\"inline-quotes\"><span class=\"inline-quote\">").reference(ctx.get(["symbol"], false),ctx,"h").write("<span class=\"change ").helper("changeClass",ctx,{},{"type":"quote","symbol":ctx.get(["symbol"], false)}).write("\">").helper("quoteField",ctx,{},{"symbol":ctx.get(["symbol"], false),"field":"percent-change"}).write("</span></span>").section(ctx.get(["symbols"], false),ctx,{"block":body_5},{}).write("</div></li>");}function body_3(chk,ctx){return chk.write("<span class=\"publisher\">").reference(ctx.get(["publisher"], false),ctx,"h",["s"]).write("</span>");}function body_4(chk,ctx){return chk.write("<div class=\"description\">").reference(ctx.get(["description"], false),ctx,"h").write("</div>");}function body_5(chk,ctx){return chk.write("<span class=\"inline-quote\">").reference(ctx.getPath(true, []),ctx,"h").write("<span class=\"change ").helper("changeClass",ctx,{},{"type":"quote","symbol":ctx.getPath(true, [])}).write("\">").helper("quoteField",ctx,{},{"symbol":ctx.getPath(true, []),"field":"percent-change"}).write("</span></span>");}function body_6(chk,ctx){return chk.reference(ctx.get(["$idx"], false),ctx,"h").write(" < 20");}return body_0;})();

(function(){dust.register("Page",body_0);function body_0(chk,ctx){return chk.notexists(ctx.get(["noPageDiv"], false),ctx,{"block":body_1},{}).partial("Header",ctx,{}).write("<div data-role=\"main\" class=\"ui-content\"></div>").partial("Footer",ctx,{}).partial("NavPanel",ctx,{}).partial("RightPanel",ctx,{}).notexists(ctx.get(["noPageDiv"], false),ctx,{"block":body_2},{});}function body_1(chk,ctx){return chk.write("<div data-role=\"page\" id=\"").reference(ctx.get(["pageId"], false),ctx,"h").write("\">");}function body_2(chk,ctx){return chk.write("</div>");}return body_0;})();

(function(){dust.register("Popup",body_0);function body_0(chk,ctx){return chk;}return body_0;})();

(function(){dust.register("PortSumItem",body_0);function body_0(chk,ctx){return chk.write("<div class=\"port-sum summary-list-layout\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" data-action=\"viewPort\" onclick=\"\"><div class=\"row\"><span class=\"name\">").reference(ctx.get(["name"], false),ctx,"h").write("</span><span class=\"mkt-val mid-col\">").helper("formatField",ctx,{},{"field":"marketValue","longVal":"true"}).write("</span><span class=\"change-per right-col alt1 change-box ").helper("positive",ctx,{},{"val":ctx.get(["valueDelta"], false)}).write("\" data-action=\"toggleAlt\" onclick=\"\">").reference(ctx.get(["valueDeltaPercent"], false),ctx,"h").write("%</span><span class=\"change-per right-col alt2 change-box ").helper("positive",ctx,{},{"val":ctx.get(["gainPercent"], false)}).write("\" data-action=\"toggleAlt\" onclick=\"\">").reference(ctx.get(["gainPercent"], false),ctx,"h").write("%</span></div><div class=\"row small\"><span class=\"cash mid-col\">$").helper("formatField",ctx,{},{"field":"cash"}).write(" cash</span><span class=\"change-val right-col alt1 ").helper("positive",ctx,{},{"val":ctx.get(["valueDelta"], false)}).write("\" data-action=\"toggleAlt\" onclick=\"\">").reference(ctx.get(["valueDelta"], false),ctx,"h").write("</span><span class=\"change-val right-col alt2 ").helper("positive",ctx,{},{"val":ctx.get(["gain"], false)}).write("\" data-action=\"toggleAlt\" onclick=\"\">").reference(ctx.get(["gain"], false),ctx,"h").write("</span></div>").exists(ctx.get(["label"], false),ctx,{"block":body_1},{}).write("</div>");}function body_1(chk,ctx){return chk.write("<div class=\"col-name alt1\">Day's Change</div><div class=\"col-name alt2\">Gain/Loss</div>");}return body_0;})();

(function(){dust.register("RightPanel",body_0);function body_0(chk,ctx){return chk.write("<div data-role=\"panel\" id=\"right-panel-").reference(ctx.get(["pageId"], false),ctx,"h").write("\" data-display=\"overlay\" data-position=\"right\"><p>Right push panel.</p><a href=\"#\" data-rel=\"close\" class=\"ui-btn ui-corner-all ui-shadow ui-mini ui-btn-inline ui-icon-delete ui-btn-icon-right\">Close</a></div><!-- /panel -->");}return body_0;})();

(function(){dust.register("Signup",body_0);function body_0(chk,ctx){return chk.write("<form><div class=\"signup container\"><h3>Create a account</h3><input type=\"text\" name=\"fname\" class=\"fn\" value=\"\" placeholder=\"First name\" data-theme=\"a\"><input type=\"text\" name=\"user\" class=\"ln\" value=\"\" placeholder=\"Last name\" data-theme=\"a\"><input type=\"text\" name=\"user\" class=\"un\" value=\"\" placeholder=\"Username\" data-theme=\"a\"><input type=\"password\" name=\"pass\" class=\"pw\" value=\"\" placeholder=\"Password\" data-theme=\"a\"><input type=\"password\" name=\"pass\" class=\"pw2\" value=\"\" placeholder=\"Confirm password\" data-theme=\"a\"><input type=\"text\" name=\"email\" class=\"em\" value=\"\" placeholder=\"Email address\" data-theme=\"a\"><button type=\"submit\" class=\"ui-btn ui-corner-all ui-shadow ui-btn-b ui-btn-icon-left ui-icon-check\">Create a account</button></div></form>");}return body_0;})();

(function(){dust.register("ViewNewsArticle",body_0);function body_0(chk,ctx){return chk.write("<div class=\"news-item\"><div class=\"title\">").reference(ctx.get(["title"], false),ctx,"h",["s"]).write("</div><div class=\"source\">").exists(ctx.get(["publisher"], false),ctx,{"block":body_1},{}).write("<span class=\"pubDate\">").helper("formatDate",ctx,{},{"dateObj":"date","timeElapsed":1}).write("</span></div><div class=\"content\">").reference(ctx.get(["content"], false),ctx,"h",["s"]).write("</div><div class=\"inline-quotes\">").section(ctx.get(["symbols"], false),ctx,{"block":body_2},{}).write("</div></div>");}function body_1(chk,ctx){return chk.write("<span class=\"publisher\">").reference(ctx.get(["publisher"], false),ctx,"h",["s"]).write("</span>");}function body_2(chk,ctx){return chk.write("<span class=\"inline-quote\">").reference(ctx.getPath(true, []),ctx,"h").write("<span class=\"change ").helper("changeClass",ctx,{},{"type":"quote","symbol":ctx.getPath(true, [])}).write("\">").helper("quoteField",ctx,{},{"symbol":ctx.getPath(true, []),"field":"percent-change"}).write("</span></span>");}return body_0;})();

(function(){dust.register("ViewPort",body_0);function body_0(chk,ctx){return chk.section(ctx.get(["port"], false),ctx,{"block":body_1},{}).write("<table class=\"lots full-width draw-border\"><tr class=\"header\"><th class=\"header title\">Symbol</th><th class=\"header title info\">Price</th><th class=\"header title info\">Change</th><th class=\"header title info\">Shares</th><th class=\"header title info\">Day's Change</th><th class=\"header title info\">Price Paid</th><th class=\"header title info\">Gain/Loss</th><th class=\"header title info\">Value</th><th class=\"header title info\">Date</th><th class=\"header title info\"></th></tr>").section(ctx.get(["lots"], false),ctx,{"block":body_2},{}).section(ctx.get(["port"], false),ctx,{"block":body_10},{}).write("</table>").section(ctx.get(["port"], false),ctx,{"block":body_15},{});}function body_1(chk,ctx){return chk.write("<div class=\"port_summary\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" onclick=\"\"><div class=\"round_block\" ><div class=\"block header lighter_bg\"><h2 class=\"name\">").reference(ctx.get(["name"], false),ctx,"h").write("<span class=\"market-value value right-align\">").helper("getPortInfo",ctx,{},{"field":"market-value"}).write("</span></h2> </div><div class=\"block content\"><table class=\"content row\"><tr class=\"cash_balance\"><td><div class=\"label\">Cash Balance</div></td><td><div class=\"value info\">").reference(ctx.get(["cash"], false),ctx,"h").write("</div></td></tr><tr class=\"gain\"><td><div class=\"label\">Gain/Loss</div></td><td><div class=\"value info\">").helper("getPortInfo",ctx,{},{"field":"gain"}).write("</div></td></tr><tr class=\"value-delta\"><td><div class=\"label\">Day Change</div></td><td><div class=\"value info\">").helper("getPortInfo",ctx,{},{"field":"value-delta"}).write("</div></td></tr></table></div></div></div>");}function body_2(chk,ctx){return chk.write("<tr class=\"group_content entry\" data-symbol=\"").reference(ctx.get(["symbol"], false),ctx,"h").write("\" data-lot=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" data-action=\"viewStock\" onclick=\"\"><td class=\"symbol\">").reference(ctx.get(["symbol"], false),ctx,"h").write("</td><td class=\"price\">").section(ctx.get(["quote"], false),ctx,{"block":body_3},{}).write("</td><td class=\"change ").helper("gt",ctx,{"else":body_4,"block":body_5},{"key":ctx.getPath(false, ["quote","change"]),"value":0}).write("\">").reference(ctx.getPath(false, ["quote","change"]),ctx,"h").write(" (").reference(ctx.getPath(false, ["quote","percent-change"]),ctx,"h").write("%)</td><td class=\"qty\">").reference(ctx.get(["qty"], false),ctx,"h").write("</td><td class=\"value-delta ").helper("gt",ctx,{"else":body_6,"block":body_7},{"key":ctx.get(["valueDelta"], false),"value":0}).write("\">").reference(ctx.get(["valueDelta"], false),ctx,"h").write("</td><td class=\"cost\">").reference(ctx.get(["price"], false),ctx,"h").write("</td><td class=\"gain ").helper("gt",ctx,{"else":body_8,"block":body_9},{"key":ctx.get(["gain"], false),"value":0}).write("\">").reference(ctx.get(["gain"], false),ctx,"h").write("</td><td class=\"value\">").reference(ctx.get(["marketValue"], false),ctx,"h").write("</td><td class=\"value\">").helper("formatDate",ctx,{},{"dateObj":"transDate","shortDate":"1"}).write("</td><!--td class=\"value\"><a href=\"#\" data-action=\"sellLot\" data-lot=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" class=\"ui-btn ui-btn-inline ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext\">Delete</a><a href=\"#\" data-action=\"viewEditTrans\" data-lot=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" class=\"ui-btn ui-btn-inline ui-corner-all ui-btn-a ui-icon-edit ui-btn-icon-notext\">Edit</a></td--></tr>");}function body_3(chk,ctx){return chk.reference(ctx.get(["price"], false),ctx,"h");}function body_4(chk,ctx){return chk.write("negative");}function body_5(chk,ctx){return chk.write("positive");}function body_6(chk,ctx){return chk.write("negative");}function body_7(chk,ctx){return chk.write("positive");}function body_8(chk,ctx){return chk.write("negative");}function body_9(chk,ctx){return chk.write("positive");}function body_10(chk,ctx){return chk.write("<tr class=\"cash entry\" sym=\"").reference(ctx.get(["symbol"], false),ctx,"h").write("\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" data-action=\"viewLot\" onclick=\"\">\n<td class=\"symbol\" colspan=\"7\">Cash</td><td class=\"value ").helper("gt",ctx,{"else":body_11,"block":body_12},{"key":ctx.get(["cash"], false),"value":0}).write("\" >$").reference(ctx.get(["cash"], false),ctx,"h").write("</td><td ></td></tr><tr class=\"total entry\" sym=\"").reference(ctx.get(["symbol"], false),ctx,"h").write("\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" data-action=\"viewLot\" onclick=\"\">\n<td class=\"symbol\" colspan=\"4\"><b>Total</b></td><td class=\"value-delta\">").helper("getPortInfo",ctx,{},{"field":"valueDelta"}).write("</td><td class=\"cost\"></td><td class=\"gain ").helper("gt",ctx,{"else":body_13,"block":body_14},{"key":ctx.get(["gain"], false),"value":0}).write("\">").helper("getPortInfo",ctx,{},{"field":"gain"}).write("</td><td class=\"value\" colspan=>$").helper("getPortInfo",ctx,{},{"field":"marketValue"}).write("</td><td ></td></tr>");}function body_11(chk,ctx){return chk.write("negative");}function body_12(chk,ctx){return chk.write("positive");}function body_13(chk,ctx){return chk.write("negative");}function body_14(chk,ctx){return chk.write("positive");}function body_15(chk,ctx){return chk.write("<a class=\"ui-btn\" data-action=\"setPortCash\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\">Update Cash</a>");}return body_0;})();

(function(){dust.register("ViewPorts",body_0);function body_0(chk,ctx){return chk.write("<div class=\"my_portfolios summary-list-container\">").section(ctx.get(["allPorts"], false),ctx,{"block":body_1},{}).section(ctx.get(["myPorts"], false),ctx,{"block":body_2},{}).write("</div>");}function body_1(chk,ctx){return chk.write("<div class=\"heading\">Net Assets: ").helper("formatField",ctx,{},{"field":"marketValue","longVal":"true"}).write("</div>").partial("PortSumItem",ctx,{"name":"All Portfolios","label":"1"});}function body_2(chk,ctx){return chk.partial("PortSumItem",ctx,{});}return body_0;})();

(function(){dust.register("ViewStock",body_0);function body_0(chk,ctx){return chk.section(ctx.get(["quote"], false),ctx,{"block":body_1},{}).write("<div class=\"viewChart tab_content round_block\" hidden>").section(ctx.get(["quote"], false),ctx,{"block":body_18},{}).write("<ul class=\"chart_range tabs five_tabs\"><li class=\"1d tab first\" view=\"1d\" onclick=\"\"><a>1d</a></li><li class=\"5d tab active\" view=\"5d\" onclick=\"\"><a>5d</a></li><li class=\"3m tab\" view=\"3m\" onclick=\"\"><a>3m</a></li><li class=\"6m tab\" view=\"6m\" onclick=\"\"><a>6m</a></li><li class=\"1y tab last\" view=\"1y\" onclick=\"\"><a>1y</a></li></ul></div><div class=\"lots scroll-container\"><table class=\"draw-border\" portId=\"").reference(ctx.get(["port_id"], false),ctx,"h").write("\"><tr class=\"row\"><th class=\"left\">Portfolio</td><th class=\"left\">Symbol</td><th class=\"\">Shares</td><th class=\"\">Paid</td><th class=\"\">Gain</td><th class=\"\">Value</td><th class=\"\">Date</td></tr>").section(ctx.get(["portLotsInfo"], false),ctx,{"block":body_19},{}).write("</table></div>").partial("News",ctx,{});}function body_1(chk,ctx){return chk.write("<div class=\"quote-summary\"><div class=\"title\"><span class=\"h2 symbol\">").reference(ctx.get(["name"], false),ctx,"h").write(" (").reference(ctx.get(["symbol"], false),ctx,"h").write(")</span></div><div class=\"quote\"><div class=\"h1 price\">").reference(ctx.get(["price"], false),ctx,"h").write("</div><div class=\"changes\"><span class=\"change\"><span class=\"label\">").notexists(ctx.get(["priceAH"], false),ctx,{"else":body_2,"block":body_3},{}).write(":</span><span class=\"").helper("gt",ctx,{"else":body_4,"block":body_5},{"key":ctx.get(["change"], false),"value":0}).write("\">").helper("formatField",ctx,{},{"field":"change"}).write(" (").helper("formatField",ctx,{},{"field":"percent-change"}).write(")</span></span>").exists(ctx.get(["priceAH"], false),ctx,{"block":body_6},{}).write("</div></div><div class=\"quote-details\"><table class=\"draw-border full-width\"><tr class=\"row\"><td class=\"label\">Prev Close</td><td class=\"value\">").reference(ctx.get(["prev_close"], false),ctx,"h").write("</td><td class=\"label\">Open</td><td class=\"value\">").reference(ctx.get(["open"], false),ctx,"h").write("</td></tr><tr class=\"row\"><td class=\"label\">Low</td><td class=\"value\">").reference(ctx.get(["day_lo"], false),ctx,"h").write("</td><td class=\"label\">High</td><td class=\"value\">").reference(ctx.get(["day_hi"], false),ctx,"h").write("</td></tr><tr class=\"row\"><td class=\"label\">52wk Low</td><td class=\"value\">").reference(ctx.get(["year_lo"], false),ctx,"h").write("</td><td class=\"label\">52w High</td><td class=\"value\">").reference(ctx.get(["year_hi"], false),ctx,"h").write("</td></tr><tr class=\"row\"><td class=\"label\">Mkt Cap</td><td class=\"value\">").reference(ctx.get(["MCap"], false),ctx,"h").write("</td><td class=\"label\">Volume</td><td class=\"value\">").reference(ctx.get(["vol"], false),ctx,"h").write("</td></tr><tr class=\"row\"><td class=\"label\">P/E</td><td class=\"value\">").exists(ctx.get(["pe"], false),ctx,{"else":body_9,"block":body_10},{}).write("</td><td class=\"label\">EPS</td><td class=\"value\">").exists(ctx.get(["eps"], false),ctx,{"else":body_11,"block":body_12},{}).write("</td></tr><tr class=\"row\"><!--td>Beta</td><td class=\"value \">").exists(ctx.get(["beta"], false),ctx,{"else":body_13,"block":body_14},{}).write("</td--><td class=\"label\">Dividend</td><td class=\"value\">").exists(ctx.get(["dividend"], false),ctx,{"else":body_15,"block":body_16},{}).write("</td><td class=\"label\">Earnings</td><td class=\"value\">").helper("formatDate",ctx,{},{"dateObj":"earningsDateObj","monDD":1}).exists(ctx.get(["earningsDateEst"], false),ctx,{"block":body_17},{}).write("</td></tr></table></div></div>");}function body_2(chk,ctx){return chk.write("Today's Close");}function body_3(chk,ctx){return chk.write("Day's Change");}function body_4(chk,ctx){return chk.write("negative");}function body_5(chk,ctx){return chk.write("positive");}function body_6(chk,ctx){return chk.write("<span class=\"change changeAH\"><span class=\"label\">After Hour:</span><span class=\"").helper("gt",ctx,{"else":body_7,"block":body_8},{"key":ctx.get(["changeAH"], false),"value":0}).write("\">").helper("formatField",ctx,{},{"field":"changeAH","format":"change"}).write(" (").helper("formatField",ctx,{},{"field":"percent_changeAH","format":"percent-change"}).write(")</span></span>");}function body_7(chk,ctx){return chk.write("negative");}function body_8(chk,ctx){return chk.write("positive");}function body_9(chk,ctx){return chk.write("N/A");}function body_10(chk,ctx){return chk.reference(ctx.get(["pe"], false),ctx,"h");}function body_11(chk,ctx){return chk.write("N/A");}function body_12(chk,ctx){return chk.reference(ctx.get(["eps"], false),ctx,"h");}function body_13(chk,ctx){return chk.write("N/A");}function body_14(chk,ctx){return chk.reference(ctx.get(["beta"], false),ctx,"h");}function body_15(chk,ctx){return chk.write("N/A");}function body_16(chk,ctx){return chk.reference(ctx.get(["dividend"], false),ctx,"h").write(" (").reference(ctx.get(["yield"], false),ctx,"h").write("%)");}function body_17(chk,ctx){return chk.write(" (Est.)");}function body_18(chk,ctx){return chk.write("<div class=\"block header dark_bg\"><label class=\"name\">").reference(ctx.get(["name"], false),ctx,"h").write("</label> <label class=\"symbol\">(").reference(ctx.get(["symbol"], false),ctx,"h").write(")</label></div><div class=\"block content\"><img class=\"chart\" src=\"http://chart.finance.yahoo.com/w?s=").reference(ctx.get(["symbol"], false),ctx,"h").write("&lang=en-US&region=US\" width=\"90%\"></div>");}function body_19(chk,ctx){return chk.section(ctx.get(["portLots"], false),ctx,{"block":body_20},{}).write("<tr class=\"row\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\"><td class=\"value symbol\" colspan=\"4\">Total</td><td class=\"value price gain ").helper("gt",ctx,{"else":body_24,"block":body_25},{"key":ctx.get(["gain"], false),"value":0}).write("\">").reference(ctx.get(["gain"], false),ctx,"h").write("</td><td class=\"value value market-value\">$").reference(ctx.get(["marketValue"], false),ctx,"h").write("</td><td class=\"value value\" colspan=\"2\"></td></tr>");}function body_20(chk,ctx){return chk.section(ctx.get(["lots"], false),ctx,{"block":body_21},{"portName":ctx.getPath(false, ["port","name"])});}function body_21(chk,ctx){return chk.write("<tr class=\"row\" data-id=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\"><td class=\"left\">").reference(ctx.get(["portName"], false),ctx,"h").write("</td><td class=\"left\">").reference(ctx.get(["symbol"], false),ctx,"h").write("</td><td class=\"value shares\">").reference(ctx.get(["qty"], false),ctx,"h").write("</td><td class=\"value price\">").reference(ctx.get(["price"], false),ctx,"h").write("</td><td class=\"value price gain ").helper("gt",ctx,{"else":body_22,"block":body_23},{"key":ctx.get(["gain"], false),"value":0}).write("\">").reference(ctx.get(["gain"], false),ctx,"h").write("</td><td class=\"value value market-value\">$").reference(ctx.get(["marketValue"], false),ctx,"h").write("</td><td class=\"value\">").helper("formatDate",ctx,{},{"dateObj":"transDate","shortDate":"1"}).write("</td><td class=\"value\"><a href=\"#\" data-action=\"sellLot\" data-lot=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" class=\"ui-btn ui-btn-inline ui-corner-all ui-btn-a ui-icon-delete ui-btn-icon-notext\">Delete</a><a href=\"#\" data-action=\"viewEditTrans\" data-lot=\"").reference(ctx.get(["objectId"], false),ctx,"h").write("\" class=\"ui-btn ui-btn-inline ui-corner-all ui-btn-a ui-icon-edit ui-btn-icon-notext\">Edit</a></td></tr>");}function body_22(chk,ctx){return chk.write("negative");}function body_23(chk,ctx){return chk.write("positive");}function body_24(chk,ctx){return chk.write("negative");}function body_25(chk,ctx){return chk.write("positive");}return body_0;})();

