
window.addEventListener('DOMContentLoaded', (event) => {


    let charge = new Audio()
    charge.src = "charge.mp3"

    const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
    for (let t = 0; t < 10000000; t++) {
        squaretable[`${t}`] = Math.sqrt(t)
        if (t > 999) {
            t += 9
        }
    }
    let video_recorder
    let recording = 0
    function CanvasCaptureToWEBM(canvas, bitrate) {
        // the video_recorder is set to  '= new CanvasCaptureToWEBM(canvas, 4500000);' in the setup, 
        // it uses the same canvas as the rest of the file.
        // to start a recording call .record() on video_recorder
        /*
        for example, 
        if(keysPressed['-'] && recording == 0){
            recording = 1
            video_recorder.record()
        }
        if(keysPressed['='] && recording == 1){
            recording = 0
            video_recorder.stop()
            video_recorder.download('File Name As A String.webm')
        }
        */
        this.record = Record
        this.stop = Stop
        this.download = saveToDownloads
        let blobCaptures = []
        let outputFormat = {}
        let recorder = {}
        let canvasInput = canvas.captureStream()
        if (typeof canvasInput == undefined || !canvasInput) {
            return
        }
        const video = document.createElement('video')
        video.style.display = 'none'

        function Record() {
            let formats = [
                "video/webm\;codecs=h264",
                "video/webm\;codecs=vp8",
                'video/vp8',
                "video/webm",
                'video/webm,codecs=vp9',
                "video/webm\;codecs=daala",
                "video/mpeg"
            ];

            for (let t = 0; t < formats.length; t++) {
                if (MediaRecorder.isTypeSupported(formats[t])) {
                    outputFormat = formats[t]
                    break
                }
            }
            if (typeof outputFormat != "string") {
                return
            } else {
                let videoSettings = {
                    mimeType: outputFormat,
                    videoBitsPerSecond: bitrate || 2000000 // 2Mbps
                };
                blobCaptures = []
                try {
                    recorder = new MediaRecorder(canvasInput, videoSettings)
                } catch (error) {
                    return;
                }
                recorder.onstop = handleStop
                recorder.ondataavailable = handleAvailableData
                recorder.start(100)
            }
        }
        function handleAvailableData(event) {
            if (event.data && event.data.size > 0) {
                blobCaptures.push(event.data)
            }
        }
        function handleStop() {
            const superBuffer = new Blob(blobCaptures, { type: outputFormat })
            video.src = window.URL.createObjectURL(superBuffer)
        }
        function Stop() {
            recorder.stop()
            video.controls = true
        }
        function saveToDownloads(input) { // specifying a file name for the output
            const name = input || 'video_out.webm'
            const blob = new Blob(blobCaptures, { type: outputFormat })
            const url = window.URL.createObjectURL(blob)
            const storageElement = document.createElement('a')
            storageElement.style.display = 'none'
            storageElement.href = url
            storageElement.download = name
            document.body.appendChild(storageElement)
            storageElement.click()
            setTimeout(() => {
                document.body.removeChild(storageElement)
                window.URL.revokeObjectURL(url)
            }, 100)
        }
    }
    const gamepadAPI = {
        controller: {},
        turbo: true,
        connect: function (evt) {
            if (navigator.getGamepads()[0] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[1] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[2] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            } else if (navigator.getGamepads()[3] != null) {
                gamepadAPI.controller = navigator.getGamepads()[0]
                gamepadAPI.turbo = true;
            }
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i] === null) {
                    continue;
                }
                if (!gamepads[i].connected) {
                    continue;
                }
            }
        },
        disconnect: function (evt) {
            gamepadAPI.turbo = false;
            delete gamepadAPI.controller;
        },
        update: function () {
            gamepadAPI.controller = navigator.getGamepads()[0]
            gamepadAPI.buttonsCache = [];// clear the buttons cache
            for (var k = 0; k < gamepadAPI.buttonsStatus.length; k++) {// move the buttons status from the previous frame to the cache
                gamepadAPI.buttonsCache[k] = gamepadAPI.buttonsStatus[k];
            }
            gamepadAPI.buttonsStatus = [];// clear the buttons status
            var c = gamepadAPI.controller || {}; // get the gamepad object
            var pressed = [];
            if (c.buttons) {
                for (var b = 0, t = c.buttons.length; b < t; b++) {// loop through buttons and push the pressed ones to the array
                    if (c.buttons[b].pressed) {
                        pressed.push(gamepadAPI.buttons[b]);
                    }
                }
            }
            var axes = [];
            if (c.axes) {
                for (var a = 0, x = c.axes.length; a < x; a++) {// loop through axes and push their values to the array
                    axes.push(c.axes[a].toFixed(2));
                }
            }
            gamepadAPI.axesStatus = axes;// assign received values
            gamepadAPI.buttonsStatus = pressed;
            // console.log(pressed); // return buttons for debugging purposes
            return pressed;
        },
        buttonPressed: function (button, hold) {
            var newPress = false;
            for (var i = 0, s = gamepadAPI.buttonsStatus.length; i < s; i++) {// loop through pressed buttons
                if (gamepadAPI.buttonsStatus[i] == button) {// if we found the button we're looking for...
                    newPress = true;// set the boolean variable to true
                    if (!hold) {// if we want to check the single press
                        for (var j = 0, p = gamepadAPI.buttonsCache.length; j < p; j++) {// loop through the cached states from the previous frame
                            if (gamepadAPI.buttonsCache[j] == button) { // if the button was already pressed, ignore new press
                                newPress = false;
                            }
                        }
                    }
                }
            }
            return newPress;
        },
        buttons: [
            'A', 'B', 'X', 'Y', 'LB', 'RB', 'Left-Trigger', 'Right-Trigger', 'Back', 'Start', 'Axis-Left', 'Axis-Right', 'DPad-Up', 'DPad-Down', 'DPad-Left', 'DPad-Right', "Power"
        ],
        buttonsCache: [],
        buttonsStatus: [],
        axesStatus: []
    };
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    let XS_engine
    let YS_engine
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }

    class Vector { // vector math and physics if you prefer this over vector components on circles
        constructor(object = (new Point(0, 0)), xmom = 0, ymom = 0) {
            this.xmom = xmom
            this.ymom = ymom
            this.object = object
        }
        isToward(point) {
            let link = new LineOP(this.object, point)
            let dis1 = link.squareDistance()
            let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
            let link2 = new LineOP(dummy, point)
            let dis2 = link2.squareDistance()
            if (dis2 < dis1) {
                return true
            } else {
                return false
            }
        }
        rotate(angleGoal) {
            let link = new Line(this.xmom, this.ymom, 0, 0)
            let length = link.hypotenuse()
            let x = (length * Math.cos(angleGoal))
            let y = (length * Math.sin(angleGoal))
            this.xmom = x
            this.ymom = y
        }
        magnitude() {
            return (new Line(this.xmom, this.ymom, 0, 0)).hypotenuse()
        }
        normalize(size = 1) {
            let magnitude = this.magnitude()
            this.xmom /= magnitude
            this.ymom /= magnitude
            this.xmom *= size
            this.ymom *= size
        }
        multiply(vect) {
            let point = new Point(0, 0)
            let end = new Point(this.xmom + vect.xmom, this.ymom + vect.ymom)
            return point.pointDistance(end)
        }
        add(vect) {
            return new Vector(this.object, this.xmom + vect.xmom, this.ymom + vect.ymom)
        }
        subtract(vect) {
            return new Vector(this.object, this.xmom - vect.xmom, this.ymom - vect.ymom)
        }
        divide(vect) {
            return new Vector(this.object, this.xmom / vect.xmom, this.ymom / vect.ymom) //be careful with this, I don't think this is right
        }
        draw() {
            let dummy = new Point(this.object.x + this.xmom, this.object.y + this.ymom)
            let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
            link.draw()
        }
    }
    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        angle() {
            return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
        }
        squareDistance() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.x1, this.y1)
            canvas_context.lineTo(this.x2, this.y2)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class LineOP {
        constructor(object, target, color, width = 1) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if (hypotenuse < 10000000 - 1) {
                if (hypotenuse > 1000) {
                    return squaretable[`${Math.round(10 * Math.round((hypotenuse * .1)))}`]
                } else {
                    return squaretable[`${Math.round(hypotenuse)}`]
                }
            } else {
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Triangle {
        constructor(x, y, color, length, fill = 0, strokeWidth = 0, leg1Ratio = 1, leg2Ratio = 1, heightRatio = 1) {
            this.x = x
            this.y = y
            this.color = color
            this.length = length
            this.x1 = this.x + this.length * leg1Ratio
            this.x2 = this.x - this.length * leg2Ratio
            this.tip = this.y - this.length * heightRatio
            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
            this.fill = fill
            this.stroke = strokeWidth
        }
        draw() {
            canvas_context.strokeStyle = this.color
            canvas_context.stokeWidth = this.stroke
            canvas_context.beginPath()
            canvas_context.moveTo(this.x, this.y)
            canvas_context.lineTo(this.x1, this.y)
            canvas_context.lineTo(this.x, this.tip)
            canvas_context.lineTo(this.x2, this.y)
            canvas_context.lineTo(this.x, this.y)
            if (this.fill == 1) {
                canvas_context.fill()
            }
            canvas_context.stroke()
            canvas_context.closePath()
        }
        isPointInside(point) {
            if (point.x <= this.x1) {
                if (point.y >= this.tip) {
                    if (point.y <= this.y) {
                        if (point.x >= this.x2) {
                            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
                            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
                            this.basey = point.y - this.tip
                            this.basex = point.x - this.x
                            if (this.basex == 0) {
                                return true
                            }
                            this.slope = this.basey / this.basex
                            if (this.slope >= this.accept1) {
                                return true
                            } else if (this.slope <= this.accept2) {
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 6, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }

        frictiveMove10() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom*.1
            this.y += this.ymom*.1
            this.xmom *= 1-((1-this.friction)*.1)
            this.ymom *= 1-((1-this.friction)*.1)
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    }
    class CircleS {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 6, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = 3// this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                // canvas_context.fillStyle = this.color
                // canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    }
    class Circled {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = 40
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius + 24, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                // canvas_context.fill()
                canvas_context.stroke();
            } else {
                // console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } class Polygon {
        constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
            if (sides < 2) {
                sides = 2
            }
            this.reflect = reflect
            this.xmom = xmom
            this.ymom = ymom
            this.body = new Circle(x, y, size - (size * .293), "transparent")
            this.nodes = []
            this.angle = angle
            this.size = size
            this.color = color
            this.angleIncrement = (Math.PI * 2) / sides
            this.sides = sides
            for (let t = 0; t < sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
        }
        isPointInside(point) { // rough approximation
            this.body.radius = this.size - (this.size * .293)
            if (this.sides <= 2) {
                return false
            }
            this.areaY = point.y - this.body.y
            this.areaX = point.x - this.body.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
                return true
            }
            return false
        }
        move() {
            if (this.reflect == 1) {
                if (this.body.x > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.body.x < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.body.x += this.xmom
            this.body.y += this.ymom
        }
        draw() {
            // this.nodes = []
            // this.angleIncrement = (Math.PI * 2) / this.sides
            // this.body.radius = this.size - (this.size * .293)
            // for (let t = 0; t < this.sides; t++) {
            //     let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
            //     this.nodes.push(node)
            //     this.angle += this.angleIncrement
            // }
            canvas_context.strokeStyle = this.color
            canvas_context.fillStyle = this.color
            canvas_context.lineWidth = 1
            canvas_context.beginPath()
            canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
            for (let t = 1; t < this.nodes.length; t++) {
                canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
            }
            canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
            canvas_context.fill()
            canvas_context.stroke()
            canvas_context.closePath()
        }
    }
    class Shape {
        constructor(shapes) {
            this.shapes = shapes
        }
        draw() {
            for (let t = 0; t < this.shapes.length; t++) {
                this.shapes[t].draw()
            }
        }
        isPointInside(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].isPointInside(point)) {
                    return true
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return true
                }
            }
            return false
        }
        innerShape(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return this.shapes[t]
                }
            }
            return false
        }
        isInsideOf(box) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (box.isPointInside(this.shapes[t])) {
                    return true
                }
            }
            return false
        }
        adjustByFromDisplacement(x, y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (typeof this.shapes[t].fromRatio == "number") {
                    this.shapes[t].x += x * this.shapes[t].fromRatio
                    this.shapes[t].y += y * this.shapes[t].fromRatio
                }
            }
        }
        adjustByToDisplacement(x, y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (typeof this.shapes[t].toRatio == "number") {
                    this.shapes[t].x += x * this.shapes[t].toRatio
                    this.shapes[t].y += y * this.shapes[t].toRatio
                }
            }
        }
        mixIn(arr) {
            for (let t = 0; t < arr.length; t++) {
                for (let k = 0; k < arr[t].shapes.length; k++) {
                    this.shapes.push(arr[t].shapes[k])
                }
            }
        }
        push(object) {
            this.shapes.push(object)
        }
    }

    class Spring {
        constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
            if (body == 0) {
                this.body = new Circle(x, y, radius, color)
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            } else {
                this.body = body
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            }
            this.gravity = gravity
            this.width = width
        }
        balance() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += (this.body.x - this.anchor.x) / this.length
                this.body.ymom += (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
            } else {
                this.body.xmom -= (this.body.x - this.anchor.x) / this.length
                this.body.ymom -= (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
            }
            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move() {
            this.anchor.ymom += this.gravity
            this.anchor.move()
        }

    }
    class SpringOP {
        constructor(body, anchor, length, width = 3, color = body.color) {
            this.body = body
            this.anchor = anchor
            this.beam = new LineOP(body, anchor, color, width)
            this.length = length
        }
        balance() {
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += ((this.body.x - this.anchor.x) / this.length)
                this.body.ymom += ((this.body.y - this.anchor.y) / this.length)
                this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length)
                this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length)
            } else if (this.beam.hypotenuse() > this.length) {
                this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
                this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
                this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
                this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
            }

            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam.draw()
        }
        move() {
            //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
        }
    }

    class Color {
        constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
            this.hue = baseColor
            if (red != -1 && green != -1 && blue != -1) {
                this.r = red
                this.g = green
                this.b = blue
                if (alpha != 1) {
                    if (alpha < 1) {
                        this.alpha = alpha
                    } else {
                        this.alpha = alpha / 255
                        if (this.alpha > 1) {
                            this.alpha = 1
                        }
                    }
                }
                if (this.r > 255) {
                    this.r = 255
                }
                if (this.g > 255) {
                    this.g = 255
                }
                if (this.b > 255) {
                    this.b = 255
                }
                if (this.r < 0) {
                    this.r = 0
                }
                if (this.g < 0) {
                    this.g = 0
                }
                if (this.b < 0) {
                    this.b = 0
                }
            } else {
                this.r = 0
                this.g = 0
                this.b = 0
            }
        }
        normalize() {
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        }
        randomLight() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12) + 4)];
            }
            var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
            return color;
        }
        randomDark() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12))];
            }
            var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
            return color;
        }
        random() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 16))];
            }
            var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
            return color;
        }
    }
    class Softbody { //buggy, spins in place
        constructor(x, y, radius, color, members = 10, memberLength = 5, force = 10, gravity = 0) {
            this.springs = []
            this.pin = new Circle(x, y, radius, color)
            this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
            this.springs.push(this.spring)
            for (let k = 0; k < members; k++) {
                this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
                if (k < members - 1) {
                    this.springs.push(this.spring)
                } else {
                    this.spring.anchor = this.pin
                    this.springs.push(this.spring)
                }
            }
            this.forceConstant = force
            this.centroid = new Point(0, 0)
        }
        circularize() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            this.angle = 0
            this.angleIncrement = (Math.PI * 2) / this.springs.length
            for (let t = 0; t < this.springs.length; t++) {
                this.springs[t].body.x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
                this.springs[t].body.y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
                this.angle += this.angleIncrement
            }
        }
        balance() {
            for (let s = this.springs.length - 1; s >= 0; s--) {
                this.springs[s].balance()
            }
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            for (let s = 0; s < this.springs.length; s++) {
                this.link = new Line(this.centroid.x, this.centroid.y, this.springs[s].anchor.x, this.springs[s].anchor.y, 0, "transparent")
                if (this.link.hypotenuse() != 0) {
                    this.springs[s].anchor.xmom += (((this.springs[s].anchor.x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                    this.springs[s].anchor.ymom += (((this.springs[s].anchor.y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
                }
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].move()
            }
            for (let s = 0; s < this.springs.length; s++) {
                this.springs[s].draw()
            }
        }
    }
    class Observer {
        constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
            this.body = new Circle(x, y, radius, color)
            this.color = color
            this.ray = []
            this.rayrange = range
            this.globalangle = Math.PI
            this.gapangle = angle
            this.currentangle = 0
            this.obstacles = []
            this.raymake = rays
        }
        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 0; f < this.rayrange; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }
        draw() {
            this.beam()
            this.body.draw()
            canvas_context.lineWidth = 1
            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath()
            canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                canvas_context.lineTo(this.body.x, this.body.y)
            }
            canvas_context.stroke()
            canvas_context.fill()
            this.ray = []
        }
    }
    function setUp(canvas_pass, style = "#000055") {
        canvas = canvas_pass
        video_recorder = new CanvasCaptureToWEBM(canvas, 2500000);
        canvas_context = canvas.getContext('2d');
        canvas_context.imageSmoothingEnabled = false
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 40)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
            window.addEventListener('pointermove', continued_stimuli);
        });
        window.addEventListener('pointerup', e => {
            window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
        }
    }
    function gamepad_control(object, speed = 1) { // basic control for objects using the controler
        //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
        if (typeof object.body != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.body.x += (gamepadAPI.axesStatus[0] * speed)
                    object.body.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        } else if (typeof object != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.x += (gamepadAPI.axesStatus[0] * speed)
                    object.y += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        }
    }
    function control(object, speed = 1) { // basic control for objects
        if (typeof object.body != 'undefined') {
            if (keysPressed['w']) {
                object.body.y -= speed
            }
            if (keysPressed['d']) {
                object.body.x += speed
            }
            if (keysPressed['s']) {
                object.body.y += speed
            }
            if (keysPressed['a']) {
                object.body.x -= speed
            }
        } else if (typeof object != 'undefined') {
            if (keysPressed['w']) {
                object.y -= speed
            }
            if (keysPressed['d']) {
                //    loe.index+=2
                //    loe.index%=loe.tongue.length-1
            }
            if (keysPressed['s']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                // loe.index-=2
                // if(loe.index < 0){
                //     loe.index =  loe.tongue.length-1
                // }
                // loe.index%=loe.tongue.length
            }
        }
    }
    function dontrol(object, speed = 1) { // basic control for objects
        if (typeof object.body != 'undefined') {
            if (keysPressed['w']) {
                object.body.y -= speed
            }
            if (keysPressed['d']) {
                object.body.x += speed
            }
            if (keysPressed['s']) {
                object.body.y += speed
            }
            if (keysPressed['a']) {
                object.body.x -= speed
            }
        } else if (typeof object != 'undefined') {
            if (keysPressed['i']) {
                object.y -= speed
            }
            if (keysPressed['d']) {
                //    loe.index+=2
                //    loe.index%=loe.tongue.length-1
            }
            if (keysPressed['k']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                // loe.index-=2
                // if(loe.index < 0){
                //     loe.index =  loe.tongue.length-1
                // }
                // loe.index%=loe.tongue.length
            }
        }
    }
    function getRandomLightColor() { // random color that will be visible on  black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        return color;
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    function getRandomDarkColor() {// color that will be visible on a black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12))];
        }
        return color;
    }
    function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
        let limit = granularity
        let shape_array = []
        for (let t = 0; t < limit; t++) {
            let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
            circ.toRatio = t / limit
            circ.fromRatio = (limit - t) / limit
            shape_array.push(circ)
        }
        return (new Shape(shape_array))
    }

    function castBetweenPoints(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
        let limit = granularity
        let shape_array = []
        for (let t = 0; t < limit; t++) {
            let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
            circ.toRatio = t / limit
            circ.fromRatio = (limit - t) / limit
            shape_array.push(circ)
        }
        return shape_array
    }

    class Disang {
        constructor(dis, ang) {
            this.dis = dis
            this.angle = ang
        }
    }

    class BezierHitbox {
        constructor(x, y, cx, cy, ex, ey, color = "red") { // this function takes a starting x,y, a control point x,y, and a end point x,y
            this.color = color
            this.x = x
            this.y = y
            this.cx = cx
            this.cy = cy
            this.ex = ex
            this.ey = ey
            this.metapoint = new Circle((x + cx + ex) / 3, (y + cy + ey) / 3, 3, "#FFFFFF")
            this.granularity = 100
            this.body = [...castBetweenPoints((new Point(this.x, this.y)), (new Point(this.ex, this.ey)), this.granularity, 0)]

            let angle = (new Line(this.x, this.y, this.ex, this.ey)).angle()

            this.angles = []
            for (let t = 0; t < this.granularity; t++) {
                this.angles.push(angle)
            }
            for (let t = 0; t <= 1; t += 1 / this.granularity) {
                this.body.push(this.getQuadraticXY(t))
                this.angles.push(this.getQuadraticAngle(t))
            }
            this.hitbox = []
            for (let t = 0; t < this.body.length; t++) {
                let link = new LineOP(this.body[t], this.metapoint)
                let disang = new Disang(link.hypotenuse(), link.angle() + (Math.PI * 2))
                this.hitbox.push(disang)
            }
            this.constructed = 1
        }
        isPointInside(point) {
            let link = new LineOP(point, this.metapoint)
            let angle = (link.angle() + (Math.PI * 2))
            let dis = link.hypotenuse()
            for (let t = 1; t < this.hitbox.length; t++) {
                if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                    continue
                }
                if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                    if (dis < (this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) {
                        return true
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            let link = new LineOP(point, this.metapoint)
            let angle = (link.angle() + (Math.PI * 2))
            let dis = link.hypotenuse()
            for (let t = 1; t < this.hitbox.length; t++) {
                if (Math.abs(this.hitbox[t].angle - this.hitbox[t - 1].angle) > 1) {
                    continue
                }
                if (angle.between(this.hitbox[t].angle, this.hitbox[t - 1].angle)) {
                    if (dis < ((this.hitbox[t].dis + this.hitbox[t - 1].dis) * .5) + point.radius) {
                        return this.angles[t]
                    }
                }
            }
            return false
        }
        draw() {
            this.metapoint.draw()
            let tline = new Line(this.x, this.y, this.ex, this.ey, this.color, 3)
            tline.draw()
            canvas_context.beginPath()
            this.median = new Point((this.x + this.ex) * .5, (this.y + this.ey) * .5)
            let angle = (new LineOP(this.median, this.metapoint)).angle()
            let dis = (new LineOP(this.median, this.metapoint)).hypotenuse()
            canvas_context.bezierCurveTo(this.x, this.y, this.cx - (Math.cos(angle) * dis * .38), this.cy - (Math.sin(angle) * dis * .38), this.ex, this.ey)

            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = 3
            canvas_context.stroke()
        }
        getQuadraticXY(t) {
            return new Point((((1 - t) * (1 - t)) * this.x) + (2 * (1 - t) * t * this.cx) + (t * t * this.ex), (((1 - t) * (1 - t)) * this.y) + (2 * (1 - t) * t * this.cy) + (t * t * this.ey))
        }
        getQuadraticAngle(t) {
            var dx = 2 * (1 - t) * (this.cx - this.x) + 2 * t * (this.ex - this.cx);
            var dy = 2 * (1 - t) * (this.cy - this.y) + 2 * t * (this.ey - this.cy);
            return -Math.atan2(dx, dy) + 0.5 * Math.PI;
        }
    }


    Number.prototype.between = function (a, b, inclusive) {
        var min = Math.min(a, b),
            max = Math.max(a, b);
        return inclusive ? this >= min && this <= max : this > min && this < max;
    }
    

    function isNyaN(num) {
        if (isNaN(num)) {
            console.log(num);
            return false
        } else if (isFinite(num)) {
            return true
        }
        // console.trace();
        return false
    }



    let setup_canvas = document.getElementById('canvas') //getting canvas from document
    // let textbox = document.getElementById('text') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 

    class Sproutfolk {
        constructor(x, y, type) {
            this.colors = [['#00FFFF', '#AAFFFF'], ['#FF00FF', '#FFAAFF'], ['#FFFF00', '#FFFFAA']]
            this.body = new Circle(x, y, 2, this.colors[type][0])
            this.body.friction = .8
            this.grounded = 1
            this.supersize = 7
            this.playlink = new LineOP(this.body, throbert.body)
            this.links = []
            this.type = type
            this.grab = 0
            this.fly = 0
            this.cling = 0
            this.clingTo = {}
            this.clingx = 0
            this.clingy = 0
            this.clingangle = 0
            this.attent = 0
            this.damage = 1
            this.carrying = 0
        }
        draw() {

            for(let x = 0;x<10;x++){
                this.body.frictiveMove10()
                this.xcord = Math.floor((this.body.x) / 10) * 10
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 5110)
                this.ycord = Math.floor((this.body.y) / 10) * 10
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 5110)
                // console.log(this.xcord, this.ycord)
                if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                    for (let t = Math.max(this.xcord - 10, 0); t < Math.min(this.xcord + 20, 5110); t += 10) {
                        for (let k = Math.max(this.ycord - 10, 0); k < Math.min(this.ycord + 20, 5110); k += 10) {
    
                            let point = new Point(throbert.road[`${t},${k}`].x + 5, throbert.road[`${t},${k}`].y + 5)
                            let link = new LineOP(this.body, point)
    
                            let linkz = new LineOP(this.clingTo, point)
                            if (this.clingTo.radius > 0) {
    
                                if (linkz.hypotenuse() <= 14 + this.clingTo.radius) {
                                    if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .2) {
                                    } else {
                                        let link = new LineOP(throbert.c1, this.clingTo)
                                        this.clingTo.x += Math.cos(link.angle()+(Math.PI*.5)) * 1.8
                                        this.clingTo.y += Math.sin(link.angle()+(Math.PI*.5)) * 1.8
                                        this.clingTo.x += Math.cos(linkz.angle()) * 1.8
                                        this.clingTo.y += Math.sin(linkz.angle()) * 1.8
                                    }
                                }
                            }
    
                            if (link.hypotenuse() <= 14+(this.fly*14)) {
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .03) {
                                } else {
                                    if (link.hypotenuse() <= 14){
                                        if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .1 && this.fly > 0) {

                                        }else{
                                        this.body.xmom = Math.cos(link.angle()) * 2
                                        this.body.ymom = Math.sin(link.angle()) * 2
                                        }
                                    }else if(link.hypotenuse() <= 14+(this.fly*14)) {
                                        if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .1) {

                                        }else{
                                        this.body.xmom = Math.cos(link.angle()) * 2
                                        this.body.ymom = Math.sin(link.angle()) * 2
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (this.fly > 0) {
                this.fly--
                if (this.fly == 0) {
                    this.attent = 0
                }
            }
            if (this.grounded == 1) {
                this.body.radius = 1.9
            } else {
                this.body.radius = 3 + (Math.abs(this.grounded))
                if (this.grounded < 0) {
                    this.grounded += .5
                }
            }
            if (this.attent == 1) {
                this.body.color = this.colors[this.type][0]
            } else {
                this.body.color = this.colors[this.type][1]
            }

            if (this.cling == 1) {
                this.body.x = this.clingTo.x + this.clingx + ((Math.random() - .5) * .01)
                this.body.y = this.clingTo.y + this.clingy + ((Math.random() - .5) * .01)
                if (this.carrying == 1 && this.clingTo.health <= 0) {
                    let link = new LineOP(throbert.c1, this.clingTo)
                    this.clingTo.x += (throbert.c1.x - this.clingTo.x) / (Math.max(link.hypotenuse(), 1) * this.clingTo.weight)
                    this.clingTo.y += (throbert.c1.y - this.clingTo.y) / (Math.max(link.hypotenuse(), 1) * this.clingTo.weight)
                    if (this.clingTo.doesPerimeterTouch(throbert.c1)) {
                        this.clingTo.x = throbert.c1.x
                        this.clingTo.y = throbert.c1.y
                        this.cling = 0
                        this.body.xmom = 0
                        this.body.ymom = 0
                        if (this.clingTo.timer > 20) {
                            this.clingTo.timer = 20
                        }
                        // this.clingTo.radius *= .96
                        if (this.playlink.hypotenuse() < 190) {
                            this.attent = 1
                        } else {
                            this.attent = 0
                        }
                    }
                }
            } else {
                this.carrying = 0
            }
            this.superbody = new Circle(this.body.x, this.body.y, this.body.radius * 1.41, "transparent")
            this.body.draw()
        }
    }
    class Gloobleglat {
        constructor(x, y) {
            this.body = new Circle(x, y, 12, "red")
            this.bodyarea = new Circle(x, y, 120, "red")
            this.go = this.body
            this.health = 1000
            this.maxhealth = this.health
            this.value = 10
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 10
            this.body.weight = this.weight
        }
        draw() {
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
                    }
                } else {
                    this.body.x -= Math.sign(this.body.x - this.go.x)
                    this.body.y -= Math.sign(this.body.y - this.go.y)
                }
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + this.body.radius, (this.body.radius * 2) * (this.health / this.maxhealth), 3, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            this.body.draw()
            this.body.health = this.health
        }
    }
    class Ploorenab {
        constructor(x, y) {
            this.body = new Circle(x, y, 6, "pink")
            this.bodyarea = new Circle(x, y, 50, "pink")
            this.go = this.body
            this.health = 100
            this.maxhealth = this.health
            this.value = 2
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 3
            this.body.weight = this.weight
        }
        draw() {
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
                    }
                } else {
                    this.body.x -= Math.sign(this.body.x - this.go.x)
                    this.body.y -= Math.sign(this.body.y - this.go.y)
                }
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + this.body.radius, (this.body.radius * 2) * (this.health / this.maxhealth), 3, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            this.body.draw()
            this.body.health = this.health
        }
    }

    class Throbert {
        constructor() {
            this.map = pikmap
            this.road = {}
            for (let t = 0; t < 512; t++) {
                for (let k = 0; k < 512; k++) {
                    let rect = new Rectangle(this.map[`${t * 10},${k * 10}`].x, this.map[`${t * 10},${k * 10}`].y, this.map[`${t * 10},${k * 10}`].width, this.map[`${t * 10},${k * 10}`].height, this.map[`${t * 10},${k * 10}`].color)
                    rect.z = this.map[`${t * 10},${k * 10}`].z
                    this.road[`${t * 10},${k * 10}`] = rect
                }
            }
            // console.log(this)
            this.body = new Circle(2560, 2560, 4, "#AAFFAA")
            canvas_context.translate(-1920, -(1920+300))
            this.seek = new CircleS(2560, 2560, 8, "#FF00FF")
            this.c1 = new CircleS(2560, 2560, 12, "magenta")
            this.c2 = new CircleS(2560, 2560, 16, "yellow")
            this.c3 = new CircleS(2560, 2560, 20, "cyan")
            this.sproutventory = []
            this.supersize = 10
            this.nonlocal = []
            this.enemies = [new Gloobleglat(2300, 2660), new Gloobleglat(2560, 2800), new Gloobleglat(2860, 2660),  new Gloobleglat(2300+900, 2560), new Gloobleglat(2560, 2800+900), new Gloobleglat(2860+900, 2560+900)]
            for(let t = 0;t<10;t++){
               let plug =  new Ploorenab(2560+((Math.random()-.5)*1200), 2560+(Math.random()*800))
               this.enemies.push(plug)
            }
            this.grab = 0
            this.seekx = 0
            this.seeky = 0
            this.worldmap = new Image()
            this.worldmap.src = "pikmap4.png"

            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)
            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)

            // this.data = canvas_context.getImageData(-640, -940, 2560, 2560)
            // console.log(this)
        }
        feel() {
            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)
            // this.data = canvas_context.getImageData(-640, -940, 2560, 2560)
        }
        generate(num) {
            this.angle = 0
            for (let t = 0; t < num; t++) {
                let sprout = new Sproutfolk(this.c1.x + (Math.cos(this.angle + ((Math.PI / 4.5) * t)) * (30 + (t * 2))), this.c1.y + (Math.sin(this.angle + ((Math.PI / 4.5) * t)) * (30 + (t * 2))), t % 3)
                this.sproutventory.push(sprout)
                console.log(sprout)
            }
            for (let t = 0; t < this.sproutventory.length; t++) {
                this.sproutventory[t].links = []
                for (let k = 0; k < this.sproutventory.length; k++) {
                    let link = new LineOP(this.sproutventory[t].body, this.sproutventory[k].body)
                    this.sproutventory[t].links.push(link)
                }
            }
        }
        draw() {
            canvas_context.drawImage(this.worldmap, 0, 0, 512, 512, 0, 0, 5120, 5120)
            // let data = canvas_context.getImageData(-640, -940, 2560, 2560)
            this.c1.draw()
            this.c2.draw()
            this.c3.draw()
            this.speedplay = 1
            this.volumeplay = 1
            let sum = 0
            if (Math.abs(gamepadAPI.axesStatus[2]) > 0) {
                sum += Math.abs(gamepadAPI.axesStatus[2]) * 1
                this.seekx = ((this.seekx * 9) + ((gamepadAPI.axesStatus[2]) * 95)) / 10
            }
            if (Math.abs(gamepadAPI.axesStatus[3]) > 0) {
                sum += Math.abs(gamepadAPI.axesStatus[3]) * 1
                this.seeky = ((this.seeky * 9) + ((gamepadAPI.axesStatus[3]) * 95)) / 10
            }
            this.volumeplay = sum / 3

            charge.volume = this.volumeplay
            if (!gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                charge.play()
            }

            if (gamepadAPI.buttonsStatus.includes('Right-Trigger')) {



                for (let t = 0; t < this.sproutventory.length; t++) {
                    if (this.seek.doesPerimeterTouch(this.sproutventory[t].body)) {
                        if (this.sproutventory[t].grounded != 1) {
                            this.sproutventory[t].body.xmom -= (this.sproutventory[t].body.x - this.body.x) / 100
                            this.sproutventory[t].body.ymom -= (this.sproutventory[t].body.y - this.body.y) / 100
                            this.sproutventory[t].attent = 1
                            this.sproutventory[t].fly = 0
                            this.sproutventory[t].cling = 0
                        }
                    }
                }

                if (Math.random() < .5) {
                    this.seek.color = getRandomLightColor()
                }
                if (this.seek.radius < 80) {
                    this.seek.radius *= 1.1
                    this.seek.radius += 2
                }
            } else {
                this.seek.radius = 8
                this.seek.color = "#FF00FF"
            }
            if (this.grab < 0) {
                this.grab++
            }
            let xdiff = this.body.x
            let ydiff = this.body.y
            gamepad_control(this.body, 4)
            xdiff = xdiff - this.body.x
            ydiff = ydiff - this.body.y
            this.seek.x = this.body.x + this.seekx
            this.seek.y = this.body.y + this.seeky
            this.seek.draw()
            this.body.draw()
            for (let t = 0; t < this.enemies.length; t++) {
                if (this.enemies[t].spliceout == 1) {
                    this.generate(this.enemies[t].value)
                    this.enemies.splice(t, 1)
                }
            }
            for (let t = 0; t < this.enemies.length; t++) {
                this.enemies[t].draw()
                if (this.enemies[t].health <= 0) {
                    this.enemies[t].marked = 1
                }
                for (let k = 0; k < this.sproutventory.length; k++) {
                    if (this.sproutventory[k].grounded != 1) {
                        if (this.enemies[t].body.doesPerimeterTouch(this.sproutventory[k].body)) {
                            this.enemies[t].health -= this.sproutventory[k].damage
                            if (this.enemies[t].health <= 0) {
                                this.enemies[t].marked = 1
                                this.sproutventory[k].carrying = 1
                            } else {
                                this.sproutventory[k].carrying = 0
                            }
                        }
                        if (this.enemies[t].body.isPointInside(this.sproutventory[k].body)) {
                            if (this.enemies[t].health <= 0) {
                                this.enemies[t].marked = 1
                                this.sproutventory[k].carrying = 1
                            } else {
                                this.sproutventory[k].carrying = 0
                            }
                            if (this.enemies[t].spliceout != 1) {
                                this.sproutventory[k].cling = 1
                            }
                            this.sproutventory[k].clingTo = this.enemies[t].body
                            this.sproutventory[k].clingx = -(this.enemies[t].body.x - this.sproutventory[k].body.x)
                            this.sproutventory[k].clingy = -(this.enemies[t].body.y - this.sproutventory[k].body.y)
                        }
                    }
                }
            }
            for (let t = 0; t < this.sproutventory.length; t++) {


                if (this.sproutventory[t].grab == 1) {
                    this.sproutventory[t].attent = 1
                    this.sproutventory[t].body.x = this.body.x
                    this.sproutventory[t].body.y = this.body.y

                    if (keysPressed['w'] || gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                        this.grab = -2
                        this.sproutventory[t].body.xmom = (gamepadAPI.axesStatus[2] * 1) * 22
                        this.sproutventory[t].body.ymom = (gamepadAPI.axesStatus[3] * 1) * 22
                        this.sproutventory[t].grab = 0
                        this.sproutventory[t].fly = 20

                    }
                }
                if (this.sproutventory[t].grounded != 1 && this.sproutventory[t].fly <= 0) {
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        if (this.sproutventory[k].grounded != 1) {
                            if (t != k) {
                                if (this.sproutventory[t].links[k].hypotenuse() < this.sproutventory[t].supersize) {
                                    if (this.sproutventory[k].fly >= 1) {
                                    } else {
                                        this.sproutventory[t].attent = 1
                                    }
                                    if (this.sproutventory[t].type != this.sproutventory[k].type) {
                                        this.sproutventory[t].body.xmom += Math.cos(this.sproutventory[t].links[k].angle())
                                        this.sproutventory[t].body.ymom += Math.sin(this.sproutventory[t].links[k].angle())
                                    } else {
                                        this.sproutventory[t].body.xmom += Math.cos(this.sproutventory[t].links[k].angle()) * .2
                                        this.sproutventory[t].body.ymom += Math.sin(this.sproutventory[t].links[k].angle()) * .2
                                    }
                                }
                            }
                        }
                    }

                    if (this.sproutventory[t].cling != 1) {
                        if (this.sproutventory[t].attent == 1) {
                            if (!gamepadAPI.buttonsStatus.includes('Left-Trigger') && !gamepadAPI.buttonsStatus.includes('Right-Trigger')) {
                                if (Math.abs(gamepadAPI.axesStatus[2]) > 0) {
                                    this.sproutventory[t].body.xmom += gamepadAPI.axesStatus[2] * 1.2
                                }
                                if (Math.abs(gamepadAPI.axesStatus[3]) > 0) {
                                    this.sproutventory[t].body.ymom += gamepadAPI.axesStatus[3] * 1.2
                                }
                            }
                        }
                    }
                }

                let length = this.sproutventory[t].playlink.hypotenuse()
                this.sproutventory[t].draw()

                // this.sproutventory[t].body.frictiveMove()
                if (keysPressed['w'] || gamepadAPI.buttonsStatus.includes('A') || gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                    if (length < this.supersize) {
                        if (this.sproutventory[t].grounded == 1) {
                            this.sproutventory[t].grounded = -3
                            this.sproutventory[t].attent = 1
                        } else {
                            if (this.grab == 0) {
                                this.sproutventory[t].grounded = -1
                                this.sproutventory[t].grab = 1
                                this.grab = 1
                            }
                        }
                    }
                }
                if (this.sproutventory[t].grounded != 1) {
                    if (this.sproutventory[t].cling != 1) {
                        if (this.sproutventory[t].attent == 1) {
                            if (length > (30 + (t * 1.5))) {
                                this.sproutventory[t].body.xmom -= (this.sproutventory[t].body.x - this.body.x) / 140
                                this.sproutventory[t].body.ymom -= (this.sproutventory[t].body.y - this.body.y) / 140
                            }
                        }
                    }
                }
            }




            canvas_context.translate(xdiff, ydiff)

            // console.log(this)
        }
    }


    let throbert = new Throbert()
    throbert.generate(9)
    function main() {
        canvas_context.clearRect(-1000000, -1000000, canvas.width * 10000000, canvas.height * 10000000)
        gamepadAPI.update()
        throbert.draw()
        if (keysPressed['-'] && recording == 0) {
            recording = 1
            video_recorder.record()
        }
        if (keysPressed['='] && recording == 1) {
            recording = 0
            video_recorder.stop()
            video_recorder.download('File Name As A String.webm')
        }
    }



})
