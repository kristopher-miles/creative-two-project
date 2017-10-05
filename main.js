const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";
const TEST_USER = "76561197995931407";
const ALL_GAMES_URL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const USER_BANS = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/";
var sumPlaytime;

function populateUserPlayedGames(userID){
    console.log("Getting stats for " + userID);
    var params = "?key=" + STEAM_API_KEY + "&steamid=" + userID.toString() + "&format=json" +
        "&include_appinfo=1&include_played_free_games=1";
    var url = ALL_GAMES_URL + params;
    $.get(url)
        .done(function ( data ) {
            console.log(this.url);
            var games = data['response']['games'];
            console.log(games);
            processUserGames(games);
            hasBans(userID);
        })
        .fail(function () {
            console.warn("Failed to make the REST call!");
            alert("API call failed!");
        })
}

function processUserGames(games){
    sumPlaytime=0;
    games.sort(function(a, b) {
        return parseFloat(a.playtime_forever) - parseFloat(b.playtime_forever);
    });
    games.reverse();
    updatePage(games);
}

function playerBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User is banned from games!");
}

function playerNeverBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User is a good community member! Never banned!");
}

function hasBans(user) {
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
function updatePage(games){
    var output ="";
    console.log("Time to update the page");
    for(var i =0;i<games.length;i++){
        //We only want to include games the user has actually played.
        var gameTime = games[i]["playtime_forever"];
        if(gameTime>0){
            games[i]['played']=(gameTime/60).toFixed(2);
            output += addRow(games, i);
            sumPlaytime+=gameTime;
        }
    }
    $("#output-table").html(output);
}

function addRow(games, i){
    var output ="<tr><th scope=&quot;row&quot;>";
    output+=games[i]["name"];
    output+="</th><td>";
    output+=games[i]["played"];
    output+=" hours</td><td>";
    output+=games[i]["numAchievements"];
    output+="</td></tr>";
    return output;
}

$("#search-username").click(function(){
    var user = $("#username-input").val();
    if (user === "") {
        populateUserPlayedGames(TEST_USER)
    }
    var url = "http://steamcommunity.com/id/" + user.toLowerCase() + "?xml=1";
    console.log("url: " + url);
    $.get(url, function(data, status){
        if (data.getElementsByTagName("error").length > 0) {
            console.warn("User does not exist!");
        }
        var steamID = data.getElementsByTagName("steamID64")[0].childNodes[0].data;
        console.log(steamID);
        populateUserPlayedGames(steamID);
    });
});