// Fresh.co.il Quick Reply
// 25/03/2011
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 25/03/2011	complete overhaul.
// 20/10/2008	complete overhaul. added: textarea horizontal resizing + a link to the 'uploads search system'.
// 12/03/2008	added: resizing textarea feature. fixed: threads with no quickreply box.
// 10/03/2008	added: link to the file uploading system.
// 10/03/2008	fixed: smiley window for wysiwyg mode, added: smiley window for 'standard editor' mode, fixed: xhtml empty tags closed.
// 04/03/2008	added [code] tag, and some code clean up to help with the dev.
// 15/02/2008	added: compatibility for 'standard editor' mode.
// 14/02/2008	'spoiler' icon replaced.
// 13/02/2008	added: 'spoiler', 'smileysign' and 'tex' buttons. drop-down menu for the regular smileys (not finished).
// 10/02/2008	first version: adds 'url', 'img', 'php' and 'youtube' tags.
// --------------------------------------------------------------------
//
// This is a Greasemonkey user script.
// To uninstall, go to Tools/Manage User Scripts, select "Fresh.co.il Quick Reply", and click Uninstall.
// --------------------------------------------------------------------
//
// ==UserScript==
// @name			Fresh.co.il Quick Reply
// @namespace			http://shoobyd.herobo.com
// @description			additional tools for fresh.co.il 'quick reply'.
// @include			*fresh.co.il/vBulletin/showthread.php*
// @version			2.3
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==


var isFF = (navigator.appName == "Netscape");
var editormode = (isFF) ? unsafeWindow.WYSIWYG : WYSIWYG;

