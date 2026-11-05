'use strict';

{

	/* data */
	const menu_items = {
		'lsections' : {
			'title' : 'תפריט',
			'items' : [
				{
					'url'   : '/',
					'title' : 'עמוד הראשי',
				},
				{
					'url'   : '/sudoku/',
					'title' : 'פותר סודוקו',
				},
				{
					'url'   : '/balloonz/',
					'title' : 'balloonz',
				},
				{
					'url'   : '/icmptunnel/',
					'title' : 'ICMP Tunnel',
				},
				{
					'url'   : '/fresh/',
					'title' : 'דברים לאתר פרש',
				},
				{
					'url'   : '/calhobb/',
					'title' : 'קלווין והובס',
				},
				{
					'url'   : '/contact/',
					'title' : 'צור קשר',
				},
			],
		},
		'lresources' : {
			'title' : 'קישורים חיצוניים',
			'items' : [
				{
					'url'   : 'https://math.biu.ac.il/',
					'title' : 'המחלקה למתמטיקה',
				},
				{
					'url'   : 'https://cs.biu.ac.il/',
					'title' : 'המחלקה למדעי־המחשב',
				},
				{
					'url'   : 'https://www1.biu.ac.il/',
					'title' : 'אוניברסיטת בר־אילן',
				},
				{
					'url'   : 'https://www.fresh.co.il/vBulletin/index.php?referrerid=90538',
					'title' : 'אתר הפורומים פרש',
				},
				{
					'url'   : 'https://www.facebook.com/groups/tzayruoti/',
					'title' : 'קבוצת "ציירו אותי" בפייסבוק',
				},
			],
		},
	};

	/* build menu */
	const $menu = $( '#menu ' );
	for ( let sect in menu_items ) {

		const submenu = menu_items[ sect ];
		const $subDiv = $( `
				<div class="submenu ${ sect }">
					<h3>${ submenu.title }</h3>
					<ul>
				</div>
			` )
			.appendTo( $menu );

		const $subUL  = $subDiv.find( 'ul' );

		for ( let item of submenu.items )
			$subUL.append( `<li><a href="${ item.url }" title="${ item.title }">${ item.title }</a></li>` );

	}

	/* locus */
	$menu.find( `li:has(a[href="${ location.pathname }"])` )
		.addClass( 'locus' )
		.find( 'a' ).contents().unwrap();

	/* special styling */
	$menu.find( 'a:contains("פרש")' )
		.html( function() {
			return $( this ).html().replace( /פרש/g, '<span class="fresh">פרש</span>' )
		} );
	$menu.find( 'a:contains("פייסבוק")' )
		.html( function() {
			return $( this ).html().replace( /פייסבוק/g, '<span class="facebook">פייסבוק</span>' )
		} );
	$menu.find( 'a:contains("קלווין")' )
		.append( '&nbsp;<span class="oldsec">(ישן)</span>' );

	/* event handlers */
	$menu.find( 'li:has(a)' ).click( function() {
		$( this ).find( 'a' )[ 0 ].click();
	} );
	$menu.find( '.lresources a' ).click( function() {
		window.open( this.href );
		return false;
	} );

}

