// Canvas + Video Setup
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const textDiv = document.getElementById("text");


// MediaPipe Hands Setup
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 10,
  modelComplexity: 1,
  minDetectionConfidence: 0.8,
  minTrackingConfidence: 0.6
});


// === Deine Erkennungsfunktion in JavaScript ===
function isThumbUp(landmarks, threshold = 0.05, threshold_mid_index = 0.005) {
    
    const thumb_tip = landmarks[4];
    const index_tip = landmarks[8];
    const middle_tip = landmarks[12];
    const ring_tip = landmarks[16];
    const small_tip = landmarks[20];
    const hand_base = landmarks[0];

    const dx = Math.abs(thumb_tip.x - index_tip.x);
    const dy = Math.abs(thumb_tip.y - index_tip.y);

    const dx2 = Math.abs(index_tip.x - middle_tip.x);
    const dy2 = Math.abs(index_tip.y - middle_tip.y);

    const fingers_up =
        middle_tip.y < thumb_tip.y &&
        middle_tip.y < index_tip.y &&
        middle_tip.y < hand_base.y;

    return dx < threshold && dy < threshold && fingers_up && dx2 > threshold_mid_index && dy2 > threshold_mid_index;
}


// === MediaPipe Callback ===
hands.onResults((results) => {

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (!results.multiHandLandmarks) {
    textDiv.innerText = "Nicht erkannt";
    return;
  }

  for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {color: "#00FF00", lineWidth: 2});
      drawLandmarks(ctx, landmarks, {color: "#FF0000", lineWidth: 1});

      if (isThumbUp(landmarks)) {
          textDiv.innerText = "Zeichen erkannt";
      } else {
          textDiv.innerText = "Nicht erkannt";
      }
  }
});


// === Kamera aktivieren ===
navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
  video.srcObject = stream;

  const camera = new Camera(video, {
    onFrame: async () => {
      await hands.send({ image: video });
    },
    width: 640,
    height: 480
  });

  camera.start();
});
