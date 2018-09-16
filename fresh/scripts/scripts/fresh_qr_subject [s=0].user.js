// Fresh.co.il QR Subject
// 25/03/2011
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 25/03/2011	bugfix: overriding unclosed <a> tag + complete overhaul.
// 23/10/2009	bugfix: preventing old qr() while 'fromquickreply'=0.
// 02/10/2009	first version: bugfix: script conflict, with the "QR Button" script.
// 27/08/2009	beta version: adds Subject field for the Quick Reply.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il QR Subject", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il QR Subject
// @namespace			http://shoobyd.herobo.com
// @description			adds a subject field for qr, with subscription but without email notification.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			1.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

if (document.getElementById("vBulletin_editor")) {

	/* creating subject field. */
	var panelsurround = document.getElementById("vBulletin_editor").parentNode.parentNode.parentNode.parentNode;
	var tmpnode = panelsurround.insertBefore(document.createElement('div'), getFirstChild(panelsurround));
	tmpnode.innerHTML='<!-- subject field --><table id="subjectfield" class="fieldset" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td class="smallfont" colspan="3">כותרת:</td></tr><tr><td><input type="text" class="bginput" name="title" value="לחצת על תגובה ושדה זה מבוטל? לא חיכית שהדף ייטען במלואו" size="60" maxlength="85" tabindex="1" title="אופציונלי" disabled="disabled" /></td></tr></tbody></table><!-- / subject field -->';


	/* changing buttons to new command. */
	if (document.getElementById("posts")) {

		var imagim = document.getElementById("posts").getElementsByTagName("img");
		for (var i=0; i<imagim.length; i++) {
			if (imagim[i].alt == "תגובה מהירה להודעה זו" && imagim[i].src == "http://static.fresh.co.il/images/vBulletin/buttons/quickreply.gif") {
				var ancr = imagim[i].parentNode;
				ancr.setAttribute("onclick", ancr.getAttribute("onclick").replace("qr(","newqr("));
			}
		}

		// for "QR Button" script.
		if (document.getElementsByName('qrbtns')) {
			var qrbtns = document.getElementsByName('qrbtns');
			for (var i=0; i<qrbtns.length; i++) {
				qrbtns[i].setAttribute("onclick", qrbtns[i].getAttribute("onclick").replace("qr(","newqr("));
			}
		}

	}

}


/* functions! */

function newqr(postid) {

	var fromqr = document.getElementsByName('fromquickreply')[0];
	var postdepth = document.getElementById("post"+postid).parentNode;
	if (postdepth.nodeName.toLowerCase()=="a") postdepth = postdepth.parentNode;
	postdepth = getFirstChild(getPreviousSibling(postdepth)).width / 18;

	if (!document.getElementById("depth")) {
		document.getElementsByName('title')[0].disabled = false;
		document.getElementsByName('title')[0].value = "";
		fromqr.value = 0;
		// set depth parameter.
		var tmpnode = fromqr.parentNode.appendChild(document.createElement('input'));
		tmpnode.setAttribute("id", "depth");
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("value", postdepth);
		tmpnode.setAttribute("name", "depth");
		// no emailupdate.
		tmpnode = fromqr.parentNode.appendChild(document.createElement('input'));
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("name", "emailupdate");
		tmpnode.setAttribute("value", "0");
	}
	else {
		document.getElementById("depth").setAttribute("value", postdepth);
	}

	return isFF ? unsafeWindow.qr(postid) : qr(postid);

}

// for firefox
if (isFF) {
	unsafeWindow.newqr = newqr;
}

// firefox 'previousSibling' and 'firstChild' bug fix.
function getPreviousSibling(startBrother) {
	endBrother = startBrother.previousSibling;
	while(endBrother.nodeType != 1) endBrother = endBrother.previousSibling;
	return endBrother;
}

function getFirstChild(parent) {
	endChild = parent.firstChild;
	while(endChild.nodeType != 1) endChild = endChild.nextSibling;
	return endChild;
}

