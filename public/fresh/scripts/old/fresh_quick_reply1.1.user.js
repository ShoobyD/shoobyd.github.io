// Fresh.co.il Quick Reply
// 10/02/2008
// Copyright (c) 2008, Baruch Mustakis
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Quick Reply", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Quick Reply
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			additional tools for fresh 'quick reply'
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			1.1
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==

var controlbar = document.getElementById("controlbar").getElementsByTagName("tr")[0];
var i = controlbar.getElementsByTagName("td").length;

controlbar.insertCell(i).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" height="20" width="6">';
controlbar.insertCell(i+1).innerHTML='<div class="imagebutton" id="cmd_createlink"><img src="http://static.fresh.co.il/images/vBulletin/editor/createlink.gif" alt="הכנס קישור" width="21" height="20" /></div>';
controlbar.insertCell(i+2).innerHTML='<div class="imagebutton" id="cmd_insertimage"><img src="http://static.fresh.co.il/images/vBulletin/editor/insertimage.gif" alt="הכנס תמונה" width="21" height="20" /></div>';
controlbar.insertCell(i+3).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" height="20" width="6">';
controlbar.insertCell(i+4).innerHTML='<div class="imagebutton" id="cmd_wrap0_php"><img src="http://static.fresh.co.il/images/vBulletin/editor/php.gif" alt="עטוף תגי [PHP]" width="21" height="20" /></div>';
controlbar.insertCell(i+5).innerHTML='<div class="imagebutton" id="cmd_wrap0_youtube"><img src="http://www.fresh.co.il/vBulletin/images/freshicons/youtube.gif" alt="Wrap [YOUTUBE] tags around selected text" title="Wrap [YOUTUBE] tags around selected text" width="21" height="20" /></div>';

