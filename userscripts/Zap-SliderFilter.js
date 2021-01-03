// ==UserScript==
// @name			Zap - Slider Filter
// @version			0.1
// @description		Adds slider filter to numeric multiple choice on Zap.
// @author			Baruch Mustakis (a.k.a. ShoobyD)
// @include			*www.zap.co.il/*&filter2=*
// ==/UserScript==

//# sourceURL=UserScripts/Zap-SliderFilter.js

const log = console.log.bind( console );

log( 'hi!' );

const $search = $( '#filterClientSearch' );

const inputs = new function() {

	/*==*==*==*==*==*==*==*==*
	 *      Components       *
	 *==*==*==*==*==*==*==*==*/

	/*
	 * constructor Input
	 */
	function Input( obj ) {

		const $obj = $( obj );
		const val = parseInt( $obj.attr( 'aria-label' ) );

		function check( state ) {
			return $obj.prop( 'checked', typeof state === 'undefined'? true: state );
		}
		function uncheck() {
			return check( false );
		}

		/** API **/
		return {
			get value() {
				return val;
			},
			get checked() {
				return $obj.prop( 'checked' );
			},
			check,
			uncheck,
		};

	}


	const inputList = $( '.FiltersList input[type="checkbox"]' ).toArray().map( x => new Input( x ) );
	let checked = inputList.map( x => x.checked );

	function setLimit( n ) {

		for ( let x of inputList )
			x.uncheck();

		checked = inputList.filter( x => x.value >= n );
		for ( let x of checked )
			x.check();

	}

	/** API **/
	return {
		setLimit,
	};

}




