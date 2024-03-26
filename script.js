mapboxgl.accessToken =
  "pk.eyJ1IjoiY291bnRyeS1jaGFuZ2UiLCJhIjoiY2xtdDd5N2liMDJtaTJrbXNjdGVxZWhuYSJ9.2_l1izu_uVDTRVoc9kmY2Q";

var filterGroup = document.getElementById("ll");
// var filterGroup = document.getElementById('filter-group');

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/country-change/cloh5ebey001101qyh00a5103",
  center: [146.403456, -34.6307854],
  zoom: 10,
  preserveDrawingBuffer: true,
  cooperativeGestures: true,
  customAttribution:
    '<a style="background-color: #567B5C; color: #FFFFFF;" target="_blank" href=http://www.geocadder.bg/en>GEOCADDDER</a>',
});

/* Adding custom control / custom button for chanigng base map style*/
class MapboxGLButtonControl {
  constructor({ className = "", title = "", eventHandler = evtHndlr }) {
    this._className = className;
    this._title = title;
    this._eventHandler = eventHandler;
  }

  onAdd(map) {
    this._btn = document.createElement("button");
    this._btn.className = "mapboxgl-ctrl-icon" + " " + this._className;
    this._btn.type = "button";
    this._btn.title = this._title;
    this._btn.onclick = this._eventHandler;

    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl-group mapboxgl-ctrl";
    this._container.appendChild(this._btn);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

/* start legend custom control button */

/* Event Handlers */
function two(event) {
  $("div.toggle-legend-box").addClass("visible-legend-box");
  $("div.toggle-legend-box").css("display", "block");
}

/* Instantiate new controls with custom event handlers */
const ctrlTwoPoint = new MapboxGLButtonControl({
  className: "toggle-legend-control",
  title: "View legend",
  eventHandler: two,
});

map.addControl(ctrlTwoPoint, "bottom-right");
/* end filter custom control button */

var nav = new mapboxgl.NavigationControl();
map.addControl(nav, "bottom-left");

// toggle legend

// $(".button-toggle-legend").on("click", function () {
//   $("div.toggle-legend-box").addClass("visible-legend-box");
// });

$(".welcome-close-button").on("click", function () {
  $("div.visible-legend-box").removeClass("visible-legend-box");
  $("div.toggle-legend-box").css("display", "none");
});
// toggle legend

var bounds = new mapboxgl.LngLatBounds();

var markersAllIds = [];

var markersAllIdsLatsLongs = [];
var onlySelectedaccessibilityPoints = [];
var isinitialSelectedMarkerId = false;
var initialSelectedMarkerId = "";
var counter = 0;
var markerId = 1;

/// loading POIs data from Google Sheets table///
$.getJSON(
  "https://sheets.googleapis.com/v4/spreadsheets/1czGrKm-cLMhyc0CMJAz-sS0v0qwdLdyXEboHVVkDw_M/values/22.Lockhart!A2:H3000?majorDimension=ROWS&key=AIzaSyArKykrTA2zH924RmE2yORI4zT42lNr1HQ",
  function (response) {
    response.values.forEach(function (marker) {
      console.log(marker[0]);

      var name = marker[0];
      console.log(name);

      var type = marker[1];
      var typeSmallLetters = type.toLowerCase().replace(/\s/g, "-");
      var typeSmallLetters = typeSmallLetters
        .replaceAll(",", "")
        .replaceAll("/", "-");
      console.log(typeSmallLetters);

      console.log(markerId);

      var address = marker[2];
      var latitude = parseFloat(marker[3]);
      var longitude = parseFloat(marker[4]);
      console.log(latitude);
      console.log(longitude);
      var phoneNumber = marker[5];

      var url = marker[6];
      if (url && url.indexOf("www") > -1) {
        console.log(url);
        url = url
          .replaceAll("www.", "https://")
          .replaceAll("https://www.", "https://");
      } else {
        console.log(url);
      }

      var iconUrl = "";
      switch (typeSmallLetters) {
        case "education":
          iconUrl = "https://uploads-ssl.webflow.com/650167c877dd38466d76ae92/65d4b14c1c64d439297476c0_education.svg";
          break;
        case "healthcare":
          iconUrl = "https://uploads-ssl.webflow.com/650167c877dd38466d76ae92/65d4b14c83b1110937c48e47_healthcare.svg";
          break;
        case "culture-&-recreation":
          iconUrl =
            "https://uploads-ssl.webflow.com/650167c877dd38466d76ae92/65d4b13f2b390ed441decd7a_culture-%26-recreation.svg";
          break;
        default:
          iconUrl =
            "https://uploads-ssl.webflow.com/650167c877dd38466d76ae92/65d4b13f2b390ed441decd7a_culture-%26-recreation.svg";
      }

      bounds.extend([longitude, latitude]);

      var popupContent =
        "<div class='marker-popup-icon'><img src='" +
        iconUrl +
        "'></div><div class='title'>" +
        name +
        "</div>";

      if (address) {
        popupContent +=
          "<div class='popup-details' ><a class='contacts' target='_blank' href='https://www.google.com/maps/dir//" +
          latitude +
          "," +
          longitude +
          "'><span class='material-symbols-outlined'>location_on</span><span class='contacts-text'>" +
          address +
          "</span></a></div>";
      }

      if (phoneNumber) {
        popupContent +=
          "<div class='popup-details' ><a class='contacts' href='tel:" +
          phoneNumber +
          "'><span class='material-symbols-outlined'>call</span><span class='contacts-text'>" +
          phoneNumber +
          "</span></a></div>";
      }

      if (url) {
        popupContent +=
          "<div class='popup-details'><a class='url-button' target='_blank' href='" +
          url +
          "'><i class='fa fa-home' aria-hidden='true'></i>View more</a></div>";
      }

      popup = new mapboxgl.Popup({ closeOnClick: false }).setHTML(popupContent);

      // create a HTML element for each feature
      var el = document.createElement("div");
      el.className = "marker " + markerId;
      // el.id = markerId;

      el.style.backgroundImage = "url(" + iconUrl + ")";

      var markerObj = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);

      $(el).click(function () {
        var currentZoom = map.getZoom();
        map.flyTo({
          center: [longitude, latitude],
          zoom: currentZoom,
          offset: [0, -150],
          duration: 1000,
        });
      });

      markersAllIds.push({
        markerId: markerId,
      });

      markersAllIdsLatsLongs.push({
        markerId: markerId,
        latitude: latitude,
        longitude: longitude,
      });

      console.log(markersAllIdsLatsLongs);

      counter++;
      markerId += 1;
      $(".popup-text").click(function (e) {
        e.preventDefault();
        console.log("desi");
        window.location = projectlink;
      });

      // $(".popup-text").on("click", function () {
      //   console.log("desi");
      //   window.open(projectlink);
      //   e.preventDefault();
      // });
    });

    var objectsJson = markersAllIds.map((object) => JSON.stringify(object));
    var objectsJsonSet = new Set(objectsJson);
    var uniqueJsonArray = Array.from(objectsJsonSet);
    var uniqueObjectsByContent = uniqueJsonArray.map((string) =>
      JSON.parse(string)
    );

    // close all opened popups
    $(".marker").click(function () {
      $(".mapboxgl-popup").remove();
    });

    $(".mapboxgl-canvas").click(function () {
      $(".mapboxgl-popup").remove();
    });

    map.fitBounds(bounds, { padding: 80 });
  }
);