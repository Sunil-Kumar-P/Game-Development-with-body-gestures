const videoElement = document.getElementsByClassName("input_video")[0];
const canvasElement = document.getElementsByClassName("output_canvas")[0];
const canvasCtx = canvasElement.getContext("2d");
const landmarkContainer = document.getElementsByClassName(
  "landmark-grid-container"
)[0];
const grid = new LandmarkGrid(landmarkContainer);

const allkeys = {'up':false,'down':false,'center':false,'left':false,'right':false};
var cstate;
var pstate;

function onResults(results) {
  if (!results.poseLandmarks) {
    grid.updateLandmarks([]);
    return;
  }
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.segmentationMask,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);

  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

  canvasCtx.globalCompositeOperation = "source-over";
  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: "#00FF00",
    lineWidth: 4,
  });
  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: "#FF0000",
    lineWidth: 2,
  });
  canvasCtx.restore();

  try {
    centerpoint(results);
  } catch (error) {
    console.log("error in onResult function");
  }

  grid.updateLandmarks(results.poseWorldLandmarks);
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
pose.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  enableSegmentation: true,
  smoothSegmentation: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
  selfieMode: true,
});
pose.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await pose.send({ image: videoElement });
  },
  width: 1280,
  height: 720,
});
camera.start();

function centerpoint(results) {
  // console.log(results);
  try {

    var x = (results.poseLandmarks[11].x + results.poseLandmarks[12].x) / 2;
    var y = (results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2;
    // console.log("x= "+x);
    // console.log("y= "+y);
    if (y < 0.35)  console.log("up");
    else if (y > 0.65) console.log("down");
    else console.log("center");

    if (x < 0.35) console.log("left");
    else if (x > 0.65) console.log("right");
    else console.log("center");

  } catch (error) {
    console.log(error);
  }
}

