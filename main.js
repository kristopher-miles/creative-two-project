const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";
const TEST_USER = "76561197995931407";
const ALL_GAMES = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const GAME_SCHEMA = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
var sumPlaytime;

function getAllGames(){
    sumPlaytime=0;
    var user = getUser();
    var url = ALL_GAMES+"?key="+STEAM_API_KEY+"&steamid="+user+"&format=json";
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
          updateTable(table);
      },
      error: function() {
          alert("Kill me now.");
      }
   });
}

//Goes through the table of responses from steam and gets the real names for each one.
function updateTable(table){
    //NOTE:Should change to single "http://api.steampowered.com/ISteamApps/GetAppList/v0001/" to avoid 
    var lengthToSearch = 3;
    
    for (var i =0;i<lengthToSearch;i++){
        var id = table[i]["appid"];
        if(table[i]["playtime_forever"]>0||i==table.length){
            sumPlaytime+=table[i]["playtime_forever"];
            table[i]["played"]=table[i]["playtime_forever"]/60;
            getGameName(table,i,id);
        }
    }
}

//Makes a request to steam to get a game's proper name by ID, and returns that ID as a string.
function getGameName(table,i,appID){
    var url = GAME_SCHEMA +"?key="+STEAM_API_KEY+"&appid="+appID;
        $.ajax({
      type: 'GET',
      url: url,
      contentType: 'text/plain',
      xhrFields: {
            withCredentials: false
      },
      headers: {},
      success: function(parsed_json) {
          var name = parsed_json["game"]["gameName"];
          table[i]["name"]=name;
          table[i]["numAchievements"]=parsed_json["game"]["availableGameStats"]["achievements"].length;
          updatePage(table);
          
      },
      error: function() {
          alert("Kill me now.");
      }
   });
}


//This function updates the page with the information we now know from all our HTTP requests. We pass in the finished table when we're done getting crap.
function updatePage(table){
    var output ="";
    for(var i =0;i<table.length;i++){
        //We only want to include games the user has actually played.
        if(table[i]["playtime_forever"]>0){
            output += addRow(table, i);
        }
    }
    $("#output-table").html(output);
}

function addRow(table, i){
    var output ="<tr><th scope=&quot;row&quot;>";
    output+=table[i]["name"];
    output+="</th><td>";
    output+=table[i]["played"];
    output+="hours</td><td>";
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
    getAllGames();

});