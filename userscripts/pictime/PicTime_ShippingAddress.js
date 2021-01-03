
// ==UserScript==
// @name         Pic-Time Shipping Address
// @version      0.7
// @description  try to take over the world!
// @author       ShoobyD
// @include      *.pic-time.com/*
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/PicTime/PicTime_ShippingAddress.js

( function() {
	'use strict';

	function setShippingAddress() {

		const $form    = $( '#shippingSlim_deliveryAddressForm' );
		const currData = $form.pictimeZForm( 'getValuesById' );

		if ( !currData )
			return;

		$form.pictimeZForm( 'setValuesById', $.extend( currData, {
			'shipToLastName' : currData.shipToLastName + '_TESTING_',
			'addressLine1'   : '2 Garden DR',
			'city'           : 'Kensigston',
			'state'          : 'Alabama',
			'zip'            : '94708',
			'country'        : 'United States',
			'phone'          : '(052) 888-8888',
		} ) );

	}

	new MutationSummary( {
		'rootNode' : document.body,
		'callback' : setShippingAddress,
		'queries'  : [ { element : '#shippingSlim_deliveryAddressForm' } ],
	} );

} )();

