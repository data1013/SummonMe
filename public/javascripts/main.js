var summonfai;
var closestchampion = "";
var percentmatch = 0;
var count = 0;


var full_champion_list = ['Aatrox', 'Ahri', 'Akali', 'Alistar', 'Amumu', 'Anivia', 'Annie', 'Ashe', 'Azir', 'Bard', 'Blitzcrank', 'Brand', 'Braum', 'Caitlyn', 'Cassiopeia', "Cho'Gath", 'Corki', 'Darius', 'Diana', 'Draven', 'DrMundo', 'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz', 'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Graves', 'Hecarim', 'Heimerdinger', 'Irelia', 'Janna', 'JarvanIV', 'Jax', 'Jayce', 'Karma', 'Karthus', 'Kassadin', 'Katarina', 'Kayle', 'Kennen', "Kha'Zix", 'Kindred', "Kog'Maw", 'LeBlanc', 'LeeSin', 'Leona', 'Lissandra', 'Lulu', 'Lux', 'Malphite', 'Malzahar', 'Maokai', 'MasterYi', 'MissFortune', 'Mordekaiser', 'Morgana', 'Nami', 'Nasus', 'Nautilus', 'Nidalee', 'Nocturne', 'Nunu', 'Olaf', 'Orianna', 'Pantheon', 'Poppy', 'Quinn', 'Rammus', "Rek'Sai", 'Renekton', 'Rengar', 'Riven', 'Rumble', 'Ryze', 'Sejuani', 'Shaco', 'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Sona', 'Soraka', 'Swain', 'Syndra', 'TahmKench', 'Talon', 'Taric', 'Teemo', 'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'TwistedFate', 'Twitch', 'Udyr', 'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vi', 'Viktor', 'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xerath', 'XinZhao', 'Yasuo', 'Yorick', 'Zac', 'Zed', 'Ziggs', 'Zilean', 'Zyra']

//var originalchampionslist = full_champion_list.slice(0, 151);

var champions = full_champion_list;


$(document).ready(function(){
	init();
	$('#pokemonme').on('click', function(){
		$('#pokemonme').prop('disabled', true);
		$('#pokemonme').val('Calculating...');
		var files = $('#uploadselfie')[0];
		if (files.files && files.files[0]){
			file = files.files[0];
			var serverUrl = 'https://api.parse.com/1/files/' + file.name;
			if (file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/jpg"){
				$.ajax({
					type: "POST",
					beforeSend: function(request) {
						request.setRequestHeader("X-Parse-Application-Id", 'odMFA37DyCogTlQTQuoq6pAaPT9eInXUNKHAFo9M');
						request.setRequestHeader("X-Parse-REST-API-Key", 'eTWx8Lg0izbdkMqKwqSHFX1zp88eGmcIEhF4tIQv');
						request.setRequestHeader("Content-Type", file.type);
					},
					url: serverUrl,
					data: file,
					processData: false,
					contentType: false,
					success: function(data) {
						summonme(data.url);
					},
					error: function(data) {
						var obj = jQuery.parseJSON(data);
						alert(obj.error);
					}
				});
			} else {
				alert('Upload file must be .png, .jpg, or .jpeg');
			}
		}	
	});

/*
	$('#changeContent').on("click", '#tofirstgen', function(e){
		champions = originalchampionslist;
		console.log(champions.length);
		$('#changeContent').html("Switch back to <a id='toall'> all the Pokémon</a>.");
	});

	$('#changeContent').on("click", '#toall', function(e){
		champions = full_champion_list;
		console.log(champions.length);
		$('#changeContent').html("Too many Pokémon? Try just the <a id='tofirstgen'> first generation</a>.");
	});
*/

	$(".myButton").hover(function() {
    	$("#login-form").css({"visibility":"visible"});
    	$(".myButton").css({"background-image":"url(../images/playpostclick.png)"});
    });

    $('#login-form').on('click', '.resultlink', function(){
    	console.log('reloading');
    	location.reload(true);
    });


});

function init(){
	$.post("https://api.clarifai.com/v1/token/", 
	{
		grant_type: "client_credentials",
		client_id: "7aHTExCPi2drd-DX2dJjyQNu7elDvMXxvTo8KHgu",
		client_secret: "rTSOazFe9NFcpVkSn-_TDWc13wSsyBNKPlMh5dES"
	},
	function(data, status){
		if (status == "success"){
			summonfai = new Clarifai(
		        {
		            'accessToken': data.access_token
		        }
		    );
		}
	});
    
}

function positive(url, champ){
	try{
		summonfai.positive(url, champ);
		summonfai.train(champ);
	} catch (err){
		console.log(err.message);
	}
}

function negative(url, champ){
	try{
		summonfai.negative(url, champ);
		summonfai.train(champ);
	} catch (err){
		console.log(err.message);
	}
}

function getpercentage(j, url){
	var thischampion = champions[j];
	summonfai.predict(url, thischampion).then(
		function(response){
			var thispercentage = response.score;
			if (thispercentage > percentmatch){
				percentmatch = thispercentage;
				closestchampion = thischampion;
				console.log(closestchampion + ", " + percentmatch);
				if (thispercentage > 0.8){
					positive(url, thischampion);
				} else if (thispercentage < 0.2){
					negative(url, thischampion);
				}
			}
			aftermath();
			return 0;

		},
		function(e){
			// an error occurred
			console.log(e);
			return 0;
		}
	);
}

function summonme(url){
	for (var i = 0; i < champions.length; i++){
		getpercentage(i, url);
	}
}

function aftermath(){
	count++;
	if (count == champions.length){
		console.log("Closest champion: " + closestchampion + "\nPercentage similarity: " + percentmatch);
		percentmatch = (100*percentmatch).toFixed(2);
		$('#pokemonme').prop('disabled', false);
		$('#pokemonme').val('Submit');
		$('#login-form').html("<p class='shadowOutline3'>Congrats! You match <a target='_blank' class='resultlink' href='http://www.google.com/images?q=lol+" + closestchampion + "'>" + closestchampion + "</a> the most!<br>Confidence: " + percentmatch + "%");
		closestchampion = "";
		percentmatch = 0;
		count = 0;
	}
	
}