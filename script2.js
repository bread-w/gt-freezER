var userLocation;
var timeArray = [];
var routeArray = [];
var imgArray = [];
var urlArray = [];
var storeNameArray = [];
var arrayOfArrays = [];
var routeTime = localStorage.getItem("time")
    ? JSON.parse(localStorage.getItem("time"))
    : "";
// console.log(timeArray);
function timeConvert(routeTime) {
    var minutes = Math.floor(routeTime / 60);
    var seconds = routeTime % 60;
    return minutes + ":" + seconds;
    console.log(minutes + ":" + seconds);
    // return minutes + ":" + seconds;
}

$(document).ready(function () {
    userLocation = navigator.geolocation.getCurrentPosition(
        locationHandler,
        locationErrorHandler,
        options
    );
    // $("#timerDisplay").append(timerStart);
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
    timeout: 000,
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
function determineTime(routeArray) {

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
            //   console.log(error);
        },
    }).then(function (response) {
        // console.log(response);
        $("#iceCreamStores").empty();
        for (var i = 0; i < 10; i++) {
            var iceCreamStores = response.businesses[i].name;
            storeNameArray.push(iceCreamStores);
            // var storeAddress = response.businesses[i].location.address1;
            var storeList = $("<button>").text(iceCreamStores);
            $(storeList).attr("class", "btn-block newIceCreamStoreButton");
            storeList.attr("id", "button" + (1 + i));
            var listItem = $("<li>").append(storeList);
            $("#iceCreamStores").append(listItem);
            // storeList.append($("<div>" + storeAddress + "</div>"));
            storeList.append(
                //$("<div>" + timeConvert(routeTime[i]) + " minutes away! " + "</div>")
                $("<div>" + timeConvert(timeArray[i]) + " minutes away! " + "</div>")
            );
            // console.log(timeArray[0])
        }
        for (var i = 0; i < 10; i++) {
            var storeURL = response.businesses[i].url;
            urlArray.push(storeURL);
        }
        for (var i = 0; i < 10; i++) {
            var imageURL = response.businesses[i].image_url;
            imgArray.push(imageURL);
        }
        // adding new id to each button
        var startingPos = latPointA + "," + lonPointA;
        var pointA = startingPos;

        for (var i = 0; i < 10; i++) {
            var latPointB = response.businesses[i].coordinates.latitude;
            var lonPointB = response.businesses[i].coordinates.longitude;
            var destinationPos = latPointB + "," + lonPointB;
            //   console.log("Destination: ", destinationPos);
            routeArray.push(destinationPos);
        }

        var mapQuestKey = "EuvsQjb9j05jti6cukSFr5sibH9t8NwF";
        for (var i = 0; i < routeArray.length; i++) {
            //   console.log(routeArray[i]);
            var pointB = routeArray[i];
            // var pointB = destinationPos;
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
            }).then(function (response) {
                var travelTime = response.route.realTime;
                // console.log(travelTime);
                timeArray.push(travelTime);
                localStorage.setItem("time", JSON.stringify(timeArray));
                arrayOfArrays.push(response.route.legs[0].maneuvers);
            });
            // storeList.append($("<div>" + storeAddress + "</div>"));
        }
        // for (var i = 0; i < timeArray.length; i++){
        //   storeList.append($("<div>" + timeArray + "</div>"));
        // }

        var imgDiv = $("<img>");
        function directionsButtons(storeNumber) {
            $("#routeNarrativeOl").empty();
            for (var i = 0; i < arrayOfArrays[storeNumber].length; i++) {
                // if (arrayOfArrays[storeNumber][i].narrative === undefined) {
                // i++
                $("#routeNarrativeOl").append(
                    $("<li>" + arrayOfArrays[storeNumber][i].narrative + "</li>")
                );
                // }
                // $("#routeNarrativeOl").append($("<li>" + arrayOfArrays[storeNumber][i+1].narrative + "</li>"))
                // console.log(arrayOfArrays[storeNumber][i].narrative);
            }
        }
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
            } else if (minutes > 5 && minutes < 12) {
                $("#timerDisplay").attr("class", "melting");
            } else {
                $("#timerDisplay").attr("class", "melted");
            }
            timerStart = minutes + ":" + seconds;
            console.log(timerStart);
        }, 1000);

        // storeList.append($("<div>" + timeArray[0] + "</div>"));
        $("#button1").on("click", function (event) {
            event.preventDefault();
            directionsButtons(0);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 1!");
            imgDiv.attr("src", imgArray[0]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeOne = timeConvert(routeTime[0]);
            timerStart = timeOne;
            console.log(timeConvert(routeTime[0]));
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
        $("#button2").on("click", function (event) {
            event.preventDefault();
            directionsButtons(1);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 2!");
            imgDiv.attr("src", imgArray[1]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeTwo = timeConvert(routeTime[1]);
            timerStart = timeTwo;
            console.log(timeConvert(routeTime[1]));
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
        $("#button3").on("click", function (event) {
            event.preventDefault();
            directionsButtons(3);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 3!");
            imgDiv.attr("src", imgArray[2]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeThree = timeConvert(routeTime[2]);
            timerStart = timeThree;
            console.log(timeConvert(routeTime[2]));
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
        $("#button4").on("click", function (event) {
            event.preventDefault();
            directionsButtons(3);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 4!");
            imgDiv.attr("src", imgArray[3]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeFour = timeConvert(routeTime[3]);
            timerStart = timeFour;
            console.log(timeConvert(routeTime[3]));
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
        $("#button5").on("click", function (event) {
            event.preventDefault();
            directionsButtons(4);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 5!");
            imgDiv.attr("src", imgArray[4]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeFive = timeConvert(routeTime[4]);
            timerStart = timeFive;
            console.log(timeConvert(routeTime[4]));
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
        $("#button6").on("click", function (event) {
            event.preventDefault();
            directionsButtons(5);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 6!");
            imgDiv.attr("src", imgArray[5]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeSix = timeConvert(routeTime[5]);
            timerStart = timeSix;
            console.log(timeConvert(routeTime[5]));
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
        $("#button7").on("click", function (event) {
            event.preventDefault();
            directionsButtons(6);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 7!");
            imgDiv.attr("src", imgArray[6]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeSeven = timeConvert(routeTime[6]);
            timerStart = timeSeven;
            console.log(timeConvert(routeTime[6]));
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
        $("#button8").on("click", function (event) {
            event.preventDefault();
            directionsButtons(7);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 8!");
            imgDiv.attr("src", imgArray[7]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeEight = timeConvert(routeTime[7]);
            timerStart = timeEight;
            console.log(timeConvert(routeTime[7]));
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
        $("#button9").on("click", function (event) {
            event.preventDefault();
            directionsButtons(8);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 9!");
            imgDiv.attr("src", imgArray[8]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeNine = timeConvert(routeTime[8]);
            timerStart = timeNine;
            console.log(timeConvert(routeTime[8]));
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
        $("#button10").on("click", function (event) {
            event.preventDefault();
            directionsButtons(9);
            $("#icecream-img").empty();
            $("#storeURLButton").empty();
            console.log("You clicked button 10!");
            imgDiv.attr("src", imgArray[9]);
            $("#icecream-img").append(imgDiv);
            $("#timerDisplay").attr("style", "display: inline-block");
            var timeTen = timeConvert(routeTime[9]);
            timerStart = timeTen;
            console.log(timeConvert(routeTime[9]));
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
// console.log(routeArray);
// console.log(imgArray);
//  console.log(timeArray);
// console.log(urlArray);
// console.log(storeNameArray);