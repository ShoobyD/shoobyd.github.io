<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="he" xml:lang="he" dir="rtl">

	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<meta name="author" content="Baruch Mustakis, aka ShoobyD" />
		<meta name="description" content="תוספי דפדפן לאתר פרש" />
		<meta name="keywords" content="Baruch Mustakis ברוך מוסטקיס add-ons תוסף תוספים greasemonky גריזמונקי firefox פיירפוקס opera אופרה scripts סקריפטים סקריפט fresh פרש" />
		<!-- revised: 13/10/2013 (scheme: dd/mm/yyyy) -->

		<title>תוספי דפדפן לאתר פרש</title>

		<link rel="stylesheet" type="text/css" href="/assets/style/main.css" />
		<!--[if lt IE 7]><link rel="stylesheet" type="text/css" href="/assets/style/iestyleshit.css" /><![endif]-->
		<!--[if lt IE 7]><script defer src="/assets/style/pngfix.js"></script><![endif]-->
		<link rel="stylesheet" type="text/css" href="/assets/lib/lightbox/css/lightbox.css">
		<style type="text/css" title="StyleSheet">
			#main-content h2 {
				color:     #8B0000;
				font-size: 1.6em;
			}
			#main-content li {
				list-style: none;
			}
			.caption {
				color:           #8B0000;
				text-decoration: underline;
				font-weight:     bold;
			}
			.test {
				color: Red;
				font-size: 0.7em;
			}
			a:hover .test {
				color: #F08080;
			}
			.date {
				color: #006600;
				font-weight: bold;
			}
			.version {
				font-weight: bold;
			}
			.preview {
				text-align: center;
			}
			.thumb {
				width:  350px;
				border: 2px solid black;
			}
			/* DarkRed = #8B0000; DarkGreen = #006400;
			   LightCoral = #F08080; Indigo = #4B0082; */
		</style>
	</head>

	<body>
		<div id="container">
			<div id="pageHeader">
				<h1><a href="/" title="לוגו האתר by Phillip Martin"><img src="/assets/images/math_logo.png" alt="לוגו האתר by Phillip Martin" /></a>
				<img src="/assets/images/header.png" alt="ברוכים הבאים לאתר של ברוך מוסטקיס" /></h1>
			</div>
			<div id="menu">
				<div id="lsections" class="submenu">
					<h3>תפריט:</h3>
					<ul>
						<li><a href="/" title="לעמוד הראשי">עמוד ראשי</a></li>
						<li class="locus">דברים לאתר פרש</li>
						<li><a href="/balloonz/" title="balloonz – משחק בלונים">באלונז</a></li>
						<li><a href="/icmptunnel/" title="ICMP Tunnel">ICMP Tunnel</a></li>
						<li><a href="/calhobb/" title="קלווין והובס">קלווין והובס <span class="oldsec">(ישן)</span></a></li>
						<li><a href="/contact/" title="צור קשר">צור קשר</a></li>
					</ul>
				</div>
				<div id="lresources" class="submenu">
					<h3>קישורים חיצוניים:</h3>
					<ul>
						<li><a href="http://www.math.biu.ac.il/" title="המחלקה למתמטיקה" onclick="window.open(this.href); return false;">המחלקה למתמטיקה</a></li>
						<li><a href="http://www.cs.biu.ac.il/" title="המחלקה למדעי־המחשב" onclick="window.open(this.href); return false;">המחלקה למדעי־המחשב</a></li>
						<li><a href="http://www1.biu.ac.il/" title="אתר אוניברסיטת בר־אילן" onclick="window.open(this.href); return false;">אתר אוניברסיטת בר־אילן</a></li>
						<li><a href="http://www.fresh.co.il/vBulletin/index.php?referrerid=90538" title="לדף הבית של פורום פרש" onclick="window.open(this.href); return false;">אתר הפורומים <span class="fresh">פרש</span></a></li>
						<li><a href="https://www.facebook.com/groups/tzayruoti/" title="קבוצת 'ציירו אותי' בפייסבוק" onclick="window.open(this.href); return false;">קבוצת <em>'ציירו אותי'</em> ב<span class="facebook">פייסבוק</span></a></li>
					</ul>
				</div>
				<script defer src="/assets/scripts/menu.js"></script>
			</div>
			<div id="main-content">
				<div class="introsect">
					<h2>תוספי דפדפן לאתר פרש</h2>
					<p>
						התוספים הם עבור אתר הפורומים <a href="http://www.fresh.co.il/vBulletin/index.php?referrerid=90538" title="לדף הבית של פורום פרש" onclick="window.open(this.href); return false;"><span class="fresh">פרש</span></a>, ונועדו לגלישה נוחה יותר שם.<br/>
						התוספים מתאימים לכל דפדפן המאפשר הרצת סקריפטי <a href="http://he.wikipedia.org/wiki/JavaScript" onclick="window.open(this.href); return false;">JavaScript</a> חיצוניים.<br/>
						<a href="http://www.fresh.co.il/vBulletin/showthread.php?t=390266&amp;referrerid=90538" onclick="window.open(this.href); return false;">קישור לאשכול התוספים הרשמי.</a>
					</p>
				</div>
				<div id="TOC">
					<h3>תוכן</h3>
					<ul>
						<li><a href="#requirements" title="דרישות לסקריפטים">דרישות</a></li>
						<li><a href="#script1" title="הרחבה לתגובה המהירה">הרחבה לתגובה המהירה</a></li>
						<li><a href="#script2" title="כפתורי תגובה מהירה">כפתורי תגובה מהירה</a></li>
						<li><a href="#script3" title="הרחבה לתגובה הרגילה">הרחבה לתגובה הרגילה</a></li>
						<li><a href="#script4" title="הרחבה להודעות פרטיות">הרחבה להודעות פרטיות</a></li>
						<li><a href="#script5" title="העלאת קבצים מובנית">העלאת קבצים מובנית</a></li>
						<li><a href="#script6" title="עריכה מהירה">עריכה מהירה</a></li>
						<li><a href="#script7" title="אישור קריאת הודעה פרטית">אישור קריאת הודעה פרטית</a></li>
						<li><a href="#script8" title="כלי הודעות פרטיות">כלי הודעות פרטיות</a></li>
						<li><a href="#script9" title="נושא בתגובה המהירה">נושא בתגובה המהירה</a></li>
					</ul>
				</div>
				<div id="requirements" class="section">
					<h3>דרישות</h3>
					<p style="line-height: 1.3em;">
						עבור הדפדפן <a href="http://he.wikipedia.org/wiki/מוזילה_פיירפוקס" onclick="window.open(this.href); return false;">פיירפוקס</a>, הסקריפטים דורשים שהתוסף <a href="https://addons.mozilla.org/en-US/firefox/addon/748" onclick="window.open(this.href); return false;">Greasemonkey</a> יהיה מותקן.<br/><br/>
						עבור הדפדפן <a href="http://he.wikipedia.org/wiki/אופרה_(דפדפן)" onclick="window.open(this.href); return false;">אופרה</a>, צריך רק להעתיק את הקבצים לתיקייה שהוגדרה כ-userjs.<br/>
						<span style="font-style: italic;">(בחלון ההעדפות: לשונית Advanced, חלק ה-Content, כפתור 'JavaScript Options...&lrm;', תחת 'User JavaScript files'.)</span><br/><br/>
						עבור הדפדפן <a href="http://he.wikipedia.org/wiki/Internet_Explorer" onclick="window.open(this.href); return false;">אינטרנט אקספלורר</a>, גרסא 6 ומעלה, ניתן בעקרון להשתמש בתוכנה <a href="http://en.wikipedia.org/wiki/IE7Pro" onclick="window.open(this.href); return false;">IEPro</a> להרצת סקריפטים של המשתמש, צריך רק לשנות את סיומת הקבצים מ-<span style="font-style: italic;">'&lrm;.user.js'</span> ל-<span style="font-style: italic;">'&lrm;.ieuser.js'</span>, עם זאת, אצלי לא הכל צלח...<br/><br/>
						חלק מהתוספים עובדים גם בדפדפן <a href="http://he.wikipedia.org/wiki/גוגל_כרום" onclick="window.open(this.href); return false;">גוגל כרום</a>. פרטים בהמשך.
						<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
					</p>
				</div>
				<div id="script1" class="section">
					<h3>הרחבה לתגובה המהירה</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_quick_reply_supersize.png" data-lightbox="quick_reply" data-title="תגובה מהירה – סופר סייז">
									<img class="thumb" src="images/fresh_quick_reply_supersize.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">2.3</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> מוסיף פונקציות נוספות לעורך התגובה המהירה, כגון:<br/>
						כפתורי הוספת קישור, תמונה, PHP, קוד, סרטוני יוטיוב, ספויילרים, <img src="LaTeX.gif" alt="לוגו לאטך" />, סמיילים, והסמיילי מחזיק השלט (של שימי)<br/>
						קישורים למערכת העלאת הקבצים ולמערכת חיפוש ההעלאות<br/>
						אפשרות לשנות את גודל שדה הכתיבה</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_quick_reply.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
						<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script2" class="section">
					<h3>כפתורי תגובה מהירה</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_qr_buttons_up.png" data-lightbox="qr_buttons" data-title="כפתורי תגובה מהירה – למעלה">
									<img class="thumb" src="images/fresh_qr_buttons_up.png" />
								</a>
								<a href="images/fresh_qr_buttons_down.png" data-lightbox="qr_buttons" data-title="כפתורי תגובה מהירה – למטה">
									<img class="thumb" src="images/fresh_qr_buttons_down.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">2.2</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> הוספת כפתורי התגובה המהירה בתחתית ובחלק העליון של האשכול.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_qr_buttons.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script3" class="section">
					<h3>הרחבה לתגובה הרגילה</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_extended_reply.png" data-lightbox="extended_reply" data-title="הרחבה לתגובה הרגילה">
									<img class="thumb" src="images/fresh_extended_reply.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.4</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> התוסף מוסיף את התגים החסרים וגם אפשרות להגדיל את אזור הטקסט בצורה אופקית.<br/>
						מתקן גם את גודל חלון הסמיילים..<br/>
						עובד גם בדף פתיחת אשכול חדש.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_extended_reply.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script4" class="section">
					<h3>הרחבה להודעות פרטיות</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_extended_reply.png" data-lightbox="extended_pm" data-title="הרחבה לתגובה הרגילה">
									<img class="thumb" src="images/fresh_extended_reply.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.2</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> כי מסתבר שזה לא בדיוק אותו עורך כמו התגובה הרגילה :\<br/>
						מסדר את גודל אזור הטקסט (בעורך המתקדם חצי מהשטח פשוט ריק)<br/>
						מוסיף אפשרות להגדיל את אזור הטקסט בצורה אופקית (2 מצבים: הכל או כלום..)<br/>
						לבינתיים לא מוסיף תגים מיוחדים כי ראשית כל אני לא בטוח שזה בכלל נחוץ ושנית כל התעצלתי :P<br/>
						עובד גם בעורך החתימה :)</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_extended_pm.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script5" class="section">
					<h3>העלאת קבצים מובנית</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_upsys_iframe.png" data-lightbox="upsys_iframe" data-title="העלאת קבצים מובנית">
									<img class="thumb" src="images/fresh_upsys_iframe.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">2.3</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> מוסיף את מערכת העלאת הקבצים מובנית בתוך הדף (<span style="color: #4B0082;">הקרדיט על הרעיון נתון ל-<a href="http://www.fresh.co.il/vBulletin/member.php?u=9442">The IceMan</a></span>)<br/>
						הבעיה עם הסקריפט היא שהלינקים של "הוספת התמונה" וכו' לא עובדים, אז מה שאני עושה זה להעתיק את מיקום הקישור בלינק עם שם הקובץ ולהכניס אותו ידנית (אם אני מעלה רק קובץ או שניים אז זה לא כ"כ מפריע)<br/>
						למרות שהוא לא גמור אני בכל זאת מוצא אותו שימושי ולכן העליתי אותו גם.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_upsys_iframe.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script6" class="section">
					<h3>עריכה מהירה</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_quick_edit.png" data-lightbox="quick_edit" data-title="עריכה מהירה">
									<img class="thumb" src="images/fresh_quick_edit.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.2</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> הסקריפט מוסיף כפתור של "עריכה מהירה" בכל תגובה הניתנת לעריכה<br/>
						הכפתור פותח את חלון העריכה בבלוק מרחף בתוך הדף. הבלוק גם ניתן להזזה בתוך הדף.<br/>
						חלון התגובה עצמו עדיין נטען כך שזה לא ממש מזרז את העניין, זה פשוט נותן אפשרות לערוך הודעה ולראות את האשכול בו-זמנית.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_quick_edit.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script7" class="section">
					<h3>אישור קריאת הודעה פרטית</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_pm_receipt.png" data-lightbox="pm_receipt" data-title="אישור קריאת הודעה פרטית">
									<img class="thumb" src="images/fresh_pm_receipt.png" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.1</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> מחליף את חלון בקשת אישור קריאה בצ'קבוקס, מצב ברירת המחדל הוא ללא שליחת בקשה.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_pm_receipt.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script8" class="section">
					<h3>כלי הודעות פרטיות</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_pm_toolsbox.jpg" data-lightbox="pm_toolsbox" data-title="כלי הודעות פרטיות">
									<img class="thumb" src="images/fresh_pm_toolsbox.jpg" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.1</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> מוסיף את תיבת כלי ההודעות הפרטיות לראש רשימת ההודעות.</li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_pm_toolsbox.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
				<div id="script9" class="section">
					<h3>נושא בתגובה המהירה</h3>
					<ul>
						<li>
							<div class="preview">
								<a href="images/fresh_qr_subject.gif" data-lightbox="qr_subject" data-title="נושא בתגובה המהירה">
									<img class="thumb" src="images/fresh_qr_subject.gif" />
								</a>
							</div>
						</li>
						<li><span class="caption">גרסא נוכחית:</span> <span class="version">1.2</span></li>
						<li><span class="caption">עודכן לאחרונה ב:</span> <span class="date">25/03/2011</span></li>
						<li><span class="caption">פרטים:</span> באמת צריך לפרט? :)</li>
						<li><span style="font-weight: bold;">אם בא בשילוב עם תוסף <a href="#script2" title="כפתורי תגובה מהירה">"כפתורי התגובה המהירה"</a>, אזי נדרשת גרסא 2.1 ומעלה לתוסף הכפתורים, למניעת התנגשות.</span></li>
						<li><span class="caption">הורדה:</span> [<a href="scripts/fresh_qr_subject.user.js" onclick="window.open(this.href); return false;">לינק</a>]</li>
					</ul>
					<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
				</div>
			</div>
<?php
	$end_script = '/assets/lib/lightbox/js/lightbox-plus-jquery.min.js';
	require( '/home/a9577381/public_html/assets/template/footer.php' );
?>
