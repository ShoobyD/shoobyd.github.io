// ==UserScript==
// @name         WhatsApp Web: Sivan Censored
// @version      0.5
// @description  try to take over the world!
// @author       ShoobyD
// @include      *web.whatsapp.com*
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/SivanCensored.js

( function() {
	'use strict';

	new MutationSummary( {
		'rootNode' : document.body,
		'callback' : sum => {
			for ( let elm of sum[ 0 ].added )
				elm.innerHTML = elm.innerHTML.replace( /סיוון/g, 'ס☠☠☠ן' );
		},
		'queries'  : [ { element : '.selectable-text, .quoted-mention' } ],
	} );

} )();

