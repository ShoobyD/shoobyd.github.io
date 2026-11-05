// Fresh.co.il PM Receipt
// 25/03/2011
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 27/08/2009	first version: replace the 'confirmation option' popup with a checkbox.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il PM Receipt", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il PM Receipt
// @namespace			http://shoobyd.herobo.com
// @description			replace the 'confirmation option' popup with a checkbox.
// @include			*fresh.co.il/vBulletin/private.php*
// @version			1.1
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

if (document.getElementById("vBulletin_editor")) {

	/* adding checkbox. */
	var confirm = document.getElementsByName("receipt")[0];
	confirm.setAttribute('type', 'checkbox');
	confirm.setAttribute('id', 'receipt');
	confirm.removeAttribute('value');
	var tmpnode = confirm.parentNode.insertBefore(document.createElement('label') ,getNextSibling(confirm));
	tmpnode.setAttribute('for', 'receipt');
	tmpnode.innerHTML = "בקש אישור קריאה להודעה זו.<br />";

	// change command.
	var formname = document.getElementsByName("vbform")[0];
	formname.setAttribute('onsubmit', 'return newcheckpm(this)');

}


/* functions! */

function newcheckpm(formname) {
	var vpfunc = (isFF) ? unsafeWindow.validatePost : validatePost;
	var result = vpfunc(formname, formname.title.value, 0, 15000);
	if (result == false) {
		formname.dopreview = false;
		return result;
	}
	return result;
}

// for firefox
if (isFF) {
	unsafeWindow.newcheckpm = newcheckpm;
}

// firefox 'firstChild' bug fix.
function getNextSibling(startBrother) {
	endBrother = startBrother.nextSibling;
	while(endBrother.nodeType != 1) endBrother = endBrother.nextSibling;
	return endBrother;
}

