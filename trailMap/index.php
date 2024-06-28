<?php

$page_title = "Keep Sur Wild";
$page_css = "assets/css/style.css";

include ("./components/head.php"); // Top section up to and including body tag
include ("./layouts/main.php"); // An open div with layout class

include ("./components/nav.php"); // standalone div
include ("./components/welcome-header.php"); // standalone div
include ("./components/topo-map.php"); // standalone div + script

include ("./components/tail.php"); // closing tags for layout div, body, and html

include_once ("../../web_config/keep_sur_wild_db_connect.php"); // $msqli connect
// $query = "SELECT * FROM users";
// $result = mysqli_query($mysqli, $query);

// if ($result) {
//   $users = mysqli_fetch_all($result);

//   foreach ($users as $user) {
//     echo '<h6>Username: </h6>', $user[1], ' <h6>Registration date: </h6>', $user[3];
//   }

//   mysqli_free_result($result);
// }
mysqli_close($mysqli);
