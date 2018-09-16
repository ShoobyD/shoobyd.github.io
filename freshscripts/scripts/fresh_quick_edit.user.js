﻿// Fresh.co.il Quick Edit
// 25/03/2011
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 27/08/2009	bugsfix: executed when 'edit' img was in post, solution: added 'alt' condition. editbox has been able to go out of browser window.
// 23/10/2008	first version: adds 'quick edit' buttons that opens a movable(!) iframe with quick edit.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Quick Edit", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Quick Edit
// @namespace			http://shoobyd.herobo.com
// @description			adds a quick edit function.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			1.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

/* insert quick edit buttons. */
if (document.getElementById("posts")) {

	var imagim = document.getElementById("posts").getElementsByTagName("img");
	var btncont = '&nbsp;<img border="0" alt="עריכה מהירה להודעה זו" src="http://uploaded.fresh.co.il/2008/10/22/92211264.gif" title="עריכה מהירה להודעה זו" />';
	var isedit = 0;

	for (var i=0; i<imagim.length; i++) {
		if (imagim[i].alt == "ערוך/מחק הודעה" && imagim[i].src == "http://static.fresh.co.il/images/vBulletin/buttons/edit.gif") {
			var ancr = imagim[i].parentNode;
			var link = ancr.href;
			var tmpnode = ancr.parentNode.insertBefore(document.createElement('a'), ancr.nextSibling);
			tmpnode.setAttribute('onclick', 'openEdit("'+link+'");');
			tmpnode.innerHTML = btncont;
			isedit = 1;
		}
	}

}


/* quick edit in an iframe. */
if (isedit) {

	// create iframe
	var editbokhs = '<table class="tborder" cellpadding="0" cellspacing="1" border="0" width="680px"><thead id="editTop" style="cursor: move;"><tr><td class="tcat" colspan="2"><a href="javascript:closeEdit();" style="float: right;"><img border="0" alt="" src="http://uploaded.fresh.co.il/2008/10/23/71885871.gif" style="width: 15px; height: 15px;"/></a><a style="float:left" href="#top" onclick="return editor_loaded ? false : toggle_collapse('+"'quickedit'"+');"><img id="collapseimg_quickedit" src="http://static.fresh.co.il/images/vBulletin/buttons/collapse_tcat.gif" alt="" border="0" /></a>עריכה מהירה</td></tr></thead><tbody id="collapseobj_quickedit" style=""><tr><td class="panelsurround" align="center"><div class="panel"><iframe id="QuickEdit" src="" style="height: 480px; width: 640px;"></iframe></div></td></tr></tbody></table><br />';
	var vbform = (isFF) ? unsafeWindow.document.vbform : document.vbform;
	var tmpedit = vbform.parentNode.insertBefore(document.createElement('div'), vbform);
	tmpedit.setAttribute('id', 'EditBox');
	tmpedit.setAttribute('style', 'display:none; position:fixed; top:256px; left:48px;');
	tmpedit.innerHTML = editbokhs;

	// initialization.
	var flag = 0;
	var drag = false;
	var editbox = document.getElementById("EditBox");
	var qedit = document.getElementById("QuickEdit");

	// dragging events.
	document.getElementsByTagName('body')[0].setAttribute("onmousemove","moveit(event);");
	if (isFF) {
		unsafeWindow.document.onmouseup = function() {drag=0;}
		unsafeWindow.document.getElementById("editTop").onmousedown = function() {drag=1;}
	}
	else {
		document.onmouseup = function() {drag=0;}
		document.getElementById("editTop").onmousedown = function() {drag=1;}
	}

}


/* functions! */

function openEdit(link) {
	if (!flag) {
		editbox.style.display = "";
		flag = 1;
	}
	qedit.src = link;
	qedit.focus();
}
function closeEdit() {
	editbox.style.display = "none";
	qedit.src = "";
	flag = 0;
}
function moveit(event) {
	if (drag==true) {
		var pos_x = event.clientX-450;
		var pos_y = event.clientY-10;
		if (pos_y>0 && pos_y<(window.outerHeight-300)) {
			editbox.style.left=pos_x+"px";
			editbox.style.top=pos_y+"px";
		}
	}
}

if (isFF) {
	unsafeWindow.openEdit = openEdit;
	unsafeWindow.closeEdit = closeEdit;
	unsafeWindow.moveit = moveit;
}

