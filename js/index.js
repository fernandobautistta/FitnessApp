const video5 = document.getElementsByClassName('input_video5')[0];
const out5 = document.getElementsByClassName('output5')[0];
const controlsElement5 = document.getElementsByClassName('control5')[0];
const canvasCtx5 = out5.getContext('2d');

const fpsControl = new FPS();

const spinner = document.querySelector('.loading');
spinner.ontransitionend = () => {
  spinner.style.display = 'none';
};

// Declarar e inicializar variables
let stage = 'arriba';
let contador = 0;

function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function calculateAngle(a, b, c) {
  const angleRad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angleDeg = Math.abs((angleRad * 180.0) / Math.PI);

  if (angleDeg > 180.0) {
    angleDeg = 360 - angleDeg;
  }

  return angleDeg;
}

function onResultsPose(results) {
  document.body.classList.add('loaded');
  fpsControl.tick();

  canvasCtx5.save();
  canvasCtx5.clearRect(0, 0, out5.width, out5.height);
  canvasCtx5.drawImage(results.image, 0, 0, out5.width, out5.height);
  drawConnectors(canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
    color: (data) => {
      const x0 = out5.width * data.from.x;
      const y0 = out5.height * data.from.y;
      const x1 = out5.width * data.to.x;
      const y1 = out5.height * data.to.y;

      const z0 = clamp(data.from.z + 0.5, 0, 1);
      const z1 = clamp(data.to.z + 0.5, 0, 1);

      const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
      gradient.addColorStop(1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
      return gradient;
    }
  });


  const hombro_izq = [
    results.poseLandmarks[5].x,
    results.poseLandmarks[5].y
  ];

  const codo_izq = [
    results.poseLandmarks[6].x,
    results.poseLandmarks[6].y
  ];
  const muñeca_izq = [
    results.poseLandmarks[7].x,
    results.poseLandmarks[7].y
  ];

  const hombro_der = [
    results.poseLandmarks[8].x,
    results.poseLandmarks[8].y
  ];
  const codo_der = [
    results.poseLandmarks[9].x,
    results.poseLandmarks[9].y
  ];
  const muñeca_der = [
    results.poseLandmarks[10].x,
    results.poseLandmarks[10].y
  ];



  const angleLeft = calculateAngle(hombro_izq, codo_izq, muñeca_izq);
  const angleRight = calculateAngle(hombro_der, codo_der, muñeca_der);

  // Realizar acciones basadas en los ángulos
  if (angleRight > 160 && angleLeft > 160) {
    // Realizar acciones cuando ambos ángulos son mayores a 160
    console.log("Abajo");
    stage = "abajo";
  }

  if ((angleRight < 30 && angleLeft < 30) && stage === 'abajo') {
    // Realizar acciones cuando ambos ángulos son menores a 30 y la etapa es 'abajo'
    console.log("Arriba");
    contador++;
    console.log(contador);
    stage = 'arriba';
  }

  canvasCtx5.restore();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  }
});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({ image: video5 });
  },
  width: 480,
  height: 480
});
camera.start();

new ControlPanel(controlsElement5, {
  selfieMode: true,
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
})
  .add([
    new StaticText({ title: 'MediaPipe Pose' }),
    fpsControl,
    new Toggle({ title: 'Selfie Mode', field: 'selfieMode' }),
    new Toggle({ title: 'Upper-body Only', field: 'upperBodyOnly' }),
    new Toggle({ title: 'Smooth Landmarks', field: 'smoothLandmarks' }),
    new Slider({
      title: 'Min Detection Confidence',
      field: 'minDetectionConfidence',
      range: [0, 1],
      step: 0.01
    }),
    new Slider({
      title: 'Min Tracking Confidence',
      field: 'minTrackingConfidence',
      range: [0, 1],
      step: 0.01
    }),
  ])
  .on(options => {
    video5.classList.toggle('selfie', options.selfieMode);
    pose.setOptions(options);
  });
