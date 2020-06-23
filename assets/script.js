var userLocation;
// arrays for storing business info below
var timeArray = {};
var routeArray = [];
var imgArray = [];
var urlArray = [];
var storeNameArray = [];
var arrayOfArrays = [];
// empty string for route time to later feed in generated info
var routeTime = "";
// converting route time to minutes and seconds
function timeConvert(routeTime) {
  var minutes = Math.floor(routeTime / 60);
  var seconds = routeTime % 60;
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return minutes + ":" + seconds;
}
// running geolocation for allow/block
$(document).ready(function () {
  userLocation = navigator.geolocation.getCurrentPosition(
    locationHandler,
    locationErrorHandler,
    options
  );
  // zipcode submit fields here, clears all arrays and empties button div
  $("#zipcode-submit").on("click", function () {
    $("#iceCreamStores").empty();
    timeArray = [];
    routeArray = [];
    imgArray = [];
    urlArray = [];
    storeNameArray = [];
    arrayOfArrays = [];
    $("#timerDisplay").attr("style", "display: none");
    var zipcode = $("#zipcode-input").val();
    getIceCreamStores(zipcode);
  });
  return userLocation;
});

// pulled following location data from
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
var options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};
function locationHandler(pos) {
  var crd = pos.coords;
  getIceCreamStores(crd);
}
function locationErrorHandler(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}
function determineTime(routeArray) {}

