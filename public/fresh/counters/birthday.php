<?php

/*
 *  Description: Birthday counter.
 *  Revised: 03/10/15
 *  Site: http://shoobyd.herobo.com
 *  Design: Samantha
 *  Author: Baruch Mustakis (a.k.a. ShoobyD)
 *  License: This file is under the GNU General Public License (GPL).
 */


// strings and sources.
include 'counterz.php';
$no_date_msg_1 = 'Error: No date parameter.';
$no_date_msg_2 = 'Add ?date=dd/mm to end of URL.';
$bad_date_msg  = 'Error: Date must be in dd/mm format.';
$far_date_msg  = 'Error: Date out of range.';
$img_base      = 'imgsrc/Birthday_base.png';
$img_default   = 'imgsrc/Birthday_today.png';
//$bad_date_msg = 'Error: Impossible date entered.';


if ( !isset( $_GET['date'] ) ) error_image( $no_date_msg_1, $no_date_msg_2 );

$date = $_GET['date'].'/'.date('Y');
$num_days = get_days( $date, $bad_date_msg );

// birthday of this year has already passed.
if ( $num_days < 0 ) {
	$num_days = get_days( $date.' +1 year', $bad_date_msg );
}

// set image, export it and free alloc space.
if ( $num_days ) {
	// parameters: $img, $days, $digits, $pos_x, $pos_y, $out_size, $text_color, $outline_color, $shade_color.
	make_image( $img_base, $num_days, 3, 88, 11, 'b61839', 2, 'ffffff', '7f7f7f' );
}

// it's mah b-day!!
else {
	header( 'Content-type: image/png' );
	echo file_get_contents( $img_default );
}

?>
