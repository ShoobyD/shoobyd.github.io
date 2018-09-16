// Fresh.co.il Extended PM
// 25/03/2011
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 30/09/2009	code overhaul. bugfix: textarea resizing worked according to screen width instead of window width.
// 22/10/2008	first version: fix textarea size. adds textarea horizontal resizing function. also works on the 'signature editor'.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Extended PM", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Extended PM
// @namespace			http://shoobyd.herobo.com
// @description			additional tools for fresh.co.il private messages (and 'signature editor').
// @include			*fresh.co.il/vBulletin/private.php*
// @include			*fresh.co.il/vBulletin/profile.php*
// @version			1.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

if (document.getElementById("vBulletin_editor")) {

	var isWYSIWYG = (document.getElementById("htmlbox")) ? 1 : 0;
	var boxwidth = (isWYSIWYG) ? "560px" : "370px";
	var boxid = (isWYSIWYG) ? "htmlbox" : "message";
	var messagebox = document.getElementById(boxid);
	var resizecmd = new Array(
		"return span_text_area('"+boxid+"', 0)",
		"return span_text_area('"+boxid+"', 1)"
	);

	(isWYSIWYG) ? 0 : document.getElementById("smiliebox").parentNode.style.width = "140px";
	messagebox.style.width = boxwidth;
	messagebox = messagebox.parentNode;

	var tmpnode = messagebox.appendChild(document.createElement('div'));
	tmpnode.setAttribute('class', 'smallfont');
	tmpnode.style.cssFloat = "left";
	tmpnode.innerHTML='<a onclick="'+resizecmd[0]+'" href="#">«</a>&nbsp;<a onclick="'+resizecmd[1]+'" href="#">»</a>';

	tmpnode = getPreviousSibling(tmpnode);
	tmpnode.style.cssFloat = "right";
	tmpnode.parentNode.insertBefore(document.createElement('br'),tmpnode);

}


/* functions! */

function span_text_area(boxid, vos) {
	var kak = document.getElementById("vBulletin_editor");
	if (vos==1) {
		kak.parentNode.style.width = "100%";
		getFirstChild(kak).style.width = "100%";
		document.getElementById(boxid).style.width = "100%";
	}
	else {
		kak.parentNode.style.width = "580px";
		document.getElementById(boxid).style.width = boxwidth;
	}
	return false;
}

// for firefox
if (isFF) {
	unsafeWindow.span_text_area = span_text_area;
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

