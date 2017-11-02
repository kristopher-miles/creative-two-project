var express = require('express');
var router = express.Router();
const https = require('https');
const STEAM_API_KEY = "43377D01563646A8748EF8FBCB0E1B7E";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', {root: 'public'});
});

router.get('/getsteamdata',function(req,res,next){
  var result = [];
  var querry_url= "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/"+"?key="+STEAM_API_KEY+"&steamid="+req.query.u+"&format=json" + "&include_appinfo=1&include_played_free_games=1"
  https.get(querry_url,function(response){
    response.on('data',function(d){
      result += d;});
      response.on('end', function(){
        res.status(200).json(JSON.parse(result));
      });
    });
});

router.get('/getsteambans',function(req,res,next){
  var result = [];
  var querry_url= "https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/"+"?key="+STEAM_API_KEY+"&steamids="+req.query.u+"&format=json"
  https.get(querry_url,function(response){
    response.on('data',function(d){
      result += d;});
      response.on('end', function(){
        res.status(200).json(JSON.parse(result));
      });
    });
});


module.exports = router;
