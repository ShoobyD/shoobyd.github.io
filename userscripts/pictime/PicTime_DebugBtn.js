
// ==UserScript==
// @name         Pic-Time Debugging Button
// @version      0.10
// @description  try to take over the world!
// @author       ShoobyD
// @include      *.pic-time.com/*
// @include      *.pic-times.com/*
// @include      *.lifetouch.com/*
// @include      *.passgallery.com/*
// @include      *.jcpportraits.com/*
// @exclude      */tests.pic-time.com/*
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_DebugBtn.js

( function() {
	'use strict';

	if ( /brandonwalsh/.test( location.hostname ) ) return;

	if ( !unsafeWindow.$ ) return;

	const  log = console.log.bind( console );

	if ( /debugging=yaa-man/.test( location.search ) ) return;

	const debug_icon = `
		data:image/png;base64,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
	`;
	log( 'Pic-Time Debugging Button' );
	AddBtn();

	function AddBtn() {
		unsafeWindow.$( '<button id="pictime_dbg">' )
			.html( 'Debug' )
			.css( {
				'position'            : 'absolute',
				'left'                : 160,
				'top'                 : -4,
				'font-size'           : 15,
				'color'               : 'Black',
				'cursor'              : 'pointer',
				'padding'             : '8px 16px 8px 38px',
				'border'              : '2px solid Black',
				'border-radius'       : '0 0 15px 15px',
				'background'          : 'White',
				'background-repeat'   : 'no-repeat',
				'background-size'     : 24,
				'background-position' : '8px, center',
				'background-image'    : `url( ${ debug_icon } )`,
				'z-index'             : 999999,
			} )
			.click( DebugMe )
			.prependTo( document.body );
	}

	function DebugMe() {
		location.search += ( location.search? '&': '' ) + 'debugging=yaa-man';
	}

} )();

