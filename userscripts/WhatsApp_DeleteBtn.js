// ==UserScript==
// @name         WhatsApp Web: Delete Btn
// @version      0.1
// @description  try to take over the world!
// @author       ShoobyD
// @include      *web.whatsapp.com*
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/WhatsApp_DeleteBtn.js

( function() {
	'use strict';

	new MutationSummary( {
		'rootNode' : document.body,
		'callback' : function( sum ) {
			debugger;
			const downArrowElm = sum[ 0 ].added[ 0 ];

		},
		'queries'  : [ { element : '[data-icon="down-context"]' } ],
	} );

} )();

