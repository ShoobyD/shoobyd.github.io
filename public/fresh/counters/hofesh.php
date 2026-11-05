<?php

/*
 *  Description: Vacation counter.
 *  Revised: 03/10/15
 *  Site: http://shoobyd.herobo.com
 *  Design: Samantha
 *  Author: Baruch Mustakis (a.k.a. ShoobyD)
 *  License: This file is under the GNU General Public License (GPL).
 */


// strings and sources.
include 'counterz.php';
$no_date_msg_1 = 'Error: No date parameter.';
$no_date_msg_2 = 'Add ?date=dd/mm/yyyy to end of URL.';
$bad_date_msg  = 'Error: Date must be in dd/mm/yyyy format.';
$far_date_msg  = 'Error: Date out of range.';
$img_base      = 'imgsrc/Hofesh_base.png';
$img_default   = 'imgsrc/Hofesh_started.png';
//$bad_date_msg = 'Error: Impossible date entered.';


if ( !isset( $_GET['date'] ) ) error_image( $no_date_msg_1, $no_date_msg_2 );

$num_days = get_days( $_GET['date'], $bad_date_msg );

// date has passed.
if ( $num_days < 1 ) {
	header( 'Content-type: image/png' );
	echo file_get_contents( $img_default );
}

// date too far.
else if ( $num_days > 999 ) echo error_image( $far_date_msg );

// set image, export it and free alloc space.
else {
	// parameters: $img, $days, $digits, $pos_x, $pos_y, $out_size, $text_color, $outline_color, $shade_color.
	make_image( $img_base, $num_days, 3, 163, 10, 'f1f9ff', 2, '075593', 'ffffff' );
}

?>
