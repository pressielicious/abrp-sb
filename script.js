const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 1
}).setView([0, 0], -1);

const imageUrl = "peta-gta-v.jpg";  // Tukar kepada fail peta GTA V
const imageBounds = [[-8192, -6444], [8192, 6444]];
L.imageOverlay(imageUrl, imageBounds).addTo(map);
map.setMaxBounds(imageBounds);

const markers = {};
let hiddenMarkers = [];
let lastHiddenMarker = null;

const markerData = [  
    { id: "marker1", lat: 100, lng: 200 },  
    { id: "marker2", lat: -300, lng: 150 },  
    { id: "marker3", lat: 400, lng: -250 }
];

function loadMarkers() {
    database.ref("hiddenMarkers").on("value", snapshot => {
        hiddenMarkers = snapshot.val() || [];
        updateMarkers();
    });

    markerData.forEach(data => {
        const marker = L.marker([data.lat, data.lng]).addTo(map)
            .on("contextmenu", (e) => hideMarker(data.id, marker));

        markers[data.id] = marker;
    });
}

function hideMarker(id, marker) {
    if (!hiddenMarkers.includes(id)) {
        hiddenMarkers.push(id);
        lastHiddenMarker = id;

        map.removeLayer(marker);
        updateDatabase();
    }
}

function updateMarkers() {
    Object.keys(markers).forEach(id => {
        if (hiddenMarkers.includes(id)) {
            map.removeLayer(markers[id]);
        } else {
            markers[id].addTo(map);
        }
    });
}

function updateDatabase() {
    database.ref("hiddenMarkers").set(hiddenMarkers);
}

document.getElementById("undoBtn").addEventListener("click", () => {
    if (lastHiddenMarker) {
        hiddenMarkers = hiddenMarkers.filter(id => id !== lastHiddenMarker);
        lastHiddenMarker = null;
        updateDatabase();
    }
});

loadMarkers();
