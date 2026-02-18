document.querySelector(".data-card")
  .addEventListener("click", () => {
    window.location.href = "camera.html?mode=auth";
  });

document.querySelector(".util-card")
  .addEventListener("click", () => {
    window.location.href = "camera.html?mode=species";
  });
