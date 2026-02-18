const menuBtn = document.getElementById("menuBtn");
const sidePanel = document.getElementById("sidePanel");
const overlay = document.getElementById("overlay");

// menuBtn.addEventListener("click", togglePanel);
// overlay.addEventListener("click", togglePanel);

function togglePanel() {
  sidePanel.classList.toggle("open");
  overlay.classList.toggle("show");
}
const dataCard = document.querySelector('.data-card');
console.log(dataCard);
dataCard.addEventListener("click", e => {
    window.location.href = "/data"
});
const utilityCard = document.querySelector('.util-card');
console.log(utilityCard);
utilityCard.addEventListener("click", e => {
    window.location.href = "/util"
});