/* additional buttons */
if (document.getElementById("controlbar")) {

	var controlbar = document.getElementById("controlbar").getElementsByTagName("tr")[0];
	var i = controlbar.getElementsByTagName("td").length;
	var smwin = new Array(
		"'misc.php?do=getsmilies&wysiwyg=",
		"'smilies','statusbar=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,width=620,height=620'"
	);

	//styles
	controlbar.insertCell(i++).innerHTML='<style type="text/css"><!--.zibybtn {background: #ECE9D8; color: #000000; padding: 1px; border: none;}.zibybtn:hover {background: #C1D2EE; color: #000000; padding: 0px; border: 1px solid #316AC5;}.zibybtn:active {background: #98B5E2; color: #000000; padding: 0px; border: 1px solid #316AC5;}.zibymenu{background: #FFFFFF; color: #000000; padding: 0px; border: 1px solid #FFFFFF;}.zibymenu:hover {background: #C1D2EE; color: #316AC5; padding: 0px; border: 1px solid #316AC5;}.zibymenu:active {background: #98B5E2; color: #316AC5; padding: 0px; border: 1px solid #316AC5;}--></style><img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';

	if (editormode == 2) {
		// 'full wysiwyg' mode.
		var edmode="1',";
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_createlink"><img src="http://static.fresh.co.il/images/vBulletin/editor/createlink.gif" alt="הכנס קישור" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_insertimage"><img src="http://static.fresh.co.il/images/vBulletin/editor/insertimage.gif" alt="הכנס תמונה" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_code"><img src="http://static.fresh.co.il/images/vBulletin/editor/code.gif" alt="עטוף תגי [CODE]" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_php"><img src="http://static.fresh.co.il/images/vBulletin/editor/php.gif" alt="עטוף תגי [PHP]" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_youtube"><img src="http://www.fresh.co.il/vBulletin/images/freshicons/youtube.gif" alt="עטוף תגי [YOUTUBE] סביב טקסט נבחר" title="עטוף תגי [YOUTUBE] סביב טקסט נבחר" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_spoiler"><img src="http://uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_tex"><img src="http://uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" /></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<style type="text/css"><!--#vBulletin_editor {background: #ECE9D8;padding: 0px;}.imagebutton {background: #ECE9D8;color: #000000;padding: 1px;border: none;}.ocolor, .ofont, .osize, .osmilie, .osyscolor, .smilietitle {background: #FFFFFF;color: #000000;border: 1px solid #FFFFFF;}.popup_pickbutton {border: 1px solid #FFFFFF;}.popup_feedback {background: #FFFFFF;color: #000000;border-right: 1px solid #FFFFFF;}.popupwindow {background: #FFFFFF;}#fontOut, #sizeOut, .popup_feedback div {background: #FFFFFF;color: #000000;}.alt_pickbutton {border-left: 1px solid #ECE9D8;}.zibymenu{font: 11px tahoma;cursor: default;text-align: center;margin-top: 4px;height: 20px;}--></style><div class="imagebutton" style="left:0px" id="cmd_smilie"><table cellpadding="0" cellspacing="0" border="0"><tr><td><img src="http://uploaded.fresh.co.il/2008/02/13/90378390.gif" alt="הכנס סמיילי" width="21" height="20" /></td><td class="alt_pickbutton"><img src="http://static.fresh.co.il/images/vBulletin/editor/menupop.gif" alt="פתח תפריט" width="11" height="16" /></td></tr></table></div><!-- START SMILIES POPUP --><div id="popup_smilie" class="popupwindow" style="width:150px; height:220px; display:none; position:absolute; top:21px; filter:alpha(enabled=1,opacity=100)"><table id="smilietable" cellpadding="0" cellspacing="0" border="0" width="133"><tr><td class="thead" style="padding:0px">פרצופים</td></tr><tr><td class="osmilie" id="smilie_68"><img src="images/freshsmilies/rotfl.gif" alt="ROTFL" /> ROTFL</td></tr><tr><td class="osmilie" id="smilie_78"><img src="images/freshsmilies/ten.gif" alt="עשר" /> עשר</td></tr><tr><td class="osmilie" id="smilie_3"><img src="images/smilies/biggrin.gif" alt="Big Grin" /> Big Grin</td></tr><tr><td class="osmilie" id="smilie_11"><img src="images/smilies/frown.gif" alt="Frown" /> Frown</td></tr><tr><td class="osmilie" id="smilie_19"><img src="images/freshsmilies/blink.gif" alt="מצמוץ" /> מצמוץ</td></tr><tr><td class="osmilie" id="smilie_27"><img src="images/freshsmilies/crazy.gif" alt="משוגע" /> משוגע</td></tr><tr><td class="osmilie" id="smilie_35"><img src="images/freshsmilies/fresh.gif" alt="פרש" /> פרש</td></tr><tr><td class="osmilie" id="smilie_50"><img src="images/freshsmilies/kiss.gif" alt="נשיקה" /> נשיקה</td></tr><tr><td class="osmilie" id="smilie_85"><img src="images/freshsmilies/wink2.gif" alt="קורץ 2" /> קורץ 2</td></tr><tr><td class="osmilie" id="smilie_2"><img src="images/smilies/redface.gif" alt="Embarrassment" /> Embarrassment</td></tr><tr><td class="osmilie" id="smilie_10"><img src="images/smilies/confused.gif" alt="Confused" /> Confused</td></tr><tr><td class="osmilie" id="smilie_18"><img src="images/freshsmilies/bigsmile.gif" alt="יאמי" /> יאמי</td></tr><tr><td class="osmilie" id="smilie_26"><img src="images/freshsmilies/cool2.gif" alt="cool" /> cool</td></tr><tr><td class="osmilie" id="smilie_34"><img src="images/freshsmilies/flue.gif" alt="שפעת" /> שפעת</td></tr><tr><td class="osmilie" id="smilie_42"><img src="images/freshsmilies/happy.gif" alt="שמח" /> שמח</td></tr><tr><td><hr /></td></tr><tr><td class="zibymenu" onclick="window.open('+smwin[0]+edmode+smwin[1]+')" style="padding:0px">מציג 15 סמיילים מתוך 90 בסך הכל.<br />-- הצג את כל הסמיילים --</td></tr></table></div><!-- END SMILIES POPUP -->';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton" id="cmd_wrap0_smileysign"><img src="http://uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" /></div>';
	}

	else {
		// 'standard editor' mode.
		var edmode="0',";
		var j=0;
		var vbcmds = new Array(
			"namedlink('URL')",
			"return vbcode('IMG', 'http://')",
			"return vbcode('CODE', '')",
			"return vbcode('PHP', '')",
			"return vbcode('YOUTUBE', '', 0)",
			"return vbcode('SPOILER', '')",
			"return vbcode('TEX', '')",
			"return vbcode('SMILEYSIGN', '')"
		);
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://static.fresh.co.il/images/vBulletin/editor/createlink.gif" alt="הכנס תמונה" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://static.fresh.co.il/images/vBulletin/editor/insertimage.gif" alt="הכנס תמונה" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://static.fresh.co.il/images/vBulletin/editor/code.gif" alt="עטוף תגי [CODE]" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://static.fresh.co.il/images/vBulletin/editor/php.gif" alt="עטוף תגי [PHP]" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://www.fresh.co.il/vBulletin/images/freshicons/youtube.gif" alt="עטוף תגי [YOUTUBE] סביב טקסט נבחר" title="עטוף תגי [YOUTUBE] סביב טקסט נבחר" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" width="6" height="20" />';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="window.open('+smwin[0]+edmode+smwin[1]+')"><img src="http://uploaded.fresh.co.il/2008/02/13/90378390.gif" alt="פתיחת חלון להוספת סמיילים" title="פתיחת חלון להוספת סמיילים" width="21" height="20" border="0" /></a></div>';
		controlbar.insertCell(i++).innerHTML='<div class="imagebutton"><a onclick="'+vbcmds[j++]+'"><img src="http://uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" border="0" /></a></div>';
	}

}


