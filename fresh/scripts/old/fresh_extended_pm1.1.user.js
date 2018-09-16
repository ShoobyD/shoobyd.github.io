// Fresh.co.il Extended PM
// 30/09/2009
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
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
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			additional tools for fresh.co.il private messages (and 'signature editor').
// @include			*fresh.co.il/vBulletin/private.php*
// @include			*fresh.co.il/vBulletin/profile.php*
// @version			1.1
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var browser = navigator.appName;

if (document.getElementById("vBulletin_editor")) {

var isWYSIWYG = (document.getElementById("htmlbox")) ? 1 : 0;
var boxwidth = (isWYSIWYG) ? "560px" : "370px";
//var sidebr = (isWYSIWYG) ? 0 : 200;
(isWYSIWYG) ? 0 : document.getElementById("smiliebox").parentNode.style.width = "140px";

var boxid = (isWYSIWYG) ? "htmlbox" : "message";
var messagebox = document.getElementById(boxid);
var resizecmd = new Array(
	"return span_text_area('"+boxid+"', 0)",
	"return span_text_area('"+boxid+"', 1)"
);

messagebox.style.width = boxwidth;
messagebox = messagebox.parentNode;

var tmpnode_w = document.createElement('div');
var tmpcont_w = document.createTextNode('');
tmpnode_w.setAttribute('id', 'resize_w');
tmpnode_w.setAttribute('class', 'smallfont');
tmpnode_w.style.cssFloat = "left";
tmpnode_w.appendChild(tmpcont_w);
messagebox.appendChild(tmpnode_w);
document.getElementById("resize_w").innerHTML='<a onclick="'+resizecmd[0]+'" href="#">«</a>&nbsp;<a onclick="'+resizecmd[1]+'" href="#">»</a>';

var tmpnode_h = getPreviousSibling(document.getElementById("resize_w"));
tmpnode_h.style.cssFloat = "right";
tmpnode_h.parentNode.insertBefore(document.createElement('br'),tmpnode_h);

}


/* functions! */

//firefox
if (browser == "Netscape") {
unsafeWindow.span_text_area = function(boxid, vos) {
	var kak = document.getElementById("vBulletin_editor");
	if (vos==1) {
		kak.parentNode.style.width = "100%";
		getFirstChild(kak).style.width = "100%";
		document.getElementById(boxid).style.width = "100%";
		//document.getElementById(boxid).style.width = (window.outerWidth-220-sidebr)+"px";
	}
	else {
		kak.parentNode.style.width = "580px";
		document.getElementById(boxid).style.width = boxwidth;
	}
	return false;
}
}

//opera etc.
else {
function span_text_area(boxid, vos) {
	var kak = document.getElementById("vBulletin_editor");
	if (vos==1) {
		kak.parentNode.style.width = "100%";
		getFirstChild(kak).style.width = "100%";
		document.getElementById(boxid).style.width = "100%";
		//document.getElementById(boxid).style.width = (window.outerWidth-220-sidebr)+"px";
	}
	else {
		kak.parentNode.style.width = "580px";
		document.getElementById(boxid).style.width = boxwidth;
	}
	return false;
}
}


// firefox 'previousSibling' and 'firstChild' bug fix.
function getPreviousSibling(startBrother) {
	endBrother = startBrother.previousSibling;
	while(endBrother.nodeType != 1) {
		endBrother = endBrother.previousSibling;
	}
	return endBrother;
}

function getFirstChild(parent) {
	endChild = parent.firstChild;
	while(endChild.nodeType != 1) {
		endChild = endChild.nextSibling;
	}
	return endChild;
}

