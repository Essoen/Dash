var host = "http://10.0.0.9:8081";
var apiKey = "46abdc48319c66c67962883b06ec7f74";

function refresh(){
	clearFields(); 
	getHistory();
	getUpcoming(); 
}

function clearFields(){
	$("#log").html("");
	$("#history").html("");
	$("#upcoming").html("");
}

function changeSettings(){ //@TODO
	return; 
}

function getHistory(){ // Cotacts SickBeard and gets the latest downladed episodes.
	var log = $("#log");
	$.ajax({
		type: "GET",
		url: host + "/api/" + apiKey + "/?cmd=history&type=downloaded&limit=25",
		data: String,
		dataType: "jsonp", 
		error: function(){
			log.append("Something is wrong, we can't get the history of downloaded episodes.");
		},
		success: function(data){
			presentHistory(data); 
		}
	})
}

function getUpcoming(){ // Cotacts SickBeard and gets the upcoming episodes.
	var log = $("#log");
	$.ajax({
		type: "GET",
		url: host + "/api/" + apiKey + "/?cmd=future&sort=date",
		data: String,
		dataType: "jsonp", 
		success: function(data){
			if (data.result == "success"){
				presentUpcoming(data); 
			}else{
				log.append("Something is wrong, we can't get the upcoming episodes.");
			}
		}
	});
}

function presentHistory(data){ // Presents the history-data
	var loc = $("#history");
	var episodes = data.data; 
	var addedEpisodes = new Array(); // Holds the added episodes, so we can check if a download is just a new version.
	for (var i = 0; i < episodes.length; i++){
		var ep = episodes[i];
		if ( addedEpisodes.indexOf(ep.show_name+ep.season+ep.episode) != -1) {
			continue; 
		}
		var btn = "<a href='"+"'<span class='glyphicon glyphicon-play'></span>"; // Needs padding.
		loc.append( btn + "<a onClick='checkOff()' >"+ ep.show_name + " - " + ep.season + " x " + ep.episode +"</a><br>"); 
		loc.append(getFilePath(ep)); 
		addedEpisodes.push(ep.show_name+ep.season+ep.episode);
	}
}

function presentUpcoming(data){ // Presents the upcoming-data
	var loc = $("#upcoming"); 
	var eps  = [data.data.today, data.data.soon, data.data.later];
	for (var time = 0; time < eps.length; time++){
		var episodes = eps[time]; 
		for (var i = 0; i < episodes.length; i++){
			var ep = episodes[i];
			loc.append(ep.show_name+ " - " + ep.airdate + " - " + ep.season + " x " + ep.episode +"<br>"); 
		}
	}
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
		async: false, 
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

function isToBeShown(tvdbid){ 
	// Tries to find out if download is backlog-download, or new episode.
	show = true; 
	$.ajax({
		type: "GET", 
		url: host + "/api/" + apiKey + "?cmd=show&tvdbid=" + tvdbid.toString(),
		data: String,
		dataType: "jsonp", 
		async: false,
        cache: false,
        timeout: 30000, 
        error: function(){
        	$("#log").append("Method isToBeShown failed for " + tvdbid.toString());
        	return true; 
        },
		success: function(data){
			console.log(data.data.status);
			if (data.data.status != "Ended"){ // If it's not a running show, this episode is backlog-download.
				return true;  
			}
			return false; 
		}
	});
}