// ==UserScript==
// @name         Duolingo AutoPractice
// @version      0.7
// @description  try to take over the world!
// @author       ShoobyD
// @namespace    https://shoobyd.github.io/
// @include      *duolingo.com*
// @require      https://shoobyd.github.io/assets/lib/shoobyd.js
// @require      https://shoobyd.github.io/assets/lib/mutation-summary.js
// @require      https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js
// @run-at       document-start
// ==/UserScript==

//# sourceURL=UserScripts/Duolingo_AutoPractice.js

var log = console.log.bind( console );

( function() {
	'use strict';

	let _practice;


	ShoobyD.setXHRHandler( xhr => {
		if ( /\/sessions$/.test( xhr.responseURL ) ) {
			const { challenges } = JSON.parse( xhr.response );
			_practice            = new Practice( challenges );
		}
	} );

	function isAutoPractice() {
		return Cookies.get( 'auto-practice' );
	}


	class Practice {

		constructor( challenges ) {

			this.challenges = challenges;
			this.currIndex  = 0;

		}

		get currChallenge() {

			return this.challenges[ this.currIndex ];

		}

		get isSkip() {

			const { type } = this.currChallenge;

			const skipTypes = [
				'speak',
				'translate',
				'name',
				'listen',
			];

			return skipTypes.includes( type );

		}

		get isTapToken() {

			const { type } = this.currChallenge;

			const tapTokenTypes = [
				'listenTap',
				'tapComplete',
			];

			return tapTokenTypes.includes( type );

		}

		get choiceElements() {

			return [ ...document.querySelectorAll( this.isTapToken?
				'[data-test="word-bank"] [data-test="challenge-tap-token"]':
				'[data-test="challenge-choice"]',
			) ];

		}

		getChoiceElementText( element ) {

			return this.isTapToken?
				element.innerText:
				element.querySelector( '[data-test="challenge-judge-text"]' ).innerText;

		}

		solve() {

			if ( this.isSkip )
				return this.continue();

			/*
				case 'translate':
				case 'name':
					setTimeout( () => {
					const inputElm = document.querySelector( '[data-test="challenge-translate-input"], [data-test="challenge-text-input"]' );
					inputElm.value = correctSolutions[ 0 ];
					}, 500 );
					break;
			*/

			this.solutionElements.forEach( solutionElement => solutionElement.click() );

			this.continue();

		}

		get solutionElements() {

			const {
				      type,
				      correctIndex,
				      correctIndices,
				      correctTokens,
			      } = this.currChallenge;

			if ( type === 'listenTap' )
				return correctTokens.map( token => this.findChoiceElementByText( token ) );

			if ( correctIndices )
				return correctIndices.map( index => this.findChoiceElementByIndex( index ) );

			return [ this.findChoiceElementByIndex( correctIndex ) ];

		}

		findChoiceElementByText( text ) {

			const choiceElement = this.choiceElements.find( choiceElement => this.getChoiceElementText( choiceElement ) === text );

			if ( !choiceElement )
				throw new Error( `No choice element for: ${ text }` );

			return choiceElement;

		}

		findChoiceElementByIndex( index ) {

			const { choices }  = this.currChallenge;
			const solutionText = choices[ index ]?.text || choices[ index ];

			return this.findChoiceElementByText( solutionText );

		}

		async continue() {

			await this.btnClickPromise( this.isSkip? 'skip': 'next' );

			this.currIndex++;
			if ( !this.currChallenge )
				_practice = null;

			await this.btnClickPromise();

		}

		async btnClickPromise( type = 'next' ) {

			return new Promise( resolve => {

				const iVal = setInterval( () => {

					const btn = document.querySelector( `[data-test="player-${ type }"]` );

					if ( btn && !btn.disabled ) {

						clearInterval( iVal );
						btn.click();
						resolve();

					}

				}, 200 );

			} );

		}

	}


	new MutationSummary( {
		'rootNode': document.body,
		'callback': function( summary ) {

			if ( !summary[ 0 ].added.length )
				return;

			if ( !_practice )
				return;

			_practice.solve();

		},
		'queries' : [ { element: '[data-test="challenge-header"]' } ],
	} );


	new MutationSummary( {
		'rootNode': document.body,
		'callback': function( summary ) {

			if ( !summary[ 0 ].added.length )
				return;

			// debugger;

			const practiceBtn = document.querySelector( '[data-test="global-practice"]' );
			if ( practiceBtn ) {
				const autoBtn = ShoobyD.createElement( `
					<button class="_1f0yj _-7YNG _3zYDc _1LfAN _2fOC9 t5wFJ _3dtSu _25Cnc _3yAjN UCrz7 _3GeW0">
						${ isAutoPractice()? 'Stop': 'Start' } Practice
					</button>
				` );
				autoBtn.addEventListener( 'click', e => {
					if ( isAutoPractice() ) {
						Cookies.remove( 'auto-practice' );
						autoBtn.innerText = 'Start Practice';
					} else {
						Cookies.set( 'auto-practice', true );
						practiceBtn.click();
					}
				} );
				practiceBtn.parentNode.appendChild( autoBtn );
			}
		},
		'queries' : [ { element: '[data-test="global-practice"]' } ],
	} );

	new MutationSummary( {
		'rootNode': document.body,
		'callback': function( summary ) {

			if ( !summary[ 0 ].added.length )
				return;

			if ( !isAutoPractice() )
				return;

			const startBtn = document.querySelector( '[data-test="player-next"], [data-test="player-practice-again"]' );
			if ( startBtn ) {
				startBtn.click();
			}
		},
		'queries' : [ { element: '[data-test="player-next"], [data-test="player-practice-again"]' } ],
	} );


} )();


