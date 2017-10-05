const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";
const TEST_USER = "76561197995931407";
const ALL_GAMES = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const GAME_SCHEMA = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
const MASTER_GAME_LIST = "http://api.steampowered.com/ISteamApps/GetAppList/v0001/";
const USER_BANS = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/";
var sumPlaytime;

function populateUserPlayedGames(){
    
    var user = getUser();
    var url = ALL_GAMES+"?key="+STEAM_API_KEY+"&steamid="+user+"&include_appinfo=1&include_played_free_games=1&format=json";
    var table;
    $.ajax({
      type: 'GET',
      url: url,
      contentType: 'text/plain',
      xhrFields: {
            withCredentials: false
      },
      headers: {},
      success: function(parsed_json) {
          var table = parsed_json['response']['games'];
          processUserGames(table);
      },
      error: function() {
          alert("REST SERVICE ERROR");
      }
   });
}

function processUserGames(table){  
    sumPlaytime=0;
    hasBans();
    table.sort(function(a, b) {
        return parseFloat(a.playtime_forever) - parseFloat(b.playtime_forever);
    });
    table.reverse();
    updatePage(table);               
}

function playerBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User is banned from games!");
}

function playerNeverBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User is a good community member! Never banned!");
}

function hasBans(){
	var user = getUser();
	url = USER_BANS+"?key="+STEAM_API_KEY+"&steamids="+user+"&format=json";
	$.ajax({
      type: 'GET',
      url: url,
      contentType: 'text/plain',
      xhrFields: {
            withCredentials: false
      },
      headers: {},
      success: function(parsed_json) {
          var vacBan = parsed_json['players'][0]['VACBanned'];
		  var communityBan = parsed_json['players'][0]['CommunityBanned'];
          var econBan = parsed_json['players'][0]['EconomyBan'];
		  if(vacBan==true||communityBan==true||econBan==true){
			  playerBanned();
		  }
		  else{
			  playerNeverBanned();
		  }
      },
      error: function() {
          alert("Kill me now.");
      }
   });
	
}

//This function updates the page with the information we now know from all our HTTP requests. We pass in the finished table when we're done getting crap.
function updatePage(table){
    var output ="";
    console.log("Time to update the page");
    for(var i =0;i<table.length;i++){
        //We only want to include games the user has actually played.
        var gameTime = table[i]["playtime_forever"];
        if(gameTime>0){
            table[i]['played']=(gameTime/60).toFixed(2);
            output += addRow(table, i);
            sumPlaytime+=gameTime;
        }
    }
    $("#output-table").html(output);
}

function addRow(table, i){
    var output ="<tr><th scope=&quot;row&quot;>";
    output+=table[i]["name"];
    output+="</th><td>";
    output+=table[i]["played"];
    output+=" hours</td><td>";
    output+=table[i]["numAchievements"];
    output+="</td></tr>";
    return output;
}

//This method makes sure the user isn't blank. If it is, we use the test user instead.
function getUser(){
    var user = $("#username-input").val();
    if (user ==null || user==""||user.length!=23){
        return TEST_USER;
    }
    return user;
}

$(document).ready(function() {
    populateUserPlayedGames();
});