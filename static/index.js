const searchForm = document.querySelector('form');
const rTemp = document.querySelector('template');
const resultArea = document.querySelector('#restaurant-results');

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  resultArea.innerHTML = '';


  var marker = new Array();


  



   markerDel();

  var city = document.querySelector('#list').value;

  console.log(city);
  var lat1 = 0
  var long1 = 0;
  if(city === 'Sydney') {
    lat1 = -33.865;
    long1 = 151.2094;
  }
  else if (city == 'Brisbane') {
    lat1 = -27.468;
    long1 = 153.028;
 
  }
  else if (city == 'Melbourne') {
    lat1 = -37.8136;
    long1 = 144.9631;
  
  }
  else if (city == 'Canberra') {
    lat1 = -35.2864;
    long1 = 149.117;
  
  }
  else if (city == 'Darwin') {
    lat1 = -12.462406159;
    long1 = 130.8414636836;

  }
  else if (city == 'Perth') {
    lat1 = -31.957;
    long1 = 115.856;
   
  }
  else if (city == 'Adelaide') {
    lat1 = -34.926;
    long1 = 138.6;
  
  }
  else if (city == 'Hobart') {
    lat1 = -42.8827309833;
    long1 = 147.3271428955;
    
  }
 
  map.panTo([lat1,long1], 10);
 
 
 
 //map.setView(new L.latlng(), 10);
/*
  var lat1 = 0
  var long1 = 0;
  cccccccc  //for the city
  if (select == 'Sydney') {
    city = 'Sydney';
    lat1 = -33.865;
    long1 = 151.2094;
    
  }
  else if (city == 'Brisbane') {
    city = 'Brisbane';
    lat1 = -27.468;
    long1 = 153.028;
 
  }
  else if (city == 'Melbourne') {
    city = 'Melbourne';
    lat1 = -37.8136;
    long1 = 144.9631;
  
  }
  else if (city == 'Canberra') {
    city = 'Canberra';
    lat1 = -35.2864;
    long1 = 149.117;
  
  }
  else if (city == 'Darwin') {
    city = 'Darwin';
    lat1 = -12.462406159;
    long1 = 130.8414636836;

  }
  else if (city == 'Perth') {
    city = 'Perth';
    lat1 = -31.957;
    long1 = 115.856;
   
  }
  else if (city == 'Adelaide') {
    city = 'Adelaide';
    lat1 = -34.926;
    long1 = 138.6;
  
  }
  else if (city == 'Hobart') {
    city = 'Hobart';
    lat1 = -42.8827309833;
    long1 = 147.3271428955;
    
  }


  //map.panTo([lat1, long1], 10);
  console.log(city);
  */

  // Clear all the marker in the array
 



  const query = e.target.querySelector('#restaurant-name').value; // for the restaurant name
  if (query === '') {
    return
  }

  e.target.querySelector('#restaurant-name').value = '';

  const res = await fetch('/search', {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: 'POST', body: `q=${query},${city}`
  })

  const json = await res.json();
  // console.log(json.restaurants);

  console.log(json);



  try {
    populateData(json.restaurants);
  } catch (err) {
    for (obj in json) {
      const newResult = rTemp.content.cloneNode(true);
      newResult.querySelector('.result-title').innerText = json[obj].name;
      newResult.querySelector('.result-neighborhood').innerText = json[obj].locality;
      newResult.querySelector('.result-address').innerText = json[obj].address;
      newResult.querySelector('.result-price').innerText = '$'.repeat(json[obj].price);
      newResult.querySelector('.result-thumbnail').src = json[obj].thumbnail;
      newResult.querySelector('.result-website').href = json[obj].url;
      newResult.querySelector('.result-timing').innerText = json[obj].timings;
      resultArea.appendChild(newResult);

    }
  }

  //console.log(json.restaurants);

  console.log("Here");
  try {
    var results = json.restaurants;
    for (i = 0; i < results.length; i++) {
      var LamMarker = new L.marker([results[i].location.latitude, results[i].location.longitude]);
      marker.push(LamMarker);
      marker[i].bindPopup(results[i].name);
      map.addLayer(marker[i]);

    }


  } catch (err) {
    var j = 0;
    for (obj in json) {
      console.log(json[obj].lat);
      var LamMarker = new L.marker([json[obj].lat, json[obj].long]);
      marker.push(LamMarker);
      marker[j].bindPopup(json[obj].name);
      map.addLayer(marker[j]);
      j++;
    }


  }








  //   results.foreach(result => {
  //    marker = l.marker([result.location.latitude,result.location.longitude]);
  //    marker.bindpopup(result.name);
  //    map.addlayer(marker);
  //   markerlist.push(marker);
  //  })
});


function markerDel() {
  map.eachLayer(function (layer) {
    map.removeLayer(layer);
  });

  L.tileLayer('https://a.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.locate({ enableHighAccuracy: true });
  map.on('locationfound', e => {
    console.log(e);
    const coords = [e.latlng.lat, e.latlng.lng];
    const marker = L.circle(coords, {
      color: 'red',
      fillColor: 'red',
      radius: 500

    });
    marker.bindPopup('You are Here!');
    map.addLayer(marker);
  })
}

function populateData(results) {
  results.forEach(result => {
    const newResult = rTemp.content.cloneNode(true);
    newResult.querySelector('.result-title').innerText = result.name;
    newResult.querySelector('.result-neighborhood').innerText = result.locality;
    newResult.querySelector('.result-address').innerText = result.address;
    newResult.querySelector('.result-price').innerText = '$'.repeat(result.price);
    newResult.querySelector('.result-thumbnail').src = result.thumbnail;
    newResult.querySelector('.result-website').href = result.url;
    newResult.querySelector('.result-timing').innerText = result.timings;
    resultArea.appendChild(newResult);
  });
}