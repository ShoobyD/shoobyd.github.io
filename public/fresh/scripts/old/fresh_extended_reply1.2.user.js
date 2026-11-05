// Fresh.co.il Extended Reply
// 26/10/2008
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
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
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			additional tools for fresh.co.il 'regular reply'.
// @include			*fresh.co.il/vBulletin/newreply.php*
// @include			*fresh.co.il/vBulletin/newthread.php*
// @include			*fresh.co.il/vBulletin/editpost.php*
// @version			1.2
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var browser = navigator.appName;
var isWYSIWYG = (document.getElementById("htmlbox")) ? 1 : 0;
var sidebr = (isWYSIWYG) ? 0 : 200;
if (browser == "Netscape") { unsafeWindow.smiliewindow_x = 620; unsafeWindow.smiliewindow_y = 620; }
else { smiliewindow_x = 620; smiliewindow_y = 620; };


/* fix wrapper style */
var wrapper = document.getElementById("vBulletin_editor").parentNode.parentNode.parentNode.parentNode.parentNode;
wrapper.setAttribute('align', 'center');
wrapper.style.width = "100%";


/* additional buttons */
if (document.getElementById("controlbar")) {

var contmp = document.getElementById("controlbar").getElementsByTagName("tr");
var controlbar = contmp[contmp.length-1];
var i = controlbar.getElementsByTagName("td").length;

if (isWYSIWYG) {
// 'full wysiwyg' mode.
controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_spoiler"><img src="http://uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" /></div>';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_tex"><img src="http://uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" /></div>';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_smileysign"><img src="http://uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" /></div>';
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
controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" border="0" /></a></div>';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" border="0" /></a></div>';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="window.open('+smwin+')"><img src="http://uploaded.fresh.co.il/2008/02/13/90378390.gif" alt="פתיחת חלון להוספת סמיילים" title="פתיחת חלון להוספת סמיילים" width="21" height="20" border="0" /></a></div>';
controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" border="0" /></a></div>';
}

}


/* resize textarea */
if (document.getElementById("vBulletin_editor")) {

// 'full wysiwyg' mode.
if (isWYSIWYG) {
	var messagebox = document.getElementById("htmlbox").parentNode;
	var resizecmd = new Array(
		"return alter_box_width('htmlbox', 300)",
		"return alter_box_width('htmlbox', -300)"
	);
}

// 'standard editor' mode.
else {
	var messagebox = document.getElementById("message").parentNode;
	var resizecmd = new Array(
		"return alter_box_width('message', 300)",
		"return alter_box_width('message', -300)"
	);
}

var tmpnode_w = document.createElement('div');
var tmpcont_w = document.createTextNode('');
tmpnode_w.setAttribute('id', 'resize_w');
tmpnode_w.setAttribute('class', 'smallfont');
tmpnode_w.style.cssFloat = "left";
tmpnode_w.appendChild(tmpcont_w);
messagebox.appendChild(tmpnode_w);
document.getElementById("resize_w").innerHTML='<a onclick="'+resizecmd[1]+'" href="#">«</a>&nbsp;<a onclick="'+resizecmd[0]+'" href="#">»</a>';

var tmpnode_h = getPreviousSibling(document.getElementById("resize_w"));
tmpnode_h.style.cssFloat = "right";
tmpnode_h.parentNode.insertBefore(document.createElement('br'),tmpnode_h);

}


/* functions! */
function getPreviousSibling(startBrother) {
	endBrother = startBrother.previousSibling;
	while(endBrother.nodeType != 1) {
		endBrother = endBrother.previousSibling;
	}
	return endBrother;
}

//firefox
if (browser == "Netscape") {
unsafeWindow.openSearchWindow = function() {
	searchsystem = window.open("/scripts/upload.php?do=search","searchsystem","width=1000,height=700,scrollbars=1");
	searchsystem.location.href = "/scripts/upload.php?do=search";
	if (searchsystem.opener == null)
		searchsystem.opener = window;
}
unsafeWindow.alter_box_width = function(boxid, pixelvalue) {
	var dabox = document.getElementById(boxid);
	var boxwidth = parseInt(dabox.style.width);
	var newwidth = boxwidth + pixelvalue;
	if (newwidth > 400 && newwidth < (screen.width - sidebr))
	{
		dabox.style.width = newwidth + "px";
	}
	return false;
}
}

//opera etc.
else {
function openSearchWindow() {
	searchsystem = window.open("/scripts/upload.php?do=search","searchsystem","width=1000,height=700,scrollbars=1");
	searchsystem.location.href = "/scripts/upload.php?do=search";
	if (searchsystem.opener == null)
		searchsystem.opener = window;
}
function alter_box_width(boxid, pixelvalue) {
	var dabox = document.getElementById(boxid);
	var boxwidth = parseInt(dabox.style.width);
	var newwidth = boxwidth + pixelvalue;
	if (newwidth > 400 && newwidth < (screen.width - sidebr))
	{
		dabox.style.width = newwidth + "px";
	}
	return false;
}
}

