
// ==UserScript==
// @name         Pic-Time TestQA Redirect
// @version      0.3
// @description  try to take over the world!
// @author       ShoobyD
// @include      *.pic-time.com/*
// @run-at       document-start
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_TestQA_Redirect.js

( function() {
	'use strict';

	if ( !/\.dev\d?\.pic-time\.com/.test( location.host ) ) {
		location.host = location.host.replace( '.pic-time', '.dev.pic-time' );
	}
} )();

