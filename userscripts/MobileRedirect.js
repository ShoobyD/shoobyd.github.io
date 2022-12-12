// ==UserScript==
// @name         Redirect Mobile Pages
// @version      0.13
// @description  redirecting mobile pages to desktop view
// @author       Baruch Mustakis (a.k.a. ShoobyD)
// @include      *.m.wikipedia.org*
// @include      *.m.wikibooks.org*
// @include      *m.facebook.com*
// @include      *graph.facebook.com*
// @include      *m.9gag.com*
// @include      *m.aliexpress.com*
// @include      *.maariv.co.il/amp/*
// @run-at       document-start
// ==/UserScript==

//# sourceURL=UserScripts/MobileRedirect.js

( function() {
	'use strict';

	const log = console.log.bind( console );

	function replaceUrl( what, who ) {
		location.assign( location.href.replace( what, who ) );
	}

	const getUrlParam = ( () => {
		const queryString = location.search.slice( 1 ).replace( /\?.*/, '' );
		const urlParams   = new URLSearchParams( queryString );
		return param => urlParams.get( param );
	} )();

	if ( /\w{2}\.m\.wiki(pedia|books)\.org/.test( location.host ) )
		replaceUrl( '.m.', '.' );

	if (
		[
			'm.9gag.com',
			'm.aliexpress.com',
		].includes( location.host )
	)
		replaceUrl( 'm.', 'www.' );

	if ( 'graph.facebook.com' == location.host )
		replaceUrl( 'graph.', 'www.' );

	if ( /maariv\.co\.il/.test( location.host ) )
		replaceUrl( '/amp/', '/' );

	if ( 'm.facebook.com' == location.host ) {
		if ( '/story.php' == location.pathname ) {
			location.assign( `${
				location.origin
					.replace( 'm.', 'www.' )
			}/${ getUrlParam( 'id' ) }/posts/${ getUrlParam( 'story_fbid' ) }` );
		} else if ( getUrlParam( 'view' ) === 'permalink' ) {
			replaceUrl( /\/\/m(\..*)\?.*/, `//www$1/permalink/${ getUrlParam( 'id' ) }/` );
		} else {
			replaceUrl( 'm.', 'www.' );
		}
	}

} )();

