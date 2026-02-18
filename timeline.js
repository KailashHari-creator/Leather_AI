const timeline = document.getElementById("timeline");
const socket = io();

/* Render one capture */
function renderCapture(c) {
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <img src="${c.path}" alt="${c.name}">
    <div class="meta">
      ${c.name}<br>
      ${new Date(c.time).toLocaleString()}<br>
      🌍 ${c.lat}, ${c.lng}
    </div>
  `;

  timeline.prepend(card);
}

/* Initial sync */
socket.on("init_sync", data => {
  timeline.innerHTML = "";
  data.captures.forEach(renderCapture);
});

/* Live updates */
socket.on("update_data", data => {
  renderCapture(data.newImage);
});