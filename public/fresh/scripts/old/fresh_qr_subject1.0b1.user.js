// Fresh.co.il QR Subject
// 27/08/2009
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 27/08/2009	first version: adds Subject field for the Quick Reply.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il QR Subject", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il QR Subject
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			adds subject field for qr
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			1.0 beta 1
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var browser = navigator.appName;

if (document.getElementById("vBulletin_editor")) {


/* creating subject field. */
var panelsurround = document.getElementById("vBulletin_editor").parentNode.parentNode.parentNode.parentNode;
var tmpnode = document.createElement('div');
var tmpcont = document.createTextNode('');
tmpnode.appendChild(tmpcont);
panelsurround.insertBefore(tmpnode, getFirstChild(panelsurround));
tmpnode.innerHTML='<!-- subject field --><table class="fieldset" border="0" cellpadding="0" cellspacing="0"><tbody><tr><td class="smallfont" colspan="3">כותרת:</td></tr><tr><td><input type="text" class="bginput" name="title" value="" size="50" maxlength="85" tabindex="1" title="אופציונלי" /></td></tr></tbody></table><!-- / subject field -->';


if (document.getElementById("posts")) {

var fromqr = document.getElementsByName('fromquickreply')[0];
fromqr.value = 0;

/* changing buttons to new command. */
var imagim = document.getElementById("posts").getElementsByTagName("img");
for (var i=0; i<imagim.length; i++) {
	if (imagim[i].src == "http://static.fresh.co.il/images/vBulletin/buttons/quickreply.gif" && imagim[i].alt == "תגובה מהירה להודעה זו") {
		var ancr = imagim[i].parentNode;
		var cmd = ancr.getAttribute("onclick");
		var postid = cmd.substring(10,cmd.length-2)
		ancr.setAttribute("onclick", "return newqr("+postid+");");
	}
}
}


}


/* functions! */
//firefox
if (browser == "Netscape") {
unsafeWindow.newqr = function(postid) {
	var postdepth = getFirstChild(getPreviousSibling(document.getElementById("post"+postid).parentNode)).width / 18;
	//alert(postdepth);
	if (!document.getElementById("depth")) {
		// set depth parameter.
		var tmpnode = document.createElement('input');
		tmpnode.setAttribute("id", "depth");
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("value", postdepth);
		tmpnode.setAttribute("name", "depth");
		fromqr.parentNode.appendChild(tmpnode);
		// no emailupdate.
		tmpnode = document.createElement('input');
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("name", "emailupdate");
		tmpnode.setAttribute("value", "9999");
		fromqr.parentNode.appendChild(tmpnode);
	}
	else {
		document.getElementById("depth").setAttribute("value", postdepth);
	}
	return unsafeWindow.qr(postid);
}
}

//opera etc.
else {
function newqr(postid) {
	var postdepth = getFirstChild(getPreviousSibling(document.getElementById("post"+postid).parentNode)).width / 18;
	//alert(postdepth);
	if (!document.getElementById("depth")) {
		// set depth parameter.
		var tmpnode = document.createElement('input');
		tmpnode.setAttribute("id", "depth");
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("value", postdepth);
		tmpnode.setAttribute("name", "depth");
		fromqr.parentNode.appendChild(tmpnode);
		// no emailupdate.
		tmpnode = document.createElement('input');
		tmpnode.setAttribute("type", "hidden");
		tmpnode.setAttribute("name", "emailupdate");
		tmpnode.setAttribute("value", "9999");
		fromqr.parentNode.appendChild(tmpnode);
	}
	else {
		document.getElementById("depth").setAttribute("value", postdepth);
	}
	return qr(postid);
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

