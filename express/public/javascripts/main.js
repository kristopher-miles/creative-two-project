const TEST_USER = "76561197995931407";
const USER_BANS = "http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/";
var sumPlaytime;

function populateUserPlayedGames(userID){
    $("#alerts").html("");
    console.log("Getting stats for " + userID);
    var params = userID.toString();
    var url = "getsteamdata?u=" + params;
    console.log("Got: "+this.url);
    $.getJSON(url).done(function ( data ) {
            var games = data['response']['games'];
            processUserGames(games);
            hasBans(userID);
        })
        .fail(function () {
            console.log("Non-fatal error, continuing.");
        })
}

function processUserGames(games){
    if (games==undefined||games==null||games.length==0){
        userNotFound();
    }
    else{
        sumPlaytime=0;
        games.sort(function(a, b) {
            return parseFloat(a.playtime_forever) - parseFloat(b.playtime_forever);
        });
        games.reverse();
        updatePage(games);
    }
}

function userNotFound(){
    var html = "<div class=&quot;alert alert-success&quot; role=&quot;alert&quot;>This user cannot be found. Is that steam profile public?</div>";
    $("#alerts").html(html); 
}

function playerBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User is banned from games!");
}

function playerNeverBanned(){
	$("#bans").css('display','block');
	$("#bans").html("User has never been banned from a game.");
}

function hasBans(user) {
    var params = user.toString();
    var url = "getsteambans?u=" + params;
    $.getJSON(url).done(function ( data ) {
          var vacBan = data['players'][0]['VACBanned'];
		  var communityBan = data['players'][0]['CommunityBanned'];
          var econBan = data['players'][0]['EconomyBan'];
		  if(vacBan==true||communityBan==true||econBan!="none"){
			  playerBanned();
		  }
		  else{
			  playerNeverBanned();
		  }
        })
        .fail(function () {
            console.log("Non-fatal error, continuing.");
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

$(document).ready(function() {
    $("#search-username").click(function(e){
        e.preventDefault();
        var user = $("#username-input").val();
        if (user.toString().length==17&&!isNaN(user.toString())) {
            $("#alerts").html("");
            populateUserPlayedGames(user);
        }
        else{
           var alertHTML = "<div class=&quot;alert alert-success&quot; role=&quot;alert&quot;>Are you sure that is a valid steamID? A valid ID will be a number 17 digits long.</div>";
	       $("#alerts").html(alertHTML); 
        }
    });
    $("#whatis").toggle(false);
    $('#what-steam').click(function(e) {
        e.preventDefault();
         $('#whatis').toggle("slide");
    });
    
    $("#sample-user").click(function(e){
       e.preventDefault();
        $("#username-input").val(TEST_USER);
        populateUserPlayedGames(TEST_USER);
    });
    
});
