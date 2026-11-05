// Fresh.co.il Extended Reply
// 25/03/2011
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 30/09/2009	code overhaul. added textarea full-span function.
// 26/10/2008	compatibility for post edit page.
// 21/10/2008	complete overhaul. fix smiliewindow size. added: textarea horizontal resizing function.
// 13/04/2008	first version: adds 'spoiler', 'smileysign' and 'tex' tags.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Extended Reply", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Extended Reply
// @namespace			http://shoobyd.herobo.com
// @description			additional tools for fresh.co.il 'regular reply'.
// @include			*fresh.co.il/vBulletin/newreply.php*
// @include			*fresh.co.il/vBulletin/newthread.php*
// @include			*fresh.co.il/vBulletin/editpost.php*
// @version			1.4
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");

if (document.getElementById("vBulletin_editor")) {

	var isWYSIWYG = (document.getElementById("htmlbox")) ? 1 : 0;
	var sidebr = (isWYSIWYG) ? 0 : 200;
	if (!isWYSIWYG) document.getElementById("smiliebox").parentNode.style.width = "140px";
	if (isFF) { unsafeWindow.smiliewindow_x = 620; unsafeWindow.smiliewindow_y = 620; }
	else { smiliewindow_x = 620; smiliewindow_y = 620; };


	/* fix wrapper style */
	var wrapper = document.getElementById("vBulletin_editor").parentNode.parentNode.parentNode.parentNode.parentNode;
	wrapper.setAttribute('align', 'center');
	wrapper.style.width = "100%";


	/* additional buttons */
	if (document.getElementById("controlbar")) {

		var controlbar = document.getElementById("controlbar").getElementsByTagName("tr");
		controlbar = controlbar[controlbar.length-1];
		var i = controlbar.getElementsByTagName("td").length;

		if (isWYSIWYG) {
			// 'full wysiwyg' mode.
			controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_spoiler"><img src="http://2008.uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" /></div>';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_tex"><img src="http://2008.uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" /></div>';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_smileysign"><img src="http://2008.uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" /></div>';
		}

		else {
			// 'standard editor' mode.
			var j=0; i--;
			var vbcmds = new Array(
				"return vbcode('SPOILER', '')",
				"return vbcode('TEX', '')",
				"return vbcode('SMILEYSIGN', '')"
			);
			var smwin = "'misc.php?do=getsmilies&wysiwyg=0','smilies','statusbar=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,width=620,height=620'";
			controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://2008.uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" border="0" /></a></div>';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://2008.uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" border="0" /></a></div>';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="window.open('+smwin+')"><img src="http://2008.uploaded.fresh.co.il/2008/02/13/90378390.gif" alt="פתיחת חלון להוספת סמיילים" title="פתיחת חלון להוספת סמיילים" width="21" height="20" border="0" /></a></div>';
			controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://2008.uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" border="0" /></a></div>';
		}

	}


	/* resize textarea */
	var boxid = (isWYSIWYG) ? "htmlbox" : "message";
	var messagebox = document.getElementById( boxid ).parentNode;
	var resizecmd = new Array(
		"return alter_box_width('"+boxid+"', 300)",
		"return alter_box_width('"+boxid+"', -300)",
		"return span_text_area('"+boxid+"', 0)",
		"return span_text_area('"+boxid+"', 1)"
	);

	var tmpnode = messagebox.appendChild(document.createElement('div'));
	tmpnode.setAttribute('class', 'smallfont');
	tmpnode.style.cssFloat = "left";
	tmpnode.innerHTML='<a onclick="'+resizecmd[1]+'" href="#">«</a>&nbsp;<a onclick="'+resizecmd[0]+'" href="#">»</a>';

	tmpnode = getPreviousSibling(tmpnode);
	tmpnode.style.cssFloat = "right";
	tmpnode.parentNode.insertBefore(document.createElement('br'),tmpnode);

	//fullspan
	var fullspan = messagebox.parentNode.insertCell(-1);
	fullspan.style.verticalAlign = "middle";
	fullspan.style.width = "20px";
	fullspan.innerHTML = '<a onclick="'+resizecmd[2]+'" href="#"><img src="http://2009.uploaded.fresh.co.il/2009/09/30/11666949.png" border="0" /></a>&nbsp;<a onclick="'+resizecmd[3]+'" href="#"><img src="http://2009.uploaded.fresh.co.il/2009/09/30/66026886.png" border="0" /></a>';

}



/* functions! */

function openSearchWindow() {
	searchsystem = window.open("/scripts/upload.php?do=search","searchsystem","width=1000,height=700,scrollbars=1");
	searchsystem.location.href = "/scripts/upload.php?do=search";
	if (searchsystem.opener == null)
		searchsystem.opener = window;
}
function alter_box_width(boxid, pixelvalue) {
	var dabox = document.getElementById(boxid);
	var newwidth = parseInt(dabox.style.width) + pixelvalue;
	if (newwidth > 400 && newwidth < (screen.width - sidebr)) dabox.style.width = newwidth + "px";
	return false;
}
function span_text_area(boxid, vos) {
	var kak = document.getElementById("vBulletin_editor");
	if (vos==1) {
		kak.parentNode.parentNode.parentNode.parentNode.style.width = "100%";
		getFirstChild(kak).style.width = "100%";
		document.getElementById(boxid).style.width = "100%";
	}
	else {
		kak.parentNode.parentNode.parentNode.parentNode.removeAttribute("style");
		document.getElementById(boxid).style.width = "540px";
	}
	return false;
}

// for firefox
if (isFF) {
	unsafeWindow.openSearchWindow = openSearchWindow;
	unsafeWindow.alter_box_width = alter_box_width;
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

