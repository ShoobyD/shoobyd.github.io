
// ==UserScript==
// @name         Pic-Time TestQA Redirect
// @version      0.2
// @description  try to take over the world!
// @author       ShoobyD
// @include      *testqa.pic-time.com/*
// @run-at       document-start
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_TestQA_Redirect.js

( function() {
	'use strict';

	location.host = location.host.replace( 'test', 'dev' );

} )();

