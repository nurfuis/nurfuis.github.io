<div class="map__wrapper">
  <h2>Topographic Map</h2>

  <div class="map-image__wrapper">
    <img
      class="topo-map__link--image"
      src="./assets/images/map-static-300x200.png"
      onclick="openTopoMap()"
    />
  </div>
</div>

<script>
  function openTopoMap() {
    window.location.href = "./pages/topo-map.html";
  }
</script>
