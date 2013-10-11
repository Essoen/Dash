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
function getHistory(){ 
	var log = $("#log");
	$.ajax({
		type: "POST",
		url: host + "/api/" + apiKey + "/?cmd=history&type=downloaded&limit=25&jsonp=hist",
		data: String,
		dataType: "jsonp", 
		success: function(data){
			if (data.result == "success"){
				reprHist(data); 
			}else{
				log.append("Something is wrong.");
			}
		}
	})
}

function getUpcoming(){
	var log = $("#log");
	$.ajax({
		type: "POST",
		url: host + "/api/" + apiKey + "/api/46abdc48319c66c67962883b06ec7f74/?cmd=future&sort=date&jsonp=up",
		data: String,
		dataType: "jsonp", 
		success: function(data){
			if (data.result == "success"){
				reprUpcoming(data); 
			}else{
				log.append("Something is wrong.");
			}
		}
	})
}
function reprHist(data){
	var loc = $("#history")
	var episodes = data.data; 
	for (var i = 0; i < episodes.length; i++){
		var ep = episodes[i];
		loc.append(ep.show_name + " - " + ep.season + "x" + ep.episode +"<br>"); 
	}
}

function reprUpcoming(data){
	var loc = $("#upcoming"); 
	var eps  = [data.data.today, data.data.soon, data.data.later];
	for (var time = 0; time < eps.length; time++){
		var episodes = eps[time]; 
		for (var i = 0; i < episodes.length; i++){
			var ep = episodes[i];
			loc.append(ep.show_name+ " - " + ep.airdate + " - " + ep.season + "x" + ep.episode +"<br>"); 
		}
	}
}