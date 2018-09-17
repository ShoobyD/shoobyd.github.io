'use strict';

{
	const menuTemplate = `
		<div id="lsections" class="submenu">
			<h3>תפריט:</h3>
			<ul>
				<li><a href="/" title="לעמוד הראשי">עמוד ראשי</a></li>
				<li><a href="/sudoku/" title="פותר סודוקו">פותר סודוקו</a></li>
				<li><a href="/balloonz/" title="balloonz – משחק בלונים">באלונז</a></li>
				<li><a href="/icmptunnel/" title="ICMP Tunnel">ICMP Tunnel</a></li>
				<li><a href="/fresh/" title="דברים לאתר פרש">דברים לאתר <span class="fresh">פרש</span></a></li>
				<li><a href="/calhobb/" title="קלווין והובס">קלווין והובס <span class="oldsec">(ישן)</span></a></li>
				<li><a href="/contact/" title="צור קשר">צור קשר</a></li>
			</ul>
		</div>
		<div id="lresources" class="submenu">
			<h3>קישורים חיצוניים:</h3>
			<ul>
				<li><a href="https://math.biu.ac.il/" title="המחלקה למתמטיקה" onclick="window.open(this.href); return false;">המחלקה למתמטיקה</a></li>
				<li><a href="https://cs.biu.ac.il/" title="המחלקה למדעי־המחשב" onclick="window.open(this.href); return false;">המחלקה למדעי־המחשב</a></li>
				<li><a href="https://www1.biu.ac.il/" title="אתר אוניברסיטת בר־אילן" onclick="window.open(this.href); return false;">אתר אוניברסיטת בר־אילן</a></li>
				<li><a href="https://www.fresh.co.il/vBulletin/index.php?referrerid=90538" title="לדף הבית של פורום פרש" onclick="window.open(this.href); return false;">אתר הפורומים <span class="fresh">פרש</span></a></li>
				<li><a href="https://www.facebook.com/groups/tzayruoti/" title="קבוצת 'ציירו אותי' בפייסבוק" onclick="window.open(this.href); return false;">קבוצת <em>'ציירו אותי'</em> ב<span class="facebook">פייסבוק</span></a></li>
			</ul>
		</div>
	`;

	const menu_items = Array.from( document.querySelectorAll( '#menu li' ) );
	for ( let li of menu_items )
		if ( li.querySelector('a') )
			li.addEventListener( 'click', function() { li.querySelector('a').click() } );
}

