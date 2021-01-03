// ==UserScript==
// @name			Shitty Sites
// @version			0.5
// @description		Fix shitty sites
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// @run-at			document-start
// @include			*www.loveroms.com*
// ==/UserScript==

//# sourceURL=UserScripts/ShittySites.js

var log     = console.log.bind( console );

if ( /www\.loveroms\.com/.test( location.host ) ) {
	Object.defineProperty( unsafeWindow, 'c799', { writable: false } );
}

