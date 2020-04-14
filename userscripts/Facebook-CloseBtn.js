// ==UserScript==
// @name         Facebook - Close Btn
// @version      2.4
// @description  try to take over the world!
// @author       ShoobyD
// @namespace    http://shoobyd.herobo.com/
// @include      *facebook.com/groups/*
// @include      *facebook.com/events/*
// @require      https://shoobyd.github.io/assets/lib/shoobyd.js
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/Facebook-CloseBtn.js


const FEED_SELECTOR = '[role="feed"]';
const POST_SELECTOR = '.sjgh65i0.l9j0dhe7.k4urcfbm.du4w35lb';

new MutationSummary( {
	'rootNode'          : document.body,
	'callback'          : init,
	'observeOwnChanges' : true,
	'queries'           : [ { element : FEED_SELECTOR } ],
} );


function init() {
	'use strict';

	const wrapperElm = document.querySelector( FEED_SELECTOR );

	new MutationSummary( {
		'rootNode'          : wrapperElm,
		'callback'          : AddCloseBtns,
		'observeOwnChanges' : true,
		'queries'           : [ { element : POST_SELECTOR } ],
	} );

	function AddCloseBtns() {

		const postsArr = wrapperElm.querySelectorAll( POST_SELECTOR );

		postsArr.forEach( postElm => {

			const closeBtn = postElm.querySelector( '.close-btn' ) || ShoobyD.createElement( `
				<button class="close-btn" onclick="this.parentNode.remove()" style="
					position: absolute;
					right: 8px;
					top: -17px;
					display: inline-block;
					border: none;
					border-radius: 10px 10px 0 0;
					background-color: var(--notification-badge);
					color: var(--always-white);
					cursor: pointer;
				">×</button>
			` );
			postElm.prepend( closeBtn );

		} );

	}

}

