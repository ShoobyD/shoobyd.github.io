<?php

/*
 *  Description: 2012 Olympic games counter.
 *  Revised: 03/10/15
 *  Site: http://shoobyd.herobo.com
 *  Design: Samantha
 *  Author: Baruch Mustakis (a.k.a. ShoobyD)
 *  License: This file is under the GNU General Public License (GPL).
 */


// strings and sources.
include 'counterz.php';
$date        = '27/07/2012';
$img_base    = 'imgsrc/Olympics2012_base.png';
$img_default = 'imgsrc/Olympics2012_started.png';

$num_days = get_days( $date );

// date has passed.
if ( $num_days < 1 ) {
	header( 'Content-type: image/png' );
	echo file_get_contents( $img_default );
}

// set image, export it and free alloc space.
else {
	// parameters: $img, $days, $digits, $pos_x, $pos_y, $out_size, $text_color, $outline_color, $shade_color.
	make_image( $img_base, $num_days, 3, 282, 10, '0854b5', 2, 'ffffff', '7f7f7f' );
}

?>
