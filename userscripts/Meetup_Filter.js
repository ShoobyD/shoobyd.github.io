// ==UserScript==
// @name         Meetup_Filter
// @version      0.25
// @description  Filter meetups.
// @author       Baruch Mustakis (a.k.a. ShoobyD)
// @include      *www.meetup.com/find/events/*
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/Meetup_Filter.js

( async function() {
	'use strict';

	const $         = unsafeWindow.$;
	const log       = console.log.bind( console );
	const $body     = $( 'body' );
	// const JSON_URL  = 'https://www.jsonstore.io/9e682480ba9de202720deaef9aa1e53e3cadc76d296e6ad7101c0b97a2b95015/blacklist';
	// const JSON_URL  = 'https://api.myjson.com/bins/uves6';
	const JSON_URL  = 'https://tests.pic-time.com/assets/Meetup_Filter_blacklist.json';

	const isBlackList = await ( async () => {

		let blacklist   = await fetch( JSON_URL )
			.then( response  => response.text() )
			.then( response  => JSON.parse( response ) )
			.then( response  => ( response || {} ).blacklist )
			.then( blacklist => ( blacklist || [] ).map( host => host.toLowerCase() ) );

		return host => blacklist.includes( host.toLowerCase() );

	} )();

	const setBlacklist = function() {

		$( '.event-listing' ).each( ( i, li ) => {
			const $li  = $( li );
			const host = $li.find( '[itemprop="location"] [itemprop="name"]' ).text();
			$li.toggleClass( 'blacklist', isBlackList( host ) );
		} );

		$( '.date-indicator' ).each( ( i, li ) => {
			const $li   = $( li );
			const allBL = !$li.next().has( '.event-listing:not(.blacklist)' ).length;
			$li.toggleClass( 'blacklistDate', allBL );
		} );

	};
	setBlacklist();

	new MutationSummary( {
		'rootNode' : document.body,
		'callback' : setBlacklist,
		'queries'  : [ { element : '.event-listing' } ],
	} );

	$( '<style>' ).append( `
			.motivation-section,
			.seeded-event-section,
			.activeFilter .blacklistDate,
			.activeFilter .event-listing.blacklist {
				display: none;
			}
			
			.filterSwitch {
				display: inline-block;
				vertical-align: middle;
				width: 42px;
				height: 24px;
				margin: 0 36px;
			}
			
			.filterSwitch input {
				display: none;
			}
			
			.filterSwitch .slider {
				cursor: pointer;
				width: 100%;
				height: 100%;
				background: #ccc;
				transition: .4s;
				border-radius: 24px;
			}
			
			.filterSwitch .slider:before {
				display: block;
				position: relative;
				content: "";
				height: 16px;
				width: 16px;
				top: 4px;
				left: 4px;
				background: White;
				border-radius: 50%;
				transition: .4s;
			}
			
			.filterSwitch input:checked + .slider {
				background: #2196F3;
			}
			
			.filterSwitch input:checked + .slider:before {
				left: 22px;
			}
		` )
		.appendTo( document.head );


	$( `
			<label class="filterSwitch">
				<input type="checkbox">
				<div class="slider"></div>
			</label>
		` )
		.click( function() {
			const $chbox = $( this ).find( '[type="checkbox"]' );
			setTimeout( () => {
				const isChecked = $chbox.prop( 'checked' );
				// $chbox.prop( 'checked', !isChecked );
				$body.toggleClass( 'activeFilter', isChecked );
			} );
		} )
		.click()
		.appendTo( '#searchForm' );

} )();

