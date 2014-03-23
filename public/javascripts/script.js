$(document).ready(function() {

  var feed = new Instafeed({
      get: 'tagged',
      tagName: 'brazil2014',
      clientId: '3dad719abecd475d85234d084d12ffc0',
      limit:60
  });
  feed.run();

  $('.showTweets').on('click', function()
  {
  	$('section').toggleClass('off');
  });

	$('header ul li').on('click', function()
	{
		$('header ul li.active').removeClass('active');

		$(this).addClass('active');

		currentState = $(this).attr('data-i');

		$('.cartodb-popup').remove();
	});

	$('ul.rightMenu li').on('click', function()
	{
		$('ul.rightMenu li.active').removeClass('active');

		$(this).addClass('active');

		currentStateForRightMenu = $(this).attr('data-i');

		if(currentStateForRightMenu == "0")
		{
			$("#instafeed").hide();
			$(".showTweets").show();
		}
		else
		{
			$("#instafeed").show();
			$(".showTweets").hide();
		}
	});

	var socket = io.connect(window.location.hostname);

	var tweets = "";

	var alreadyCaptured = [];
	var alreadyCapturedAll = [];

	var counter = 0;

	var canLoadMore = true;

	socket.on('data', function(data) {

		if(currentStateForRightMenu == "0")
		{
			tweets = "";

			if(data.user != null && canLoadMore)
			{
				canLoadMore = false;
				window.setTimeout(function()
				{

					if(alreadyCapturedAll.length > 30) alreadyCapturedAll.pop();
					alreadyCapturedAll.reverse();
					alreadyCapturedAll.push("<span style='color: #2980b9'>@" + data.user.screen_name + "</span>: " + data.text);
					alreadyCapturedAll.reverse();

					for(var i in alreadyCapturedAll)
					{
						if(alreadyCapturedAll[i] !== undefined)
						{
							tweets += "<li>";

							tweets += alreadyCapturedAll[i];

							tweets += "</li>";
						}
					}

					$('ul.allTweets').html(tweets);

					canLoadMore = true;
				}, 500);
			}
		}

		var length = Object.keys(countriesHash).length;

		var toBlink = (Math.round((Math.random()*100))) %length;

		var counterTo = 0;

		if(currentState == "0")
		{
			jQuery.each(countriesHash, function(i, val)
			{
				//console.log(toBlink+ " - "+ counterTo);

				if(toBlink == counterTo)
				{
					blinkCountry(countriesHash[i])

					if(currentCountry == i)
					{
						alreadyCaptured.push("<span style='color: #2980b9'>@" + data.user.screen_name + "</span>: " + data.text);
						alreadyCaptured.reverse();

						tweets = "";

						for(var i in alreadyCaptured)
						{
							if(alreadyCaptured[i] !== undefined)
							{
								tweets += "<li>";

								tweets += alreadyCaptured[i];

								tweets += "</li>";
							}
						}

						counter++;

						$('#toFillContent .fillWithTweets').html(tweets);
					}
				}

				counterTo++;
			});
		}
		else
		{

			jQuery.each(countriesHash, function(i, val)
			{
				//console.log(toBlink+ " - "+ counterTo);

				if(toBlink == counterTo)
				{
					blinkCountry(countriesHash[i]);
				}
				
				counterTo++;
			});
		}
	});
	
	/*window.setTimeout(function(){
	countriesRef
	.on('value', function(data)
	{
		data.forEach(function(country)
		{
			//console.log(country.name());
			var news = data.val();

			for(var i in news)
			{
				console.log(news[i].newsThumb.src);
				console.log(news[i].newsTitle.href);
				console.log(news[i].newsTitle.text);
			}
		})
	});
},3000);*/
});
