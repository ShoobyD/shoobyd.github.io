
(function() {

	/********************
	 *   Music Object   *
	 ********************/
	function Music() {

		var types        = [ "mp3", "ogg" ],
		    prev_on      = !document.cookie.match( /\s*nomusic\s*/ );

		// wrapper
		var contnr       = document.createElement( "div" );
		contnr.id        = "music";
		document.body.appendChild( contnr );

		// adding image button
		this.btn         = document.createElement( "img" );
		this.btn.src     = "music_" + ( prev_on? "on": "off" ) + ".png";
		this.btn.border  = "0";
		var _this        = this;
		contnr.addEventListener( "click", function () { _this.click() } );
		contnr.appendChild( this.btn );

		// adding audio
		this.music       = document.createElement( "audio" );
		this.music.loop  = this.music.autoplay = true;
		this.music.muted = !prev_on;
		for ( i in types )
			this.music.innerHTML += "<source src=\"mario_theme." + types[i] + "\" type=\"audio/" + types[i] + "\">";
		contnr.appendChild( this.music );

	};

	/* button click handler */
	Music.prototype.click = function () {
		var exp_time = 0;
		if ( this.music.muted ) {
			this.music.muted = false;
			this.btn.src = "music_on.png";
		}
		else {
			this.music.muted = true;
			this.btn.src = "music_off.png";
			exp_time     = 60 * 60 * 24 * 365; // a year
		}
		document.cookie  = "nomusic; max-age=" + exp_time + ";";
	};

	/* style injection */
	function setStyle() {
		var lnk_obj  = document.createElement( "link" );
		lnk_obj.rel  = "stylesheet";
		lnk_obj.type = "text/css";
		lnk_obj.href = "music.css";
		document.head.appendChild( lnk_obj );
	};

	/************
	 *   Main   *
	 ************/
	setStyle();
	new Music();

})();

