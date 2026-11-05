// Fresh.co.il Upload System iFrame
// 23/10/2009
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 23/10/2009	added: compatibility for reg. reply, new thread and edit-post pages.
// 04/10/2009	added: 'close' link in upsys closes the iframe.
// 30/09/2009	bugfix: insertion of uploads actually works now!
// 17/10/2008	first version: adds an iframe with the uploading system.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Upload System iFrame", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Upload System iFrame
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			adds the uploading system in an iframe.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @include			*fresh.co.il/vBulletin/newreply.php*
// @include			*fresh.co.il/vBulletin/newthread.php*
// @include			*fresh.co.il/vBulletin/editpost.php*
// @include			*fresh.co.il/scripts/upload.php*
// @version			2.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var browser = navigator.appName;

// uploading system in an iframe.
if (document.getElementById("vBulletin_editor")) {
	var qrtable = document.getElementById("vBulletin_editor");
	var isQR = (qrtable.tagName.toLowerCase()=='td');
	if (browser == "Netscape") {unsafeWindow.isQR = isQR}
	qrtable = isQR ? qrtable.parentNode.parentNode : qrtable.parentNode.parentNode.parentNode;
	qrtable.insertRow(isQR ? 3 : 1).insertCell(0).innerHTML='<center><a href="javascript:toggle_upsys();">לחץ לפתיחת/סגירת העלאה מובנית</a><br /><iframe id="UpSys" src="" style="height: 700px; width: 640px; display: none;"></iframe><center>';
	var upsys = document.getElementById("UpSys");
	var flag = 0;

/* functions! */
//firefox
if (browser == "Netscape") {
	unsafeWindow.toggle_upsys = function() {
		upsys.style.display = (upsys.style.display == "none") ? "" : "none";
		if (!flag) upsys.src = "http://www.fresh.co.il/scripts/upload.php";
		flag = 1;
	}
}
//opera etc.
else {
	function toggle_upsys() {
		upsys.style.display = (upsys.style.display == "none") ? "" : "none";
		if (!flag) upsys.src = "http://www.fresh.co.il/scripts/upload.php";
		flag = 1;
	}
}

}


// upload system 'insert_text' fix.
if (document.getElementById("tblMain") && window.top!=window.self) {
	var isWYSIWYG = (window.top.document.getElementById("htmlbox")) ? 1 : 0;
	var messagebox = window.top.document.getElementById((isWYSIWYG) ? "htmlbox" : (window.top.isQR ? "qr_message" : "message"));
	//alert(isWYSIWYG+"\n\n"+messagebox.contentDocument.body.innerHTML);
	var ancrs = document.getElementById("tblMain").getElementsByTagName("a");
	for (var i=0; i<ancrs.length; i++) {
		if (ancrs[i].href == "javascript:window.close();") {
			ancrs[i].href = "javascript:window.top.toggle_upsys();";
		}
	}

/* functions! */
//firefox
if (browser == "Netscape") {
	if (isWYSIWYG) {
		unsafeWindow.insert_text = function(text) {
			messagebox.contentDocument.body.innerHTML += text;
		}
	}
	else {
		unsafeWindow.insert_text = function(text) {
			messagebox.value += text;
			messagebox.focus();
		}
	}
}
//opera etc.
else {
	if (isWYSIWYG) {
		function insert_text(text) {
			messagebox.contentDocument.body.innerHTML += text;
		}
	}
	else {
		function insert_text(text) {
			messagebox.value += text;
			messagebox.focus();
		}
	}
}

}

