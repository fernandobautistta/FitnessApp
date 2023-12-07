
    const levantamiento = document.getElementById("levantamiento")
    const brazosHombros = document.getElementById("brazosHombros")
    const elevacionDehombros = document.getElementById("elevacionDehombros")

    const stateOk = document.getElementById("stateOk")
    let model, webcam, ctx, labelContainer, maxPredictions;
    let state='Abajo';

    const differents = ['down', 'abajo', 'Class 1']
    const contador = {
        'levantamiento' : 0, 
        'brazosHombros' : 0, 
        'elevacionDehombros' : 0
    }

    async function init(URL) {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        model = await tmPose.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const size = 200;
        const flip = true; 
        webcam = new tmPose.Webcam(size, size, flip); 
        await webcam.setup(); 
        await webcam.play();
        window.requestAnimationFrame(loop);

        const canvas = document.getElementById("canvas");
        canvas.width = size; canvas.height = size;
        ctx = canvas.getContext("2d");
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { 
            labelContainer.appendChild(document.createElement("div"));
        }
    }

    async function loop(timestamp) {
        webcam.update(); 
        await predict();
        window.requestAnimationFrame(loop);
    }

    async function predict() {

        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const prediction = await model.predict(posenetOutput);

        for (let i = 0; i < maxPredictions; i++) {
            if(prediction[i].probability.toFixed(2) > 0.97) {
                
                /**
                 * ? Modelo de establecimiento de contador
                 * @prediction.probability es el treshold manual
                 */

                if(state!==prediction[i].className && !differents.includes(prediction[i].className)){
                    
                    /**
                     * ? Un contador para cada clase
                     */
                    
                    if(prediction[i].className =='up') {
                        contador.levantamiento++;
                        levantamiento.innerHTML = contador.levantamiento;
                    }

                    if(prediction[i].className =='Class 2' || prediction[i].className =='Class 3') {
                        contador.brazosHombros++;
                        brazosHombros.innerHTML = contador.brazosHombros;
                    }

                    if(prediction[i].className =='arriba') {
                        contador.elevacionDehombros++;
                        levantamiento.innerHTML = contador.elevacionDehombros;
                    }


                }
                state = prediction[i].className
            }
        }

        // finally draw the poses
        drawPose(pose);
    }

    function drawPose(pose) {
        if (webcam.canvas) {
            ctx.drawImage(webcam.canvas, 0, 0);
            // draw the keypoints and skeleton
            if (pose) {
                const minPartConfidence = 0.5;
                tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
                tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);
            }
        }
    }