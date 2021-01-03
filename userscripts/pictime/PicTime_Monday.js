
// ==UserScript==
// @name         Pic-Time Monday
// @version      0.3
// @description  try to take over the world!
// @author       ShoobyD
// @include      *pic-time.monday.com/*
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_DebugBtn.js

( function() {
	'use strict';

	const myUserParam = 'userId=5816551';
	const regex       = new RegExp( myUserParam );
	if ( !regex.test( location.search ) )
		location.search += `&${ myUserParam }`;

} )();

