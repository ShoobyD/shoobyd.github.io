// ==UserScript==
// @name         MyLink Bypass
// @version      0.6
// @description  try to take over the world!
// @author       ShoobyD
// @include      *kat2.biz*
// @include      *kickass.cx*
// @include      *kickass.best*
// @include      *kickasstorrents.bz*
// @include      *kickasstorrents.bz*
// @include      *kickass2.how*
// @include      *kkickass.com*
// @include      *kkat.net*
// @include      *kickass-kat.com*
// @include      *kickasst.net*
// @include      *kickasst.org*
// @include      *kickasstorrents.id*
// @include      *thekat.cc*
// @include      *thekat.ch*
// @include      *kickass2.biz*
// ==/UserScript==

//# sourceURL=UserScripts/MyLink_Bypass.js

( function() {
	'use strict';

	const $   = unsafeWindow.$;
	const log = console.log.bind( console );

	$( 'a' ).attr( 'href', function( i, href ) {
		return decodeURIComponent( href.replace( /^https:\/\/mylink.(cx|me.uk)\/\?url\=/i, '' ) )
	} );

} )();

