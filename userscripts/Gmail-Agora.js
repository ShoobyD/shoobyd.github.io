// ==UserScript==
// @name         Gmail - Agora
// @version      0.54
// @description  try to take over the world!
// @author       ShoobyD
// @namespace    http://shoobyd.herobo.com/
// @include      *mail.google.com*
// @include      *www.agora.co.il*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js
// ==/UserScript==

//# sourceURL=UserScripts/Gmail-Agora.js

var log = console.log.bind( console );

( function() {
	'use strict';

	var $elm;
	if ( /mail.google.com/.test( location.host ) ) {

		$( document ).on( 'keydown', function( e ) {

			log( e.key );
			switch ( e.key ) {

				case '0':
					// Get random mail
					$elm = $( '.zA' );
					var r = Math.floor( Math.random() * $elm.length );
					$elm = $elm.eq( r );
					if ( $elm.length === 1 ) $elm.click();
					else log( $elm );
					break;

				case '1':
					// Open mail
					$elm = $( 'a' )
						.filter( ( i, x ) => /agora.co.il\/cache\/./.test( x.href ) );
					if ( $elm.length === 1 ) $elm[ 0 ].click();
					else log( $elm );
					break;

				case '2':
					// Delete mail
					$elm = $( '[role="button"][data-tooltip="Delete"]:visible' );
					if ( $elm.length !== 1 )
						$elm = $( '[role="button"][title="Delete"]:visible' );
					if ( $elm.length === 1 )
						triggerMouseClick( $elm );
					else log( $elm );
					break;

			}
		} );

	} else if ( /www.agora.co.il/.test( location.host ) ) {

		if ( $( '#unavailable, #messageBox, .frozenMessage' ).length || $( '.givenMessage' ).text() === 'החפץ נמסר' ) {
			setTimeout( _ => window.close(), 300 );
		}

	}

	function triggerMouseClick( $elm ) {
		var event = document.createEvent( 'MouseEvents' );
		[ 'mousedown', 'mouseup' ].forEach( type => {
			event.initMouseEvent( type, false, true );
			$elm[ 0 ].dispatchEvent( event );
		} );
	}

} )();


