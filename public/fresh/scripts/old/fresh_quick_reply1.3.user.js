// Fresh.co.il Quick Reply
// 14/02/2008
// Copyright (c) 2008, Baruch Mustakis
//
// last updates:
// 14/02/2008	'spoiler' icon replaced.
// 13/02/2008	added: 'spoiler', 'smileysign' and 'tex' buttons. popup window for the regular smileys (not finished).
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
// @version			1.3
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// ==/UserScript==

var controlbar = document.getElementById("controlbar").getElementsByTagName("tr")[0];
var i = controlbar.getElementsByTagName("td").length;

controlbar.insertCell(i).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" height="20" width="6">';
controlbar.insertCell(i+1).innerHTML='<div class="imagebutton" id="cmd_createlink"><img src="http://static.fresh.co.il/images/vBulletin/editor/createlink.gif" alt="הכנס קישור" width="21" height="20" /></div>';
controlbar.insertCell(i+2).innerHTML='<div class="imagebutton" id="cmd_insertimage"><img src="http://static.fresh.co.il/images/vBulletin/editor/insertimage.gif" alt="הכנס תמונה" width="21" height="20" /></div>';
controlbar.insertCell(i+3).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" height="20" width="6">';
controlbar.insertCell(i+4).innerHTML='<div class="imagebutton" id="cmd_wrap0_php"><img src="http://static.fresh.co.il/images/vBulletin/editor/php.gif" alt="עטוף תגי [PHP]" width="21" height="20" /></div>';
controlbar.insertCell(i+5).innerHTML='<div class="imagebutton" id="cmd_wrap0_youtube"><img src="http://www.fresh.co.il/vBulletin/images/freshicons/youtube.gif" alt="עטוף תגי [YOUTUBE] סביב טקסט נבחר" title="עטוף תגי [YOUTUBE] סביב טקסט נבחר" width="21" height="20" /></div>';
controlbar.insertCell(i+6).innerHTML='<div class="imagebutton" id="cmd_wrap0_spoiler"><img src="http://uploaded.fresh.co.il/2008/02/14/95149184.gif" alt="עטוף תגי [SPOILER] סביב טקסט נבחר" title="עטוף תגי [SPOILER] סביב טקסט נבחר" width="21" height="20" /></div>';
controlbar.insertCell(i+7).innerHTML='<div class="imagebutton" id="cmd_wrap0_tex"><img src="http://uploaded.fresh.co.il/2008/02/13/13508904.gif" alt="הוספת נוסחא בפורמט TEX" title="הוספת נוסחא בפורמט TEX" width="21" height="20" /></div>';
controlbar.insertCell(i+8).innerHTML='<img src="http://static.fresh.co.il/images/vBulletin/editor/separator.gif" alt="" height="20" width="6">';
controlbar.insertCell(i+9).innerHTML='<style type="text/css"><!--#vBulletin_editor {background: #ECE9D8;padding: 0px;}.imagebutton {background: #ECE9D8;color: #000000;padding: 1px;border: none;}.ocolor, .ofont, .osize, .osmilie, .osyscolor, .smilietitle {background: #FFFFFF;color: #000000;border: 1px solid #FFFFFF;}.popup_pickbutton {border: 1px solid #FFFFFF;}.popup_feedback {background: #FFFFFF;color: #000000;border-right: 1px solid #FFFFFF;}.popupwindow {background: #FFFFFF;}#fontOut, #sizeOut, .popup_feedback div {background: #FFFFFF;color: #000000;}.alt_pickbutton {border-left: 1px solid #ECE9D8;}--></style><div class="imagebutton" style="left:0px" id="cmd_smilie"><table cellpadding="0" cellspacing="0" border="0"><tr><td><img src="http://uploaded.fresh.co.il/2008/02/13/90378390.gif" alt="הכנס סמיילי" width="21" height="20" /></td><td class="alt_pickbutton"><img src="http://static.fresh.co.il/images/vBulletin/editor/menupop.gif" alt="פתח תפריט" width="11" height="16" /></td></tr></table></div><!-- START SMILIES POPUP --><div id="popup_smilie" class="popupwindow" style="width:150px; height:220px; display:none; position:absolute; top:21px; filter:alpha(enabled=1,opacity=100)"><table id="smilietable" cellpadding="0" cellspacing="0" border="0" width="133"><tr><td class="thead" style="padding:0px">פרצופים</td></tr><tr><td class="osmilie" id="smilie_68"><img src="images/freshsmilies/rotfl.gif" alt="ROTFL" /> ROTFL</td></tr><tr><td class="osmilie" id="smilie_78"><img src="images/freshsmilies/ten.gif" alt="עשר" /> עשר</td></tr><tr><td class="osmilie" id="smilie_3"><img src="images/smilies/biggrin.gif" alt="Big Grin" /> Big Grin</td></tr><tr><td class="osmilie" id="smilie_11"><img src="images/smilies/frown.gif" alt="Frown" /> Frown</td></tr><tr><td class="osmilie" id="smilie_19"><img src="images/freshsmilies/blink.gif" alt="מצמוץ" /> מצמוץ</td></tr><tr><td class="osmilie" id="smilie_27"><img src="images/freshsmilies/crazy.gif" alt="משוגע" /> משוגע</td></tr><tr><td class="osmilie" id="smilie_35"><img src="images/freshsmilies/fresh.gif" alt="פרש" /> פרש</td></tr><tr><td class="osmilie" id="smilie_50"><img src="images/freshsmilies/kiss.gif" alt="נשיקה" /> נשיקה</td></tr><tr><td class="osmilie" id="smilie_85"><img src="images/freshsmilies/wink2.gif" alt="קורץ 2" /> קורץ 2</td></tr><tr><td class="osmilie" id="smilie_2"><img src="images/smilies/redface.gif" alt="Embarrassment" /> Embarrassment</td></tr><tr><td class="osmilie" id="smilie_10"><img src="images/smilies/confused.gif" alt="Confused" /> Confused</td></tr><tr><td class="osmilie" id="smilie_18"><img src="images/freshsmilies/bigsmile.gif" alt="יאמי" /> יאמי</td></tr><tr><td class="osmilie" id="smilie_26"><img src="images/freshsmilies/cool2.gif" alt="cool" /> cool</td></tr><tr><td class="osmilie" id="smilie_34"><img src="images/freshsmilies/flue.gif" alt="שפעת" /> שפעת</td></tr><tr><td class="osmilie" id="smilie_42"><img src="images/freshsmilies/happy.gif" alt="שמח" /> שמח</td></tr><tr><td><hr /></td></tr><tr><td class="otextlink" id="moresmilies" style="padding:0px">מציג 15 סמיילים מתוך 90 בסך הכל.<br />-- הצג את כל הסמיילים --</td></tr></table></div><!-- END SMILIES POPUP -->';
controlbar.insertCell(i+10).innerHTML='<div class="imagebutton" id="cmd_wrap0_smileysign"><img src="http://uploaded.fresh.co.il/2008/02/14/86716711.gif" alt="צור סמיילי עם שלט" title="יוצר סמיילי עם טקסט מותאם אישית של שימי" width="21" height="20" /></div>';


// two icons for the spoiler tag button: http://uploaded.fresh.co.il/2008/02/13/41854693.gif, http://uploaded.fresh.co.il/2008/02/13/82408617.gif, http://uploaded.fresh.co.il/2008/02/14/95149184.gif

