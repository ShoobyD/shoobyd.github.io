// ==UserScript==
// @name         Blender Filtering
// @version      0.25
// @description  try to take over the world!
// @author       ShoobyD
// @match        *.blender.co.il/*
// ==/UserScript==

//# sourceURL=UserScripts/BlenderFilter.js

( function() {
	'use strict';

	const $   = unsafeWindow.$;
	const log = console.log.bind( console );

	const $auctions_filters = $( '#auctions-filter' );
	const $market_filters   = $( '#marketfilter' );

	if ( !$auctions_filters.length ) return;

	return;

	$.fn.dataTable.ext.search.push( function( settings, data, dataIndex ) {
		const insurance = parseFloat( data[ 6 ] );
		const interest  = parseFloat( data[ 7 ] );
		return !isFilteredReblend || insurance < 3 && interest > 9;
	} );




	function getNum( str ) {
		return parseInt( str.replace( /[^\d\.\,]+/g, '' ) );
	}
	function getFloat( str ) {
		return parseFloat( str.replace( /[^0-9.]/g, '' ).trim() );
	}

	const $durVal   = $auctions_filters.find( '#filterval1' );
	const $priceVal = $auctions_filters.find( '#filterval2' );

	const d_arr = $( '#savingsinfo2 table td:nth-child(3)' ).map( function() {
			return getNum( $( this ).text() );
		} ).toArray();
	const p_arr = $( '#savingsinfo2 table td:nth-child(4)' ).map( function() {
			return getNum( $( this ).text() );
		} ).toArray();
	const r_arr = $( '#savingsinfo2 table td:nth-child(7)' ).map( function() {
			return getFloat( $( this ).text() );
		} ).toArray();
	const min_durat = Math.min( ...d_arr );
	const max_durat = Math.max( ...d_arr );
	const min_price = Math.min( ...p_arr );
	const max_price = Math.max( ...p_arr );
	const min_rate  = 0;
	const max_rate  = Math.max( ...r_arr );

	const duration = $auctions_filters.find( '#sliderFilter1' )
						.slider( 'option', 'range', true )
						.slider( 'option', 'slide', ( event, ui ) => {
							$durVal.text( ui.values.join( '–' ) + " " + months_i18n );
						} )
						.slider( 'option', 'values', [ min_durat, max_durat ] )
						.slider( 'option', 'values' );
	const s_price  = $auctions_filters.find( '#sliderFilter2' )
						.slider( 'option', 'range', true )
						.slider( 'option', 'slide', ( event, ui ) => {
							$priceVal.text( ui.values.join( '–' ) + " " + curr_i18n   );
						} )
						.slider( 'option', 'values', [ min_price, max_price ] )
						.slider( 'option', 'values' );
	const $c_rate  = $auctions_filters.find( '#sliderFilter3' );

	FilterResult = function() {

		const d_min = duration[ 0 ];
		const d_max = duration[ 1 ];
		const p_min = s_price[ 0 ];
		const p_max = s_price[ 1 ];
		const rate  = $c_rate.slider( 'option', 'value' );

		$( '#offerTable_market tr' )
			.show()
			.each( function() {

				const $this = $( this );
				const $d_td = $this.find( 'td:nth-child( 3 )' );
				const $p_td = $this.find( 'td:nth-child( 4 )' );
				const $r_td = $this.find( 'td:nth-child( 7 )' );

				const d_value = getNum( $d_td.text() );
				const p_value = getNum( $p_td.text() );
				const r_value = getFloat( $r_td.text() );

				if (
					d_value < d_min || d_max < d_value ||
					p_value < p_min || p_max < p_value ||
					r_value < rate
				) $this.hide();

			} );

		/*
		$( '#offerTable_market' ).removeClass( 'table-striped' );
		if ( typeof ( updateScroll ) != 'undefined' ) {
			updateScroll( $( document ).find( $( '.scroll-pane' ) ) );
		}
		*/

	}

	$( '<style>' ).append( `
			.ui-slider .ui-slider-range {
				background       : #3fc380 !important;
			}
			.slider-single-spot .ui-slider {
				background-color : #858585 !important;
			}
		` )
		.appendTo( document.head );

} )();

