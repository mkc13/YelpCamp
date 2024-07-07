mapboxgl.accessToken ='pk.eyJ1IjoiaWNlLWJlYXIiLCJhIjoiY2xzNXUyZWtyMWo4eDJqbzN6NjZwZmdseSJ9.o139wwZER4wqMr2jFPinvw';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: hardcodedCoordinates, // starting position [lng, lat]
  zoom: 9 // starting zoom
});

new mapboxgl.Marker()
      .setLngLat(hardcodedCoordinates)
      .addTo(map);