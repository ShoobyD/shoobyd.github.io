// ==UserScript==
// @name         Duolingo AutoPractice
// @version      1.8
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

	const nativeInputValueSetter    = Object.getOwnPropertyDescriptor( window.HTMLInputElement.prototype, 'value' ).set;
	const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor( window.HTMLTextAreaElement.prototype, 'value' ).set;

	function triggerTextInput( inputElement, text ) {
		if ( inputElement instanceof HTMLTextAreaElement )
			nativeTextAreaValueSetter.call( inputElement, text );
		else
			nativeInputValueSetter.call( inputElement, text );

		inputElement.dispatchEvent( new InputEvent( 'input', {
			bubbles  : true,
			composed : true,
			inputType: 'insertText',
			isTrusted: true,
		} ) );
	}


	ShoobyD.setXHRHandler( xhr => {
		if ( /\/sessions$/.test( xhr.responseURL ) ) {
			const session = JSON.parse( xhr.response );
			_practice     = new Practice( session );
		}
	} );

	function isAutoPractice() {
		return Cookies.get( 'auto-practice' );
	}

	class Challenge {

		constructor( challengeData ) {

			Object.assign( this, challengeData, {
				data: challengeData,
			} );

		}

		get isSkip() {

			const skipTypes = [
				'speak',
				'listen',
			];

			return skipTypes.includes( this.type );

		}

		get isTapToken() {

			const tapTokenTypes = [
				'listenTap',
				'tapComplete',
			];

			return tapTokenTypes.includes( this.type );

		}

		solve() {

			switch ( this.type ) {

				case 'translate':
				case 'name':
					const inputElement = document.querySelector( '[data-test="challenge-translate-input"], [data-test="challenge-text-input"]' );
					triggerTextInput( inputElement, this.correctSolutions[ 0 ] );
					break;

				default:
					this.solutionElements.forEach( solutionElement => solutionElement.click() );
			}

			this.solved = true;

		}

		get solutionElements() {

			if ( this.type === 'listenTap' )
				return this.correctTokens.map( token => this.findChoiceElementByText( token ) );

			if ( this.correctIndices )
				return this.correctIndices.map( index => this.findChoiceElementByIndex( index ) );

			return [ this.findChoiceElementByIndex( this.correctIndex ) ];

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

		findChoiceElementByText( text ) {

			const choiceElement = this.choiceElements.find( choiceElement => this.getChoiceElementText( choiceElement ) === text );

			if ( !choiceElement )
				throw new Error( `No choice element for: ${ text }` );

			return choiceElement;

		}

		findChoiceElementByIndex( index ) {

			const solutionText = this.choices[ index ]?.text || this.choices[ index ];

			return this.findChoiceElementByText( solutionText );

		}

	}

	class Practice {

		constructor( session ) {

			this.session = session;

			const hardChallenges = session.adaptiveChallenges || [];
			this.challenges      = session.challenges;
			this.challenges.splice( -hardChallenges.length, 0, ...hardChallenges );

			this.challenges = this.challenges.map( challengeData => new Challenge( challengeData ) );

			this.currIndex = 0;

		}

		getCurrentChallenge() {

			return this.challenges.find( challenge => !challenge.solved );
			// return this.challenges[ this.currIndex ];

		}

		solve() {

			this.currentChallenge = this.getCurrentChallenge();

			if ( this.currentChallenge.isSkip ) {
				this.challenges.forEach( challenge => {
					if ( challenge.type === this.type )
						challenge.solved = true;
				} );
				return this.continue();
			}

			this.currentChallenge.solve();
			this.continue();

		}

		async continue() {

			await this.btnClickPromise( this.currentChallenge.isSkip? 'skip': 'next' );

			this.currIndex++;
			if ( !this.getCurrentChallenge() )
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


