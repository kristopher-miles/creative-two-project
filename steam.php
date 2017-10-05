<?php

$STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";

if ($_GET["command"] == "games") {
    $url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/" . "?key=" . $STEAM_API_KEY . "&steamid=" . $_GET["steamid"] . "&format=json" . "&include_appinfo=1&include_played_free_games=1";
}

// create a new cURL resource
$ch = curl_init();

// set URL and other appropriate options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, 0);

// grab URL and pass it to the browser
curl_exec($ch);

// close cURL resource, and free up system resources
curl_close($ch);
?>