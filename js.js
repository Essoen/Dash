var host = "http://10.0.0.9:8081";
var apiKey = "46abdc48319c66c67962883b06ec7f74";
function getHistory(){ 
	var log = $("#log"); 
	log.append("Fetching data, hold on...");
	var sendUrl = host + "/api/" + apiKey + "/?cmd=history&type=downloaded&limit=25&jsonp=history&callback=?";
	$.ajax({
		type: "POST",
		url: host + "/api/" + apiKey + "/?cmd=history&type=downloaded&limit=25&jsonp=hist",
		data: String,
		dataType: "jsonp", 
		success: function(data){
			if (data.result == "success"){
				log.append("We did it!"); 
				reprHistory(data); 
			}else{
				log.append("Something is wrong.");
			}
		}
	})
}

function reprHistory(data){
	var episodes = data.data; 
	
}

function getUpcoming(){

}

function reprUpcoming(){

}