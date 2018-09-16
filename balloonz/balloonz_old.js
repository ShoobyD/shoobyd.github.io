
if ( bal_flag ) {

	/* Floating Balloon Script, by ShoobyD */

	console.log( "BALLOONZ!!" );

	function Balloon( imgsrc, bsize, sfx, score ) { // balloon class
		this.size  = bsize;
		this.sfx   = sfx;
		this.score = score;
		this.mouse = new Mouse( this, "http://2014.uploaded.fresh.co.il/2014/05/09/51585731.gif" );
		this.addToPage( imgsrc ); // add balloon element to page
		this.reset();             // reset position and stuff
		this.y     = Math.random() * window.innerHeight;
		this.animate();           // start floating
	}

	Balloon.prototype.addToPage = function ( imgsrc ) { // make balloon element
		var bal_obj           = document.createElement( "div" );
		bal_obj.className     = "balloon unselectable";
		bal_obj.style.cssText = "position: fixed; opacity: 0.8;";
		bal_obj.innerHTML     = "<img src=\"" + imgsrc + "\" border=\"0\" style=\"width: " + this.size + "px; height: auto;\">";
		var _this             = this;
		bal_obj.querySelector( "img" ).addEventListener( "click", function () { _this.pop() } );
		this.obj              = document.body.appendChild( bal_obj );
	};

	Balloon.prototype.pop = function () {
		var curr_x = this.currX()
		this.mouse.fall( curr_x, this.y ); // activate mouse
		this.score.show( curr_x, this.y ); // update and show score
		this.show( false );                // hide balloon
		this.sfx.currentTime = 0;
		this.sfx.play();                   // play 'POP' sound
	};

	Balloon.prototype.show = function ( bool ) { // balloon visibility
		this.obj.style.visibility = bool? "visible": "hidden";
	};

	Balloon.prototype.reset = function () {
		var pad     = this.size * 0.8;               // window sides padding
		this.t      = 0;                             // reset timer
		this.amp    = Math.random() * this.size + 5; // set amplitude size
		this.x      = Math.random() * ( window.innerWidth - this.size - this.amp - pad ) + pad;
		this.y      = window.innerHeight;            // put in bottom
		this.step   = {
			t: 0.01 + Math.random() / this.amp,      // set step-t size
			y: 1.25 + Math.random()                  // set step-y size
		}
		this.update();                               // update div
	};

	Balloon.prototype.animate = function () {
		this.t += this.step.t;          // increase timer
		this.y -= this.step.y;          // go up
		if ( this.y < 0 ) this.reset(); // got to top
		this.update();                  // update div
		var _this = this;
		setTimeout( function() { _this.animate() }, 10 );
	};

	Balloon.prototype.currX = function () { // calc current x-position
		return ( this.x + this.amp * Math.sin( this.t ) );
	};

	Balloon.prototype.update = function () { // update div position
		this.obj.style.left = this.currX() + "px";
		this.obj.style.top  = this.y       + "px";
	};

	function Score() { // score class
		this.score = 0;
	}

	Score.prototype.show = function ( x, y ) { // update and show score
		this.score++;
		var scr_obj        = document.createElement( "div" );
		scr_obj.className  = "balloon-score unselectable";
		scr_obj.style.left = x + "px";
		scr_obj.style.top  = y + "px";
		scr_obj.innerHTML  = this.score;
		document.body.appendChild( scr_obj );
		setTimeout( function() { scr_obj.parentNode.removeChild( scr_obj ) }, 2000 );
	};

	function Mouse( balloon, imgsrc ) { // mouse class
		this.balloon = balloon;
		this.size    = this.balloon.size * 0.85;
		this.addToPage( imgsrc );
	}

	Mouse.prototype.addToPage = function ( imgsrc ) { // make mouse element
		var mouse_obj           = document.createElement( "div" );
		mouse_obj.className     = "unselectable";
		mouse_obj.style.cssText = "position: fixed; visibility: hidden;";
		mouse_obj.innerHTML     = "<img src=\"" + imgsrc + "\" border=\"0\" style=\"width: " + this.size + "px; height: auto;\">";
		this.obj                = document.body.appendChild( mouse_obj );
	};

	Mouse.prototype.fall = function ( x, y ) {
		this.x   = x;                           // set starting x-position
		this.y   = y;                           // set starting y-position
		this.t   = Math.random() * Math.PI;     // reset timer
		var _amp = this.size * 0.8;
		this.amp = _amp + Math.random() * _amp; // set amplitude size
		this.show( true );                      // show mouse
		this.animate();                         // start sliding
	};

	Mouse.prototype.animate = function () {
		this.t += 0.03;           // increase timer
		this.y += 2.4;            // fall
		this.update();            // update div
		if ( this.y > window.innerHeight ) {
			this.show( false );   // hide mouse
			this.balloon.reset(); // reset balloon position and stuff
			this.balloon.show( true );
		}
		else {
			var _this = this;
			setTimeout( function() { _this.animate() }, 10 );
		}
	};

	Mouse.prototype.show = function ( bool ) { // mouse visibility
		this.obj.style.visibility = bool? "visible": "hidden";
	};

	Mouse.prototype.update = function () { // update div position
		this.obj.style.left = this.currX() + "px";
		this.obj.style.top  = this.y       + "px";
	};

	Mouse.prototype.currX = function () { // calc current x-position
		return ( this.x + this.amp * Math.sin( this.t ) );
	};

	(function () {
		var num_of_each  = 2;                                           // how many balloons of each color;
		var indicator    = Math.max( screen.availWidth, screen.availHeight, 840 );
		var bsize        = indicator / 26;                              // width in pixels
		var balloon_imgs = [
			"http://2014.uploaded.fresh.co.il/2014/05/09/82241000.png", // red
			"http://2014.uploaded.fresh.co.il/2014/05/09/41183853.png", // yellow
			"http://2014.uploaded.fresh.co.il/2014/05/09/70531410.png", // green
			"http://2014.uploaded.fresh.co.il/2014/05/09/72730075.png", // blue
			"http://2014.uploaded.fresh.co.il/2014/05/09/42988541.png"  // purple
		];
		var audio_src    = {
			ogg: "http://2014.uploaded.fresh.co.il/2014/05/11/24031868.ogg",
			mp3: "http://2014.uploaded.fresh.co.il/2014/05/09/20916768.mp3"
		};
		setStyle( "http://2014.uploaded.fresh.co.il/2014/05/10/82527683.css" );
		var pop_sfx      = makeSFX( audio_src );
		var score        = new Score();
		for ( var i = 0; i < balloon_imgs.length * num_of_each; i++ ) {
			var btmp = new Balloon( balloon_imgs[ i % balloon_imgs.length ], bsize, pop_sfx, score );
			btmp.obj.style.zIndex = i;
		}
		function makeSFX( src ) { // make SFX element
			var sfx_obj       = document.createElement( "audio" );
			for ( i in src )
				sfx_obj.innerHTML += "<source src=\"" + src[ i ] + "\" type=\"audio/" + i + "\">";
			return document.body.appendChild( sfx_obj );
		};
		function setStyle( url ) { // inject style
			var lnk_obj  = document.createElement( "link" );
			lnk_obj.rel  = "stylesheet";
			lnk_obj.type = "text/css";
			lnk_obj.href = url;
			document.head.appendChild( lnk_obj );
		};
	})();

}

