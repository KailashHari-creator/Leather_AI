document.addEventListener("DOMContentLoaded", () => {
  const actionCards = document.querySelectorAll(".action-card");

  actionCards.forEach(card => {
    const title = card.querySelector("h4")?.innerText.trim();

    switch (title) {
      case "Review Uploaded Images":
        card.addEventListener("click", () => {
          window.location.href = "/timeline";
        });
        break;

      case "Manage Models":
        card.addEventListener("click", () => {
          console.log("Manage Models clicked");
          // window.location.href = "models.html";
        });
        break;

      case "User Activity Logs":
        card.addEventListener("click", () => {
          window.location.href = "/users";
          // window.location.href = "logs.html";
        });
        break;

      case "System Settings":
        card.addEventListener("click", () => {
          console.log("Settings clicked");
          // window.location.href = "settings.html";
        });
        break;
    }
  });
});
