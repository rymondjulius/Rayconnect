function initializePlacesSearch() {
  var input = document.getElementById("place-search");
  const placesErrorElm = document.getElementById("places-error");

  var autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener("place_changed", function () {
    var place = autocomplete.getPlace();

    const searchResults = [];

    resetClasses(placesErrorElm);
    placesErrorElm.classList.add("text-info");
    placesErrorElm.innerText = "Searching ...";

    getCabinets()
      .then(async (cabinets) => {
        resetClasses(placesErrorElm);
        placesErrorElm.classList.add("text-info");
        placesErrorElm.innerText = "Estimating ...";

        for await (const cabinet of cabinets) {
          const result = await checkCabinet(place, cabinet);
          searchResults.push(result);
        }

        //get positive results
        let closeCabinets = searchResults.filter((i) => i.results === true);

        if (closeCabinets.length > 0) {
          // get the first cabinet
          const closest = closeCabinets.sort((a, b) => a.distance - b.distance);

          // show packages
          resetClasses(placesErrorElm);
          placesErrorElm.classList.add("text-success");
          placesErrorElm.innerText =
            closeCabinets.length + " locations near you found";

          const closeCabinet = closest[0];

          // scroll to position
          document.getElementById(
            "close-cabinet"
          ).innerText = `Tap our internet at ${
            closeCabinet?.cabinet?.location
          } : ${Math.ceil(
            closeCabinet?.distance
          )}m away at reliable high speed`;
          const homePackages = closeCabinet?.cabinet?.packages?.filter(
            (x) => x.group === "home"
          );
          await showResults(
            homePackages,
            "home-packages",
            place,
            closeCabinet?.cabinet
          );

          const dedicatedPackages = closeCabinet?.cabinet?.packages?.filter(
            (x) => x.group === "dedicated"
          );
          await showResults(
            dedicatedPackages,
            "dedicated-packages",
            place,
            closeCabinet?.cabinet
          );

          const smePackages = closeCabinet?.cabinet?.packages?.filter(
            (x) => x.group === "sme"
          );
          await showResults(
            smePackages,
            "sme-packages",
            place,
            closeCabinet?.cabinet
          );

          const placesResults = document.getElementById("places-results");
          placesResults.classList.remove("d-none");
          placesResults.scrollIntoView();
        } else {
          resetClasses(placesErrorElm);
          placesErrorElm.classList.add("text-danger");
          placesErrorElm.innerText =
            "Sorry we are currently not offering our services in your region yet";
        }
      })
      .catch((err) => {
        resetClasses(placesErrorElm);
        placesErrorElm.classList.add("text-danger");
        placesErrorElm.innerText = "Unable to complete search. Try again later";
      });
  });
}

function resetClasses(element) {
  element.classList.remove("text-danger");
  element.classList.remove("text-success");
  element.classList.remove("text-info");
}

function getCabinets() {
  const api = document.getElementById("api").getAttribute("content");
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`${api}/cabinets/active`);
      const data = await res.json();
      return resolve(data);
    } catch (err) {
      reject("Unable to complete search. Try again later");
    }
  });
}

function checkCabinet(place, cabinet) {
  return new Promise((resolve) => {
    const radiusInMeters = 2000; // radius in meters

    const center = new window.google.maps.LatLng(+cabinet.lat, +cabinet.lng);

    //user selected address
    const to = new window.google.maps.LatLng(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );

    // now check the distance between two address, is it inside the radius
    // returns distance in meters
    const distanceBetween =
      window.google.maps.geometry.spherical.computeDistanceBetween(center, to);
    resolve({
      cabinet,
      distance: distanceBetween,
      results: distanceBetween <= radiusInMeters,
    });
  });
}

async function showResults(packages, elementId, place, cabinet) {
  const targetDiv = document.getElementById(elementId);
  targetDiv.innerHtml = "";
  for await (const data of packages) {
    const col = document.createElement("div");
    col.classList.add("col-lg-4", "col-md-6", "col-sm-6");
    col.append(createPackageCard(data, place, cabinet));
    targetDiv.append(col);
  }
}

function createPackageCard(data, place, cabinet) {
  const priceCard = document.createElement("div");
  priceCard.classList.add("single-pricing-table");

  const cardHeader = document.createElement("div");
  cardHeader.classList.add("pricing-header");

  const headerIcon = document.createElement("div");
  headerIcon.classList.add("icon");

  const icon = document.createElement("i");
  icon.classList.add("flaticon-online-shop");

  headerIcon.append(icon);

  cardHeader.append(headerIcon);

  const name = document.createElement("h3");
  name.innerText = `${data.name} (${data.speed})`;
  cardHeader.append(name);

  priceCard.append(cardHeader);

  const applications = document.createElement("ul");
  applications.classList.add("pricing-features-list");

  data?.applications.forEach((item) => {
    const application = document.createElement("li");
    const checkIcon = document.createElement("i");
    checkIcon.classList.add("flaticon-check-mark");
    application.append(checkIcon);
    application.append(item);

    applications.append(application);
  });

  priceCard.append(applications);

  const price = document.createElement("div");
  price.classList.add("price");

  const spanFrom = document.createElement("span");
  spanFrom.innerText = "From";
  const spanCurrency = document.createElement("span");
  spanCurrency.innerText = "Ksh";

  price.append(spanFrom);
  price.append(spanCurrency);

  price.append(data.cost);

  const spanPerMonth = document.createElement("span");
  spanPerMonth.innerText = " /mo ";
  price.append(spanPerMonth);

  priceCard.append(price);

  const link = document.createElement("a");
  link.classList.add("view-plans-btn");
  link.href = `./?page=purchase-internet&package=${data.packageId}&location=${place.name}&cabinet=${cabinet.cabinetId}`;
  link.innerText = "Select";

  priceCard.append(link);

  const imageBox = document.createElement("div");
  imageBox.classList.add("image-box");

  const image1 = document.createElement("img");
  image1.src = "assets/img/shape-image/2.png";
  image1.alt = "image1";
  imageBox.append(image1);
  const image2 = document.createElement("img");
  image2.src = "assets/img/shape-image/2.png";
  image2.alt = "image2";
  imageBox.append(image2);

  priceCard.append(imageBox);

  return priceCard;
}
