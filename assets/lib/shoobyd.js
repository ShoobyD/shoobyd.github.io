/*
 * ShoobyD-lib
 *    v0.7
 */

( function() {
	'use strict';

	const log = console.log.bind( console );
	const err = console.error.bind( console );

	if ( !window.log )
		window.log = log;

	if ( !window.err )
		window.err = err;

	const ShoobyD = window.ShoobyD = window.ShoobyD || {

		// Creating an element from HTML string
		createElement( htmlString ) {

			const templateElement = document.createElement( 'template' );
			templateElement.innerHTML = htmlString.trim(); // Never return a text node of whitespace as the result
			return templateElement.content.firstChild;

		},


		// Downloading file
		// MUST BE CALLED FROM SAME ORIGIN
		downloadFile( fileUrl, fileName = '' ) {

			const dlElm = this.createElement( `<a href="${ fileUrl }" download="${ fileName }"></a>` );

			dlElm.style.display = 'none';
			document.body.appendChild( dlElm );

			dlElm.click();

			document.body.removeChild( dlElm );

		},



		// Extending a function / object method
		extendFunction( data ) {

			let functionName, object, extendFunction, isBefore;

			if ( typeof data !== 'object' ) {

				( {
					functionName,
					object,
					extendFunction,
					isBefore,
				} = data );

			} else {

				if ( typeof arguments[ 0 ] !== 'string' )
					return;

				functionName = arguments[ 0 ];

				if ( typeof arguments[ 1 ] === 'function' ) {

					if ( arguments[ 2 ] )
						return;

					object         = unsafeWindow;
					extendFunction = arguments[ 1 ];
					isBefore       = arguments[ 2 ];

				} else {

					if ( typeof arguments[ 2 ] !== 'function' )
						return;

					object         = arguments[ 1 ];
					extendFunction = arguments[ 2 ];
					isBefore       = arguments[ 3 ];

				}

			}

			const oldFunc = object[ functionName ];
			const funcs   = isBefore? [ oldFunc, extendFunction ]: [ extendFunction, oldFunc ];

			object[ functionName ] = function() {

				funcs.forEach( function( func ) {
					func.apply( this, arguments );
				} );

			};

			object[ functionName ].extended = true;

		},


	};


} )();

