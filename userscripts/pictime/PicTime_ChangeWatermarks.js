
// ==UserScript==
// @name         Pic-Time Change Watermarks
// @version      0.21
// @description  try to take over the world!
// @author       ShoobyD
// @include      *.pic-time.com/*
// @include      *.pic-times.com/*
// @include      *.passgallery.com/*
// @include      *.jcpportraits.com/*
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_ChangeWatermarks.js

( function() {
	'use strict';

	if ( !unsafeWindow.$ ) return;

	const $          = unsafeWindow.$;
	const log        = console.log.bind( console );
	let $watermarks, wmObj, dialog, select;

	const loop = setInterval( function() {
		$watermarks = $( '.watermark' );
		if ( !$watermarks.length ) return;
		init();
		clearInterval( loop );
	}, 500 );

	function init() {

		log( 'Pic-Time Change Watermarks' );
		wmObj  = {
			'watermark0'  :  'None',
			'watermark2'  :  'Bottom left corner',
			'watermark3'  :  'Bottom center',
			'watermark4'  :  'Bottom right corner',
			'watermark5'  :  'Center',
			'watermark6'  :  'Lower left',
			'watermark7'  :  'Lower right',
			'watermark8'  :  'Snap bottom right',
			'watermark9'  :  'Snap bottom left',
			'watermark10' : 'Tiled',
		};
		select = new Select( $watermarks.attr( 'class' ).match( /watermark\d/ )[ 0 ] );
		dialog = new Dialog( [ 'Choose new watermark:', select.$obj ] );

		$( document ).keypress( function( e ) {
			if ( e.shiftKey && e.which === KEYCODES.w )
				dialog.open();
		} );

	}

	function Select( currentWM ) {

		const $obj = $( '<select>' )
			.css( {
				'display'   : 'block',
				'width'     : '100%',
				'margin'    : '12px 0',
				'font-size' : 17,
			} )
			.change( function( e ) {
				setWatermark( $( this ).val() )
			} );
		for ( let w in wmObj )
			$obj.append( `<option value="${ w }">${ wmObj[ w ] }</option>` );
		$obj.find( `[value="${ currentWM }"]` ).prop( 'selected', 'selected' );

		return {
			$obj,
		};

	}

	function setWatermark( newWM ) {
		$( '.watermark' )
			.removeClass( ( i, c ) => ( c.match( /watermark\d+/g ) || [] ).join( ' ' ) )
			.addClass( typeof newWM === 'number'? `watermark${ newWM }`: newWM || 'watermark0' );
	}



	/*==*==*==*==*==*==*==*==*
	 *     General Utils     *
	 *==*==*==*==*==*==*==*==*/

	/*
	 * KeyCodes constants
	 */
	const KEYCODES    = {

		'BACKSPACE' : 8,
		'BKSP'      : 8,
		'DELETE'    : 46,
		'ESC'       : 27,
		'ESCAPE'    : 27,
		'SPACE'     : 32,

		'TAB'       : 9,
		'ENTER'     : 13,

		'SHIFT'     : 16,
		'CTRL'      : 17,
		'CONTROL'   : 17,
		'ALT'       : 18,

		'C'         : 67,
		'COPY'      : 67,
		'V'         : 86,
		'PASTE'     : 86,
		'w'         : 87,

		'PAGEUP'    : 33,
		'PAGEDOWN'  : 34,
		'END'       : 35,
		'HOME'      : 36,

		'F1'        : 112,
		'F12'       : 123,

		'LEFT'      : 37,
		'UP'        : 38,
		'RIGHT'     : 39,
		'DOWN'      : 40,

		'NUM0'      : 48,
		'NUM9'      : 57,
		'NUMPAD0'   : 96,
		'NUMPAD9'   : 105,

	};

	/*
	 * jQuery extend
	 */
	$.fn.extend( {
		'isOrHas' : function( elm ) {
			elm = elm || document.activeElement;
			return this.is( elm ) || this.has( elm ).length;
		},
	} );

	/*
	 * Dialog
	 */
	function Dialog( msg ) {

		const $dialog   = $( '<dialog>' )
			.appendTo( document.body );

		const $content  = $( '<div class="content">' )
			.html( msg )
			.click( selectText )
			.appendTo( $dialog );

		const $closeBtn = $( '<button>' )
			.addClass( 'closeBtn' )
			.html( 'Close' )
			.click( close )
			.appendTo( $dialog );
		$( '<style>' )
			.html( `
				/** dialog **/
				dialog {
					position        : fixed;
					margin          : auto;
					padding         : 32px;
					top             : 50%;
					transform       : translateY( -50% );
					z-index         : 999999;
				}
				dialog .closeBtn {
					display         : block;
					margin          : 24px auto 0;
					padding         : 7px;
				}
				dialog .content {
					font-size       : 24px;
					font-family     : consolas, monospace;
					text-align      : justify;
					text-align-last : justify;
				}` )
			.appendTo( 'head' );

		$( document )
			.click( function( e ) {
				if ( !$dialog.isOrHas( e.target ) ) close();
			} )
			.keydown( function( e ) {
				if ( e.which === KEYCODES.ESC ) close();
			} );

		function selectText() {

			getSelection().selectAllChildren( $content[ 0 ] );

		}

		function open( msg ) {

			if ( msg ) $content.html( msg );
			$dialog.prop( 'open', true );

		}

		function close() {

			$dialog.prop( 'open', false );

		}

		return {
			open,
			close,
		};

	}

} )();

