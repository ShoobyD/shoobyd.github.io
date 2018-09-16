// Fresh.co.il Mark Forum As Read
// 13/08/2009
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 13/08/2009	first version: adds 'Mark Forum As Read' button at the top of the forum's main page.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Mark Forum As Read", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Mark Forum As Read
// @namespace			http://shoobyd.herobo.com
// @description			adds a 'Mark Forum As Read' button at the top of the forum's main page.
// @include			*fresh.co.il/vBulletin/forumdisplay.php*
// @version			1.0
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var inp = document.getElementsByTagName("input");
//for (var i = 0, inp[i].name != 'f' || i<inp.length, i++) {alert("i: "+i+"\nname: "+inp[i].name+"\nvalue: "+inp[i].value);};
var forumid = inp[5].value;
var forumtop = document.getElementById("forumtools").parentNode.parentNode.insertRow(0).insertCell(0);

forumtop.innerHTML = '<a href="forumdisplay.php?do=markread&f='+forumid+'">סמן פורום זה כנקרא</a>';
forumtop.colSpan="3";
forumtop.align="center";

