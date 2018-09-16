'use strict';

{
let menu_items = Array.from( document.querySelectorAll( '#menu li' ) );
for ( let li of menu_items )
	if ( li.querySelector('a') )
		li.addEventListener( 'click', function() { li.querySelector('a').click() } );
}

