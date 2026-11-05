// Fresh.co.il PM Receipt
// 27/08/2009
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 27/08/2009	first version: replace the 'confirmation option' popup with a checkbox.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il PM Receipt", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il PM Receipt
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			replace the 'confirmation option' popup with a checkbox.
// @include			*fresh.co.il/vBulletin/private.php*
// @version			1.0
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var browser = navigator.appName;

if (document.getElementById("vBulletin_editor")) {

/* adding checkbox. */
var confirm = document.getElementsByName("receipt")[0];
confirm.setAttribute('type', 'checkbox');
confirm.setAttribute('id', 'receipt');
confirm.removeAttribute('value');
var tmpnode = document.createElement('label');
var tmpcont = document.createTextNode('');
tmpnode.appendChild(tmpcont);
tmpnode.setAttribute('for', 'receipt');
confirm.parentNode.insertBefore(tmpnode ,getNextSibling(confirm));
tmpnode.innerHTML = "בקש אישור קריאה להודעה זו.<br />";

// change command.
var formname = document.getElementsByName("vbform")[0];
formname.setAttribute('onsubmit', 'return newcheckpm(this)');

}


/* functions! */

//firefox
if (browser == "Netscape") {
unsafeWindow.newcheckpm = function(formname) {
	var result = unsafeWindow.validatePost(formname, formname.title.value, 0, 15000);
	if (result == false) {
		formname.dopreview = false;
		return result;
	}
	return result;
}
}

//opera etc.
else {
function newcheckpm(formname) {
	var result = validatePost(formname, formname.title.value, 0, 15000);
	if (result == false) {
		formname.dopreview = false;
		return result;
	}
	return result;
}
}

// firefox 'firstChild' bug fix.
function getNextSibling(startBrother) {
	endBrother = startBrother.nextSibling;
	while(endBrother.nodeType != 1) {
		endBrother = endBrother.nextSibling;
	}
	return endBrother;
}

