// Fresh.co.il QR Buttons
// 17/02/2008
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
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
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			adds 'quick reply' buttons to the main post at the bottom and the top of the thread.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			1.1
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==

var posts = document.getElementById("posts").innerHTML;
var tmpstr = posts.substring(11,20); var idend = 11+tmpstr.indexOf(" ");
var mainpostid = posts.substring(11,idend);

if (document.getElementById("htmlbox")) {var i = 15;}
else {var i = 13;}
var tables = document.getElementsByTagName("table");
var poststop = tables[8].rows[0].cells[0];
var postsbottom = tables[tables.length-i].rows[0].cells[0];

tmpbuttons = poststop.innerHTML;
poststop.innerHTML = tmpbuttons + '&nbsp;<a href="newreply.php?do=newreply&amp;p='+mainpostid+'" onclick="return qr('+mainpostid+');"><img src="http://static.fresh.co.il/images/vBulletin/buttons/quickreply.gif" alt="תגובה מהירה להודעה הראשית" border="0" /></a>';
postsbottom.innerHTML = tmpbuttons + '&nbsp;<a href="newreply.php?do=newreply&amp;p='+mainpostid+'" onclick="return qr('+mainpostid+');"><img src="http://static.fresh.co.il/images/vBulletin/buttons/quickreply.gif" alt="תגובה מהירה להודעה הראשית" border="0" /></a>';


