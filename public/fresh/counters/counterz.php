<?php

/*
 *  Description: General functions for counters.
 *  Revised: 03/10/15
 *  Site: http://shoobyd.herobo.com
 *  Author: Baruch Mustakis (a.k.a. ShoobyD)
 *  License: This file is under the GNU General Public License (GPL).
 */

 
// set timezone to Israel.
date_default_timezone_set( 'Asia/Jerusalem' );


/**********************************
*   getting num days from $date   *
**********************************/
function get_days( $date, $err_msg='' ) {
	if ( version_compare( PHP_VERSION, '5.3.0' ) >= 0 ) {
		$date = date_create_from_format( 'd/m/Y', $date );
		return date_diff( date_create(), $date )->format( '%r%a' );
	}
	else {
		$date = str_replace( '/', '-', $date );
		$date = @strtotime( $date )
			 or error_image( $err_msg );
		return ceil( ( $date - time() ) / ( 60*60*24 ) );
	}
}


/************************************
*   allocate color in hex format    *
************************************/
function hex_color_alloc( $img, $color ) {
	$r = hexdec( '0x'.$color{0}.$color{1} );
	$g = hexdec( '0x'.$color{2}.$color{3} );
	$b = hexdec( '0x'.$color{4}.$color{5} );
	return imagecolorallocate( $img, $r, $g, $b );
}


/********************
*   setting image   *
********************/
function make_image( $img, $days, $digits=3, $pos_x, $pos_y, $text_color, $out_size=1, $outline_color='', $shade_color='' ) {

	$days = str_pad( $days, $digits, '0', STR_PAD_LEFT );
	$img  = imagecreatefrompng( $img );

	// set colors.
	$text_color = hex_color_alloc( $img, $text_color );
	if ( $outline_color ) $outline_color = hex_color_alloc( $img, $outline_color );
	if ( $shade_color   ) $shade_color   = hex_color_alloc( $img, $shade_color   );

	// draw shadow.
	if ( $shade_color )
		for ( $i = $pos_x - $out_size; $i < $pos_x + $out_size + 1; $i++ )
			imagestring( $img, 5, $i + 1, $pos_y + $out_size + 1, $days, $shade_color );
	// draw outline.
	if ( $outline_color )
		for ( $i = $pos_x - $out_size; $i < $pos_x + $out_size + 1; $i++ )
			for ( $j = $pos_y - $out_size; $j < $pos_y + $out_size + 1; $j++ )
				imagestring( $img, 5, $i, $j, $days, $outline_color );
	// draw text.
	imagestring( $img, 5, $pos_x, $pos_y, $days, $text_color );

	// send image.
	header( 'Content-type: image/png' );
	imagepng( $img );
	imagedestroy( $img );

}


/***************************
*   return error message   *
***************************/
function error_image( $msg, $msg2='', $bg_color='f0f4f8', $text_color='850e5b' ) {

	$height    = ( $msg2 )? 52: 32;
	$len       = max( strlen( $msg ), strlen( $msg2 ) );
	$font_size = ( $len > 36 )? 4: 5;
	$offset    = max( 12, min( 32, ( 350 - $len*8 ) / 2 ) );

	$img = @imagecreate( 350, $height )
		 or die( 'Cannot Initialize new GD image stream' );

	// draw error message.
	$bg_color   = hex_color_alloc( $img, $bg_color   );
	$text_color = hex_color_alloc( $img, $text_color );
	imagestring( $img, $font_size, $offset, 8, $msg, $text_color );
	if ( $msg2 ) imagestring( $img, $font_size, $offset, 28, $msg2, $text_color );

	// send image.
	header( 'Content-type: image/png' );
	imagepng( $img );
	imagedestroy( $img );
	die();

}

?>
