// Fresh.co.il PM Toolbox
// 27/08/2009
// Copyright (c) 2009, Baruch Mustakis
//
// last updates:
// 27/08/2009	first version: adds the PM toolbox at the top of the message table.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il PM Toolbox", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il PM Toolbox
// @namespace			http://u.math.biu.ac.il/~mustakb/
// @description			adds the PM toolbox at the top of the message table.
// @include			*fresh.co.il/vBulletin/private.php*
// @version			1.0
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var toolbox = '<tr><td align="left" colspan="4" class="tfoot"><div class="smallfont">הודעות נבחרות:<select name="dowhat"><option value="move">העבר לתיקיה...</option><option value="delete">מחק</option><option value="read">סמן כ"נקרא"</option><option value="unread">סמן כ"לא נקרא"</option><option value="xml">הורד כקובץ XML</option><option value="csv">הורד כקובץ CSV</option><option value="txt">הורד כקובץ טקסט</option></select><input type="submit" value="בצע" class="button"/></div></td></tr>';
var msgtable = document.getElementsByName("dowhat")[0].parentNode.parentNode.parentNode.parentNode.parentNode;
//alert(msgtable.tagName);
var tmpnode = document.createElement('tbody');
var tmpcont = document.createTextNode('');
tmpnode.appendChild(tmpcont);
msgtable.insertBefore(tmpnode ,getNextSibling(getFirstChild(msgtable)));
tmpnode.innerHTML = toolbox;


// firefox 'nextSibling' and 'firstChild' bug fix.
function getNextSibling(startBrother) {
	endBrother = startBrother.nextSibling;
	while(endBrother.nodeType != 1) {
		endBrother = endBrother.nextSibling;
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

