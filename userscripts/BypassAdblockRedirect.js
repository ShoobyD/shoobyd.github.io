// ==UserScript==
// @name         Bypass Adblock Redirect
// @version      0.2
// @description  bypass redirecting when adblock is detected
// @author       Baruch Mustakis (a.k.a. ShoobyD)
// @include      *themarker.com*
// @include      *globes.co.il*
// @run-at       document-start
// ==/UserScript==

//# sourceURL=UserScripts/BypassAdblockRedirect.js

( function() {
	'use strict';

	const log = console.log.bind( console );

	if ( /themarker\.com/.test( location.host ) )
		unsafeWindow.canRunAds = true;

	if ( /globes\.co\.il/.test( location.host ) )
		document.blocked_var = true;

} )();

