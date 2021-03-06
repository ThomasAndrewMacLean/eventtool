// These varaibales may change depending on the store
const storeName = "DEMO";
const backendUrl = "https://store-locator-backend-jypiiqzjwq-ew.a.run.app";
const mapId = "fa0ee1ca1d6c118b";
const numberOfStoresToShow = 4;
// The location of belgium
const belgium = {
  lat: 50.5039,
  lng: 4.4699,
};

var activeMap;
var activeMarkers = [];
function initMap() {
  activeMap = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: belgium,
    disableDefaultUI: true,
    zoomControl: true,
    mapId,
  });
  fetchStores();
}

function debounce(callback, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      callback.apply(this, args);
    }, wait);
  };
}

function listenToInputChange() {
  const input = document.getElementById("input");
  input.addEventListener(
    "input",
    debounce(() => {
      if (!input.value) {
        // the input is empty, focus on entire map
        fitMapToMarkers(activeMarkers);
        return;
      }

      toggleLoading(true);
      fetch(backendUrl + "/api", {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: input.value,
          store: storeName,
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          toggleLoading(false);
          setStoresInRange(data.stores, data.addressLatLng);
        })
        .catch(function (err) {
          toggleLoading(false);
          console.warn("Something went wrong.", err);
        });
    }, 250),
    false
  );
}

function fetchStores() {
  toggleLoading(true);
  fetch(backendUrl + "/allStores", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      store: storeName,
    }),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      toggleLoading(false);
      setAllStores(data.stores);
    })
    .catch(function (err) {
      toggleLoading(false);
      console.warn("Something went wrong.", err);
    });
}

function setAllStores(allStores) {
  document.querySelector("#addresses").innerHTML = "";
  document.querySelector("#addresses").appendChild(buildAddressList(allStores));
  addMarkersonMap(allStores);
  fitMapToMarkers();
}

function setStoresInRange(storesInRange, addressLatLng) {
  document.querySelector("#addresses").innerHTML = "";
  document
    .querySelector("#addresses")
    .appendChild(buildAddressList(storesInRange));

  // set first 5 stores in range + origin addres
  const arrayOfPoints = [
    latLngToGoogleMarker(
      {
        latLng: addressLatLng,
      },
      false
    ),
    ...storesInRange
      .slice(0, numberOfStoresToShow)
      .map((store) => latLngToGoogleMarker(store, false)),
  ];
  fitMapToMarkers(arrayOfPoints);
}

function buildAddressList(data) {
  var ul = document.createElement("UL");
  data.forEach(function (a) {
    var li = document.createElement("LI");
    li.tabIndex = "0";
    li.innerHTML = `<div class="name">${a.name}</div><div class="address">${a.address}</div>`;
    li.onclick = function () {
      fitMapToMarkers([latLngToGoogleMarker(a)]);
      activeMap.setZoom(15);
    };
    ul.append(li);
  });
  return ul;
}

function latLngToGoogleMarker(address, addToMap = true) {
  const latLn = address.latLng.split(",");
  const marker = new google.maps.Marker({
    position: {
      lat: parseFloat(latLn[0]),
      lng: parseFloat(latLn[1]),
    },
  });
  if (addToMap) {
    marker.setMap(activeMap);
    marker.addListener("click", () => {
      console.log(address);
    });
  }
  return marker;
}

function addMarkersonMap(data) {
  if (activeMap) {
    activeMarkers = data.map(function (a) {
      return latLngToGoogleMarker(a);
    });
  }
}

function fitMapToMarkers(markersInRange) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < (markersInRange || activeMarkers).length; i++) {
    bounds.extend((markersInRange || activeMarkers)[i].getPosition());
  }
  activeMap.fitBounds(bounds);
}

function toggleLoading(loading) {
  if (loading) {
    document.querySelector(".gray-overlay").style.display = "block";
    document.querySelector(".lds-roller").style.display = "block";
  } else {
    document.querySelector(".gray-overlay").style.display = "none";
    document.querySelector(".lds-roller").style.display = "none";
  }
}

listenToInputChange();
