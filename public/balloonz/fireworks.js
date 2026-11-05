
// retrieve 'balloonz' cookie
function getCookie() {
	var value = document.cookie.replace( /(?:(?:^|.*;)\s*balloonz\s*\=\s*([^;]*).*$)|^.*$/, "$1" );
	return ( value != "" )? value: "ON";
};

if ( fw_flag && ( getCookie() == "ON" ) ) {

	console.log( "FIRE!!" );

	var bits    = 80; // how many bits
	var speed   = 33; // how fast - smaller is faster
	var bangs   = 5;  // how many can be launched simultaneously (note that using too many can slow the script down)
	var colours = [
		"#03f",       // blue
		"#f03",       // red
		"#0e0",       // green
		"#93f",       // purple
		"#0cf",       // cyan
		"#f93",       // orange
		"#f0c"        // pink
	];                

	/****************************
	*      Fireworks Effect     *
	*(c)2004-14 mf2fm web-design*
	*  http://www.mf2fm.com/rv  *
	* DON'T EDIT BELOW THIS BOX *
	****************************/
	var bangheight = new Array();
	var intensity  = new Array();
	var colour     = new Array();
	var Xpos       = new Array();
	var Ypos       = new Array();
	var dX         = new Array();
	var dY         = new Array();
	var stars      = new Array();
	var decay      = new Array();
	var swide      = 800;
	var shigh      = 600;
	var boddie;

	window.addEventListener( "load", light_blue_touchpaper );

	function light_blue_touchpaper() {
		boddie               = document.createElement("div");
		boddie.style.cssText = [
			"position: fixed; top: 0px; left: 0px; overflow: visible;",
			"width: 1px; height: 1px; background-color: transparent;"
		].join( " " );
		document.body.appendChild( boddie );
		set_width();
		for ( var i = 0; i < bangs; i++ ) {
			write_fire( i );
			launch( i );
			setInterval( 'stepthrough(' + i + ')', speed );
		}
	}

	function write_fire( N ) {
		stars[ N + 'r' ] = createDiv( '|', 12 );
		boddie.appendChild( stars[ N + 'r' ] );
		for ( var i = bits * N; i < bits + bits * N; i++ ) {
			stars[ i ] = createDiv( '*', 13 );
			boddie.appendChild( stars[ i ] );
		}
	}

	function createDiv( char, size ) {
		var div           = document.createElement( "div" );
		div.style.cssText = "font: "+ size + "px monospace; position: absolute; background-color: transparent;";
		div.appendChild( document.createTextNode( char ) );
		return ( div );
	}

	function launch( N ) {
		colour[ N ]     = Math.floor( Math.random() * colours.length );
		Xpos[ N + "r" ] = swide * 0.5;
		Ypos[ N + "r" ] = shigh - 5;
		bangheight[ N ] = Math.round( ( 0.5 + Math.random() ) * shigh * 0.4 );
		dX[ N + "r" ]   = ( Math.random() - 0.5 ) * swide / bangheight[ N ];
		if ( dX[ N + "r" ] > 1.25 )
			stars[ N + "r" ].firstChild.nodeValue   = "/";
		else if ( dX[ N + "r" ] < -1.25 )
			stars[ N + "r" ].firstChild.nodeValue   = "\\";
		else stars[ N +  "r" ].firstChild.nodeValue = "|";
		stars[ N + "r" ].style.color                = colours[ colour[ N ] ];
	}

	function bang( N ) {
		var Z, A = 0;
		for ( var i = bits * N; i < bits + bits * N; i++ ) {
			Z      = stars[ i ].style;
			Z.left =  Xpos[ i ] + "px";
			Z.top  =  Ypos[ i ] + "px";
			if ( decay[ i ] ) decay[ i ]--;
			else A++;
			if ( decay[ i ] == 15 )     Z.fontSize   = "7px";
			else if ( decay[ i ] == 7 ) Z.fontSize   = "2px";
			else if ( decay[ i ] == 1 ) Z.visibility = "hidden";
			if ( decay[ i ] > 1 && Math.random() < .1 ) {
				Z.visibility = "hidden";
				setTimeout( 'stars[' +  i + '].style.visibility="visible"', speed - 1 );
			}
			Xpos[ i ] +=   dX[ i ];
			Ypos[ i ] += ( dY[ i ] += 1.25 / intensity[ N ] );
		}
		if ( A != bits )
			setTimeout( "bang(" + N + ")", speed );
	}

	function stepthrough( N ) {
		var M, Z;
		var oldx       = Xpos[ N + "r" ];
		var oldy       = Ypos[ N + "r" ];
		Xpos[ N + "r" ] += dX[ N + "r" ];
		Ypos[ N + "r" ] -= 4;
		if ( Ypos[ N + "r" ] < bangheight[ N ] ) {
			M              = Math.floor( Math.random() * 3 * colours.length );
			intensity[ N ] = 5 + Math.random() * 4;
			for ( var i = N * bits; i < bits + bits * N; i++ ) {
				Xpos[ i ]  = Xpos[ N + "r" ];
				Ypos[ i ]  = Ypos[ N + "r" ];
				dY[ i ]    = ( Math.random() - 0.5 ) *   intensity[ N ];
				dX[ i ]    = ( Math.random() - 0.5 ) * ( intensity[ N ] - Math.abs( dY[ i ] ) ) * 1.25;
				decay[ i ] = 16 + Math.floor( Math.random() * 16 );
				Z          = stars[ i ];
				if ( M < colours.length )
					Z.style.color = colours[ i%2? colour[ N ]: M ];
				else if ( M < 2 * colours.length )
					Z.style.color = colours[ colour[ N ] ];
				else
					Z.style.color = colours[ i%colours.length ];
				Z.style.fontSize   = "13px";
				Z.style.visibility = "visible";
			}
			bang( N );
			launch( N );
		}
		stars[ N + "r" ].style.left = oldx + "px";
		stars[ N + "r" ].style.top  = oldy + "px";
	} 

	window.onresize = set_width;
	function set_width() {
		swide = Math.min(
			document.documentElement.clientWidth,
			document.body.clientWidth,
			self.innerWidth
		);
		shigh = Math.min(
			document.documentElement.clientHeight,
			document.body.clientHeight,
			self.innerHeight
		);
	}

}

