
// make menu LIs clickable.
(function() {
	var menu_items = Array.from( document.querySelectorAll( '#menu li' ) );
	for ( var li of menu_items )
		if ( li.querySelector('a') )
			li.addEventListener( 'click', function() { this.querySelector('a').click() } );
})();

