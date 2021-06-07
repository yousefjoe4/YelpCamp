const coordinates = campground.geometry.coordinates.length ? campground.geometry.coordinates : [28.9850622, 41.0103848]
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

const popup = new mapboxgl.Popup({offset:25}).setHTML(`<h5>${campground.title}</h5>${campground.location}`)
new mapboxgl.Marker()
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map)

map.addControl(new mapboxgl.NavigationControl());