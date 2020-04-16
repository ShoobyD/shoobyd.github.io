// ==UserScript==
// @name         Vimeo Downloaer
// @version      0.21
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

	if ( location.hostname === 'vod-progressive.akamaized.net' )
		return ShoobyD.downloadListener();

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
					BuildDownloadPanel();
					isSet = true;
				}
			},
			'queries'  : [ { element : '.vp-prefs' } ],
		} );

	}


	function BuildDownloadPanel() {

		const downloadPanel = ShoobyD.createElement( '<div></div>' );
		document.querySelector( '.vp-prefs' ).after( downloadPanel );

		const downloadBtn = BuildDownloadBtn();
		downloadPanel.append( downloadBtn );

		const captionsUrl = getCaptionsUrl();
		if ( captionsUrl ) {
			const downloadMenu = BuildMenu();
			downloadPanel.append( downloadMenu );
			const captionsBtn  = BuildCaptionsBtn( captionsUrl );
			downloadMenu.querySelector( '.vp-panel' ).append( captionsBtn );
		}

	}

	function BuildDownloadBtn() {

		const downloadUrls = parsePageData( scriptElm.innerText );
		const bestQuality  = getBestQuality( downloadUrls );
		const isFullHD     = bestQuality.quality === '1080p';

		const downloadBtn  = ShoobyD.createElement( `
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
		return downloadBtn;

	}

	function BuildMenu() {

		const downloadMenu = ShoobyD.createElement( `
			<div class="vp-menu download-captions-menu" role="menu"
			     style="right: 2.15em; bottom: 3.2em; height: auto;">
				<div class="vp-panel vp-panel-open"></div>
				<style scoped>
					.download-captions-menu {
						opacity:        0                  !important;
						visibility:     hidden             !important;
						pointer-events: all                !important;
						transition:     opacity 0.5s 0.2s ease,
						                visibility 0s 0.7s !important;
					}
					:focus > .download-captions-menu,
					:hover > .download-captions-menu {
						opacity:        1                  !important;
						visibility:     visible            !important;
						transition:     visibility 0s,
						                opacity 0.5s ease  !important;
					}
					.download-captions-menu .vp-panel {
						min-width:      auto               !important;
					}
					.download-captions-menu .vp-panel button {
						margin:         1em                !important;
					}
				</style>
			</div>
		` );

		return downloadMenu;

	}

	function BuildCaptionsBtn( captionsUrl ) {

		const downloadBtn = ShoobyD.createElement( `
			<button type="button" class="toggle cc on" aria-haspopup="true">
				<svg viewBox="0 0 20 14" focusable="false" aria-labelledby="cc-icon-title" role="img">
					<title id="cc-icon-title">Download captions</title>
					<path class="fill" fill-rule="evenodd" clip-rule="evenodd" d="M17 0h-14c-1.657 0-3 1.343-3 3v8c0 1.656 1.343 3 3 3h14c1.657 0 3-1.344 3-3v-8c0-1.657-1.343-3-3-3zm-7.271 8.282c-.145.923-.516 1.686-1.105 2.268-.597.591-1.369.89-2.294.89-1.138 0-2.049-.402-2.706-1.195-.647-.786-.975-1.866-.975-3.215 0-1.458.372-2.603 1.105-3.403.65-.708 1.487-1.067 2.487-1.067 1.33 0 2.321.482 2.947 1.435.34.53.526 1.072.553 1.611l.013.236h-1.984l-.044-.169c-.092-.355-.207-.622-.343-.793-.239-.298-.591-.443-1.076-.443-.483 0-.856.209-1.14.641-.298.455-.449 1.12-.449 1.977 0 .851.156 1.49.466 1.898.298.395.666.588 1.122.588.469 0 .814-.16 1.058-.491.138-.183.255-.472.351-.856l.042-.17h2.013l-.041.258zm7.582 0c-.145.923-.516 1.686-1.104 2.268-.598.591-1.369.89-2.294.89-1.139 0-2.049-.402-2.707-1.195-.646-.785-.975-1.865-.975-3.214 0-1.458.372-2.603 1.106-3.403.649-.708 1.485-1.067 2.486-1.067 1.33 0 2.32.482 2.946 1.435.34.53.526 1.072.554 1.611l.012.236h-1.9829999999999999l-.043-.169c-.092-.355-.208-.623-.344-.793-.238-.298-.591-.443-1.076-.443-.483 0-.856.209-1.139.641-.299.455-.45 1.12-.45 1.977 0 .851.157 1.49.467 1.898.299.395.666.588 1.121.588.469 0 .814-.16 1.058-.491.138-.183.256-.472.352-.856l.042-.17h2.012l-.041.257z"></path>
				</svg>
			</button>
		` );

		downloadBtn.addEventListener( 'click', e => ShoobyD.downloadFile( captionsUrl ) );
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

	function getCaptionsUrl() {
		const captionsElm = document.querySelector( 'track[kind="captions"]' );
		return captionsElm?.src;
	}


} )();

