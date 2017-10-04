const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";
const TEST_USER = "76561197995931407";
const ALL_GAMES = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const GAME_SCHEMA = "http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/";
const MASTER_GAME_LIST = "http://api.steampowered.com/ISteamApps/GetAppList/v0001/";
const USER_BANS = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/";
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
          newUpdateTable(table);
      },
      error: function() {
          alert("Kill me now.");
      }
   });
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

function newUpdateTable(userGamesTable){                
    url = MASTER_GAME_LIST+"?key="+STEAM_API_KEY+"&format=json";
    $.ajax({
      type: 'GET',
      url: url,
      contentType: 'text/plain',
      xhrFields: {
            withCredentials: false
      },
      headers: {},
      success: function(parsed_json) {
          var table = parsed_json['applist']['apps']['app'];
          var outputAppsTable=[];
          for(var i =0;i<table.length;i++){
              var id =table[i]['appid'];
              //console.log("added game id: "+id+" with name: "+table[i]['name']);
              outputAppsTable[id]=table[i]['name'];
          }
         //Now that we have all the game names, we can add them correctly.
          for(var i =0;i<userGamesTable.length;i++){
              if(userGamesTable[i]["playtime_forever"]>0){
                  var gameID=userGamesTable[i]["appid"];
                  userGamesTable[i]['name']=outputAppsTable[gameID];
                  userGamesTable[i]['played']=(userGamesTable[i]["playtime_forever"]/60).toFixed(2);
                  userGamesTable[i]['numAchievements']=0;
              }
          }
          
          //Finally, update the output table.
		  hasBans();
		  userGamesTable.sort(function(a, b) {
    		return parseFloat(a.playtime_forever) - parseFloat(b.playtime_forever);
		  });
		  userGamesTable.reverse();
          updatePage(userGamesTable);
        
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
    getAllGames();
});