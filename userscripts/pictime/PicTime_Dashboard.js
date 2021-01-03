
// ==UserScript==
// @name         Pic-Time Dashboard
// @version      0.4
// @description  try to take over the world!
// @author       ShoobyD
// @include      *.pic-time.com/professional*
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_Dashboard.js

( function() {
	'use strict';

	_pt$.bind( 'filterCategoryChanged', () => {
		( ( _dataHandler$ || {} ).dashboard || {} ).uxMessages = [];
	} );

} )();

