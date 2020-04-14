// ==UserScript==
// @name         Vimeo Downloaer
// @version      0.17
// @description  try to take over the world!
// @author       ShoobyD
// @include      *player.vimeo.com/*
// @include      *vod-progressive.akamaized.net/*
// @require      https://shoobyd.github.io/assets/lib/shoobyd.js
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/Vimeo_Downloaer.js

( function() {
	'use strict';

	if ( location.hostname === 'vod-progressive.akamaized.net' ) {
		ShoobyD.downloadListener();
		return;
	}

	const playerElm = document.querySelector( '#player' );
	const scriptElm = document.querySelector( 'body > script' );
	if ( !playerElm || !scriptElm )
		return;


	const downloadInterface = ShoobyD.downloadInterfaceFactory();
	setDownloadBtn();



	/* funcs */
	function setDownloadBtn() {

		let isSet = false;
		new MutationSummary( {
			'rootNode' : playerElm,
			'callback' : () => {
				if ( !isSet ) {
					BuildDownloadBtn();
					isSet = true;
				}
			},
			'queries'  : [ { element : '.vp-prefs' } ],
		} );

	}

	function BuildDownloadBtn() {

		const downloadUrls = parsePageData( scriptElm.innerText );
		const bestQuality  = getBestQuality( downloadUrls );
		const isFullHD     = bestQuality.quality === '1080p';

		const downloadBtn    = ShoobyD.createElement( `
				<button type="button" class="vp-prefs">
					<svg viewBox="0 0 451.111 451.111" ${ isFullHD? 'class="fill"': 'style="fill: #f66"' }>
						<g>
							<path d="m225.556 354.445 145-145-48.333-48.333-64.444 64.444v-225.556h-64.444v225.556l-64.444-64.444-48.333 48.333z"></path>
							<path d="m0 386.667h451.111v64.444h-451.111z"></path>
						</g>
					</svg>
				</button>
			` );

		downloadBtn.addEventListener( 'click', e => downloadInterface.download( bestQuality.url ) );
		document.querySelector( '.vp-prefs' ).after( downloadBtn );
		return downloadBtn;

	}


	/* helpers */
	function getBestQuality( downloadUrls ) {
		const qualities = [ '1080p', '720p', '540p', '360p', '240p' ];
		for ( let quality of qualities ) {
			const url = downloadUrls[ quality ];
			if ( url )
				return { quality, url };
		}
	}

	function parsePageData( pageData ) {
		const vidsArr   = eval( pageData.replace( /.*"progressive":/, '' ).replace( /\].*/, ']' ) );
		const vidsPairs = vidsArr.map( vData => [ vData.quality, vData.url ] );
		return Object.fromEntries( vidsPairs );
	}


} )();

