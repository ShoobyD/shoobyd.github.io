<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="he" xml:lang="he" dir="rtl">
	<head>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<meta name="author" content="Baruch Mustakis, aka ShoobyD" />
		<meta name="description" content="תוספים דפדפן לאתר פרש" />
		<meta name="keywords" content="Baruch Mustakis ברוך מוסטקיס add-ons תוסף תוספים greasemonky גריזמונקי firefox פיירפוקס opera אופרה scripts סקריפטים סקריפט fresh פרש" />
		<!-- revised: 13/10/2013 (scheme: dd/mm/yyyy) -->
		
		<title>ICMP Tunnel</title>
		
		<link href="/assets/styles/main.css" rel="stylesheet" type="text/css" />
		<!--[if lt IE 7]><link rel="stylesheet" type="text/css" href="/assets/styles/iestyleshit.css" /><![endif]-->
		<!--[if lt IE 7]><script defer type="text/javascript" src="/assets/styles/pngfix.js"></script><![endif]-->
		<style type="text/css" title="StyleSheet">
			#files {
				padding-right: 24px;
			}
			.introsect, .section {
				margin: 42px 0 !important;
			}
			code {
				direction: ltr;
				font:      12pt monospace;
			}
		</style>
		<link rel="stylesheet" href="/assets/lib/highlight.js/styles/zenburn.css">
		<script src="/assets/lib/highlight.js/highlight.pack.js"></script>
		<script>hljs.initHighlightingOnLoad();</script>
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
						<li><a href="/fresh/" title="דברים לאתר פרש">דברים לאתר <span class="fresh">פרש</span></a></li>
						<li><a href="/balloonz/" title="balloonz – משחק בלונים">באלונז</a></li>
						<li class="locus">ICMP Tunnel</li>
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
				<script defer type="text/javascript" src="/assets/scripts/menu.js"></script>
			</div>
			<div id="main-content">
				<div class="introsect">
					<h2>ICMP Tunnel</h2>
					<p>יישום העברת קבצים אמינה מעל פרוטוקול ICMP, ותחת ערבול payload.</p>
					<p id="files"><a href="icmp_tunnel.zip" style="font-style: italic;" >הורדה</a> <small>(zip)</small>; <a href="README.pdf" style="font-style: italic;" >קרא־אותי</a> <small>(pdf)</small>.</p>
				</div>
				<div id="TOC">
					<h3>תוכן</h3>
					<ul>
						<li><a href="#client" title="קוד לקוח">קוד לקוח</a></li>
						<li><a href="#server" title="קוד שרת">קוד שרת</a></li>
						<li><a href="#module" title="קוד מודול">קוד מודול</a></li>
					</ul>
				</div>
				<ul>
					<li id="client" class="section">
						<h3>קוד לקוח (cxicmp.py)</h3>
						<pre><code class="python"><?php
								$balloonz_code = file_get_contents( 'cxicmp.py' );
								$balloonz_code = str_replace( array( '<', '>' ), array( '&lt;', '&gt;' ), $balloonz_code );
								echo $balloonz_code;
							?></code></pre>
						<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
					</li>
					<li id="server" class="section">
						<h3>קוד שרת (sxicmp.py)</h3>
						<pre><code class="python"><?php
								$balloonz_code = file_get_contents( 'sxicmp.py' );
								$balloonz_code = str_replace( array( '<', '>' ), array( '&lt;', '&gt;' ), $balloonz_code );
								echo $balloonz_code;
							?></code></pre>
						<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
					</li>
					<li id="module" class="section">
						<h3>קוד מודול (icmp_tunnel.py)</h3>
						<pre><code class="python"><?php
								$balloonz_code = file_get_contents( 'icmp_tunnel.py' );
								$balloonz_code = str_replace( array( '<', '>' ), array( '&lt;', '&gt;' ), $balloonz_code );
								echo $balloonz_code;
							?></code></pre>
						<div class="uplink"><a href="#TOC" title="חזרה לתוכן העניינים">חזרה למעלה</a></div>
					</li>
				</ul>
			</div>
<?php
	require( '/home/a9577381/public_html/assets/template/footer.php' );
?>
