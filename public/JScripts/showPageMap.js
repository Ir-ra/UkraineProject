mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/light-v10', // style URL
center: place.geometry.coordinates, // starting position [lng, lat]
zoom: 8
});

new mapboxgl.Marker()
.setLngLat(place.geometry.coordinates)
// POP UP
.setPopup(
     new mapboxgl.Popup({offset: 25})
     .setHTML(`<h3>${place.title}</h3><p>${place.location}</p>`)
) 
.addTo(map);