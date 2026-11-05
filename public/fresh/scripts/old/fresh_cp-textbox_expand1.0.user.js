// Fresh.co.il CP-Textbox Expand
// 16/07/2010
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 16/07/2010	first version: expands the textbox in the managers control-panel.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il CP-Textbox Expand", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il CP-Textbox Expand
// @namespace			http://shoobyd.herobo.com
// @description			expands the textbox in the managers control-panel.
// @include			*fresh.co.il/vBulletin/modcp/announcement.php*
// @version			1.0
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


if (document.getElementById("ta_pagetext")) {
	var textbox = document.getElementById("ta_pagetext");
	textbox.style.width = "100%";
	textbox.rows = "30";
}


