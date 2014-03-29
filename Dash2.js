if (Meteor.isClient) {

    update(); // Inital
    Meteor.setTimeout(update, 0.5* 60000);

    // Templates
    Template.content.downloaded = function() {
        return Session.get("downloaded");
    };

    Template.content.upcoming = function() {
        return Session.get("upcoming");
    };

    // Methods
    function update(){
        updateDownloaded();
        updateUpcoming();
    }

    function updateUpcoming(){
        Meteor.call("getUpcoming", function(error, results) {
            console.log(results.data);
            Session.set("upcoming", presentUpcoming(results.data));
        });
    }

    function updateDownloaded(){
        Meteor.call("getHistory", function(error, results){
            Session.set("downloaded", presentHistory(results.data));
        });
    }

    function checkForService(){
      $.ajax({
        type: "GET",
        url: host + "/api/" + apiKey + "/?cmd=sb.ping",
        dataType: "jsonp",
        error: function(){
            return false;
        },
        success: function(data){
            return true;
        }
      })
    }

    function presentHistory(data){ // Presents the history-data
        if (!data){
            return "Something is wrong.";
        }
        var html = "";
        var episodes = data.data;
        var addedEpisodes = new Array(); // Holds the added episodes, so we can check if a download is just a new version.
        for (var i = 0; i < episodes.length; i++){
            var ep = episodes[i];
            if (addedEpisodes.indexOf(ep.show_name+ep.season+ep.episode) != -1){
                continue;
            }
            // getStatus(ep);
            html += "<li> " + ep.show_name + " - " + ep.season + " x " + ep.episode  + "</li>";
            addedEpisodes.push(ep.show_name+ep.season+ep.episode);
            if (i == 40)
                break;
        }
        return html;
    }


    function presentUpcoming(data){ // Presents the upcoming-data
        var eps  = [data.data.today, data.data.soon, data.data.later];
        var toReturn = [];
        for (var time = 0; time < eps.length; time++){
            if (time == 0)
                var html = "<h3>Today</h3>";
            else if (time == 1)
                var html = "<h3>Soon</h3>";
            else if (time == 2)
                var html = "<h3>Later</h3>";
            var episodes = eps[time];
            for (var i = 0; i < episodes.length; i++){
                var ep = episodes[i];
                html += "<li> " + ep.show_name + " - " + ep.season + " x " + ep.episode  + "</li>";
            }
        toReturn.push(html);
        }
        return toReturn[0] + toReturn[1] + toReturn[2];
    }

    function checkOff(){ // Check out an episode
      // @TODO: Also allow unchecking if already checked.
      $(event.target).css('text-decoration', 'line-through');
      // @TODO: Implement some logic for remembering that this episode has been checked.
    }

    function getFilePath(episode){
      var id = getTVDBID(episode.show_name);
      $.ajax({
        type: "GET",
        url: host + "/api/" + apiKey + "?cmd=episode&tvdbid="+ id+"&season="+episode.season.toString() +"&episode="+ episode.episode.toString()+ "&full_path=1",
        data: String,
        dataType: "jsonp",
        success: function(data){
          console.log(data.data["location"]);
        }
      });
      return "";
    }

    function getTVDBID(showName){
      $.ajax({
        type: "GET",
        url: host + "/api/" + apiKey + "/?cmd=shows&sort=name",
        dataType: "jsonp",
        error: function(){
          $("#log").append("Could not get TVDBID for the show " + showName);
        },
        success: function(data){
          var shows = data.data;
          for (show in shows){
            if (shows[show].show_name == showName){
              return shows.show.tvdbid;
            }
          }
        }
      });
    }



    function getStatus(episodeData){
      // Gets the shows status
      $.ajax({
        type: "GET",
        url: host + "/api/" + apiKey + "?cmd=show&tvdbid=" + episodeData.tvdbid.toString(),
        data: String,
        dataType: "jsonp",
            error: function(){
              $("#log").append("Method isToBeShown failed for " + tvdbid.toString());
            },
        success: function(data){
          checkStatus(data, episodeData);
        }
      });
    }

    function checkStatus(showData, episodeData){
      if (showData.data.status != "Ended"){ // If it's not a running show, this episode is backlog-download.
        addToView(episodeData)
      }
    }

}

if (Meteor.isServer) {
    var port = "8081";
    var host = "http://10.0.0.9:" + port;
    var apiKey = "46abdc48319c66c67962883b06ec7f74";
    Meteor.methods({
        getHistory: function(){ // Cotacts SickBeard and gets the latest downladed episodes.
            return HTTP.get(host+"/api/" + apiKey + "/?cmd=history&type=downloaded&limit=50");
        },
        getUpcoming: function(){
            return HTTP.get(host + "/api/" + apiKey + "/?cmd=future&sort=date");
        }
    });
    Meteor.startup(function () {
        // code to run on server at startup
    });
}