/* link to the file uploading system. */
if (document.getElementById("vBulletin_editor")) {
	var qrtable = document.getElementById("vBulletin_editor").parentNode.parentNode;
	qrtable.insertRow(2).insertCell(0).innerHTML='<center><a href="javascript:makeUpload()">לחץ כאן להעלאת קובץ</a><br /><a href="javascript:openSearchWindow()">לחץ כאן לחיפוש העלאות קודמות</a></center>';
}


/* resizable textarea */
if (document.getElementById("vBulletin_editor")) {

	var messagebox = document.getElementById("vBulletin_editor");

	// 'full wysiwyg' mode.
	if (editormode == 2) {
		var resizecmd = new Array(
			"return alter_box_height('htmlbox', 100)",
			"return alter_box_height('htmlbox', -100)",
			"return alter_box_width('htmlbox', 300)",
			"return alter_box_width('htmlbox', -300)"
		);
	}

	// 'standard editor' mode.
	else {
		var resizecmd = new Array(
			"return alter_box_height('qr_message', 100)",
			"return alter_box_height('qr_message', -100)",
			"return alter_box_width('qr_message', 300)",
			"return alter_box_width('qr_message', -300)"
		);
	}

	// insert resizing buttons.
	var tmpnode = messagebox.appendChild(document.createElement('div'));
	tmpnode.setAttribute('class', 'smallfont');
	tmpnode.style.cssFloat = "right";
	tmpnode.innerHTML='<a onclick="'+resizecmd[0]+'" href="#">הגדל</a>&nbsp;<a onclick="'+resizecmd[1]+'" href="#">הקטן</a>';

	tmpnode = messagebox.appendChild(document.createElement('div'));
	tmpnode.setAttribute('class', 'smallfont');
	tmpnode.style.cssFloat = "left";
	tmpnode.innerHTML='<a onclick="'+resizecmd[3]+'" href="#">«</a>&nbsp;<a onclick="'+resizecmd[2]+'" href="#">»</a>';

}


/* functions! */

function openSearchWindow() {
	searchsystem = window.open("/scripts/upload.php?do=search","searchsystem","width=1000,height=700,scrollbars=1");
	searchsystem.location.href = "/scripts/upload.php?do=search";
	if (searchsystem.opener == null) searchsystem.opener = window;
}
function alter_box_width(boxid, pixelvalue) {
	var dabox = document.getElementById(boxid);
	var boxwidth = parseInt(dabox.style.width);
	var newwidth = boxwidth + pixelvalue;
	if (newwidth > 400 && newwidth < screen.width) dabox.style.width = newwidth + "px";
	return false;
}

// for firefox
if (isFF) {
	unsafeWindow.openSearchWindow = openSearchWindow;
	unsafeWindow.alter_box_width = alter_box_width;
}

