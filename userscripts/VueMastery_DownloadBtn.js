// ==UserScript==
// @name         VueMastery DownloadBtn
// @version      0.5
// @description  try to take over the world!
// @author       ShoobyD
// @include      *www.vuemastery.com*
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// ==/UserScript==

//# sourceURL=UserScripts/VueMastery_DownloadBtn.js

( function() {
	'use strict';

	const $   = unsafeWindow.$;
	const log = console.log.bind( console );

	new MutationSummary( {
		'rootNode' : document.body,
		'callback' : BuildDownloadBtn,
		'queries'  : [ { element : 'iframe' } ],
	} );

	async function BuildDownloadBtn() {
		const downloadUrl = await getVimeoDownloadUrl();
		const lessonName  = getLessonName();
		const cardElm     = document.querySelector( '.card-body' )
		cardElm.innerHTML = `
			<a data-v-7a860b52="" data-v-3ecb07c8=""
			   href="${ downloadUrl }"
			   download="${ lessonName }"
			   class="button secondary -full">
				<svg data-v-45b1b638="" data-v-7a860b52="" name="download-cloud"
				     type="feather" width="24" height="24" class="icon">
					<use data-v-45b1b638=""
					     xlink:href="/images/spr-feather.svg#download-cloud"></use>
				</svg> Download Video</a>
			` + cardElm.innerHTML;

	}

	async function getVimeoDownloadUrl() {
		const itemPropElm = document.querySelector( '[itemprop="embedURL"]' );
		if ( !itemPropElm )
			throw 'No [itemprop="embedURL"] Element';
		const corsUrl  = `https://cors-anywhere.herokuapp.com/${ itemPropElm.content }`;
		const pageData = await ( await fetch( corsUrl ) ).text();
		return parsePageData( pageData );
	}

	function parsePageData( pageData ) {
		const vidsArr = eval( pageData.replace( /.*"progressive":/, '' ).replace( /\].*/, ']' ) );
		const vidData = vidsArr.find( vData => vData.quality === "1080p" );
		if ( !vidData )
			throw 'No 1080p quality';
		return vidData.url;
	}

	function getLessonName() {
		return lessonTitle = document.querySelector( '.list-item.active .list-item-title' ).innerText;
	}

} )();

