var userLocation;
var timeArray = [];
var routeArray = [];

$(document).ready(function () {
  userLocation = navigator.geolocation.getCurrentPosition(
    locationHandler,
    locationErrorHandler,
    options
  );
  $("#zipcode-submit").on("click", function () {
    var zipcode = $("#zipcode-input").val();
    getIceCreamStores(zipcode);
  });
  return userLocation;
});

// pulled following location data from
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function locationHandler(pos) {
  var crd = pos.coords;

  getIceCreamStores(crd);

  console.log("Your current position is:");
  console.log("Latitude: " + crd.latitude);
  console.log("Longitude: " + crd.longitude);
}
function locationErrorHandler(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function getIceCreamStores(loc) {
  var data = { term: "ice cream" };
  if (loc && loc.latitude) {
    data.latitude = loc.latitude;
    data.longitude = loc.longitude;
  } else if (loc) {
    if (loc.length === 5 && Number(loc)) {
      data.location = loc;
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
    // console.log(response);
    $("#iceCreamStores").empty();

    var storeOne = response.businesses[0].name;
    var storeTwo = response.businesses[1].name;
    var storeThree = response.businesses[2].name;
    var storeFour = response.businesses[3].name;
    var storeFive = response.businesses[4].name;
    var storeSix = response.businesses[5].name;
    var storeSeven = response.businesses[6].name;
    var storeEight = response.businesses[7].name;
    var storeNine = response.businesses[8].name;
    var storeTen = response.businesses[9].name;

    for (var i = 0; i < 10; i++) {
      var iceCreamStores = response.businesses[i].name;
      var storeList = $("<button>").text(iceCreamStores);
      $(storeList).attr("class", "btn-block newIceCreamStoreButton");
      storeList.attr("id", iceCreamStores);
      var listItem = $("<li>").append(storeList);
      $("#iceCreamStores").append(listItem);
    }

    //   var storeAddress = response.businesses[i].location.address1;

    // adding new id to each button
    var startingPos = latPointA + "," + lonPointA;
    var pointA = startingPos;

    for (var i = 0; i < 10; i++) {
      var latPointB = response.businesses[i].coordinates.latitude;
      var lonPointB = response.businesses[i].coordinates.longitude;
      var destinationPos = latPointB + "," + lonPointB;
      console.log("Destination: ", destinationPos);
      routeArray.push(destinationPos);
    }
    console.log(routeArray);

    var mapQuestKey = "bDYO5JVsT0lGPolecMUk1lCGVNostBHT";

    for (var i = 0; i < routeArray.length; i++) {
      console.log(routeArray[i]);
      var pointB = routeArray[i];

      // var pointB = destinationPos;

      var myURL =
        "https://www.mapquestapi.com/directions/v2/route?key=bDYO5JVsT0lGPolecMUk1lCGVNostBHT&from=" +
        pointA +
        "&to=" +
        pointB;

      $.ajax({
        url: myURL,
        method: "GET",
      }).then(function (response) {
        var travelTime = response.route.realTime;
        console.log(travelTime);
        //   timeArray.push(travelTime);
      });
    }
  });
}