function getIceCreamStores(loc) {
  var data = { term: "ice cream" };
  var hasZip = false;
  if (loc && loc.latitude) {
    data.latitude = loc.latitude;
    data.longitude = loc.longitude;
  } else if (loc) {
    if (loc.length === 5 && Number(loc)) {
      data.location = loc;
      hasZip = true;
    }
    if (!(data.lattitude && data.longitude) && !data.location) {
      alert("Please enter a valid Zip Code.");
      return;
    }
  }
  var latPointA = loc.latitude;

  var lonPointA = loc.longitude;

  var URL =
    "https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?";
  var APIkey =
    "pZoeLz1SZU0FpO7ZzMtXIQ9dSW1UZ3Wp762C53LAb3zgJeMNvtwIQUCJL2-8hAAquHFK2XIiamEuOUXbuw5Rre3ie_pe1vknYXD9bCDCmd53ztY7KsdjUuIxlVvqXnYx";

  $.ajax({
    url: URL,
    method: "GET",
    headers: {
      Authorization: `Bearer ${APIkey}`,
    },
    data: data,
    success: function (result) {
      // console.log(result);
    },
    error: function (error) {
      console.log(error);
    },
  }).then(function (response) {
    $("#iceCreamStores").empty();

    for (var i = 0; i < 10; i++) {
      var storeURL = response.businesses[i].url;
      urlArray.push(storeURL);
    }
    for (var i = 0; i < 10; i++) {
      var imageURL = response.businesses[i].image_url;
      imgArray.push(imageURL);
    }

    var startingPos;

    if (hasZip) {
      startingPos = data.location;
    } else {
      startingPos = latPointA + "," + lonPointA;
    }

    var pointA = startingPos;
    for (var i = 0; i < 10; i++) {
      var latPointB = response.businesses[i].coordinates.latitude;
      var lonPointB = response.businesses[i].coordinates.longitude;
      var destinationPos = latPointB + "," + lonPointB;

      routeArray.push(destinationPos);
    }

    var mapQuestKey = "7qB0GaDmnvFBrBGryDHgvZH6KXuOKtkN";
    for (let i = 0; i < routeArray.length; i++) {
      var pointB = routeArray[i];

      var k = 0;
      var myURL =
        "https://www.mapquestapi.com/directions/v2/route?key=" +
        mapQuestKey +
        "&from=" +
        pointA +
        "&to=" +
        pointB;
      $.ajax({
        url: myURL,
        method: "GET",
        // generate buttons below
      }).then(function (res) {
        var travelTime = res.route.realTime;
        timeArray[i] = travelTime;
        arrayOfArrays.push(res.route.legs[0].maneuvers);
        var iceCreamStores = response.businesses[i].name;
        storeNameArray.push(iceCreamStores);
        var storeList = $("<button>").text(iceCreamStores);
        $(storeList).attr("class", "btn-block newIceCreamStoreButton");
        storeList.attr("id", "button" + (1 + i));
        var listItem = $("<li>").append(storeList);
        $("#iceCreamStores").append(listItem);

        storeList.append(
          $("<div>" + timeConvert(timeArray[i]) + " minutes away! " + "</div>")
        );
      });
    }

    var imgDiv = $("<img>");
    function directionsButtons(storeNumber) {
      $("#routeNarrativeOl").empty();
      for (var i = 0; i < arrayOfArrays[storeNumber].length; i++) {
        $("#routeNarrativeOl").append(
          $("<li>" + arrayOfArrays[storeNumber][i].narrative + "</li>")
        );
      }
    }
    // timer start, using button clicks to dynamically change timer start
    var timerStart = "";
    var timerInterval = setInterval(function () {
      var timer = timerStart.split(":");
      var minutes = parseInt(timer[0], 10);
      var seconds = parseInt(timer[1], 10);
      --seconds;
      minutes = seconds < 0 ? --minutes : minutes;
      if (minutes < 0) clearInterval(timerInterval);
      seconds = seconds < 0 ? 59 : seconds;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      $("#timerDisplay").text(minutes + ":" + seconds);
      if (minutes < 5) {
        $("#timerDisplay").attr("class", "perfect");
      } else if (minutes >= 5 && minutes < 12) {
        $("#timerDisplay").attr("class", "melting");
      } else {
        $("#timerDisplay").attr("class", "melted");
      }
      timerStart = minutes + ":" + seconds;
    }, 1000);
    // adds url image and store name to middle column
    $(document).on("click", "#button1", function (event) {
      event.preventDefault();
      directionsButtons(0);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[0]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeOne = timeConvert(timeArray[0]);
      timerStart = timeOne;
      $("#storeHeader").text(storeNameArray[0]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[0] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button2", function (event) {
      event.preventDefault();
      directionsButtons(1);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[1]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeTwo = timeConvert(timeArray[1]);
      timerStart = timeTwo;
      $("#storeHeader").text(storeNameArray[1]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[1] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button3", function (event) {
      event.preventDefault();
      directionsButtons(3);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[2]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeThree = timeConvert(timeArray[2]);
      timerStart = timeThree;
      $("#storeHeader").text(storeNameArray[2]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[2] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button4", function (event) {
      event.preventDefault();
      directionsButtons(3);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[3]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeFour = timeConvert(timeArray[3]);
      timerStart = timeFour;
      $("#storeHeader").text(storeNameArray[3]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[3] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button5", function (event) {
      event.preventDefault();
      directionsButtons(4);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[4]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeFive = timeConvert(timeArray[4]);
      timerStart = timeFive;
      $("#storeHeader").text(storeNameArray[4]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[4] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button6", function (event) {
      event.preventDefault();
      directionsButtons(5);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[5]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeSix = timeConvert(timeArray[5]);
      timerStart = timeSix;
      $("#storeHeader").text(storeNameArray[5]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[5] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button7", function (event) {
      event.preventDefault();
      directionsButtons(6);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[6]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeSeven = timeConvert(timeArray[6]);
      timerStart = timeSeven;
      $("#storeHeader").text(storeNameArray[6]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[6] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button8", function (event) {
      event.preventDefault();
      directionsButtons(7);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[7]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeEight = timeConvert(timeArray[7]);
      timerStart = timeEight;
      $("#storeHeader").text(storeNameArray[7]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[7] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button9", function (event) {
      event.preventDefault();
      directionsButtons(8);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[8]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeNine = timeConvert(timeArray[8]);
      timerStart = timeNine;
      $("#storeHeader").text(storeNameArray[8]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[8] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
    $(document).on("click", "#button10", function (event) {
      event.preventDefault();
      directionsButtons(9);
      $("#icecream-img").empty();
      $("#storeURLButton").empty();
      imgDiv.attr("src", imgArray[9]);
      $("#icecream-img").append(imgDiv);
      $("#timerDisplay").attr("style", "display: inline-block");
      var timeTen = timeConvert(timeArray[9]);
      timerStart = timeTen;
      $("#storeHeader").text(storeNameArray[9]);
      var storeLink = $("<button>");
      $(storeLink).attr("class", "btn-block storeLinkButton");
      $("#storeURLButton").append(storeLink);
      storeLink.append(
        $(
          "<a href='" +
            urlArray[9] +
            "' target='_blank'> Click here for our store hours, menu & more!</a>"
        )
      );
    });
  });
}
