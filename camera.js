const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const sendBtn = document.getElementById("send");
const title = document.getElementById("modeTitle");

const ctx = canvas.getContext("2d");

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode") || "auth";

title.innerText =
  mode === "species"
    ? "LEATHER_AI • SPECIES DETECTION"
    : "LEATHER_AI • AUTHENTICATION";

/* Start camera */
navigator.mediaDevices.getUserMedia({
  video: { facingMode: "environment" }
}).then(stream => {
  video.srcObject = stream;
});

/* Capture frame */
captureBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  video.style.display = "none";
  canvas.style.display = "block";
  sendBtn.style.display = "inline-block";
};

/* Upload */
sendBtn.onclick = () => {
  const image = canvas.toDataURL("image/png");

  fetch("/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      mode   // auth | species (backend-ready)
    })
  })
  .then(res => res.json())
  .then(() => {
    alert("IMAGE SENT SUCCESSFULLY");
    window.location.href = "/";
  });
};
