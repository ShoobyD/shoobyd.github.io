// Fresh.co.il QR Buttons
// 25/03/2011
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 02/10/2009	bugfix: script conflict, with the new "QR subject" script. 
// 15/10/2008	complete overhaul. script rebuilt from the ground up. bugfix: script conflict, now it doesn't matter which script you install first.
// 20/02/2008	bugfix: threads with no quickreply box (like locked threads) displayed wrong.
// 18/02/2008	bugfix: top button on threads with survey fixed.
// 17/02/2008	added: a 'quick reply' button at the top.
// 17/02/2008	first version: adds 'quick reply' button at the bottom.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il QR Buttons", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il QR Buttons
// @namespace			http://shoobyd.herobo.com
// @description			adds 'quick reply' buttons to the main post at the bottom and the top of the thread.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			2.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

if (document.getElementById("collapseobj_quickreply")) {

	// for "QR subject" script conflict.
	var isSubject = document.getElementById('subjectfield');
	var qrcommand = (isSubject) ? 'newqr' : 'qr';

	var mainpostid = (isFF) ? unsafeWindow.curpostid : curpostid;

	var poststop = getNextSibling(document.getElementById("poststop")).rows[0].cells[0];
	var postsbottom = getFirstChild(document.getElementsByName('vbform')[0].parentNode).rows[0].cells[0];

	var tmpbuttons = poststop.innerHTML;
	tmpbuttons = tmpbuttons + '&nbsp;<a href="newreply.php?do=newreply&amp;p='+mainpostid+'" onclick="return '+qrcommand+'('+mainpostid+');" name="qrbtns"><img src="http://static.fresh.co.il/images/vBulletin/buttons/quickreply.gif" alt="תגובה מהירה להודעה הראשית" border="0" /></a>';

	poststop.innerHTML = tmpbuttons;
	postsbottom.innerHTML = tmpbuttons;

}

// firefox 'nextSibling' and 'firstChild' bug fix.
function getNextSibling(startBrother) {
	endBrother = startBrother.nextSibling;
	while(endBrother.nodeType != 1) endBrother = endBrother.nextSibling;
	return endBrother;
}
function getFirstChild(parent) {
	endChild = parent.firstChild;
	while(endChild.nodeType != 1) endChild = endChild.nextSibling;
	return endChild;
}

