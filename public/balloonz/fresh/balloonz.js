
/*****************************
 *        'Balloonz'         *
 *   popping balloons game   *
 *        by ShoobyD         *
 *****************************/

if ( bal_flag ) {

	(function () {

		console.log( "BALLOONZ!!" );

		/*************************
		 *   General Functions   *
		 *************************/
		// start balloonz
		function startBalloonz() {
			var balloon_imgs = [
				"http://2014.uploaded.fresh.co.il/2014/05/09/82241000.png", // red
				"http://2014.uploaded.fresh.co.il/2014/05/09/41183853.png", // yellow
				"http://2014.uploaded.fresh.co.il/2014/05/09/70531410.png", // green
				"http://2014.uploaded.fresh.co.il/2014/05/09/72730075.png", // blue
				"http://2014.uploaded.fresh.co.il/2014/05/09/42988541.png"  // purple
			];
			var num_of_each  = 2;              // how many balloonz of each color
			var indicator    = Math.max( screen.availWidth, screen.availHeight, 840 );
			var bsize        = indicator / 26; // width in pixels
			for ( var i = 0; i < balloon_imgs.length * num_of_each; i++ ) {
				var btmp = new Balloon( balloon_imgs[ i % balloon_imgs.length ], bsize );
				btmp.obj.style.zIndex = i;
				balloonz.push( btmp );
			}
			//console.log( balloonz );
		};

		// stop balloonz
		function stopBalloonz() {
			for ( var i in balloonz ) {
				balloonz[ i ].destroy();
			}
			balloonz = [];
			//console.log( balloonz );
		};

		// make SFX element
		function makeSFX() {
			var audio_src    = {
				ogg: "http://2014.uploaded.fresh.co.il/2014/05/11/24031868.ogg",
				mp3: "http://2014.uploaded.fresh.co.il/2014/05/09/20916768.mp3"
			};
			var sfx_obj       = document.createElement( "audio" );
			for ( i in audio_src )
				sfx_obj.innerHTML += "<source src=\"" + audio_src[ i ] + "\" type=\"audio/" + i + "\">";
			return document.body.appendChild( sfx_obj );
		};

		// inject style
		function setStyle() {
			var lnk_obj  = document.createElement( "link" );
			lnk_obj.rel  = "stylesheet";
			lnk_obj.type = "text/css";
			lnk_obj.href = "http://2014.uploaded.fresh.co.il/2014/06/01/17932326.css";
			document.head.appendChild( lnk_obj );
		};

		//####################################################################//

		/**********************
		 *   Balloon Object   *
		 **********************/
		function Balloon( imgsrc, bsize ) {
			this.size  = bsize;
			this.mouse = new Mouse( this, "http://2014.uploaded.fresh.co.il/2014/05/09/51585731.gif" );
			this.addToPage( imgsrc ); // add balloon element to page
			this.reset();             // reset position and stuff
			this.y     = Math.random() * window.innerHeight;
			this.animate();           // start floating
		};

		// make balloon element
		Balloon.prototype.addToPage = function ( imgsrc ) {
			var bal_obj           = document.createElement( "div" );
			bal_obj.className     = "balloon unselectable";
			bal_obj.style.cssText = "position: fixed; opacity: 0.8;";
			bal_obj.innerHTML     = "<img src=\"" + imgsrc + "\" border=\"0\" style=\"width: " + this.size + "px; height: auto;\">";
			var _this             = this;
			bal_obj.querySelector( "img" ).addEventListener( "click", function () { _this.pop() } );
			this.obj              = document.body.appendChild( bal_obj );
		};

		Balloon.prototype.pop = function () {
			//console.log( "Balloon POP" );
			var curr_x = this.currX()
			this.mouse.fall( curr_x, this.y ); // activate mouse
			score.show( curr_x, this.y );      // update and show score
			this.show( false );                // hide balloon
			pop_sfx.currentTime = 0;
			pop_sfx.play();                   // play 'POP' sound
		};

		// balloon visibility
		Balloon.prototype.show = function ( bool ) {
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

		// update div position
		Balloon.prototype.update = function () {
			this.obj.style.left = this.currX() + "px";
			this.obj.style.top  = this.y       + "px";
		};

		// calc current x-position
		Balloon.prototype.currX = function () {
			return ( this.x + this.amp * Math.sin( this.t ) );
		};

		// destroy balloon element
		Balloon.prototype.destroy = function () {
			this.mouse.destroy();
			this.obj.parentNode.removeChild( this.obj );
			delete this;
		};

		//####################################################################//

		/********************
		 *   Mouse Object   *
		 ********************/
		function Mouse( balloon, imgsrc ) {
			this.balloon = balloon;
			this.size    = this.balloon.size * 0.85;
			this.addToPage( imgsrc );
		};

		// make mouse element
		Mouse.prototype.addToPage = function ( imgsrc ) {
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

		// mouse visibility
		Mouse.prototype.show = function ( bool ) {
			this.obj.style.visibility = bool? "visible": "hidden";
		};

		// update div position
		Mouse.prototype.update = function () {
			this.obj.style.left = this.currX() + "px";
			this.obj.style.top  = this.y       + "px";
		};

		// calc current x-position
		Mouse.prototype.currX = function () {
			return ( this.x + this.amp * Math.sin( this.t ) );
		};

		// destroy mouse element
		Mouse.prototype.destroy = function () {
			this.obj.parentNode.removeChild( this.obj );
			delete this;
		};

		//####################################################################//

		/********************
		 *   Score Object   *
		 ********************/
		function Score() {
			this.score = 0;
		};

		// update and show score
		Score.prototype.show = function ( x, y ) {
			this.score++;
			var scr_obj        = document.createElement( "div" );
			scr_obj.className  = "balloon-score unselectable";
			scr_obj.style.left = x + "px";
			scr_obj.style.top  = y + "px";
			scr_obj.innerHTML  = this.score;
			document.body.appendChild( scr_obj );
			setTimeout( function() { scr_obj.parentNode.removeChild( scr_obj ) }, 2000 );
		};

		//####################################################################//

		/*********************
		 *   Button Object   *
		 *********************/
		function SwitchBtn() {
			this.addToPage();
			this.setState( this.getCookie() );
		};

		// make button element
		SwitchBtn.prototype.addToPage = function () {
			var imgsrc        = "http://2014.uploaded.fresh.co.il/2014/05/31/98926972.png";
			var btn_obj       = document.createElement( "div" );
			btn_obj.className = "onoffswitch unselectable";
			btn_obj.innerHTML = [
				"\t<input type=\"checkbox\" class=\"onoffswitch-checkbox\" id=\"switchbtn\">\r\n",
				"\t<div class=\"onoffswitch-label\" for=\"switchbtn\">\r\n",
				"\t\t<span class=\"onoffswitch-inner\"></span>\r\n",
				"\t\t<span class=\"onoffswitch-switch\">",
				"\t\t\t<img src=\"" + imgsrc + "\" border=\"0\">\r\n",
				"\t\t</span>\r\n",
				"\t</div>"
			].join( "" );
			var _this         = this;
			btn_obj.addEventListener( "click", function () { _this.click() } );
			this.obj          = document.body.appendChild( btn_obj );
			this.chkbox       = this.obj.querySelector( "#switchbtn" );
		};

		// set 'balloonz' switch state
		SwitchBtn.prototype.setState = function ( value ) {
			this.chkbox.checked = ( value == "ON" );
			return this.setCookie( value );
		};

		// get 'balloonz' switch state
		SwitchBtn.prototype.getState = function () {
			return this.chkbox.checked; // if not exist, set to "ON"
		};

		// set 'balloonz' cookie
		SwitchBtn.prototype.setCookie = function ( value ) {
			var exp_time    = 60 * 60 * 24 * 365; // a year
			document.cookie = "balloonz=" + value + "; max-age=" + exp_time +  "; path=/";
			return value;
		};

		// retrieve 'balloonz' cookie
		SwitchBtn.prototype.getCookie = function () {
			var value = document.cookie.replace( /(?:(?:^|.*;)\s*balloonz\s*\=\s*([^;]*).*$)|^.*$/, "$1" );
			if ( value != "" ) return value;
			return this.setCookie( "ON" ); // if not exist, set to "ON"
		};

		// button clicked
		SwitchBtn.prototype.click = function () {
			if ( this.getState() ) {
				console.log( "Balloonz: OFF" );
				this.setState( "OFF" );
				stopBalloonz();
			}
			else {
				console.log( "Balloonz: ON" );
				this.setState( "ON" );
				startBalloonz();
			}
		};

		//####################################################################//

		/************
		 *   Main   *
		 ************/
		setStyle();
		var balloonz     = [];
		var pop_sfx      = makeSFX();
		var score        = new Score();
		var btn          = new SwitchBtn();
		if ( btn.getState() ) startBalloonz();

	})();

}


