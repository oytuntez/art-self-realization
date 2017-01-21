(function() {
    var canvas;
    // @todo replace this with the actual writing.
    var lines = [
        "Paris’teki çocuklar 2 dakika geç kalmıştı",
        "                sen 8 saat",
        "içine zarf atmıştık, geri döndü",
        "kimi bulanmış romantizme, dönmüş",
        "karşı çıkmadı birimiz, öyle güzel, çılgın",
        "                            çılgın",
        "                            çılgın",
        "                        çok güzel",
        "demokratik flörtler ya bunlar,",
        "flört de mi değil, flört mü,",
        "demo-mo-mo-mo-mo layığıyla sarmalamışlar",
        "            yok, gırtlağıyla",
        "o bohem oğlanlarınsa aklına camdan evler soktum",
        "sen her akşam o eve 8 saat geç geliyorsun",
        "",
        "Paris’te 2 dakikada bir ıslık, düdük, öttürü..."
    ];
    var introText = "To view this piece,\nyou need to click \"Allow\" \nwhen your browser asks for your camera access.\n\n\n" +
        "You have to step up for the piece.\nNeither it nor I\nshall not go down on knees\nto invite you here.";
    var closureText = "you sneaky invader.\n\nciao.";
    var cameraRejectionText = "thanks for being honest.\nrejection requires exiting this piece now.";
    var cameraRejectionSubText = "[refresh the page for one more chance to allow camera access.]";
    var signature = "Oytun Tez © 2017, Harlem";

    var introObject,
        cameraRejectionObject,
        cameraRejectionSubObject,
        linesRightMargin = 50,
        linesStartTop = 120,
        linesLineMargin = 30,
        linesDelaySeconds = 3,
        linesGroup = [],
        moleculeCount = 9,
        newMoleculeDelay = 500,
        moleculeFeedRatio = 0.05,
        moleculeGroup = [],
        moleculeAnimations = [
            'easeInBack','easeInBounce','easeInCirc','easeInCubic','easeInElastic',
            'easeInExpo','easeInOutBack','easeInOutBounce','easeInOutCirc','easeInOutCubic',
            'easeInOutElastic','easeInOutExpo','easeInOutQuad','easeInOutQuart','easeInOutQuint',
            'easeInOutSine','easeInQuad','easeInQuart','easeInQuint','easeInSine',
            'easeOutBack','easeOutBounce','easeOutCirc','easeOutCubic','easeOutElastic',
            'easeOutExpo','easeOutQuad','easeOutQuart','easeOutQuint','easeOutSine'
        ],
        canvasWidth,
        canvasHeight,
        currentCameraCoverageRadius = 20,
        maximumCameraCoverageRadius = 230,
        vibrationStarted = false,
        vibrationFinished = false,
        video = document.getElementById('camera');

    window.cancelRequestAnimFrame = (function(){
        //noinspection JSUnresolvedVariable
        return  window.cancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout
    })();

    function initialize() {
        fabric.Object.prototype.selectable = false;

        canvas = new fabric.Canvas('c', {
            selection: false
        });

        (function(){
            window.addEventListener('resize', resizeCanvas, false);

            function resizeCanvas() {
                canvas.setHeight(window.innerHeight);
                canvas.setWidth(window.innerWidth);
                canvas.renderAll();
            }

            // resize on init
            resizeCanvas();
        })();

        canvasWidth = canvas.getWidth();
        canvasHeight = canvas.getHeight();

        setupIntro();
        setupSignature();
        // Camera will start the lines and molecules as we require camera permission for the whole piece.
        setupCamera();
    }

    function setupSignature() {
        var signatureObject = new fabric.Text(signature, {
            fontFamily: '"Lucida Console", Monaco, monospace',
            fontSize: 10,
            fill: "#ddd",
            textAlign: 'center'
        });

        signatureObject.setTop(canvasHeight - (signatureObject.getHeight()) - 20);
        signatureObject.setLeft(10);

        canvas.add(signatureObject);
    }

    function setupMolecules() {
        for(var i = 1; i <= moleculeCount; i++) {
            fabric.loadSVGFromURL('/img/'+i+'.svg',function(objects,options) {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.setVisible(false);
                canvas.add(obj).renderAll();
                moleculeGroup.push(obj);

                if(moleculeCount === moleculeGroup.length) {
                    animateMolecules();
                }
            });
        }
    }

    function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function animateMolecules() {
        var center = canvas.getCenter(),
            centerLeft = center.left,
            centerTop = center.top,
            interval;

        interval = setInterval(function() {
            var index = getRandomInt(0, (moleculeCount-1)),
                molecule = moleculeGroup[index];

            molecule.clone(function(newMolecule) {
                var animationFrameRequest,
                    animationType = fabric.util.ease[moleculeAnimations[getRandomInt(0, 29)]],
                    moleculeScale = getRandomInt(10, 70);

                newMolecule.setVisible(true);
                newMolecule.setLeft(getRandomInt(0, (canvasWidth/2)));
                newMolecule.setTop(getRandomInt(0, canvasHeight));
                newMolecule.scaleToHeight(moleculeScale);
                canvas.add(newMolecule);
                newMolecule.bringToFront();

                newMolecule.animate('top', (centerTop-currentCameraCoverageRadius), {
                    duration: 2000,
                    onChange: canvas.renderAll.bind(canvas)
                });
                newMolecule.animate('left', (centerLeft-currentCameraCoverageRadius), {
                    duration: 2000,
                    onChange: function() {
                        if(vibrationFinished) {
                            newMolecule.remove();
                        }

                        canvas.renderAll.bind(canvas);
                    },
                    onComplete: function() {
                        currentCameraCoverageRadius += Math.round(moleculeScale*moleculeFeedRatio);
                        newMolecule.remove();
                        cancelRequestAnimFrame(animationFrameRequest);
                    },
                    easing: animationType
                });

                function rotateMolecule() {
                    newMolecule.setAngle(newMolecule.getAngle()+5);
                    animationFrameRequest = fabric.util.requestAnimFrame(rotateMolecule);
                }

                rotateMolecule();
            });

            if(vibrationFinished) {
                clearInterval(interval);
            }
        }, newMoleculeDelay);
    }
    
    function setupLines() {
        linesGroup = [];

        for(var i = 0; i < lines.length; i++) {
            var object = new fabric.Text(lines[i], {
                top: (linesStartTop + (linesLineMargin*i)),
                fontFamily: '"Lucida Console", Monaco, monospace',
                fontSize: 16,
                opacity: 0
            });

            object.setLeft((canvasWidth-object.getWidth()-linesRightMargin));

            (function(object) {
                setTimeout(function() {
                    canvas.add(object);
                    linesGroup.push(object);

                    object.animate('opacity', 1, {
                        onChange: canvas.renderAll.bind(canvas),
                        duration: 1000
                    });
                }, (i*(linesDelaySeconds*1000)));
            })(object);
        }
    }

    function setupIntro() {
        introObject = new fabric.Text(introText, {
            fontFamily: '"Lucida Console", Monaco, monospace',
            fontSize: 20,
            fill: 'black',
            textAlign: 'center'
        });

        canvas.add(introObject);
        introObject.center();
    }

    function removeIntro() {
        introObject.remove();
    }

    function setupCamera() {
        //noinspection JSUnresolvedVariable
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        if (!navigator.getUserMedia) {
            manageCameraRejection();

            return false;
        }

        //noinspection JSCheckFunctionSignatures
        video.setAttribute('autoplay', true);

        navigator.getUserMedia({video: true, audio: false}, manageCamera, manageCameraRejection);
    }

    function manageCameraRejection() {
        removeIntro();

        cameraRejectionObject = new fabric.Text(cameraRejectionText, {
            fontFamily: '"Lucida Console", Monaco, monospace',
            fontSize: 30,
            fill: 'red',
            textAlign: 'center'
        });
        cameraRejectionSubObject = new fabric.Text(cameraRejectionSubText, {
            fontFamily: '"Lucida Console", Monaco, monospace',
            fontSize: 16,
            fill: 'black',
            textAlign: 'center'
        });

        canvas.add(cameraRejectionObject);
        canvas.add(cameraRejectionSubObject);
        cameraRejectionObject.center();
        cameraRejectionSubObject.centerH();
        cameraRejectionSubObject.setTop(canvasHeight-(cameraRejectionSubObject.getHeight()+100));

        canvas.renderAll();
    }
    
    function manageCamera(stream) {
        //noinspection JSUnresolvedVariable,JSUnresolvedFunction
        video.src = window.URL.createObjectURL(stream);

        var isVibrationExpanded = true;
        var currentVibrationRadius = maximumCameraCoverageRadius;

        var videoFrame = new fabric.Image(video, {
            left: 0,
            top: 0,
            width: 200,
            height: 200,
            selectable: true,
            hasControls: true,
            clipTo: function (ctx) {
                if(vibrationFinished) {
                    return;
                }

                if(vibrationStarted) {
                    var radius = 0;

                    if(isVibrationExpanded) {
                        radius = currentVibrationRadius -= 1;
                        isVibrationExpanded = false;
                    } else {
                        radius = maximumCameraCoverageRadius;
                        isVibrationExpanded = true;
                    }

                    if(radius < 1) {
                        // Make the video full-screen
                        videoFrame.setWidth(canvasWidth);
                        videoFrame.setHeight(canvasHeight);
                        videoFrame.setLeft(0).setTop(0).set({
                            opacity: 0.3
                        });

                        vibrationFinished = true;
                        vibrationStarted = false;
                        videoFrame.clipTo = null;
                        currentCameraCoverageRadius = 0;

                        // Hide the poem lines
                        for(var k = 0; k < linesGroup.length; k++) {
                            linesGroup[k].remove();
                        }

                        var closureTextObject = new fabric.Text(closureText, {
                            fontFamily: '"Lucida Console", Monaco, monospace',
                            fontSize: 30,
                            color: 'black'
                        });

                        canvas.add(closureTextObject);
                        closureTextObject.center();

                        return;
                    } else {
                        ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
                    }

                    return;
                }

                if(currentCameraCoverageRadius >= maximumCameraCoverageRadius) {
                    vibrationStarted = true;
                } else {
                    ctx.arc(0, 0, currentCameraCoverageRadius, 0, Math.PI * 2, true);
                }
            }
        });

        video.addEventListener('loadedmetadata', function() {
            videoFrame.setWidth(video.videoWidth);
            videoFrame.setHeight(video.videoHeight);
            videoFrame.center();

            // Camera is on. Start the piece.
            removeIntro();
            setupLines();
            setupMolecules();
        });

        canvas.add(videoFrame);
        videoFrame.getElement().play();

        fabric.util.requestAnimFrame(function render() {
            canvas.renderAll();
            if(!vibrationFinished) {
                fabric.util.requestAnimFrame(render);
            }
        });
    }

    initialize();
})();