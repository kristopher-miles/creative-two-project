const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";
const TEST_USER = "76561197995931407";
const ALL_GAMES_URL = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";
const USER_BANS = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/";
var sumPlaytime;

function populateUserPlayedGames(userID){
    $("#alerts").html("");
    console.log("Getting stats for " + userID);
    var params = "?command=games&steamid=" + userID.toString();
    var url = "http://ec2-54-201-196-253.us-west-2.compute.amazonaws.com/creative-two-project/steam.php" + params;
    console.log("Got: "+this.url);
    $.getJSON(url).done(function ( data ) {
            var games = data['response']['games'];
            processUserGames(games);
            //hasBans(userID);
        })
        .fail(function () {
            console.warn("Failed to make the REST call!");
        })
}

function processUserGames(games){
    if (games==null){
        userNotFound();
        return null;
    }
    sumPlaytime=0;
    games.sort(function(a, b) {
        return parseFloat(a.playtime_forever) - parseFloat(b.playtime_forever);
    });
    games.reverse();
    updatePage(games);
}

function userNotFound(){
    var html = "<div class=&quot;alert alert-success&quot; role=&quot;alert&quot;>This user cannot be found. Is that a valid steamID?</div>";
    $("#alerts").html(html); 
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
	sumPlaytime = (sumPlaytime/60/24).toFixed(1);
	var hoursPlayedHTML = "<div class=&quot;alert alert-success&quot; role=&quot;alert&quot;>This user has played "+sumPlaytime+" days.</div>";
	$("#alerts").html(hoursPlayedHTML);
}

function addRow(games, i){
    var output ="<tr><th scope=&quot;row&quot;>";
    output+=games[i]["name"];
    output+="</th><td>";
    output+=games[i]["played"];
    output+=" hours</td></tr>";
    return output;
}

$("#search-username").click(function(e){
	e.preventDefault();
    var user = $("#username-input").val();
    if (user === "") {
        populateUserPlayedGames(TEST_USER)
    }
    
    populateUserPlayedGames(user);
    
});