//replace enemy and throbert movement with mag calcs
//also do the vsum if you can for path2 calcs
window.addEventListener('DOMContentLoaded', (event) => {


    const eleven = 11
    const ten = 10
    let globalPrio = 0
    const globalspeedlimit = 6
    let charge = new Audio()
    charge.src = "charge.mp3"
    let whistle = new Audio()
    whistle.src = "whistle.mp3"
    whistle.volume = .3 
    let beamboss = new Audio()
    let absorb = new Audio()
    absorb.src = "absorb.mp3"

    const worksounds = []
    for (let t = 1; t < 11; t++) {
        let sound = new Audio()
        sound.src = `workdeath${t}.mp3`
        sound.volume = .6 - (t * .025)
        worksounds.push(sound)
    }
    const enemysounds = []
    for (let t = 1; t < 3; t++) {
        let sound = new Audio()
        sound.src = `enemydeath${t}.mp3`
        sound.volume = .6 - (t * .025)
        enemysounds.push(sound)
    }


    beamboss.src = "beambosslong.mp3"
    beamboss.volume = .25
    const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
    for (let t = 0; t < 10000000; t++) {
        squaretable[`${t}`] = Math.sqrt(t)
        if (t > 999) {
            t += 9
        }
    }
    let video_recorder
    let recording = 0

    let airmail = {}
    airmail.x = 0
    airmail.y = 0
    // function CanvasCaptureToWEBM(canvas, bitrate) {
    //     // the video_recorder is set to  '= new CanvasCaptureToWEBM(canvas, 4500000);' in the setup, 
    //     // it uses the same canvas as the rest of the file.
    //     // to start a recording call .record() on video_recorder
    //     /*
    //     for example, 
    //     if(keysPressed['-'] && recording == 0){
    //         recording = 1
    //         video_recorder.record()
    //     }
    //     if(keysPressed['='] && recording == 1){
    //         recording = 0
    //         video_recorder.stop()
    //         video_recorder.download('File Name As A String.webm')
    //     }
    //     */
    //     this.record = Record
    //     this.stop = Stop
    //     this.download = saveToDownloads
    //     let blobCaptures = []
    //     let outputFormat = {}
    //     let recorder = {}
    //     let canvasInput = canvas.captureStream()
    //     if (typeof canvasInput == undefined || !canvasInput) {
    //         return
    //     }
    //     const video = document.createElement('video')
    //     video.style.display = 'none'

    //     function Record() {
    //         let formats = [
    //             "video/webm\;codecs=h264",
    //             "video/webm\;codecs=vp8",
    //             'video/vp8',
    //             "video/webm",
    //             'video/webm,codecs=vp9',
    //             "video/webm\;codecs=daala",
    //             "video/mpeg"
    //         ];

    //         for (let t = 0; t < formats.length; t++) {
    //             if (MediaRecorder.isTypeSupported(formats[t])) {
    //                 outputFormat = formats[t]
    //                 break
    //             }
    //         }
    //         if (typeof outputFormat != "string") {
    //             return
    //         } else {
    //             let videoSettings = {
    //                 mimeType: outputFormat,
    //                 videoBitsPerSecond: bitrate || 2000000 // 2Mbps
    //             };
    //             blobCaptures = []
    //             try {
    //                 recorder = new MediaRecorder(canvasInput, videoSettings)
    //             } catch (error) {
    //                 return;
    //             }
    //             recorder.onstop = handleStop
    //             recorder.ondataavailable = handleAvailableData
    //             recorder.start(100)
    //         }
    //     }
    //     function handleAvailableData(event) {
    //         if (event.data && event.data.size > 0) {
    //             blobCaptures.push(event.data)
    //         }
    //     }
    //     function handleStop() {
    //         const superBuffer = new Blob(blobCaptures, { type: outputFormat })
    //         video.src = window.URL.createObjectURL(superBuffer)
    //     }
    //     function Stop() {
    //         recorder.stop()
    //         video.controls = true
    //     }
    //     function saveToDownloads(input) { // specifying a file name for the output
    //         const name = input || 'video_out.webm'
    //         const blob = new Blob(blobCaptures, { type: outputFormat })
    //         const url = window.URL.createObjectURL(blob)
    //         const storageElement = document.createElement('a')
    //         storageElement.style.display = 'none'
    //         storageElement.href = url
    //         storageElement.download = name
    //         document.body.appendChild(storageElement)
    //         storageElement.click()
    //         setTimeout(() => {
    //             document.body.removeChild(storageElement)
    //             window.URL.revokeObjectURL(url)
    //         }, 100)
    //     }
    // }
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
            // ////console.log(pressed); // return buttons for debugging purposes
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
        doesPerimeterTouch(point) {
            return true
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }

    class PointD {
        constructor(x, y) {
            this.x = x
            this.y = y
        }
        doesPerimeterTouch(point) {
            return true
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
        angle() {
            return (new Line(0, 0, this.xmom, this.ymom)).angle()
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
        // angle() {
        //     let y = this.object.y - this.target.y 
        //     let x = this.object.x - this.target.x 
        //     let z = y/x
        //     let za = Math.abs(z)
        //     if(za > 1){
        //         return Math.atan2(y, x)
        //     }
        //     return (fourthPi*z) - ((z*(za - 1))*(0.2447 + 0.0663*za))
        // }
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
    class LineOPD {
        constructor(object, target) {
            this.object = object
            this.target = target
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
        angleM() {
            return Math.atan2(this.target.y - this.object.y, this.target.x - this.object.x)
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
            this.k = 0
            this.blast = 1
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.sxmom = 0
            this.symom = 0
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
            this.sfriction = .5
        }
        draw() {
            this.blast = (1 + (this.blast * 1000)) / 1001
            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                ////console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        smove() {
            this.x += this.sxmom
            this.y += this.symom
            this.sxmom *= this.sfriction
            this.symom *= this.sfriction
        }
        unmove() {
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveMove10(t = 0) {
            if (t == 1) {
                TIP_engine.x += this.xmom * 0.05
                TIP_engine.y += this.ymom * 0.05
            }
            this.x += this.xmom * 0.05
            this.y += this.ymom * 0.05
            this.xmom *= 1 - ((1 - this.friction) * 0.05)
            this.ymom *= 1 - ((1 - this.friction) * 0.05)
        }
        frictiveMoveR10(step) {
            this.x += this.xmom * step
            this.y += this.ymom * step
            this.xmom *= 1 - ((1 - this.friction) * step)
            this.ymom *= 1 - ((1 - this.friction) * step)
        }
        frictiveMove8() {
            this.x += this.xmom * 0.125
            this.y += this.ymom * 0.125
            this.xmom *= 1 - ((1 - this.friction) * 0.125)
            this.ymom *= 1 - ((1 - this.friction) * 0.125)
        }
        frictiveMove24() {
            this.x += this.xmom * 0.04166666666
            this.y += this.ymom * 0.04166666666
            this.xmom *= 1 - ((1 - this.friction) * 0.04166666666)
            this.ymom *= 1 - ((1 - this.friction) * 0.04166666666)
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
    class CircleHalf {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 6, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.blast = 1
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.sxmom = 0
            this.symom = 0
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
            this.sfriction = .5
        }
        draw() {
            this.blast = (1 + (this.blast * 1000)) / 1001
            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, this.angle, (Math.PI * 1) + this.angle, this.sp)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                // canvas_context.stroke();
            } else {
                ////console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
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
        smove() {
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
            this.x += this.sxmom
            this.y += this.symom
            this.sxmom *= this.sfriction
            this.symom *= this.sfriction
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
            this.x += this.xmom * 0.07142857142
            this.y += this.ymom * 0.07142857142
            this.xmom *= 1 - ((1 - this.friction) * 0.07142857142)
            this.ymom *= 1 - ((1 - this.friction) * 0.07142857142)
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

            const angle = (((new LineOP(this, point)).angle()))


            if (this.sp == true) {
                if (angle.between(this.angle, this.angle + Math.PI)) {
                    this.areaY = point.y - this.y
                    this.areaX = point.x - this.x
                    if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                        this.color = "yellow"
                        return true
                    }
                    this.color = "cyan"
                    return false
                } else {
                    // this.color = "red"
                    return false
                }
            } else {

                if (angle.between((this.angle % (Math.PI * 2)), ((this.angle) - Math.PI) % (Math.PI * 2))) {
                    this.areaY = point.y - this.y
                    this.areaX = point.x - this.x
                    if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                        // this.color = "#444444"
                        return true
                    }
                    // this.color = "cyan"
                    return false
                } else {
                    // this.color = "red"
                    return false
                }
            }
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
                ////console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
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
                // ////console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
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
        // video_recorder = new CanvasCaptureToWEBM(canvas, 3000000);
        canvas_context = canvas.getContext('2d');
        // canvas_context.imageSmoothingEnabled = true
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 40)
        document.addEventListener('keydown', (event) => {
            if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
                event.preventDefault();
            }
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            const txfr = canvas_context.getTransform()
            TIP_engine.x = XS_engine - txfr.e
            TIP_engine.y = YS_engine - txfr.f
            TIP_engine.body = TIP_engine
            throbert.whistling = 0
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
            window.addEventListener('pointermove', continued_stimuli);
        });
        window.addEventListener('contextmenu', e => {
            e.preventDefault()
            throbert.whistling = 1
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            const txfr = canvas_context.getTransform()
            TIP_engine.x = XS_engine - txfr.e
            TIP_engine.y = YS_engine - txfr.f
            TIP_engine.body = TIP_engine
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
            window.addEventListener('pointermove', continued_stimuli);
        });
        window.addEventListener('pointerup', e => {
            throbert.guiding = 0
            throbert.whistling = 0

            window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            const txfr = canvas_context.getTransform()
            TIP_engine.x = XS_engine - txfr.e
            TIP_engine.y = YS_engine - txfr.f
            TIP_engine.body = TIP_engine
            let link = (new LineOPD(TIP_engine, throbert.body)).angle()
            let link2 = (new LineOPD(TIP_engine, throbert.body)).hypotenuse()
            throbert.seekz = (Math.cos(link) * (Math.min(95, link2)))
            throbert.seekw = (Math.sin(link) * (Math.min(95, link2)))
            throbert.guiding = 1
        }
    }
    function gamepad_control(object, speed = 1) { // basic control for objects using the controler
        //         ////console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
        if (typeof object.body != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.body.xmom += (gamepadAPI.axesStatus[0] * speed)
                    object.body.ymom += (gamepadAPI.axesStatus[1] * speed)
                }
            }
        } else if (typeof object != 'undefined') {
            if (typeof (gamepadAPI.axesStatus[1]) != 'undefined') {
                if (typeof (gamepadAPI.axesStatus[0]) != 'undefined') {
                    object.xmom += (gamepadAPI.axesStatus[0] * speed)
                    object.ymom += (gamepadAPI.axesStatus[1] * speed)
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
                object.x += speed
            }
            if (keysPressed['s']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                object.x -= speed
            }
        }
    }
    function keycontrol(object, speed = 1) { // basic control for objects
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
                object.ymom -= speed
                object.wasdflag = 1
            }
            if (keysPressed['d']) {
                object.xmom += speed
                object.wasdflag = 1
            }
            if (keysPressed['s']) {
                object.ymom += speed
                object.wasdflag = 1
            }
            if (keysPressed['a']) {
                object.xmom -= speed
                object.wasdflag = 1
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

            const angle = (new Line(this.x, this.y, this.ex, this.ey)).angle()

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
            const link = new LineOP(point, this.metapoint)
            const angle = (link.angle() + (Math.PI * 2))
            const dis = link.hypotenuse()
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
            const link = new LineOP(point, this.metapoint)
            const angle = (link.angle() + (Math.PI * 2))
            const dis = link.hypotenuse()
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
            const tline = new Line(this.x, this.y, this.ex, this.ey, this.color, 3)
            tline.draw()
            canvas_context.beginPath()
            this.median = new Point((this.x + this.ex) * .5, (this.y + this.ey) * .5)
            const angle = (new LineOP(this.median, this.metapoint)).angle()
            const dis = (new LineOP(this.median, this.metapoint)).hypotenuse()
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
            ////console.log(num);
            return false
        } else if (isFinite(num)) {
            return true
        }
        // ////console.trace();
        return false
    }



    let setup_canvas = document.getElementById('canvas') //getting canvas from document
    // let textbox = document.getElementById('text') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 

    const fcs = new Image()
    fcs.src = "fcsx.png"
    const fcs2 = new Image()
    fcs2.src = "fcs2x.png"
    const fcb = new Image()
    fcb.src = "fcbx.png"
    const fcb2 = new Image()
    fcb2.src = "fcb2x.png"
    const fcf = new Image()
    fcf.src = "fcfx.png"
    const fcf2 = new Image()
    fcf2.src = "fcf2x.png"


    const fms = new Image()
    fms.src = "fmsx.png"
    const fms2 = new Image()
    fms2.src = "fms2x.png"
    const fmb = new Image()
    fmb.src = "fmbx.png"
    const fmb2 = new Image()
    fmb2.src = "fmb2x.png"
    const fmf = new Image()
    fmf.src = "fmfx.png"
    const fmf2 = new Image()
    fmf2.src = "fmf2x.png"

    const fys = new Image()
    fys.src = "fysx.png"
    const fys2 = new Image()
    fys2.src = "fys2x.png"
    const fyb = new Image()
    fyb.src = "fybx.png"
    const fyb2 = new Image()
    fyb2.src = "fyb2x.png"
    const fyf = new Image()
    fyf.src = "fyfx.png"
    const fyf2 = new Image()
    fyf2.src = "fyf2x.png"

    const guycolors = [['#00FFFF', '#AAFFFF'], ['#FF00FF', '#FFAAFF'], ['#FFFF00', '#FFFFAA']]


    class Sproutfolk {
        constructor(x, y, type) {
            this.hittime = Math.floor(Math.random() * 100)
            this.bloomdriptimer = 0
            this.bloom = 0
            this.body = new Circle(x, y, 3, guycolors[type][0])
            this.cursorline = new LineOPD(TIP_engine, this.body)
            this.body.friction = .8
            this.grounded = 1
            this.supersize = 12 //9
            this.playlink = new LineOPD(this.body, throbert.body)
            this.camplink = new LineOPD(this.body, throbert.c1)
            this.links = []
            this.type = type
            if (this.type == 0) {
                this.captain = fcs
                this.captain2 = fcs2
                this.captainb = fcb
                this.captain2b = fcb2
                this.captainf = fcf
                this.captain2f = fcf2
            } else if (this.type == 1) {
                this.captain = fms
                this.captain2 = fms2
                this.captainb = fmb
                this.captain2b = fmb2
                this.captainf = fmf
                this.captain2f = fmf2

            } else if (this.type == 2) {
                this.captain = fys
                this.captain2 = fys2
                this.captainb = fyb
                this.captain2b = fyb2
                this.captainf = fyf
                this.captain2f = fyf2
            }
            this.grab = 0
            this.fly = 0
            this.cling = 0
            this.clingTo = {}
            this.clingx = 0
            this.clingy = 0
            this.clingangle = 0
            this.attent = 0
            this.damage = 2 //must match % on hittime
            if (this.type == 1) {
                this.damage++
            }

            this.carrying = 0
            this.marked = -1000

            this.glop = this.body
        }
        path(tar = this.goTo) {
            this.target = tar
            this.raypoint = new Circle(this.clingTo.x, this.clingTo.y, 1, "#FF00FF", (this.target.x - this.clingTo.x) * .0001, (this.target.y - this.clingTo.y) * .0001)
            // let drawmod = 30
            let ultramod = 5
            // this.waypoints = [this.raypoint]
            for (let l = 0; l < 300; l++) {
                // if (l % drawmod == 0) {
                //     this.waypoints.push(new Circle(this.raypoint.x, this.raypoint.y, 3, "red"))
                // }
                this.raypoint.move()
                if (l % ultramod == 0 && Math.random() < .981) {
                    this.raypoint.xmom = (this.target.x - this.raypoint.x) * .001
                    this.raypoint.ymom = (this.target.y - this.raypoint.y) * .001
                }






                this.xcord = Math.floor((this.raypoint.x) * .1) * ten
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 10230)
                this.ycord = Math.floor((this.raypoint.y) * .1) * ten
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 10230)


                for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                    for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                        // if (true) {
                        const link = new LineOP(this.raypoint, throbert.road[`${t},${k}`])

                        const hyp = link.hypotenuse()
                        const angle = link.angle()
                        if (hyp <= ten) {
                            // if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .0299) {
                            // } else {
                            //     if (link.hypotenuse() <= 17) {
                            //         if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .05) {
                            //         } else {
                            const vec = new Vector(this.raypoint, this.raypoint.xmom, this.raypoint.ymom)
                            vec.rotate(vec.angle() + (Math.sign(vec.angle() - Math.PI) * (Math.PI * .26)))
                            for (let t = 0; t < 5; t++) {
                                this.raypoint.unmove()
                            }

                            const xsign = Math.sign(this.target.x - this.raypoint.x)
                            const ysign = Math.sign(this.target.y - this.raypoint.y)
                            const xsign2 = Math.sign(this.raypoint.xmom)
                            const ysign2 = Math.sign(this.raypoint.ymom)
                            if (xsign != xsign2) {
                                this.raypoint.xmom = vec.xmom
                            } else {
                                this.raypoint.xmom = -vec.xmom
                            }
                            if (ysign != ysign2) {
                                this.raypoint.ymom = -vec.ymom
                            } else {
                                this.raypoint.ymom = vec.ymom
                            }


                            // if (vec.isToward(this.target)) {
                            //     this.raypoint.xmom = vec.xmom + ((Math.random()-.5)/1000)
                            //     this.raypoint.ymom = vec.ymom+ ((Math.random()-.5)/1000)
                            // } else {
                            //     this.raypoint.xmom = -vec.xmom+ ((Math.random()-.5)/1000)
                            //     this.raypoint.ymom = -vec.ymom+ ((Math.random()-.5)/1000)
                            // }
                            ultramod += 1
                            //         }
                            //     }
                            // }
                        }
                        // }
                    }
                }
            }
            // for(let t= 0;t< this.waypoints.length;t++){
            //     this.waypoints[t].draw()

            // }




            // for(let k = 0;k<this.obstacles.length;k++){
            //     if(this.obstacles[k].isPointInside(this.raypoint)){
            //         let vec = new Vector(this.raypoint, this.raypoint.xmom, this.raypoint.ymom)
            //         vec.rotate(vec.angle()+(Math.PI*.26))
            //         for(let t = 0;t<20;t++){
            //         this.raypoint.unmove()
            //         }
            //         if(vec.isToward(this.target)){
            //             this.raypoint.xmom = vec.xmom// + ((Math.random()-.5)/1000)
            //             this.raypoint.ymom = vec.ymom//+ ((Math.random()-.5)/1000)
            //         }else{
            //             this.raypoint.xmom = -vec.xmom//+ ((Math.random()-.5)/1000)
            //             this.raypoint.ymom = -vec.ymom//+ ((Math.random()-.5)/1000)
            //         }
            //         ultramod+=10
            //     }
            // }
            return this.raypoint
        }

        smartpath() {
            airmail.x = 0
            airmail.y = 0
            if (this.carrying == 1 && this.clingTo.health <= 0) {
                this.goTo = throbert.c1
                let index = -1
                // let min = 9999999999 * 9999999999
                let pr = 999999
                this.body.neighbors = []
                let relmin = 9999999999999
                if (this.glop == this.body || (Math.random() < .05)) { //.33 //|| (Math.random() < .05
                    for (let t = 0; t < throbert.nodes.length; t++) {
                        if (throbert.nodes[t].priority <= pr) {
                            if (throbert.nodes[t].equity.doesPerimeterTouch(this.clingTo)) {
                                if (this.clingTo.supralinks[t].hypotenuse() < relmin) {
                                    if (throbert.path2(this.clingTo, throbert.nodes[t])) {
                                        relmin = this.clingTo.supralinks[t].hypotenuse()
                                        this.glop = throbert.nodes[t]
                                        this.gloppath = 0
                                        this.boglpath = 0
                                        pr = throbert.nodes[t].priority
                                    }
                                }
                            }
                        }

                        if (throbert.nodes[t].small.doesPerimeterTouch(this.clingTo)) {
                            this.glop = throbert.nodes[t]
                            // this.clingTo.color = getRandomLightColor()
                            for (let n = 0; n < this.glop.neighbors.length; n++) {
                                if (this.glop.neighbors[n].priority < this.glop.priority) {
                                    this.bogl = this.glop.neighbors[n]
                                    this.gloppath = 0
                                    this.boglpath = 1
                                }
                            }
                            break
                        }
                    }
                }
                if (this.glop == this.body) {
                    return
                }
                if (this.gloppath == 0) {
                    if (throbert.path2(this.clingTo, this.glop)) {
                        const linkus = new LineOPD(this.clingTo, this.glop)
                        // const linkus = new LineOP(this.clingTo, this.glop, "green", 2)
                        const anfle = linkus.angle()
                        airmail.x -= (((Math.cos(anfle) * this.clingTo.weight)) * .1234) * (1 + (this.bloom * .1))
                        airmail.y -= (((Math.sin(anfle) * this.clingTo.weight)) * .1234) * (1 + (this.bloom * .1))
                        // linkus.draw()
                        this.gloppath = 1
                    }
                } else {
                    // const linkus = new LineOP(this.clingTo, this.glop, "yellow", 2)
                    const linkus = new LineOPD(this.clingTo, this.glop)
                    const anfle = linkus.angle()
                    airmail.x -= (((Math.cos(anfle) * this.clingTo.weight)) * .1234) * (1 + (this.bloom * .1))
                    airmail.y -= (((Math.sin(anfle) * this.clingTo.weight)) * .1234) * (1 + (this.bloom * .1))
                    // linkus.draw()
                }
                if (this.boglpath == 0) {
                    this.bogl = this.glop
                    let cap = this.glop.priority
                    for (let p = 0; p < this.glop.paths.length; p++) {
                        if (this.glop.neighbors[p].priority < cap) {
                            this.bogl = this.glop.neighbors[p]
                            cap = this.glop.neighbors[p].priority
                        }
                    }
                    // if(cap == this.glop.priority){
                    //     //console.log(this.glop)
                    // }
                    if (throbert.path2(this.clingTo, this.bogl)) {
                        // const linkg = new LineOP(this.clingTo, this.bogl, "orange", 2)
                        const linkg = new LineOPD(this.clingTo, this.bogl)
                        const anfleg = linkg.angle()
                        airmail.x -= (((Math.cos(anfleg) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                        airmail.y -= (((Math.sin(anfleg) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                        this.boglpath = 1
                        // linkg.draw()
                    }
                } else {
                    const linkg = new LineOP(this.clingTo, this.bogl, "pink", 2)
                    const anfleg = linkg.angle()
                    airmail.x -= (((Math.cos(anfleg) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                    airmail.y -= (((Math.sin(anfleg) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                    // linkg.draw()

                }


                if (this.camplink.hypotenuse() < 280) {
                    const angle = this.camplink.angle()
                    airmail.x -= (((Math.cos(angle) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                    airmail.y -= (((Math.sin(angle) * this.clingTo.weight) * 1) * .3769) * (1 + (this.bloom * .1))
                }


                if (index != -1) {
                    this.goTo = this.clingTo.supralinks[index].target
                }
                if ((new LineOP(this.body, throbert.c1)).hypotenuse() < 200) {
                    this.goTo = throbert.c1
                }


            }

        }

        draw() {
            if (this.fly <= 0) {
                let brf = 0
                while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > (globalspeedlimit * 4)) {
                    brf++
                    if (brf > 8) {
                        break
                    }
                    this.body.xmom *= .8
                    this.body.ymom *= .8
                    this.body.sxmom *= .8
                    this.body.symom *= .8
                }
            }
            if (this.playlink.hypotenuse() > 720) { //600
                this.attent = 0
            }
            this.hittime++
            this.bloomdriptimer--

            this.vsum = 0
            this.vmax = -9999
            this.vmin = 9999
            if (this.ignore != 1) {
                this.xcord = Math.floor((this.body.x) * .1) * 10
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 10230)
                this.ycord = Math.floor((this.body.y) * .1) * 10
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 10230)

            this.vmax = throbert.road[`${this.xcord},${this.ycord}`].z
            this.vmin = throbert.road[`${this.xcord},${this.ycord}`].z
                for (let t = Math.max(this.xcord - 20, 0); t < Math.min(this.xcord + 30, 10230); t += ten) {
                    for (let k = Math.max(this.ycord - 20, 0); k < Math.min(this.ycord + 30, 10230); k += ten) {
                        this.vsum += Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z)
                        if(this.vmax < throbert.road[`${t},${k}`].z){
                            this.vmax = throbert.road[`${t},${k}`].z
                        }else if(this.vmin > throbert.road[`${t},${k}`].z){
                            this.vmin = throbert.road[`${t},${k}`].z
                        }
                    }
                }
            }
            if (this.ignore == 1 || this.vsum <= .05 || Math.abs(this.vmax-this.vmin) < .2) {
                this.body.frictiveMove()
            } else {
                const mag = Math.max(((Math.abs(this.body.xmom) + Math.abs(this.body.ymom)))*1.5, 3)
                if (mag > 0) {
                    const stepper = 1 / mag
                    for (let x = 0; x < mag; x++) {
                        this.body.frictiveMoveR10(stepper)
                        this.xcord = Math.floor((this.body.x) * .1) * 10
                        this.xcord = Math.max(this.xcord, 0)
                        this.xcord = Math.min(this.xcord, 10230)
                        this.ycord = Math.floor((this.body.y) * .1) * 10
                        this.ycord = Math.max(this.ycord, 0)
                        this.ycord = Math.min(this.ycord, 10230)
                        if (this.clingTo.radius > 0) {
                            for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                                for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {
                                    const link = new LineOP(this.body, throbert.road[`${t},${k}`])
                                    const linkz = new LineOP(this.clingTo, throbert.road[`${t},${k}`])
                                    if (this.clingTo.radius > 0) {
                                        if (linkz.hypotenuse() <= 20 + this.clingTo.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .2) {
                                            } else {
                                                const angle = link.angle()
                                                this.clingTo.x += Math.cos(angle) * .8
                                                this.clingTo.y += Math.sin(angle) * .8
                                                this.body.x += Math.cos(angle) * .8
                                                this.body.y += Math.sin(angle) * .8
                                                this.clingTo.xmom += Math.cos(angle) * .9
                                                this.clingTo.ymom += Math.sin(angle) * .9
                                                this.body.x += Math.cos(angle) * .8
                                                this.body.y += Math.sin(angle) * .8
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])
                                const hyp = link.hypotenuse()
                                const angle = link.angle()
                                if (hyp <= 18 + (this.fly * ten)) {
                                    if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                        if (this.fly > 0) {
                                            if ((throbert.road[`${this.xcord},${this.ycord}`].z < throbert.road[`${throbert.t},${throbert.k}`].z) && (throbert.road[`${this.xcord},${this.ycord}`].z <= throbert.road[`${t},${k}`].z)) {
                                                this.body.xmom *= .997
                                                this.body.ymom *= .997

                                                if (Math.abs(throbert.road[`${throbert.t},${throbert.k}`].z - throbert.road[`${t},${k}`].z) > .1 && (throbert.road[`${throbert.t},${throbert.k}`].z < throbert.road[`${t},${k}`].z)) {
                                                    this.body.xmom = Math.cos(angle) * (2.12 + throbert.magsetoff)
                                                    this.body.ymom = Math.sin(angle) * (2.12 + throbert.magsetoff)
                                                    break
                                                }
                                            }
                                        }
                                    } else {
                                        if (hyp <= 17) {
                                            if (((throbert.road[`${throbert.t},${throbert.k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) >= -.9) && this.fly > 0) {

                                                if ((throbert.road[`${this.xcord},${this.ycord}`].z < throbert.road[`${throbert.t},${throbert.k}`].z) && (throbert.road[`${this.xcord},${this.ycord}`].z <= throbert.road[`${t},${k}`].z)) {
                                                    this.body.xmom *= .997
                                                    this.body.ymom *= .997

                                                    if (Math.abs(throbert.road[`${throbert.t},${throbert.k}`].z - throbert.road[`${t},${k}`].z) > .1 && (throbert.road[`${throbert.t},${throbert.k}`].z < throbert.road[`${t},${k}`].z)) {
                                                        this.body.xmom = Math.cos(angle) * (2.12 + throbert.magsetoff)
                                                        this.body.ymom = Math.sin(angle) * (2.12 + throbert.magsetoff)
                                                        break
                                                    }
                                                }
                                            } else {
                                                if (Math.abs(throbert.road[`${throbert.t},${throbert.k}`].z - throbert.road[`${t},${k}`].z) > .1 && (throbert.road[`${throbert.t},${throbert.k}`].z < throbert.road[`${t},${k}`].z)) {
                                                    this.body.xmom = Math.cos(angle) * (2.12 + throbert.magsetoff)
                                                    this.body.ymom = Math.sin(angle) * (2.12 + throbert.magsetoff)
                                                    break
                                                }
                                                if ((throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) < -.09) {
                                                    this.body.xmom = Math.cos(angle) * (2.12 + throbert.magsetoff)
                                                    this.body.ymom = Math.sin(angle) * (2.12 + throbert.magsetoff)
                                                    break
                                                }
                                            }
                                        } else if (hyp <= 18 + (this.fly * ten)) { //10
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .9) {
                                            } else {
                                                this.body.xmom = Math.cos(angle) * (2.12 + throbert.magsetoff)
                                                this.body.ymom = Math.sin(angle) * (2.12 + throbert.magsetoff)
                                                break
                                            }
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
                // if (this.fly == 0) {
                this.attent = 0
                // }
            }
            if (this.grounded == 1) {
                if (this.bloom < 2) {
                    if (Math.random() < .001) {
                        this.bloom++
                    }
                }
                this.body.radius = 1.9
            } else {
                this.body.radius = 3.5 + (Math.abs(this.grounded)) + (Math.abs(this.grab * 1.5)) + (Math.abs(Math.max(this.fly, 0) * .16))
                if (this.marked > 0) {
                    // //console.log("hitt")
                    if(this.marked == 19){
                        for (let t = 0; t < worksounds.length; t++) {
                            if (worksounds[t].paused) {
                                worksounds[t].play()
                                break
                            }
                        }
                    }
                    this.body.radius += Math.max((20 - this.marked), 0) * .5
                }
                if (this.grounded < 0) {
                    this.grounded += .5
                }
            }
            this.marked--
            if (this.marked == 1) {
                this.away = 1
            }
            // if (this.attent == 1) {
            //     this.body.color = this.colors[this.type][0]
            //     if (this.marked > 0) {
            //     }
            // } else {
            //     this.body.color = this.colors[this.type][1]
            // }
            if (this.cling == 1) {
                if (this.clingTo.pulse == 1) {
                    this.cling = 0
                }
            }
            if (this.cling == 1) {
                this.body.x = this.clingTo.x + this.clingx + ((Math.random() - .5) * .01)
                this.body.y = this.clingTo.y + this.clingy + ((Math.random() - .5) * .01)
                this.clingTo.release--
                if (this.clingTo.release < 0) {
                    this.cling = 0
                    this.ignore = 0
                }
                if (this.clingTo.shot == 1) {
                } else {
                    if (this.clingTo.doesPerimeterTouch(throbert.c1)) {
                        this.clingTo.x = throbert.c1.x
                        this.clingTo.y = throbert.c1.y
                        this.cling = 0
                        this.clingTo.xmom = 0
                        this.clingTo.ymom = 0
                        this.body.xmom = 0
                        this.body.ymom = 0
                        if (this.clingTo.timer > 20) {
                            this.clingTo.timer = 20
                            if(throbert.playlink.hypotenuse() < 900){
                                absorb.play()
                            }
                        }

                        // this.playlink = new LineOPD(this.body, throbert.body)
                        if (this.playlink.hypotenuse() < 300) { //190?
                            this.attent = 1
                        } else {
                            this.attent = -109
                        }
                    }
                }
            } else {
                this.carrying = 0
            }

            this.body.x = Math.min(Math.max(Math.round(this.body.x), 0), 10240)
            this.body.y = Math.min(Math.max(Math.round(this.body.y), 0), 10240)
            // this.superbody.x = this.body.x
            // this.superbody.y = this.body.x
            // this.superbody.radius = this.body.radius*1.41
            if (this.marked >= -999) {
                this.body.xmom = 0
                this.body.ymom = 0
                this.cling = 0

                this.body.color = guycolors[this.type][0] + `${Math.max((this.marked), 0) + 37}`         //+  parseInt(Math.max((this.marked),0) + 48, 16)

                this.body.draw()
            } else {
                if (this.grounded == 1) {
                    this.body.draw()
                } else {
                    this.body.radius *= 2

                    // if (this.body.radius == 7) {
                    //     canvas_context.drawImage(this.shotsprite, this.body.x - 7, this.body.y - 7)
                    // }
                    if (this.playlink.hypotenuse() < 740) {
                        if (this.bloom == 0) {
                            if (this.attent == 1) {
                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captain, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captain, 0, 0, this.captain.width, this.captain.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            } else {
                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captain2, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captain2, 0, 0, this.captain2.width, this.captain2.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            }
                        } else if (this.bloom == 1) {
                            if (this.attent == 1) {
                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captainb, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captainb, 0, 0, this.captain2.width, this.captain2.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            } else {

                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captain2b, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captain2b, 0, 0, this.captain2.width, this.captain2.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            }
                        } else if (this.bloom == 2) {
                            if (this.attent == 1) {
                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captainf, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captainf, 0, 0, this.captain2.width, this.captain2.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            } else {
                                if (this.body.radius == 7) {
                                    canvas_context.drawImage(this.captain2f, this.body.x - 7, this.body.y - 7)
                                } else {
                                    canvas_context.drawImage(this.captain2f, 0, 0, this.captain2.width, this.captain2.height, Math.round(this.body.x - this.body.radius), Math.round((this.body.y - this.body.radius) - (this.body.radius * .25)), 2 * this.body.radius, 2 * this.body.radius)
                                }
                            }
                        }
                    }
                    this.body.radius *= .5
                }
            }
        }
    }

    class UltraCrab {
        constructor(x, y, colors, pen) {
            this.firstdead = 0
            this.type = Math.floor(Math.random() * 3)
            this.body = new Circle(x, y, 12, "red")
            if (this.type == 0) {
                this.body.color = "#00FFFF"
                this.img = crabc
            }
            if (this.type == 1) {
                this.body.color = "#FF00FF"
                this.img = crabm
            }
            if (this.type == 2) {
                this.body.color = "#FFFF00"
                this.img = craby
            }
            this.bodyarea = new Circle(x, y, 420, "red")
            this.go = this.body
            this.health = 41000
            this.maxhealth = this.health
            this.value = 45
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 18
            this.body.weight = 1 / this.weight
            this.cost = 400
            this.variety = 2.5
            // this.name = this.nameGenerator()
            this.needs = []
            this.colors = colors
            for (let t = 0; t < this.colors.length; t++) {
                this.colors[t] = this.body.color
            }
            this.radius = 5
            // this.body = new TileCircle(x, y, 5, this.colors[0])
            this.body.angle = 0
            this.clip = 0
            this.slip = .05
            this.spin = 0
            this.crab = 1
            this.scale = .5
            this.age = 0
            this.pen = pen
            this.body.friction = .9
            this.playlink = new LineOP(this.body, throbert.body)
            this.crush = 0
            this.cycle = 1
        }
        jumpspin() {
            if (Math.random() < .2) {
                this.spin = -Math.random() * .2
            }
            if (Math.random() < .2) {
                this.spin = Math.random() * .2
            }
            this.body.angle += Math.random() - .5
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {

            if (this.playlink.hypotenuse() > 950) {
                return
            }
            
            if (this.health <= 0) {
                this.body.smove()
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - 50, 0); t < Math.min(this.xcord + 60, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - 50, 0); k < Math.min(this.ycord + 60, 10230); k += ten) {

                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                const hyp = link.hypotenuse()
                                const angle = link.angle()
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (hyp <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    this.body.xmom -= Math.sign(this.body.x - this.go.x) * .19
                    this.body.ymom -= Math.sign(this.body.y - this.go.y) * .19
                }
            }
            if (this.health > 0) {
                this.clip += this.slip
                if (Math.abs(this.clip) > ((Math.PI * 1) + (this.clip * 1))) {
                    this.slip *= -1
                }
            }
            if (this.health > 0) {
                this.body.radius = 40
                if (Math.random() < .13) {
                    if (Math.random() < .2) {
                        this.spin = -Math.random() * .2
                    }
                    if (Math.random() < .2) {
                        this.spin = Math.random() * .2
                    }
                    if (Math.random() < .8) {
                        this.spin = 0
                    }
                }
                this.body.angle += this.spin
            } else {
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    this.pulse = 1
                    this.body.radius = 14
                    this.body.pulse = 1
                    this.crush = 0
                    this.runcrush = 0
                } else {
                    this.pulse = 0
                    this.body.pulse = 0
                }
            }
            // this.body.x += Math.cos(this.body.angle)
            // this.body.y += Math.sin(this.body.angle)
            this.claws = []
            if (this.health > 0) {
                this.angle = this.body.angle
            }
            for (let t = 0; t < 3; t++) {
                const point = new Point(this.body.x + ((this.body.radius * ((3.7191) - (this.crush / 333))) * Math.cos(this.angle)), (this.body.y + ((this.body.radius * (3.7191 - (this.crush / 333))) * Math.sin(this.angle))))
                this.angle += Math.PI / 1.5
                this.claws.push(point)
            }
            for (let t = 0; t < this.claws.length; t++) {
                const link = new LineOP(this.claws[t], this.body, this.colors[1], 9)

                if (this.crush <= 0) {
                    if (t == 0) {
                        link.color = "#00FFFF"
                    }
                    if (t == 1) {
                        link.color = "#ff00ff"
                    }
                    if (t == 2) {
                        link.color = "#ffff00"
                    }
                } else {

                    if (t == 0) {
                        link.color = "#ff000088"
                    }
                    if (t == 1) {
                        link.color = "#00ff0088"
                    }
                    if (t == 2) {
                        link.color = "#0000ff88"
                    }
                }
                link.draw()
            }
            for (let t = 0; t < this.claws.length; t++) {

                const link = new LineOP(this.claws[t], this.body, this.colors[1], 2)
                const hyp = link.angle()

                const point2 = new Circle(this.claws[t].x + ((this.body.radius * 1.1) * Math.cos(this.clip + hyp)), (this.claws[t].y + ((this.body.radius * 1.1) * Math.sin(this.clip + hyp))), 10, this.colors[0])
                const point3 = new Circle(this.claws[t].x + ((this.body.radius * 1.1) * Math.cos(-this.clip + hyp)), (this.claws[t].y + ((this.body.radius * 1.1) * Math.sin(-this.clip + hyp))), 10, this.colors[0])

                const link3 = new LineOP(this.claws[t], point2, this.colors[2], 6)
                const link2 = new LineOP(this.claws[t], point3, this.colors[3], 6)
                if (t == 0) {

                    if (this.crush <= 0) {
                        point2.color = "#00FFFF"
                        point3.color = "#00FFFF"
                        link2.color = "#00FFFF"
                        link3.color = "#00FFFF"
                    } else {

                        point2.color = "#ff000088"
                        point3.color = "#ff000088"
                        link2.color = "#ff000088"
                        link3.color = "#ff000088"
                    }
                }
                if (t == 1) {

                    if (this.crush <= 0) {
                        point2.color = "#ff00ff"
                        point3.color = "#ff00ff"
                        link2.color = "#ff00ff"
                        link3.color = "#ff00ff"
                    } else {

                        point2.color = "#00ff0088"
                        point3.color = "#00ff0088"
                        link2.color = "#00ff0088"
                        link3.color = "#00ff0088"
                    }
                }
                if (t == 2) {
                    if (this.crush <= 0) {
                        point2.color = "#ffff00"
                        point3.color = "#ffff00"

                        link2.color = "#ffff00"
                        link3.color = "#ffff00"
                    } else {

                        point2.color = "#0000ff88"
                        point3.color = "#0000ff88"

                        link2.color = "#0000ff88"
                        link3.color = "#0000ff88"
                    }
                }
                if (this.crush > 0) {
                    point2.radius = Math.min(40, 10 + (this.crush / 18))
                    point3.radius = Math.min(40, 10 + (this.crush / 18))
                } else {
                    this.crush = 0
                }
                link3.draw()
                link2.draw()
                point2.draw()
                point3.draw()
                if (this.crush > 0) {
                    if (this.health > 0) {
                        if ((throbert.body.doesPerimeterTouch(point2) || (throbert.body.doesPerimeterTouch(point3)))) {
                            throbert.health -= .2
                            if (throbert.health <= 0) {
                                throbert.health = 0
                            }
                        }
                    }
                }

                if (this.cycle % 500 == 0) {
                    this.runcrush = 1
                    this.crush = -100
                }
                if (this.runcrush == 1) {
                    this.clip = Math.PI * .5
                    this.crush += 5
                    if (this.crush > 900) {
                        this.runcrush = 0
                    }
                } else {
                    if (this.crush > 0) {
                        this.crush -= 30
                    }
                }
                if (this.health > 0) {
                    if (this.health < this.maxhealth) {
                        this.cycle++
                        if ((this.cycle % 100).between(80, 100)) {
                            this.body.radius = 40 + (Math.abs(5 - (this.cycle % 10)) * 2)
                            this.pulse = 1
                        } else {
                            this.pulse = 0
                            this.body.radius = 40
                        }
                    }
                    if (this.crush > 0) {
                        for (let k = 0; k < throbert.sproutventory.length; k++) {
                            // if (this.type == throbert.sproutventory[k].type) {
                            //     continue
                            // }
                            if (t == throbert.sproutventory[k].type) {
                                continue
                            }
                            const pang = this.elinks[k].angle()
                            if (throbert.sproutventory[k].fly <= 0 && throbert.sproutventory[k].grounded != 1) {//&& throbert.sproutventory[k].cling != 1
                                if (throbert.sproutventory[k].body.doesPerimeterTouch(point2)) {
                                    if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                        if (throbert.sproutventory[k].bloom <= 0) {
                                            throbert.sproutventory[k].marked = 20
                                            throbert.sproutventory[k].body.xmom = 0
                                            throbert.sproutventory[k].body.ymom = 0
                                            throbert.sproutventory[k].body.friction = 0
                                        } else {
                                            throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                            throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                            throbert.sproutventory[k].bloomdriptimer = 25
                                            throbert.sproutventory[k].bloom -= 1
                                        }
                                    } else {
                                        throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                        throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                    }
                                } else if ((throbert.sproutventory[k].body.doesPerimeterTouch(point3))) {
                                    if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                        if (throbert.sproutventory[k].bloom <= 0) {
                                            throbert.sproutventory[k].marked = 20
                                            throbert.sproutventory[k].body.xmom = 0
                                            throbert.sproutventory[k].body.ymom = 0
                                            throbert.sproutventory[k].body.friction = 0
                                        } else {
                                            throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                            throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                            throbert.sproutventory[k].bloomdriptimer = 25
                                            throbert.sproutventory[k].bloom -= 1
                                        }
                                    } else {
                                        throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                        throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // canvas_context.drawImage(this.img, this.body.x - this.body.radius, this.body.y - this.body.radius)

            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = `White`

            if (this.crush <= 0) {
                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle, this.angle + (Math.PI / 1.5), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#ff00ff"
                canvas_context.fill()

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + (Math.PI / 1.5), this.angle + ((Math.PI / 1.5) * 2), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#FFFF00"
                canvas_context.fill()

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + ((Math.PI / 1.5) * 2), this.angle + ((Math.PI / 1.5) * 3), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#00ffff"
                canvas_context.fill()
            } else {

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle, this.angle + (Math.PI / 1.5), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#00ff0088"
                canvas_context.fill()

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + (Math.PI / 1.5), this.angle + ((Math.PI / 1.5) * 2), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#0000ff88"
                canvas_context.fill()

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + ((Math.PI / 1.5) * 2), this.angle + ((Math.PI / 1.5) * 3), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#ff000088"
                canvas_context.fill()
            }





            // this.body.draw()
            this.body.health = this.health
            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }

        }
    }

    class Stomplegs {
        constructor(x, y, colors, pen) {
            this.legindex = 5
            this.firstdead = 0
            this.type = Math.floor(Math.random() * 3)
            this.body = new Circle(x, y, 12, "red")
            if (this.type == 0) {
                this.body.color = "#00FFFF"
                this.img = crabc
            }
            if (this.type == 1) {
                this.body.color = "#FF00FF"
                this.img = crabm
            }
            if (this.type == 2) {
                this.body.color = "#FFFF00"
                this.img = craby
            }
            this.legs = []
            this.legangle = 0
            for (let t = 0; t < 5; t++) {
                const leg = new Circle(this.body.x + (Math.cos(this.legangle) * 100), this.body.y + (Math.sin(this.legangle) * 100), 15, "#FFAAFF")
                leg.bumper = new Circle(this.body.x + (Math.cos(this.legangle) * 100), this.body.y + (Math.sin(this.legangle) * 100), 70, "#FF000088")
                leg.offsetangle = 0
                leg.link = new LineOP(this.body, leg, "teal", 4)
                leg.dir = 1
                this.legangle += (Math.PI * .4)
                this.legs.push(leg)
            }
            this.bodyarea = new Circle(x, y, 1020, "red")
            this.go = this.body
            this.health = 61000
            this.maxhealth = this.health
            this.value = 45
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 18
            this.body.weight = 1 / this.weight
            this.cost = 400
            this.variety = 2.5
            // this.name = this.nameGenerator()
            this.needs = []
            this.colors = colors
            for (let t = 0; t < this.colors.length; t++) {
                this.colors[t] = this.body.color
            }
            this.radius = 5
            // this.body = new TileCircle(x, y, 5, this.colors[0])
            this.body.angle = 0
            this.clip = 0
            this.slip = .05
            this.spin = 0
            this.crab = 1
            this.scale = .5
            this.age = 0
            this.pen = pen
            this.body.friction = .9
            this.playlink = new LineOP(this.body, throbert.body)
            this.crush = 0
            this.cycle = 1
        }
        jumpspin() {
            if (Math.random() < .2) {
                this.spin = -Math.random() * .2
            }
            if (Math.random() < .2) {
                this.spin = Math.random() * .2
            }
            this.body.angle += Math.random() - .5
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {

            if (this.playlink.hypotenuse() > 950) {
                return
            }
            if (this.health <= 0) {
                this.body.smove()
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - 50, 0); t < Math.min(this.xcord + 60, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - 50, 0); k < Math.min(this.ycord + 60, 10230); k += ten) {

                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                const hyp = link.hypotenuse()
                                const angle = link.angle()
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (hyp <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    this.body.xmom -= Math.sign(this.body.x - this.go.x) * .19
                    this.body.ymom -= Math.sign(this.body.y - this.go.y) * .19
                }
            }
            if (this.health > 0) {
                this.clip += this.slip
                if (Math.abs(this.clip) > ((Math.PI * 1) + (this.clip * 1))) {
                    this.slip *= -1
                }
            }
            if (this.health > 0) {
                this.body.radius = 30
                if (Math.random() < .13) {
                    if (Math.random() < .2) {
                        this.spin = -Math.random() * .2
                    }
                    if (Math.random() < .2) {
                        this.spin = Math.random() * .2
                    }
                    if (Math.random() < .8) {
                        this.spin = 0
                    }
                }
                this.body.angle += this.spin
            } else {
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    this.pulse = 1
                    this.body.radius = 14
                    this.body.pulse = 1
                    this.crush = 0
                    this.runcrush = 0
                } else {
                    this.pulse = 0
                    this.body.pulse = 0
                }
            }
            this.claws = []
            if (this.health > 0) {
                this.angle = this.body.angle
            }
                if (this.health > 0) {
                    if (this.health < this.maxhealth) {
                        this.cycle++
                        if ((this.cycle % 25).between(20, 25)) {
                            this.body.radius = 30 + (Math.abs(5 - (this.cycle % 10)) * 2)
                            this.pulse = 1
                        } else {
                            this.pulse = 0
                            this.body.radius = 30
                        }
                    }
                }

            if(this.cycle%25 == 0){
                this.legindex++
                this.legindex%=8
            }

            for (let t = 0; t < this.legs.length; t++) {
                this.legs[t].x = this.body.x + (Math.cos(this.legangle +this.angle + this.legs[t].offsetangle) *( Math.min(this.body.radius,30)*3.3))
                this.legs[t].y = this.body.y + (Math.sin(this.legangle +this.angle + this.legs[t].offsetangle) * ( Math.min(this.body.radius,30)*3.3))
                this.legs[t].radius = Math.min(this.body.radius,32)*.25
                this.legangle+=Math.PI*.4

                this.legs[t].link.draw()
                this.legs[t].draw()
                if(this.health > 0){
                    this.legs[t].bumper.x = this.legs[t].x
                    this.legs[t].bumper.y = this.legs[t].y
                    if(this.health < this.maxhealth){
    
                        if (this.legindex == t) {
                            if (throbert.body.doesPerimeterTouch(this.legs[t].bumper)) {
                                throbert.health--
                            }
    
                            this.legs[t].bumper.draw()
                            for (let k = 0; k < throbert.sproutventory.length; k++) {
                                const pang = this.elinks[k].angle()
                                if (throbert.sproutventory[k].fly <= 0 && throbert.sproutventory[k].grounded != 1) {//&& throbert.sproutventory[k].cling != 1
                                    if (throbert.sproutventory[k].body.doesPerimeterTouch(this.legs[t].bumper)) {
                                        if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                            if (throbert.sproutventory[k].bloom <= 0) {
                                                throbert.sproutventory[k].marked = 20
                                                throbert.sproutventory[k].body.xmom = 0
                                                throbert.sproutventory[k].body.ymom = 0
                                                throbert.sproutventory[k].body.friction = 0
                                            } else {
                                                throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                                throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                                throbert.sproutventory[k].bloomdriptimer = 25
                                                throbert.sproutventory[k].bloom -= 1
                                            }
                                        } else {
                                            throbert.sproutventory[k].body.xmom += Math.cos(pang)
                                            throbert.sproutventory[k].body.ymom += Math.sin(pang)
                                        }
                                    }
                                }
                            }
        
        
                            if (this.legs[t].dir == 1) {
                                this.legs[t].offsetangle += .04
                                if (Math.abs(this.legs[t].offsetangle) > 1) {
                                    this.legs[t].dir *= -1
                                }
                            } else {
                                this.legs[t].offsetangle -= .04
                                if (Math.abs(this.legs[t].offsetangle) > 1) {
                                    this.legs[t].dir *= -1
                                }
                            }
                        }
                    }
                }
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // canvas_context.drawImage(this.img, this.body.x - this.body.radius, this.body.y - this.body.radius)

            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = `White`

            for (let t = 0; t < Math.PI * 2; t += (Math.PI / 5)) {
                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, t, t + (Math.PI * .1), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#FFAA00"
                canvas_context.fill()

                canvas_context.beginPath();
                canvas_context.arc(this.body.x, this.body.y, this.body.radius, t + (Math.PI * .1), t + (Math.PI * .2), false)
                canvas_context.lineTo(this.body.x, this.body.y);
                canvas_context.fillStyle = "#00AAFF"
                canvas_context.fill()
            }

            // if (this.crush <= 0) {
            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle, this.angle + (Math.PI / 1.5), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#ff00ff"
            //     canvas_context.fill()

            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + (Math.PI / 1.5), this.angle + ((Math.PI / 1.5) * 2), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#FFFF00"
            //     canvas_context.fill()

            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + ((Math.PI / 1.5) * 2), this.angle + ((Math.PI / 1.5) * 3), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#00ffff"
            //     canvas_context.fill()
            // } else {

            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle, this.angle + (Math.PI / 1.5), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#00ff0088"
            //     canvas_context.fill()

            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + (Math.PI / 1.5), this.angle + ((Math.PI / 1.5) * 2), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#0000ff88"
            //     canvas_context.fill()

            //     canvas_context.beginPath();
            //     canvas_context.arc(this.body.x, this.body.y, this.body.radius, this.angle + ((Math.PI / 1.5) * 2), this.angle + ((Math.PI / 1.5) * 3), false)
            //     canvas_context.lineTo(this.body.x, this.body.y);
            //     canvas_context.fillStyle = "#ff000088"
            //     canvas_context.fill()
            // }





            // this.body.draw()
            this.body.health = this.health
            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }

        }
    }
    class Crab {
        constructor(x, y, colors, pen) {
            this.type = Math.floor(Math.random() * 3)
            this.body = new Circle(x, y, 12, "red")
            if (this.type == 0) {
                this.body.color = "#00FFFF"
                this.img = crabc
            }
            if (this.type == 1) {
                this.body.color = "#FF00FF"
                this.img = crabm
            }
            if (this.type == 2) {
                this.body.color = "#FFFF00"
                this.img = craby
            }
            this.bodyarea = new Circle(x, y, 120, "red")
            this.go = this.body
            this.health = 1000
            this.maxhealth = this.health
            this.value = 9
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 6
            this.body.weight = 1 / this.weight
            this.cost = 400
            this.variety = 2.5
            // this.name = this.nameGenerator()
            this.needs = []
            this.colors = colors
            for (let t = 0; t < this.colors.length; t++) {
                this.colors[t] = this.body.color
            }
            this.radius = 5
            // this.body = new TileCircle(x, y, 5, this.colors[0])
            this.body.angle = 0
            this.clip = 0
            this.slip = .05
            this.spin = 0
            this.crab = 1
            this.scale = .5
            this.age = 0
            this.pen = pen
            this.body.friction = .9
            this.playlink = new LineOP(this.body, throbert.body)
            this.firstdead =0
        }

        nameGenerator() {
            let name = ''
            const random = Math.floor(Math.random() * 4) + 1
            for (let t = 0; t < random; t++) {
                const select = Math.floor(Math.random() * 23)
                if (t == 0) {
                    if (select == 0) {
                        name += 'Sni'
                    } else if (select == 1) {
                        name += 'Per'
                    } else if (select == 2) {
                        name += 'Cra'
                    } else if (select == 3) {
                        name += 'Ba'
                    } else if (select == 4) {
                        name += 'Buk'
                    } else if (select == 5) {
                        name += 'Buc'
                    } else if (select == 6) {
                        name += 'Pin'
                    } else if (select == 7) {
                        name += 'Gra'
                    } else if (select == 8) {
                        name += 'Cla'
                    } else if (select == 9) {
                        name += 'She'
                    } else if (select == 10) {
                        name += 'Car'
                    } else if (select == 11) {
                        name += 'Sea'
                    } else if (select == 12) {
                        name += 'Sal'
                    } else if (select == 13) {
                        name += 'Dec'
                    } else if (select == 14) {
                        name += 'Pod'
                    } else if (select == 15) {
                        name += 'Tra'
                    } else if (select == 16) {
                        name += 'Gre'
                    } else if (select == 17) {
                        name += 'Snib'
                    } else if (select == 18) {
                        name += 'Bins'
                    } else if (select == 19) {
                        name += 'Bin'
                    } else if (select == 20) {
                        name += 'Crab'
                    } else if (select == 21) {
                        name += 'Barc'
                    } else if (select == 22) {
                        name += 'Arb'
                    }
                } else {
                    if (select == 0) {
                        name += 'ab'
                    } else if (select == 1) {
                        name += 'nch'
                    } else if (select == 2) {
                        name += 'ket'
                    } else if (select == 3) {
                        name += 'ch'
                    } else if (select == 4) {
                        name += 'b'
                    } else if (select == 5) {
                        name += 'w'
                    } else if (select == 6) {
                        name += 'll'
                    } else if (select == 7) {
                        name += 'bs'
                    } else if (select == 8) {
                        name += 'bed'
                    } else if (select == 9) {
                        name += 't'
                    } else if (select == 10) {
                        name += 'a'
                    } else if (select == 11) {
                        name += 'apo'
                    } else if (select == 12) {
                        name += 'apode'
                    } else if (select == 13) {
                        name += 'ell'
                    } else if (select == 14) {
                        name += 'hea'
                    } else if (select == 15) {
                        name += 'stacea'
                    } else if (select == 16) {
                        name += 'sta'
                    } else if (select == 17) {
                        name += 'st'
                    } else if (select == 18) {
                        name += 'cru'
                    } else if (select == 19) {
                        name += 'cap'
                    } else if (select == 20) {
                        name += 'pac'
                    } else if (select == 21) {
                        name += 'pak'
                    } else if (select == 22) {
                        name += 'kap'
                    }
                }
            }
            canvas_context.font = "18px Arial";
            canvas_context.fillStyle = 'yellow'
            canvas_context.strokeStyle = 'black'
            while (canvas_context.measureText(name).width > 80) {
                name = name.split('')
                name.splice(name.length - 1, 1)
                name = name.join('')
            }
            return name
        }
        jumpspin() {
            if (Math.random() < .2) {
                this.spin = -Math.random() * .2
            }
            if (Math.random() < .2) {
                this.spin = Math.random() * .2
            }
            this.body.angle += Math.random() - .5
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 750) {
                return
            }

            if (this.health <= 0) {
                this.body.smove()
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    for (let t = 0; t < enemysounds.length; t++) {
                        if (enemysounds[t].paused) {
                            enemysounds[t].play()
                            break
                        }
                    }
                }
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                                if (true) {
                                    const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                    const hyp = link.hypotenuse()
                                    const angle = link.angle()
                                    if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                    } else {
                                        if (hyp <= ten + this.body.radius) {
                                            if (hyp <= ten + this.body.radius) {
                                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                                } else {
                                                    this.body.xmom = Math.cos(angle) * 2
                                                    this.body.ymom = Math.sin(angle) * 2
                                                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                                }
                                            } else if (hyp <= ten) {
                                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                                } else {
                                                    this.body.xmom = Math.cos(angle) * 2
                                                    this.body.ymom = Math.sin(angle) * 2
                                                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    this.body.xmom -= Math.sign(this.body.x - this.go.x) * .09
                    this.body.ymom -= Math.sign(this.body.y - this.go.y) * .09
                }
            }
            // this.needs = []
            // let puddles = 0
            // for (let t = 0; t < this.pen.enrichment.length; t++) {
            //     if (this.pen.enrichment[t].puddle == 1) {
            //         puddles++
            //     }
            // }
            // if (((this.pen.body.width * this.pen.body.height)) / 8000 > (puddles)) {
            //     this.needs.push('More Puddles')
            // }
            // if (((this.pen.body.width * this.pen.body.height) / this.pen.animals.length) < 4000 && this.pen.animals.length > 1) {
            //     this.needs.push('Overcrowded')
            // }
            // if (this.pen.animals.length < 2) {
            //     this.needs.push('Lonely')
            // }
            // this.age++
            // this.scale = .5 + Math.min(this.age * .001, .5)
            this.body.radius = 9
            // this.body.draw()
            if (this.health > 0) {
                this.clip += this.slip
                if (Math.abs(this.clip) > ((Math.PI * .25) + (this.clip * .25))) {
                    this.slip *= -1
                }
            }
            if (this.health > 0) {
                if (Math.random() < .13) {
                    if (Math.random() < .2) {
                        this.spin = -Math.random() * .2
                    }
                    if (Math.random() < .2) {
                        this.spin = Math.random() * .2
                    }
                    if (Math.random() < .8) {
                        this.spin = 0
                    }
                }
                this.body.angle += this.spin
            }
            // this.body.x += Math.cos(this.body.angle)
            // this.body.y += Math.sin(this.body.angle)
            this.claws = []
            if (this.health > 0) {
                this.angle = this.body.angle
            }
            for (let t = 0; t < 1; t++) {
                const point = new Point(this.body.x + ((this.body.radius * 1.9191) * Math.cos(this.angle)), (this.body.y + ((this.body.radius * 1.9191) * Math.sin(this.angle))))
                // this.angle += Math.PI / 1.5
                this.claws.push(point)
            }
            for (let t = 0; t < this.claws.length; t++) {
                const link = new LineOP(this.claws[t], this.body, this.colors[1], 5)
                link.draw()
            }
            for (let t = 0; t < this.claws.length; t++) {

                const link = new LineOP(this.claws[t], this.body, this.colors[1], 2)
                const hyp = link.angle()
                const point2 = new Circle(this.claws[t].x + ((this.body.radius * 1.9191) * Math.cos(this.clip + hyp)), (this.claws[t].y + ((this.body.radius * 1.9191) * Math.sin(this.clip + hyp))), 4, this.colors[0])
                const point3 = new Circle(this.claws[t].x + ((this.body.radius * 1.9191) * Math.cos(-this.clip + hyp)), (this.claws[t].y + ((this.body.radius * 1.9191) * Math.sin(-this.clip + hyp))), 4, this.colors[0])
                const link3 = new LineOP(this.claws[t], point2, this.colors[2], 3)
                const link2 = new LineOP(this.claws[t], point3, this.colors[3], 3)
                link3.draw()
                link2.draw()
                point2.draw()
                point3.draw()

                if (this.health > 0) {
                    if (throbert.body.doesPerimeterTouch(point2)) {
                        if (throbert.body.doesPerimeterTouch(point3)) {
                            throbert.health -= 1
                            if (throbert.health <= 0) {
                                throbert.health = 0
                            }
                        }
                    }

                    for (let k = 0; k < throbert.sproutventory.length; k++) {
                        if (this.type == throbert.sproutventory[k].type) {
                            continue
                        }
                        if (throbert.sproutventory[k].fly <= 0 && throbert.sproutventory[k].grounded != 1 && throbert.sproutventory[k].cling != 1) {
                            if (throbert.sproutventory[k].body.doesPerimeterTouch(point2)) {
                                if (throbert.sproutventory[k].body.doesPerimeterTouch(point3)) {
                                    if (throbert.sproutventory[k].bloomdriptimer <= 0) {

                                        if (throbert.sproutventory[k].bloom <= 0) {
                                            throbert.sproutventory[k].marked = 20
                                            throbert.sproutventory[k].body.xmom = 0
                                            throbert.sproutventory[k].body.ymom = 0
                                            throbert.sproutventory[k].body.friction = 0
                                        } else {
                                            throbert.sproutventory[k].bloomdriptimer = 20
                                            throbert.sproutventory[k].bloom -= 1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // ////////console.log(this)

            // if (this.health > 0) {
            //     if (this.body.doesPerimeterTouch(this.go)) {
            //         this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         while (!this.go.doesPerimeterTouch(this.bodyarea)) {
            //             this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         }
            //     } else {
            //         this.body.x -= Math.sign(this.body.x - this.go.x)
            //         this.body.y -= Math.sign(this.body.y - this.go.y)
            //         if (this.bodyarea.doesPerimeterTouch(throbert.body)) {

            //             this.body.angle = ((this.body.angle * 5) + ((new LineOP(this.body, throbert.body)).angle()) + Math.PI) / 6
            //         } else {
            //             this.body.angle = ((this.body.angle * 18) + ((new LineOP(this.body, this.go)).angle()) + Math.PI) / 19
            //         }
            //     }
            // }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // this.body.draw()

            canvas_context.drawImage(this.img, this.body.x - this.body.radius, this.body.y - this.body.radius)
            this.body.health = this.health

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }

    class Hoggelspouzer {
        constructor(x, y, colors, pen) {
            this.type = Math.floor(Math.random() * 3)
            this.body = new Circle(x, y, 12, "red")
            if (this.type == 0) {
                this.body.color = "#00FFFF"
            }
            if (this.type == 1) {
                this.body.color = "#FF00FF"
            }
            if (this.type == 2) {
                this.body.color = "#FFFF00"
            }

            if (this.type == 0) {
                this.shotsprite = shotspritec
            } else if (this.type == 1) {
                this.shotsprite = shotspritem
            } else if (this.type == 2) {
                this.shotsprite = shotspritey
            }
            if (this.type == 0) {
                this.doodle = doodlec
            } else if (this.type == 1) {
                this.doodle = doodlem
            } else if (this.type == 2) {
                this.doodle = doodley
            }


            this.bodyarea = new Circle(x, y, 120, "red")
            this.go = this.body
            this.health = 6000
            this.maxhealth = this.health
            this.value = 15
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 14
            this.body.weight = 1 / this.weight
            this.cost = 400
            this.variety = 2.5
            this.needs = []
            this.colors = colors
            for (let t = 0; t < this.colors.length; t++) {
                this.colors[t] = this.body.color
            }
            this.radius = 9
            // this.body = new TileCircle(x, y, 5, this.colors[0])
            this.body.angle = 0
            this.clip = 0
            this.slip = .05
            this.spin = 0
            this.crab = 1
            this.scale = .5
            this.age = 0
            this.pen = pen
            this.body.friction = .9
            this.cycle = 0
            this.pulse = 0
            this.playlink = new LineOPD(this.body, throbert.body)
            this.spoutcount = 0
            this.shots = []
            this.firstdead =0
        }

        jumpspin() {
            if (Math.random() < .2) {
                this.spin = -Math.random() * .2
            }
            if (Math.random() < .2) {
                this.spin = Math.random() * .2
            }
            this.body.angle += Math.random() - .5
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 1200) {
                return
            }

            if (this.health <= 0) {
                this.body.smove()
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    for (let t = 0; t < enemysounds.length; t++) {
                        if (enemysounds[t].paused) {
                            enemysounds[t].play()
                            break
                        }
                    }
                }
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                                // if (true) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                const hyp = link.hypotenuse()
                                const angle = link.angle()
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (hyp <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                }
                            }
                            // }
                        }
                    }
                }
            }
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    this.body.xmom -= Math.sign(this.body.x - this.go.x) * .09
                    this.body.ymom -= Math.sign(this.body.y - this.go.y) * .09
                }
            }
            // this.needs = []
            // let puddles = 0
            // for (let t = 0; t < this.pen.enrichment.length; t++) {
            //     if (this.pen.enrichment[t].puddle == 1) {
            //         puddles++
            //     }
            // }
            // if (((this.pen.body.width * this.pen.body.height)) / 8000 > (puddles)) {
            //     this.needs.push('More Puddles')
            // }
            // if (((this.pen.body.width * this.pen.body.height) / this.pen.animals.length) < 4000 && this.pen.animals.length > 1) {
            //     this.needs.push('Overcrowded')
            // }
            // if (this.pen.animals.length < 2) {
            //     this.needs.push('Lonely')
            // }
            // this.age++
            // this.scale = .5 + Math.min(this.age * .001, .5)
            this.body.radius = 16
            // this.body.draw()

            // //console.log(this.body, this.doodle)
            // if (this.health > 0) {
            //     this.clip += this.slip
            //     if (Math.abs(this.clip) > ((Math.PI * .25) + (this.clip * .25))) {
            //         this.slip *= -1
            //     }
            // }
            if (this.health > 0) {
                if (Math.random() < .19) {
                    if (Math.random() < .2) {
                        this.spin = -Math.random() * .4
                    }
                    if (Math.random() < .2) {
                        this.spin = Math.random() * .4
                    }
                    if (Math.random() < .8) {
                        this.spin = 0
                    }
                }
                this.body.angle += this.spin
            }
            // this.body.x += Math.cos(this.body.angle)
            // this.body.y += Math.sin(this.body.angle)
            this.claws = []
            if (this.health > 0) {
                this.angle = this.body.angle
            }
            for (let t = 0; t < 1; t++) {
                const point = new Point(this.body.x + ((this.body.radius * 1.5) * Math.cos(this.angle)), (this.body.y + ((this.body.radius * 1.5) * Math.sin(this.angle))))
                // this.angle += Math.PI / 1.5
                this.claws.push(point)
            }
            for (let t = 0; t < this.claws.length; t++) {
                const link = new LineOP(this.claws[t], this.body, this.colors[1], 5)
                link.draw()
            }
            this.spoutcount++

            for (let t = 0; t < this.shots.length; t++) {
                if (this.shots[t].marked == 1) {
                    this.shots.splice(t, 1)
                }
            }
            for (let t = 0; t < this.shots.length; t++) {
                this.shots[t].move()
                // this.shots[t].draw()
                canvas_context.drawImage(this.shotsprite, this.shots[t].x - 7, this.shots[t].y - 7)



                if (this.shots[t].doesPerimeterTouch(throbert.body)) {
                    this.shots[t].marked = 1
                    throbert.health -= 5
                    if (throbert.health <= 0) {
                        this.shots[t].marked = 1
                        throbert.health = 0
                    }
                }
                if (this.shots[t].link.hypotenuse() > 300) {
                    this.shots[t].marked = 1
                }
            }
            // for (let t = 0; t < this.claws.length; t++) {
            // let point = new Point((this.claws[0].x + this.claws[0].x)*.5,(this.claws[0].y + this.claws[0].y)*.5)
            // let link = new LineOP(point, this.body, this.colors[1], 2)
            // let hyp =  0//link.angle()
            // // let point2 = new Circle((this.claws[0].x + this.claws[0].x) * .5 + ((this.body.radius * 1.9191) * Math.cos(this.clip + hyp)), ((this.claws[0].y + this.claws[0].y) * .5 + ((this.body.radius * 1.9191) * Math.sin(this.clip + hyp))), 4, this.colors[0])
            // // let link3 = new LineOP(this.claws[0], point2, this.colors[2], 3)
            // // let link2 = new LineOP(this.claws[0], point3, this.colors[3], 3)
            // // link3.draw()
            // // link2.draw()
            // // point2.draw()
            // // point3.draw()


            if (this.health > 0) {
                if ((this.spoutcount % 100).between(80, 100) && this.spoutcount % 6 == 0) {
                    let shot = new Circle((this.claws[0].x + this.claws[0].x) * .5, (this.claws[0].y + this.claws[0].y) * .5, 7, this.colors[0], Math.cos(this.angle) * 4, Math.sin(this.angle) * 4)
                    shot.link = new LineOPD(this.body, shot)
                    this.shots.push(shot)
                }
            }





            if (this.health > 0) {
                if (this.health < this.maxhealth) {
                    this.cycle++
                    if ((this.cycle % 60).between(50, 59)) {
                        this.body.radius = 16 + (Math.abs(5 - (this.cycle % 10)) * 2)
                        this.pulse = 1
                    } else {
                        this.pulse = 0
                        this.body.radius = 16
                    }
                }
                for (let k = 0; k < throbert.sproutventory.length; k++) {
                    if (this.type == throbert.sproutventory[k].type) {
                        continue
                    }
                    if (this.elinks[k].hypotenuse() > 400) {
                        continue
                    }
                    if (throbert.sproutventory[k].fly <= 0 && throbert.sproutventory[k].grounded != 1) {
                    } else {
                        continue
                    }
                    for (let t = 0; t < this.shots.length; t++) {
                        if (throbert.sproutventory[k].cling != 1) {
                            if (throbert.sproutventory[k].body.doesPerimeterTouch(this.shots[t])) {
                                this.shots[t].marked = 1
                                if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                    if (throbert.sproutventory[k].bloom <= 0) {
                                        throbert.sproutventory[k].marked = 20
                                        throbert.sproutventory[k].body.xmom = 0
                                        throbert.sproutventory[k].body.ymom = 0
                                        throbert.sproutventory[k].body.friction = 0
                                    } else {
                                        throbert.sproutventory[k].bloomdriptimer = 20
                                        throbert.sproutventory[k].bloom -= 1
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                this.pulse = 0
                // this.body.radius = 12
            }
            // }
            // ////////console.log(this)

            // if (this.health > 0) {
            //     if (this.body.doesPerimeterTouch(this.go)) {
            //         this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         while (!this.go.doesPerimeterTouch(this.bodyarea)) {
            //             this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         }
            //     } else {
            //         this.body.x -= Math.sign(this.body.x - this.go.x)
            //         this.body.y -= Math.sign(this.body.y - this.go.y)
            //         if (this.bodyarea.doesPerimeterTouch(throbert.body)) {

            //             this.body.angle = ((this.body.angle * 5) + ((new LineOP(this.body, throbert.body)).angle()) + Math.PI) / 6
            //         } else {
            //             this.body.angle = ((this.body.angle * 18) + ((new LineOP(this.body, this.go)).angle()) + Math.PI) / 19
            //         }
            //     }
            // }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - 16, this.body.y + 18, (32) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // this.body.draw()
            if (this.body.radius == 16) {
                canvas_context.drawImage(this.doodle, this.body.x - 16, this.body.y - 16)
            } else {
                canvas_context.drawImage(this.doodle, 0, 0, this.doodle.width, this.doodle.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            }
            this.body.health = this.health

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }

    class Boubyelega {
        constructor(x, y, colors, pen) {
            this.type = Math.floor(Math.random() * 3)
            this.body = new Circle(x, y, 12, "red")
            if (this.type == 0) {
                this.body.color = "#00FFFF"
            }
            if (this.type == 1) {
                this.body.color = "#FF00FF"
            }
            if (this.type == 2) {
                this.body.color = "#FFFF00"
            }

            if (this.type == 0) {
                this.doodle = bubblerc
            } else if (this.type == 1) {
                this.doodle = bubblerm
            } else if (this.type == 2) {
                this.doodle = bubblery
            }


            this.bodyarea = new Circle(x, y, 120, "red")
            this.go = this.body
            this.health = 6000
            this.maxhealth = this.health
            this.value = 15
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 14
            this.body.weight = 1 / this.weight
            this.cost = 400
            this.variety = 2.5
            this.needs = []
            this.colors = colors
            for (let t = 0; t < this.colors.length; t++) {
                this.colors[t] = this.body.color
            }
            this.radius = 9
            // this.body = new TileCircle(x, y, 5, this.colors[0])
            this.body.angle = 0
            this.clip = 0
            this.slip = .05
            this.spin = 0
            this.crab = 1
            this.scale = .5
            this.age = 0
            this.pen = pen
            this.body.friction = .9
            this.cycle = 0
            this.pulse = 0
            this.playlink = new LineOPD(this.body, throbert.body)
            this.spoutcount = 0
            this.shots = []
            this.firstdead =0
        }

        jumpspin() {
            if (Math.random() < .2) {
                this.spin = -Math.random() * .2
            }
            if (Math.random() < .2) {
                this.spin = Math.random() * .2
            }
            this.body.angle += Math.random() - .5
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 1200) {
                return
            }

            if (this.health <= 0) {
                this.body.smove()
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    for (let t = 0; t < enemysounds.length; t++) {
                        if (enemysounds[t].paused) {
                            enemysounds[t].play()
                            break
                        }
                    }
                }
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                                // if (true) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                const hyp = link.hypotenuse()
                                const angle = link.angle()
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (hyp <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                    // }
                                }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    this.body.xmom -= Math.sign(this.body.x - this.go.x) * .09
                    this.body.ymom -= Math.sign(this.body.y - this.go.y) * .09
                }
            }
            // this.needs = []
            // let puddles = 0
            // for (let t = 0; t < this.pen.enrichment.length; t++) {
            //     if (this.pen.enrichment[t].puddle == 1) {
            //         puddles++
            //     }
            // }
            // if (((this.pen.body.width * this.pen.body.height)) / 8000 > (puddles)) {
            //     this.needs.push('More Puddles')
            // }
            // if (((this.pen.body.width * this.pen.body.height) / this.pen.animals.length) < 4000 && this.pen.animals.length > 1) {
            //     this.needs.push('Overcrowded')
            // }
            // if (this.pen.animals.length < 2) {
            //     this.needs.push('Lonely')
            // }
            // this.age++
            // this.scale = .5 + Math.min(this.age * .001, .5)
            this.body.radius = 16
            // this.body.draw()

            // //console.log(this.body, this.doodle)
            // if (this.health > 0) {
            //     this.clip += this.slip
            //     if (Math.abs(this.clip) > ((Math.PI * .25) + (this.clip * .25))) {
            //         this.slip *= -1
            //     }
            // }
            if (this.health > 0) {
                if (Math.random() < .19) {
                    if (Math.random() < .2) {
                        this.spin = -Math.random() * .4
                    }
                    if (Math.random() < .2) {
                        this.spin = Math.random() * .4
                    }
                    if (Math.random() < .8) {
                        this.spin = 0
                    }
                }
                this.body.angle += this.spin
            }
            // this.body.x += Math.cos(this.body.angle)
            // this.body.y += Math.sin(this.body.angle)
            this.claws = []
            if (this.health > 0) {
                this.angle = this.body.angle
            }
            for (let t = 0; t < 1; t++) {
                let point = new Point(this.body.x + ((this.body.radius * 1.5) * Math.cos(this.angle)), (this.body.y + ((this.body.radius * 1.5) * Math.sin(this.angle))))
                // this.angle += Math.PI / 1.5
                this.claws.push(point)
            }
            for (let t = 0; t < this.claws.length; t++) {
                let link = new LineOP(this.claws[t], this.body, this.colors[1], 5)
                link.draw()
            }
            this.spoutcount++

            for (let t = 0; t < this.shots.length; t++) {
                if (this.shots[t].marked == 1) {
                    for (let k = 0; k < this.shots[t].pile.length; k++) {
                        this.shots[t].pile[k].ignore = 0
                        this.shots[t].pile[k].cling = 0
                        this.shots[t].pile[k].clingTo = {}
                    }

                }
            }

            for (let t = 0; t < this.shots.length; t++) {
                if (this.shots[t].marked == 1) {
                    for (let k = 0; k < this.shots[t].pile.length; k++) {
                        this.shots[t].pile[k].ignore = 0
                        this.shots[t].pile[k].cling = 0
                        this.shots[t].pile[k].clingTo = {}
                    }

                    this.shots.splice(t, 1)
                }
            }
            for (let t = 0; t < this.shots.length; t++) {
                this.shots[t].move()
                this.shots[t].draw()
                // canvas_context.drawImage(this.shotsprite, this.shots[t].x - 7, this.shots[t].y - 7)

                if (this.shots[t].doesPerimeterTouch(throbert.body)) {
                    // this.shots[t].marked = 1
                    throbert.health -= 1
                    if (throbert.health <= 0) {
                        this.shots[t].marked = 1
                        throbert.health = 0
                    }
                }
                if (this.shots[t].link.hypotenuse() > 350) {
                    this.shots[t].marked = 1
                }
            }
            // for (let t = 0; t < this.claws.length; t++) {
            // let point = new Point((this.claws[0].x + this.claws[0].x)*.5,(this.claws[0].y + this.claws[0].y)*.5)
            // let link = new LineOP(point, this.body, this.colors[1], 2)
            // let hyp =  0//link.angle()
            // // let point2 = new Circle((this.claws[0].x + this.claws[0].x) * .5 + ((this.body.radius * 1.9191) * Math.cos(this.clip + hyp)), ((this.claws[0].y + this.claws[0].y) * .5 + ((this.body.radius * 1.9191) * Math.sin(this.clip + hyp))), 4, this.colors[0])
            // // let link3 = new LineOP(this.claws[0], point2, this.colors[2], 3)
            // // let link2 = new LineOP(this.claws[0], point3, this.colors[3], 3)
            // // link3.draw()
            // // link2.draw()
            // // point2.draw()
            // // point3.draw()


            if (this.health > 0) {
                if ((this.spoutcount % 50 == 44)) {
                    let shot = new CircleS((this.claws[0].x + this.claws[0].x) * .5, (this.claws[0].y + this.claws[0].y) * .5, 15, this.colors[0], Math.cos(this.angle) * 3, Math.sin(this.angle) * 3)
                    shot.link = new LineOPD(this.body, shot)
                    shot.release = 100
                    shot.shot = 1
                    shot.pile = []
                    this.shots.push(shot)
                }
            }





            if (this.health > 0) {
                if (this.health < this.maxhealth) {
                    this.cycle++
                    if ((this.cycle % 60).between(50, 59)) {
                        this.body.radius = 16 + (Math.abs(5 - (this.cycle % ten)) * 2)
                        this.pulse = 1
                    } else {
                        this.pulse = 0
                        this.body.radius = 16
                    }
                }
                for (let k = 0; k < throbert.sproutventory.length; k++) {
                    if (this.type == throbert.sproutventory[k].type) {
                        continue
                    }
                    if (this.elinks[k].hypotenuse() > 400) {
                        continue
                    }
                    if (throbert.sproutventory[k].fly <= 0 && throbert.sproutventory[k].grounded != 1) {
                    } else {
                        continue
                    }

                    for (let t = 0; t < this.shots.length; t++) {
                        if (throbert.sproutventory[k].cling != 1) {
                            if (throbert.sproutventory[k].body.doesPerimeterTouch(this.shots[t])) {
                                // this.shots[t].marked = 1
                                // throbert.sproutventory[k].attent = -3
                                throbert.sproutventory[k].cling = 1
                                throbert.sproutventory[k].clingTo = this.shots[t]
                                throbert.sproutventory[k].clingx = -(((Math.random() - .5) * 8))
                                throbert.sproutventory[k].clingy = -(((Math.random() - .5) * 8))
                                this.shots[t].pile.push(throbert.sproutventory[k])
                                throbert.sproutventory[k].body.x += ((this.shots[t].x - throbert.sproutventory[k].body.x) * .3) + ((Math.random() - .5) * 2)
                                throbert.sproutventory[k].body.y += ((this.shots[t].y - throbert.sproutventory[k].body.y) * .3) + ((Math.random() - .5) * 2)
                                throbert.sproutventory[k].ignore = 1
                                // if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                //     if (throbert.sproutventory[k].bloom <= 0) {
                                //         throbert.sproutventory[k].marked = 20
                                //         throbert.sproutventory[k].body.xmom = 0
                                //         throbert.sproutventory[k].body.ymom = 0
                                //         throbert.sproutventory[k].body.friction = 0
                                //     } else {
                                //         throbert.sproutventory[k].bloomdriptimer = 20
                                //         throbert.sproutventory[k].bloom -= 1
                                //     }

                                // }
                            }
                        } else {
                            if (throbert.sproutventory[k].cling == 1) {
                                if (throbert.sproutventory[k].body.doesPerimeterTouch(this.shots[t])) {
                                    throbert.sproutventory[k].cling = 1
                                    this.shots[t].pile.push(throbert.sproutventory[k])
                                    throbert.sproutventory[k].clingTo = this.shots[t]
                                    throbert.sproutventory[k].clingx = -(((Math.random() - .5) * 8))
                                    throbert.sproutventory[k].clingy = -(((Math.random() - .5) * 8))
                                    throbert.sproutventory[k].body.x += ((this.shots[t].x - throbert.sproutventory[k].body.x) * .3) + ((Math.random() - .5) * 2)
                                    throbert.sproutventory[k].body.y += ((this.shots[t].y - throbert.sproutventory[k].body.y) * .3) + ((Math.random() - .5) * 2)
                                    throbert.sproutventory[k].ignore = 1
                                }
                            }
                        }
                    }
                }
            } else {
                this.pulse = 0
                // this.body.radius = 12
            }
            // }
            // ////////console.log(this)

            // if (this.health > 0) {
            //     if (this.body.doesPerimeterTouch(this.go)) {
            //         this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         while (!this.go.doesPerimeterTouch(this.bodyarea)) {
            //             this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         }
            //     } else {
            //         this.body.x -= Math.sign(this.body.x - this.go.x)
            //         this.body.y -= Math.sign(this.body.y - this.go.y)
            //         if (this.bodyarea.doesPerimeterTouch(throbert.body)) {

            //             this.body.angle = ((this.body.angle * 5) + ((new LineOP(this.body, throbert.body)).angle()) + Math.PI) / 6
            //         } else {
            //             this.body.angle = ((this.body.angle * 18) + ((new LineOP(this.body, this.go)).angle()) + Math.PI) / 19
            //         }
            //     }
            // }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - 16, this.body.y + 18, (32) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)
            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // this.body.draw()
            if (this.body.radius == 16) {
                canvas_context.drawImage(this.doodle, this.body.x - 16, this.body.y - 16)
            } else {
                canvas_context.drawImage(this.doodle, 0, 0, this.doodle.width, this.doodle.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            }
            this.body.health = this.health

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }

    const bosscircle = new Image()
    bosscircle.src = "bosscircle.png"
    const bosscirclepulse = new Image()
    bosscirclepulse.src = "bosscirclepulse.png"
    class Cannonboss {
        constructor(x, y) {
            this.firstdead = 0
            this.cycle = 0
            this.pulse = 0
            this.moment = Math.random() * 200
            this.body = new Circle(x, y, 60, "red")
            this.bodyarea = new Circle(x, y, 400, "red")
            this.go = this.body
            this.health = 80000
            this.maxhealth = this.health
            this.value = 60
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 20
            this.body.weight = 1 / this.weight
            this.body.friction = .9
            this.playlink = new LineOPD(this.body, throbert.body)
            this.charge = 0
            this.beaming = 0
            this.beamdis = 0
            this.beamball = new Circle(this.body.x, this.body.y, 20, "cyan")
            this.beamlink = new LineOP(this.body, this.beamball, "cyan", 28)
            this.beamball2 = new Circle(this.body.x, this.body.y, 14, "white")
            this.beamlink2 = new LineOP(this.body, this.beamball, "white", 20)
            this.pointer = new Circle(0, 0, 1, "black")
            this.p1 = new LineOP(this.body, this.pointer, "blue", 6)
            this.p2 = new LineOP(this.body, this.pointer, "#00ff00", 12)
            this.angle = Math.PI * .5
            this.cycle = 0
            this.beamshape = castBetween(this.body, this.beamball, 10, 14)
            this.beamshape = new Shape([])
            this.spin = 0
            this.hx1 = new CircleHalf(this.body.x, this.body.y, 67, "#090909")
            this.hx2 = new CircleHalf(this.body.x, this.body.y, 67, "#090909")
            this.hx1.sp = false
            this.hx2.sp = true
            this.hx1.angle = this.angle
            this.hx2.angle = this.angle

        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {

            if (this.playlink.hypotenuse() > 750) {
                return
            }
            if (this.health <= 0) {
                this.body.radius = 16
                this.beamdis = 0
                this.beaming = 0
            }
            this.cycle++
            if (this.beaming != 0) {
                this.beamdis += 8
                if (this.health <= 0) {
                } else {
                    beamboss.play()
                }
                if (this.beamdis > 400) {
                    this.beamdis = 400
                    if (this.cycle % 150 == 0) {
                        this.beaming = 0
                        this.beamdis = 0
                        beamboss.pause()
                    }
                }
            } else {
                this.beamdis = 0
            }
            if (this.moment <= 0) {
                this.charge = 0
                if (Math.random() < .03) {
                    this.spin = .056
                    this.moment = Math.random() * 100
                }
                if (Math.random() < .03) {
                    this.spin = -.056
                    this.moment = Math.random() * 100
                }
                if (Math.random() < .05) {
                    this.spin = 0
                    this.moment = Math.random() * 100
                }
                if (Math.random() < .25) {
                    this.charge = 1
                }
            }

            this.moment--
            this.angle += this.spin
            if (this.angle > Math.PI * 2) {
                this.angle -= Math.PI * 2
            }
            if (this.angle < 0) {
                this.angle += Math.PI * 2
            }


            this.pointer.x = this.body.x + (Math.cos(this.angle) * this.body.radius * 1.05)
            this.pointer.y = this.body.y + (Math.sin(this.angle) * this.body.radius * 1.05)

            if (this.cycle % 300 == 0) {
                this.beaming = 1

                if (this.health <= 0) {
                } else {
                    beamboss.play()
                }
            }

            if (this.health <= 0) {
                this.body.smove()
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - 70, 0); t < Math.min(this.xcord + 80, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - 70, 0); k < Math.min(this.ycord + 80, 10230); k += ten) {

                                // if (true) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {

                                    const hyp = link.hypotenuse()
                                    const angle = link.angle()
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (link.hypotenuse() <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                }
                                // }
                            }
                        }
                    }
                }
            }


            // this.hx2 = new CircleHalf(this.body.x, this.body.y, this.body.radius+13, "#090909")
            this.hx1.x = this.body.x, //= new CircleHalf(this.body.x, this.body.y, this.body.radius+13, "#090909")
                this.hx1.y = this.body.y

            this.hx2.x = this.body.x, //= new CircleHalf(this.body.x, this.body.y, this.body.radius+13, "#090909")
                this.hx2.y = this.body.y
            this.hx1.sp = false
            this.hx2.sp = false
            this.hx1.angle = this.angle
            this.hx2.angle = this.angle - Math.PI


            this.hx1.angle -= (this.beamdis / 400)
            this.hx2.angle += (this.beamdis / 400)

            this.hx1.x += (Math.cos(this.angle + (Math.PI / 2))) * (this.beamdis / 266) * 40
            this.hx1.y += (Math.sin(this.angle + (Math.PI / 2))) * (this.beamdis / 266) * 40
            this.hx2.x -= (Math.cos(this.angle + (Math.PI / 2))) * (this.beamdis / 266) * 40
            this.hx2.y -= (Math.sin(this.angle + (Math.PI / 2))) * (this.beamdis / 266) * 40


            if (this.health > 0) {

                if (this.health < this.maxhealth) {
                    // this.cycle++
                    if ((this.cycle % 110).between(100, 105)) {
                        this.body.radius = 60 + (Math.abs(3 - (this.cycle % 6)) * .5)
                        this.pulse = 1
                    } else {
                        this.pulse = 0
                        this.body.radius = 60
                    }
                }


                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    if (this.charge == 1) {
                        this.p1.width = 7
                        this.p2.width = 14
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.36666666666
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.36666666666
                    } else {
                        this.p1.width = 5
                        this.p2.width = 10
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.09666666666
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.09666666666
                    }
                }
            } else {
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    this.body.pulse = 1
                    this.pulse = 1
                } else {
                    this.pulse = 0
                    this.body.pulse = 0
                }
            }
            // if (this.health > 0) {
            //     if (this.body.doesPerimeterTouch(this.go)) {
            //         this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         while (!this.go.doesPerimeterTouch(this.bodyarea)) {
            //             this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         }
            //     } else {
            //         this.body.x -= Math.sign(this.body.x - this.go.x)
            //         this.body.y -= Math.sign(this.body.y - this.go.y)
            //     }
            // }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            if (this.beaming == 1) {
                this.beamshape = castBetween(this.body, this.beamball, 10, 21)
            } else {
                this.beamshape = castBetween(this.body, this.beamball, 1, 21)
            }

            if (this.health <= 0) {

            } else {
                if (this.beamshape.doesPerimeterTouch(throbert.body)) {
                    throbert.health -= 1
                    if (throbert.health <= 0) {
                        throbert.health = 0
                    }
                }
                for (let k = 0; k < throbert.sproutventory.length; k++) {
                    if (this.hx1.doesPerimeterTouch(throbert.sproutventory[k].body)) {
                        const link = new LineOPD(this.body, throbert.sproutventory[k].body)
                        const angle = link.angle()
                        throbert.sproutventory[k].body.xmom = -Math.cos(angle) * 4
                        throbert.sproutventory[k].body.ymom = -Math.sin(angle) * 4
                        throbert.sproutventory[k].cling = 0
                    }
                    if (this.hx2.doesPerimeterTouch(throbert.sproutventory[k].body)) {
                        const link = new LineOPD(this.body, throbert.sproutventory[k].body)
                        const angle = link.angle()
                        throbert.sproutventory[k].body.xmom = -Math.cos(angle) * 4
                        throbert.sproutventory[k].body.ymom = -Math.sin(angle) * 4
                        throbert.sproutventory[k].cling = 0
                    }
                    if (this.beaming != 1) {
                        if (this.body.doesPerimeterTouch(throbert.sproutventory[k].body)) {
                            const link = new LineOPD(this.body, throbert.sproutventory[k].body)
                            const angle = link.angle()
                            throbert.sproutventory[k].body.xmom = -Math.cos(angle) * 4
                            throbert.sproutventory[k].body.ymom = -Math.sin(angle) * 4
                            throbert.sproutventory[k].cling = 0
                        }
                    }
                    if (throbert.sproutventory[k].grounded != 1 && throbert.sproutventory[k].grab != 1 && throbert.sproutventory[k].fly <= 0) {
                        if (this.beamshape.isPointInside(throbert.sproutventory[k].body)) {

                            if (throbert.sproutventory[k].bloomdriptimer <= 0) {
                                if (throbert.sproutventory[k].bloom <= 0) {
                                    if (throbert.sproutventory[k].friction != 0) {
                                        throbert.sproutventory[k].marked = 20
                                        throbert.sproutventory[k].body.xmom = 0
                                        throbert.sproutventory[k].body.ymom = 0
                                        throbert.sproutventory[k].body.friction = 0
                                    }
                                } else {
                                    throbert.sproutventory[k].bloomdriptimer = 20
                                    throbert.sproutventory[k].bloom -= 1
                                }
                            }
                        }
                    }
                }
            }


            if (this.health <= 0) {
                this.body.draw()
                // this.hx1.draw()
                // this.hx2.draw()
            } else {
                this.beamball.x = this.body.x + (Math.cos(this.angle) * this.beamdis)
                this.beamball.y = this.body.y + (Math.sin(this.angle) * this.beamdis)
                this.beamball2.x = this.beamball.x
                this.beamball2.y = this.beamball.y
                this.beamball.draw()
                this.beamlink.draw()
                this.beamball2.draw()
                this.beamlink2.draw()
                // this.body.draw()
                if (this.pulse != 1) {
                    canvas_context.drawImage(bosscircle, this.body.x - this.body.radius, this.body.y - this.body.radius)

                } else {
                    canvas_context.drawImage(bosscirclepulse, this.body.x - this.body.radius, this.body.y - this.body.radius)

                }
                this.hx1.draw()
                this.hx2.draw()

                this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)

                if (this.health != this.maxhealth && this.marked != 1) {
                    this.healthbar.draw()
                }
            }
            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
            this.p2.draw()
            this.p1.draw()
            this.body.health = this.health
        }
    }

    class Gloobleglat {
        constructor(x, y) {
            this.body = new Circle(x, y, 12, "red")
            this.bodyarea = new Circle(x, y, 120, "red")
            this.go = this.body
            this.health = 3000
            this.maxhealth = this.health
            this.value = 12
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 10
            this.body.weight = 1 / this.weight
            this.body.friction = .9
            this.cycle = 0
            this.playlink = new LineOPD(this.body, throbert.body)
            this.pulse = 0
            this.firstdead =0
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 750) {
                return
            }

            if (this.health <= 0) {
                this.body.smove()
                if (this.firstdead == 0) {
                    this.firstdead = 1
                    for (let t = 0; t < enemysounds.length; t++) {
                        if (enemysounds[t].paused) {
                            enemysounds[t].play()
                            break
                        }
                    }
                }
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                                // if (true) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {

                                    const hyp = link.hypotenuse()
                                    const angle = link.angle()
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (link.hypotenuse() <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                }
                                // }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {

                if (this.health < this.maxhealth) {
                    this.cycle++
                    if ((this.cycle % 60).between(50, 59)) {
                        this.body.radius = 12 + Math.abs(5 - (this.cycle % ten))
                        this.pulse = 1
                    } else {
                        this.pulse = 0
                        this.body.radius = 12
                    }
                }


                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    if (this.health == this.maxhealth) {
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.06666666666
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.06666666666
                    } else {
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.46666666666
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.46666666666
                    }
                }
            } else {
                this.pulse = 0
                this.body.radius = 12
            }
            // if (this.health > 0) {
            //     if (this.body.doesPerimeterTouch(this.go)) {
            //         this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         while (!this.go.doesPerimeterTouch(this.bodyarea)) {
            //             this.go = new Circle(this.body.x + ((Math.random() - .5) * 100), this.body.y + ((Math.random() - .5) * 100), 10, "red")
            //         }
            //     } else {
            //         this.body.x -= Math.sign(this.body.x - this.go.x)
            //         this.body.y -= Math.sign(this.body.y - this.go.y)
            //     }
            // }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)

            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // this.body.draw()
            canvas_context.drawImage(bumper, 0, 0, bumper.width, bumper.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            this.body.health = this.health

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }
    class Nectar {
        constructor(x, y) {
            this.body = new Circle(x, y, 20, "#FFAA0088", 0, 0)
            this.playlink = new LineOPD(this.body, throbert.body)
            this.nectar = 1
        }
        speedlimit() {
            // let brf = 0
            // while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
            //     brf++
            //     if (brf > 8) {
            //         break
            //     }
            //     this.body.xmom *= .8
            //     this.body.ymom *= .8
            //     this.body.sxmom *= .8
            //     this.body.symom *= .8
            // }
        }
        draw() {
            if (this.playlink.hypotenuse() > 750) {
                return
            }
            this.body.draw()
            for (let t = 0; t < throbert.sproutventory.length; t++) {
                if (throbert.sproutventory[t].bloom < 2) {
                    if (this.body.doesPerimeterTouch(throbert.sproutventory[t].body)) {
                        this.body.radius--
                        throbert.sproutventory[t].bloom++
                        throbert.sproutventory[t].body.xmom = 0
                        throbert.sproutventory[t].body.ymom = 0
                        if (this.body.radius <= 0) {
                            this.spliceout = 1
                            this.marked = 1
                        }
                    }
                }
            }

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }


    const ploosheet = new Image()
    ploosheet.src = "ploosheet.png"

    class Ploorenab {
        constructor(x, y) {
            this.body = new Circle(x, y, 6, "pink")
            this.bodyarea = new Circle(x, y, 150, "pink")
            this.go = this.body
            this.health = 300
            this.maxhealth = this.health
            this.value = 3
            this.body.timer = 999999999999 * 999999999999
            this.body.health = this.health
            this.weight = 3
            this.body.weight = 1 / this.weight
            this.body.friction = .89
            this.playlink = new LineOPD(this.body, throbert.body)
            this.step = Math.floor(Math.random() * 18)
            this.type = Math.floor(Math.random() * 2)
            this.firstdead =0
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 750) {
                return
            }
            if (this.health <= 0) {
                this.body.smove()


                if (this.firstdead == 0) {
                    this.firstdead = 1
                    for (let t = 0; t < enemysounds.length; t++) {
                        if (enemysounds[t].paused) {
                            enemysounds[t].play()
                            break
                        }
                    }
                }
            } else {

                for (let x = 0; x < 20; x++) {
                    this.body.frictiveMove10()
                    this.xcord = Math.floor((this.body.x) * .1) * ten
                    this.xcord = Math.max(this.xcord, 0)
                    this.xcord = Math.min(this.xcord, 10230)
                    this.ycord = Math.floor((this.body.y) * .1) * ten
                    this.ycord = Math.max(this.ycord, 0)
                    this.ycord = Math.min(this.ycord, 10230)
                    // ////console.log(this.xcord, this.ycord)
                    if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                        for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                            for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                                // if (true) {
                                const link = new LineOPD(this.body, throbert.road[`${t},${k}`])

                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    const hyp = link.hypotenuse()
                                    const angle = link.angle()
                                    if (hyp <= ten + this.body.radius) {
                                        if (hyp <= ten + this.body.radius) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        } else if (hyp <= ten) {
                                            if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .159) {

                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2
                                                this.body.ymom = Math.sin(angle) * 2
                                                this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                                            }
                                        }
                                    }
                                    // }
                                }
                            }
                        }
                    }
                }
            }
            if (this.health > 0) {

                if (this.type == 1) {
                    this.step++
                } else {
                    this.step += 17
                }
                if (this.body.doesPerimeterTouch(this.go)) {
                    this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    let j = 0
                    while (!this.go.doesPerimeterTouch(this.bodyarea)) {
                        j++
                        if (j > ten) {
                            break
                        }
                        this.go = new Point(this.body.x + ((Math.random() - .5) * 300), this.body.y + ((Math.random() - .5) * 300))
                    }
                } else {
                    if (this.health == this.maxhealth) {
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.1
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.1
                    } else {
                        this.body.xmom -= Math.sign(this.body.x - this.go.x) * 0.2
                        this.body.ymom -= Math.sign(this.body.y - this.go.y) * 0.2
                    }
                }
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.healthbar = new Rectangle(this.body.x - this.body.radius, this.body.y + (this.body.radius * 1.2), (this.body.radius * 2) * (this.health / this.maxhealth), 5, `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`)

            if (this.health != this.maxhealth && this.marked != 1) {
                this.healthbar.draw()
            }
            // this.body.draw()
            canvas_context.drawImage(ploosheet, 12 * (this.step % 18), 0, 12, 12, this.body.x - this.body.radius, this.body.y - this.body.radius, 12, 12)
            this.body.health = this.health

            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }
    function empty() {
    }



    const shotspritem = new Image()
    shotspritem.src = "shotspritem.png"
    const shotspritey = new Image()
    shotspritey.src = "shotspritey.png"
    const shotspritec = new Image()
    shotspritec.src = "shotspritec.png"


    const bubblerm = new Image()
    bubblerm.src = "bubblerm.png"
    const bubblery = new Image()
    bubblery.src = "bubblery.png"
    const bubblerc = new Image()
    bubblerc.src = "bubblerc.png"

    const crabm = new Image()
    crabm.src = "crabm.png"
    const craby = new Image()
    craby.src = "craby.png"
    const crabc = new Image()
    crabc.src = "crabc.png"

    const doodlem = new Image()
    doodlem.src = "doodlem.png"
    const bumper = new Image()
    bumper.src = "bumper.png"
    const doodley = new Image()
    doodley.src = "doodley.png"
    const doodlec = new Image()
    doodlec.src = "doodlec.png"
    const gearsheet = new Image()
    gearsheet.src = "enginesheet.png"
    canvas_context.drawImage(gearsheet,0,0)
    const spinbox = new Image()
    spinbox.src = "spinbox.png"
    canvas_context.drawImage(spinbox,0,0)
    const orbpartsheet = new Image()
    orbpartsheet.src = "orbpartsheet.png"
    canvas_context.drawImage(orbpartsheet,0,0)
    const snakepart = new Image()
    snakepart.src = "snakepart.png"
    canvas_context.drawImage(snakepart,0,0)
    const bubblepart = new Image()
    bubblepart.src = "bubblepart.png"
    canvas_context.drawImage(bubblepart,0,0)
    const clockwork = new Image()
    clockwork.src = "clocksmall.png"
    canvas_context.drawImage(clockwork,0,0)
    const harmlessdisarmerpart = new Image()
    harmlessdisarmerpart.src = "harmlessdisarmerpartinv.png"
    canvas_context.drawImage(gearsheet,0,0)
    const rainbowfuelpart = new Image()
    rainbowfuelpart.src = "fuelout.png"
    canvas_context.drawImage(rainbowfuelpart,0,0)
    const warjarpart = new Image()
    warjarpart.src = "warjar.png"
    canvas_context.drawImage(warjarpart,0,0)
    const brainpart = new Image()
    brainpart.src = "brainpart.png"
    canvas_context.drawImage(brainpart,0,0)
    const mirrorpart = new Image()
    mirrorpart.src = "mirrorpart2.png"
    canvas_context.drawImage(mirrorpart,0,0)
    const radar = new Image()
    radar.src = "radarpart.png"
    canvas_context.drawImage(radar,0,0)
    const drive = new Image()
    drive.src = "drivepart.png"
    canvas_context.drawImage(drive,0,0)
    const boidpart = new Image()
    boidpart.src = "boidpart.png"
    canvas_context.drawImage(boidpart,0,0)
    const combatpart = new Image()
    combatpart.src = "combatpart.png"
    canvas_context.drawImage(combatpart,0,0)
    const labpartsmall = new Image()
    labpartsmall.src = "labpartsmall.png"
    canvas_context.drawImage(labpartsmall,0,0)
    const fuellinepart = new Image()
    fuellinepart.src = "fuellinepart.png"
    canvas_context.drawImage(labpartsmall,0,0)
// console.log(clockwork.width)
    // while(clockwork.width <= 0){
    //     canvas_context.drawImage(clockwork,0,0)
    // }




    class Part {
        constructor(x, y, type) {
            this.healthbar = new Rectangle(0, 0, 0, 0, "red")
            // this.healthbar.draw = empty
            this.body = new Circle(x, y, 30, "red")
            this.step = 0
            this.type = type
            this.playlink = new LineOPD(this.body, throbert.body)
            this.health = 0
            this.maxhealth = 100000
            this.body.health = this.health
            this.drawn = 0

            if(this.type == 0){
                this.weight = 400
            }
            if(this.type == 1){
                this.weight = 180
            }
            if(this.type == 2){
                this.weight = 50
            }
            if(this.type == 3){
                this.weight = 123
            }
            if(this.type == 4){
                this.weight = 321
            }
            if(this.type == 5){
                this.weight = 71
            }
            if(this.type == 6){
                this.weight = 300
            }
            if(this.type == 7){
                this.weight = 59
            }
            if(this.type == 8){
                this.weight = 590
            }
            if(this.type == 9){
                this.weight = 140
            }
            if(this.type == 10){
                this.weight = 69
            }
            if(this.type == 11){
                this.weight = 42
            }
            if(this.type == 12){
                this.weight = 74
            }
            if(this.type == 13){
                this.weight = 169
            }
            if(this.type == 14){
                this.weight = 100
            }
            if(this.type == 15){
                this.weight = 60
            }
            if(this.type == 16){
                this.weight = 256
            }
            this.body.weight = 1 / this.weight
            this.body.timer = 999999999999 * 999999999999
        }
        speedlimit() {
            let brf = 0
            while (Math.abs(this.body.xmom) + Math.abs(this.body.ymom) + Math.abs(this.body.sxmom) + Math.abs(this.body.symom) > globalspeedlimit) {
                brf++
                if (brf > 8) {
                    break
                }
                this.body.xmom *= .8
                this.body.ymom *= .8
                this.body.sxmom *= .8
                this.body.symom *= .8
            }
        }
        draw() {
            if (this.playlink.hypotenuse() > 740 && this.drawn >= 100) {
                return
            }
            if (this.health <= 0) {
                this.body.smove()
            }
            this.body.timer--
            if (this.body.timer <= 0) {
                this.spliceout = 1
            }
            this.body.health = this.health
            this.body.draw()
            this.step++
            if (this.type == 0) {
                this.drawn++
                canvas_context.drawImage(gearsheet, (this.step % 305) * (gearsheet.width / 305), 0, gearsheet.width / 305, gearsheet.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            }

            if (this.type == 1) {
                this.drawn++
                canvas_context.drawImage(spinbox, (this.step % 524) * (spinbox.width / 524), 0, spinbox.width / 524, spinbox.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            }

            if (this.type == 2) {
                this.drawn++
                canvas_context.drawImage(orbpartsheet, (this.step % 606) * (orbpartsheet.width / 606), 0, orbpartsheet.width / 606, orbpartsheet.height, this.body.x - this.body.radius, this.body.y - this.body.radius, this.body.radius * 2, this.body.radius * 2)
            }

            if (this.type == 3) {
                this.drawn++
                canvas_context.drawImage(snakepart, (this.step % 1126) * (snakepart.width / 1126), 0, snakepart.width / 1126, snakepart.height, this.body.x - (this.body.radius*.9), this.body.y - (this.body.radius*.9), this.body.radius * 1.8, this.body.radius * 1.8)
            }

            if (this.type == 4) {
                this.drawn++
                canvas_context.drawImage(bubblepart, (this.step % 323) * (bubblepart.width / 323), 0, bubblepart.width / 323, bubblepart.height, this.body.x - (this.body.radius), this.body.y - (this.body.radius), this.body.radius * 2, this.body.radius * 2)
            }

            if (this.type == 5) {
                this.drawn++
                canvas_context.drawImage(harmlessdisarmerpart, (this.step % 71) * (harmlessdisarmerpart.width / 71), 0, harmlessdisarmerpart.width / 71, harmlessdisarmerpart.height, this.body.x - (this.body.radius*2), this.body.y - (this.body.radius*2), this.body.radius * 4, this.body.radius * 4)
            }

            if (this.type == 6) {
                this.drawn++
                // this.step+=11
                canvas_context.drawImage(rainbowfuelpart, (this.step % 896) * (rainbowfuelpart.width / 896), 0, rainbowfuelpart.width / 896, rainbowfuelpart.height, this.body.x - (this.body.radius*1), this.body.y - (this.body.radius*1), this.body.radius * 2, this.body.radius * 2)
            }
            if (this.type == 7) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(clockwork, (this.step % 355) * (clockwork.width / 355), 0, clockwork.width / 355, clockwork.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 8) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(warjarpart, (this.step % 1902) * (warjarpart.width / 1902), 0, warjarpart.width / 1902, warjarpart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 9) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(brainpart, (this.step % 1128) * (brainpart.width / 1128), 0, brainpart.width / 1128, brainpart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 10) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(mirrorpart, (this.step % 244) * (mirrorpart.width / 244), 0, mirrorpart.width / 244, mirrorpart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 11) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(radar, (this.step % 104) * (radar.width / 104), 0, radar.width / 104, radar.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 12) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(drive, (this.step % 326) * (drive.width / 326), 0, drive.width / 326, drive.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 13) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(boidpart, (this.step % 684) * (boidpart.width / 684), 0, boidpart.width / 684, boidpart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 14) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(combatpart, (this.step % 730) * (combatpart.width / 730), 0, combatpart.width / 730, combatpart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 15) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(labpartsmall, (this.step % 910) * (labpartsmall.width / 910), 0, labpartsmall.width / 910, labpartsmall.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            if (this.type == 16) {
                this.drawn++
                // this.step+=4
                canvas_context.drawImage(fuellinepart, (this.step % 910) * (fuellinepart.width / 910), 0, fuellinepart.width / 910, fuellinepart.height, this.body.x - (this.body.radius*1.0), this.body.y - (this.body.radius*1.0), this.body.radius * 2.0, this.body.radius * 2.0)
            }
            
            if (throbert.body.doesPerimeterTouch(this.body)) {
                const angle = this.playlink.angle()
                throbert.body.xmom -= Math.cos(angle) * 6.1
                throbert.body.ymom -= Math.sin(angle) * 6.1
            }
        }
    }

    class Throbert {
        constructor() {
            this.smack = 0
            this.lmom = 50
            this.kmom = 50
            this.jmom = 50
            this.imom = 50
            this.t = 512
            this.k = 512
            this.nodemap = nodemap17
            this.mode = 0
            if (this.mode == 1) {
                // this.map = pumpmap
            } else {
                this.map = fatmap
            }
            // //console.log(this.map)
            this.road = {}
            this.c1 = new CircleS(5120, 5120, 16, "magenta")
            this.c2 = new CircleS(5120, 5120, 20, "yellow")
            this.c3 = new CircleS(5120, 5120, 24, "cyan")
            if (this.mode == 0) {
                for (let t = 0; t < 1024; t++) {
                    for (let k = 0; k < 1024; k++) {
                        // if(!(this.map[`${t * 10},${k * 10}`])){
                        //     //console.log(t,k)
                        // }
                        const rect = new PointD((t * ten) + 5, (k * ten) + 5)
                        rect.z = ((this.map[`${t * ten},${k * ten}`].z) * 1.5)
                        // //console.log(rect.z)
                        this.road[`${t * ten},${k * ten}`] = rect
                    }
                }
            } else {

                for (let t = 0; t < 1024; t++) {
                    for (let k = 0; k < 1024; k++) {
                        // if(!(this.map[`${t * 10},${k * 10}`])){
                        //     //console.log(t,k)
                        // }
                        const rect = new PointD((t * ten) + 5, (k * ten) + 5)
                        rect.z = 1 - ((this.map[`${t * ten},${k * ten}`].z))
                        // //console.log(rect.z)
                        this.road[`${t * ten},${k * ten}`] = rect
                    }
                }
            }
            // for (let t = 0; t < this.nodes.length; t++) {
            //     let pri = this.nodes[t].priority
            //     let count = 1
            //     for (let k = 0; k < this.nodes[t].neighbors.length; k++) {
            //         pri += this.nodes[t].neighbors[k].priority
            //         count++
            //     }
            //     let avg = pri / count
            //     this.nodes[t].priority = ((avg) + (this.nodes[t].priority * 10000)) / 10001
            // }
            // ////console.log(this)
            this.body = new Circle(5120, 5120, 7, "#090909")
            canvas_context.translate(-(1920 + 2560), -((1920 + 2560) + 300))
            this.seek = new CircleS(5120, 5120, 8, "#FF00FF")
            this.sproutventory = []
            this.supersize = 10
            this.nonlocal = []
            this.health = 100
            this.maxhealth = this.health
            this.first = 0

            // for (let t = 0; t < 10; t++) {
            //     let plug = new Crab(2560 + ((Math.random() - .5) * 1200), 2560 + (Math.random() * 800), ['red', "magenta", "orange"])
            //     this.enemies.push(plug)
            //     let plug2 = new Ploorenab(2560 + ((Math.random() - .5) * 1200), 2560 + (Math.random() * 800))
            //     this.enemies.push(plug2)
            // }


            this.grab = 0
            this.seekx = 0
            this.seeky = 0
            this.worldmap = new Image()
            if (this.mode == 0) {
                this.worldmap.src = "mediumwebmap.png" //fatmap
            } else {
                this.worldmap.src = "pikmap4202.png"
            }
            this.captain = new Image()
            this.captain.src = "imago4bl.png"

            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)
            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)

            // this.data = canvas_context.getImageData(-640, -940, 2560, 2560)
            // ////console.log(this)
            this.playlink = new LineOPD(this.c1, this.body)
            this.paths = []
            this.nodes = []
            this.renode()
        }
        renode() {
            //console.time("nodes")
            let nodespecial = new CircleS(8761, 6195, 600, "Red")
            nodespecial.priority = 8 //this.nodemap[t].z //- (t/100000)
            // //console.log(t,node.priority)
            nodespecial.small = new CircleS(8761, 6195, 20, "Red")
            nodespecial.equity = new CircleS(8761, 6195, 660, "Red")
            nodespecial.big = new CircleS(8761, 6195, 200, "Red")

            let nodespecial2 = new CircleS(700, 9700, 600, "Red")
            nodespecial2.priority = 100
            nodespecial2.small = new CircleS(700, 9700, 20, "Red")
            nodespecial2.equity = new CircleS(700, 9700, 660, "Red")
            nodespecial2.big = new CircleS(700, 9700, 200, "Red")
            let nodespecial3 = new CircleS(7444, 9756, 600, "Red")
            nodespecial3.priority = 100 //this.nodemap[t].z //- (t/100000)
            nodespecial3.small = new CircleS(7444, 9756,  20, "Red")
            nodespecial3.equity = new CircleS(7444, 9756, 660, "Red")
            nodespecial3.big = new CircleS(7444, 9756, 200, "Red")
            let nodespecial4 = new CircleS(300, 9009, 600, "Red")
            nodespecial4.priority = 99
            nodespecial4.small = new CircleS(300, 9009, 20, "Red")
            nodespecial4.equity = new CircleS(300, 9009, 660, "Red")
            nodespecial4.big = new CircleS(300, 9009, 200, "Red")

            let nodespecial5 = new CircleS(450, 9400, 600, "Red")
            nodespecial5.priority = 99.5
            nodespecial5.small = new CircleS(450, 9400, 20, "Red")
            nodespecial5.equity = new CircleS(450, 9400, 660, "Red")
            nodespecial5.big = new CircleS(450, 9400, 200, "Red")

            let nodespecial6 = new CircleS(100, 8600, 600, "Red")
            nodespecial6.priority = 98
            nodespecial6.small = new CircleS(100, 8600, 20, "Red")
            nodespecial6.equity = new CircleS(100, 8600, 660, "Red")
            nodespecial6.big = new CircleS(100, 8600, 200, "Red")

            let nodespecial7 = new CircleS(6951, 9483, 600, "Red")
            nodespecial7.priority = 12
            nodespecial7.small = new CircleS(6951, 9483, 20, "Red")
            nodespecial7.equity = new CircleS(6951, 9483, 660, "Red")
            nodespecial7.big = new CircleS(6951, 9483, 200, "Red")

            let nodespecial8 = new CircleS(7148, 9257, 600, "Red")
            nodespecial8.priority = 13
            nodespecial8.small = new CircleS(7148, 9257, 20, "Red")
            nodespecial8.equity = new CircleS(7148, 9257, 660, "Red")
            nodespecial8.big = new CircleS(7148, 9257, 200, "Red")


            this.nodes = [nodespecial, nodespecial2, nodespecial3, nodespecial4, nodespecial5, nodespecial6, nodespecial7, nodespecial8]
            for (let t = 0; t < this.nodemap.length; t++) {
                let node = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 600, "Red")
                node.priority = this.nodemap[t].z //- (t/100000)
                // //console.log(t,node.priority)
                node.small = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 20, "Red")
                node.equity = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 660, "Red")
                node.big = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 200, "Red")
                let wet = 0
                // for (let k = 0; k < this.nodes.length; k++) {
                //     if (node.big.doesPerimeterTouch(this.nodes[k].small)) {
                //         wet = 1
                //     }
                // }
                // if(wet == 0){
                if (this.nodemap[t].x.between(1300, 1500) && this.nodemap[t].y.between(4600, 4900)) {
                } else if (this.nodemap[t].x.between(1000, 1100) && this.nodemap[t].y.between(5250, 5450)) {
                } else if (this.nodemap[t].x.between(1750, 1950) && this.nodemap[t].y.between(4600, 4800)) {
                    // } else    if (this.nodemap[t].x.between(8100, 8400) && this.nodemap[t].y.between(2400, 2600)) {
                } else if (this.nodemap[t].x.between(8600, 8800) && this.nodemap[t].y.between(6100, 6300)) {
                    this.nodemap[t].x += 50
                    this.nodemap[t].y -= 50
                    node = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 600, "Red")
                    node.priority = this.nodemap[t].z //- (t/100000)
                    // //console.log(t,node.priority)
                    node.small = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 20, "Red")
                    node.equity = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 660, "Red")
                    node.big = new CircleS(this.nodemap[t].x, this.nodemap[t].y, 200, "Red")
                } else {
                    this.nodes.push(node)
                }
                // }
            }
            this.paths = []
            for (let k = 0; k < this.nodes.length; k++) {
                this.nodes[k].paths = []
                this.nodes[k].neighbors = []
            }

            for (let k = 0; k < this.nodes.length; k++) {
                // this.nodes[k].paths = []

                for (let t = 0; t < this.nodes.length; t++) {
                    if (k != t) {
                        if (this.nodes[k].priority > this.nodes[t].priority) {
                        } else {
                            continue
                        }
                        let link
                        // let x1 = new LineOP(this.nodes[k], this.c1, "red", 2)
                        // let x2 = new LineOP(this.nodes[t], this.c1, "red", 2)
                        // if(x1.hypotenuse()>x2.hypotenuse()){
                        // if (this.nodes[t].priority > this.nodes[k].priority) {
                        //     link = new LineOP(this.nodes[t], this.nodes[k], "red", 2)
                        // } else {
                        //     link = new LineOP(this.nodes[k], this.nodes[t], "red", 2)
                        // }
                        if (this.nodes[t].priority > this.nodes[k].priority) {
                            link = new LineOPD(this.nodes[t], this.nodes[k])
                        } else {
                            link = new LineOPD(this.nodes[k], this.nodes[t])
                        }
                        // }else{
                        //     link = new LineOP(this.nodes[t], this.nodes[k], "red", 2)
                        // }


                        // //console.log(this.path(this.nodes[t], this.nodes[k]))
                        if (link.hypotenuse() < 600) {
                            if (this.path(this.nodes[k], this.nodes[t])) {//this.path(this.nodes[t], this.nodes[k]) &&
                                this.nodes[k].paths.push(link)
                                this.nodes[k].neighbors.push(this.nodes[t])
                                // this.nodes[t].neighbors.push(this.nodes[k])
                                this.paths.push(link)
                            }
                        }
                    }
                }
            }


            //console.timeEnd("nodes")
        }
        path(node, node2) {
            this.target = node2
            const lin = new LineOPD(node2, node)
            const anglemake = lin.angle()
            this.raypoint = new Circle(node.x, node.y, 1, "#FF00FF", Math.cos(anglemake) * 2, Math.sin(anglemake) * 2)
            this.xcord = Math.floor((this.raypoint.x) * .1) * 10
            this.xcord = Math.max(this.xcord, 0)
            this.xcord = Math.min(this.xcord, 10230)
            this.ycord = Math.floor((this.raypoint.y) * .1) * 10
            this.ycord = Math.max(this.ycord, 0)
            this.ycord = Math.min(this.ycord, 10230)

            // let last = this.road[`${this.xcord},${this.ycord}`].z
            // let start = this.road[`${this.xcord},${this.ycord}`].z
            // //console.log(start)
            for (let l = 0; l < (600 * .5); l++) {
                if (this.raypoint.doesPerimeterTouch(node2.small)) {
                    break
                }
                this.raypoint.move()
                this.xcord = Math.floor((this.raypoint.x) * .1) * 10
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 10230)
                this.ycord = Math.floor((this.raypoint.y) * .1) * 10
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 10230)
                for (let t = Math.max(this.xcord - 10, 0); t < Math.min(this.xcord + 20, 10230); t += 10) {
                    for (let k = Math.max(this.ycord - 10, 0); k < Math.min(this.ycord + 20, 10230); k += 10) {
                        // if (true) {
                        const link = new LineOPD(this.raypoint, this.road[`${t},${k}`])

                        // if (Math.abs(start - this.road[`${t},${k}`].z) > .26) {
                        //     return false
                        // }
                        // if (Math.abs(last - this.road[`${t},${k}`].z) > .09) {
                        //     return false
                        // }
                        if (link.hypotenuse() <= 8) {
                            if ((Math.abs(this.road[`${t},${k}`].z - this.road[`${this.xcord},${this.ycord}`].z) >= .2)) {
                                return false
                            }
                            // }
                        }
                    }
                }
                // last = this.road[`${this.xcord},${this.ycord}`].z
            }
            return true
        }
        path2(node, node2) {
            this.target = node2
            const lin = new LineOPD(node2, node)
            const anglemake = lin.angle()
            this.raypoint = new Circle(node.x, node.y, 1, "#FF00FF", Math.cos(anglemake) * ten, Math.sin(anglemake) * ten)
            this.xcord = Math.floor((this.raypoint.x) * .1) * ten
            this.xcord = Math.max(this.xcord, 0)
            this.xcord = Math.min(this.xcord, 10230)
            this.ycord = Math.floor((this.raypoint.y) * .1) * ten
            this.ycord = Math.max(this.ycord, 0)
            this.ycord = Math.min(this.ycord, 10230)

            // let last = this.road[`${this.xcord},${this.ycord}`].z
            // let start = this.road[`${this.xcord},${this.ycord}`].z
            // //console.log(start)
            for (let l = 0; l < (660 * .1); l++) { //600
                if (this.raypoint.doesPerimeterTouch(node2.small)) {
                    break
                }
                this.raypoint.move()
                this.xcord = Math.floor((this.raypoint.x) * .1) * ten
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 10230)
                this.ycord = Math.floor((this.raypoint.y) * .1) * ten
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 10230)
                for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                    for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {
                        // if (true) {
                        // let point = 
                        const link = new LineOPD(this.raypoint, this.road[`${t},${k}`])
                        if (link.hypotenuse() <= 12) {
                            if ((Math.abs(this.road[`${t},${k}`].z - this.road[`${this.xcord},${this.ycord}`].z) >= .2)) {
                                return false
                            }
                        }
                        // }
                    }
                }
                // last = this.road[`${this.xcord},${this.ycord}`].z
            }
            return true
        }
        feel() {
            // canvas_context.drawImage(this.worldmap, 0,0,128,128, -640,-940,2560,2560)
            // this.data = canvas_context.getImageData(-640, -940, 2560, 2560)
        }
        spawn(num) {
            this.angle = 0
            let sworp = 0
            for (let t = 0; t < num; t++) {
                const sprout = new Sproutfolk(this.c1.x + (Math.cos(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4))), this.c1.y + (Math.sin(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4))), t % 3)
                let wet = 1
                while (wet == 1) {
                    wet = 0
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        if (this.sproutventory[k].grounded == 1) {
                            if (this.sproutventory[k].body.doesPerimeterTouch(sprout.body)) {
                                wet = 1
                                sworp += .1
                                sprout.body.x = this.c1.x + (Math.cos(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4)))
                                sprout.body.y = this.c1.y + (Math.sin(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4)))
                            }
                        }
                    }
                }
                this.sproutventory.push(sprout)
                ////console.log(sprout)
            }


            // for (let k = 0; k < this.enemies.length; k++) {
            //     this.enemies[k].elinks = []
            // }

            for (let t = 0; t < this.sproutventory.length; t++) {
                if (typeof this.sproutventory[t].elinks == "undefined") {
                    this.sproutventory[t].links = []
                    this.sproutventory[t].elinks = []
                }
                for (let k = 0; k < this.enemies.length; k++) {
                    const link = new LineOPD(this.sproutventory[t].body, this.enemies[k].body)
                    this.sproutventory[t].elinks[k] = link
                    this.enemies[k].elinks[t] = link
                }
                for (let k = 0; k < this.sproutventory.length; k++) {
                    const link = new LineOPD(this.sproutventory[t].body, this.sproutventory[k].body)
                    this.sproutventory[t].links[k] = link
                    this.sproutventory[k].links[t] = link
                }
            }




        }
        generate(num) {
            this.angle = 0
            let sworp = 0
            for (let t = 0; t < num; t++) {
                // let k= t
                // t= 0
                const sprout = new Sproutfolk(this.c1.x + (Math.cos(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4))), this.c1.y + (Math.sin(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4))), t % 3)
                let wet = 1
                // t = k
                while (wet == 1) {
                    wet = 0
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        if (this.sproutventory[k].grounded == 1) {
                            if (this.sproutventory[k].body.doesPerimeterTouch(sprout.body)) {
                                wet = 1
                                sworp += .1
                                sprout.body.x = this.c1.x + (Math.cos(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4)))
                                sprout.body.y = this.c1.y + (Math.sin(this.angle + ((Math.PI / (4.5)) * (t + sworp))) * (40 + ((t + sworp) * 1.4)))
                            }
                        }
                    }
                }
                this.sproutventory.push(sprout)
                ////console.log(sprout)
            }
            for (let k = 0; k < this.enemies.length; k++) {
                this.enemies[k].elinks = []
            }

            // for (let t = 0; t < this.sproutventory.length; t++) {
            //     this.sproutventory[t].links = []
            //     this.sproutventory[t].elinks = []
            //     for (let k = 0; k < this.enemies.length; k++) {
            //         const link = new LineOPD(this.sproutventory[t].body, this.enemies[k].body)
            //         this.sproutventory[t].elinks[k] = link
            //         this.enemies[k].elinks[t] = link
            //     }
            //     for (let k = t; k < this.sproutventory.length; k++) {
            //         const link = new LineOPD(this.sproutventory[t].body, this.sproutventory[k].body)
            //         this.sproutventory[t].links[k] = link
            //         this.sproutventory[k].links[t] = link
            //     }
            // }

            for (let t = 0; t < this.sproutventory.length; t++) {
                if (typeof this.sproutventory[t].elinks == "undefined") {
                    this.sproutventory[t].links = []
                    this.sproutventory[t].elinks = []
                }
                for (let k = 0; k < this.enemies.length; k++) {
                    const link = new LineOPD(this.sproutventory[t].body, this.enemies[k].body)
                    this.sproutventory[t].elinks[k] = link
                    this.enemies[k].elinks[t] = link
                }
                for (let k = 0; k < this.sproutventory.length; k++) {
                    const link = new LineOPD(this.sproutventory[t].body, this.sproutventory[k].body)
                    this.sproutventory[t].links[k] = link
                    this.sproutventory[k].links[t] = link
                }
            }

        }
        draw() {

            // if(keysPressed['x']){
            //     this.nodemap.splice(this.nodemap.length-1,1)
            //     this.renode()
            //     keysPressed = {}
            // }
            // if(keysPressed['l']){
            //     //console.log(JSON.stringify(this.nodemap))
            // }
            // if(keysPressed['r']){
            //     globalPrio++
            //     keysPressed = {}
            // }
            // if(keysPressed['f']){
            //     globalPrio--
            //     keysPressed = {}
            // }
            // if(keysPressed[' ']){
            //     let node = {}
            //     node.x = this.body.x
            //     node.y = this.body.y
            //     node.z = globalPrio
            //     this.nodemap.push(node)
            //     this.renode()
            //     keysPressed = {}
            // }
            // this.sproutventory = this.sproutventory.sort((a,b) => a.body.y < b.body.y ? 1 : -1)

            if (this.first == 0) {
                this.first = 1
                this.enemies = [] //[new Gloobleglat(2300, 2660), new Gloobleglat(2560, 2800), new Gloobleglat(2860, 2660), new Gloobleglat(2300 + 900, 2560), new Gloobleglat(2560, 2800 + 900), new Gloobleglat(2860 + 900, 2560 + 900)]
               


                const engine = new Part(4800, 4800, 0)
                this.enemies.push(engine)

                const rotor = new Part(6500, 6500, 1)
                rotor.body.color = "#909090"
                this.enemies.push(rotor)

                const orbpart = new Part(600, 6500, 2)
                orbpart.body.color = "#FFFF00"
                this.enemies.push(orbpart)

                const snakepartpart = new Part(4700, 7333, 3)
                snakepartpart.body.color = "#00AA00"
                this.enemies.push(snakepartpart)

                const bupplepart = new Part(6472, 1346, 4)
                bupplepart.body.radius *= .75
                bupplepart.body.color = "#DDDDDD"
                this.enemies.push(bupplepart)

                const armpart = new Part(3883, 3223, 5)
                armpart.body.radius *= .75
                armpart.body.color = "#FF00AA"
                this.enemies.push(armpart)

                const fuelpart = new Part(9000, 300, 6)
                fuelpart.body.color = "#000000"
                fuelpart.body.radius *= .75
                this.enemies.push(fuelpart)

                const clockpart =new Part(5200, 4143, 7)
                clockpart.body.color = "#FFFFFF"
                // clockpart.body.radius *= .75
                clockpart.body.radius *= 2
                this.enemies.push(clockpart)

                const warjar = new Part(6200, 9200, 8)
                warjar.body.color = "#8844FF"
                warjar.body.radius *= 2
                this.enemies.push(warjar)


                const brainjar = new Part(4467, 6529,  9)
                brainjar.body.color = "#FF8844"
                this.enemies.push(brainjar)


                const mirrorjar = new Part(9000, 9000,  10)
                mirrorjar.body.color = "#090909"
                mirrorjar.body.radius = 39
                this.enemies.push(mirrorjar)



                const radarpart =  new Part(1111, 1111,  11)
                radarpart.body.color = "#FFFFFF"
                radarpart.body.radius = 35
                this.enemies.push(radarpart)



                const drivepart = new Part(8100, 6900,  12)
                drivepart.body.color = "#00DD55"
                drivepart.body.radius = 25
                this.enemies.push(drivepart)

                const boider = new Part(1450, 9500,  13)
                boider.body.color = "#AAFFAA"
                boider.body.radius = 35
                this.enemies.push(boider)

                const comber = new Part(9000, 6000,  14)
                comber.body.color = "#090919"
                comber.body.radius = 40
                this.enemies.push(comber)

                const labb = new Part(7100, 3000,  15)
                labb.body.color = "#090919"
                labb.body.radius = 25
                this.enemies.push(labb)

                const fuleline = new Part(7200, 9800,  16)
                fuleline.body.color = "#FFFFFF"
                fuleline.body.radius = 25
                this.enemies.push(fuleline)
                // let mod = 5
                // let x = 4600
                // let y = 4600
                // for(let t = 0;t<this.enemies.length;t++){

                //     if(t%5 == 0 && t>0){
                //         x = 4600
                //         y+=150
                //     }
                //     this.enemies[t].body.x = x
                //     this.enemies[t].body.y = y
                //     x+=150
                // }
                
               
                for (let t = 0; t < 8; t++) {
                    const plug = new Crab(3200 + ((Math.random() - .5) * 400), 3200 + ((Math.random() - .5) * 400), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 8; t++) {
                    const plug = new Crab(2205 + ((Math.random() - .5) * 200), 3275 + ((Math.random() - .5) * 200), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 8; t++) {
                    const plug = new Ploorenab(1600 + ((Math.random() - .5) * 400), 3350 + ((Math.random() - .5) * 400), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 18; t++) {
                    const plug = new Gloobleglat(480 + ((Math.random() - .5) * 800), 2934 + ((Math.random() - .5) * 700), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 8; t++) {
                    const plug = new Gloobleglat(2200 + ((Math.random() - .5) * 400), 4700 + ((Math.random() - .5) * 400), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 3; t++) {
                    const plug = new Ploorenab(2200 + ((Math.random() - .5) * 400), 4700 + ((Math.random() - .5) * 400), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }

                for (let t = 0; t < 200; t++) {
                    const plug = new Ploorenab(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 70; t++) {
                    const plug = new Gloobleglat(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 20; t++) {
                    const plug = new Boubyelega(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 20; t++) {
                    const plug = new Hoggelspouzer(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 20; t++) {
                    const plug = new Crab(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    plug.body.x *= 2
                    plug.body.y *= 2
                    this.enemies.push(plug)
                }
                for (let t = 0; t < 90; t++) {
                    const nec = new Nectar(2560 + ((Math.random() - .5) * 5120), 2560 + ((Math.random() - .5) * 5120), ['red', "magenta", "orange"])
                    nec.body.x *= 2
                    nec.body.y *= 2
                    this.enemies.push(nec)
                }

                const cannonboss = new Cannonboss(6172, 1646, ['red', "magenta", "orange"])
                this.enemies.push(cannonboss)

                const crabboss = new UltraCrab(3200 + ((Math.random() - .5) * 400), 3200 + ((Math.random() - .5) * 400), ['red', "magenta", "orange"])
                crabboss.body.x *= 2
                crabboss.body.y *= 2
                this.enemies.push(crabboss)

                const plug = new Hoggelspouzer(2762, 5700, ['red', "magenta", "orange"])
                // plug.body.x *= 2
                // plug.body.y *= 2
                this.enemies.push(plug)


                const stomplegs = new Stomplegs(4367, 6629, ['red', "magenta", "orange"])
                // crabboss.body.x *= 2
                // crabboss.body.y *= 2
                this.enemies.push(stomplegs)


                for (let k = 0; k < this.enemies.length; k++) {
                    this.enemies[k].body.supralinks = []
                    for (let t = 0; t < this.nodes.length; t++) {
                        this.enemies[k].body.supralinks.push(new LineOPD(this.enemies[k].body, this.nodes[t]))
                    }
                }

                throbert.generate(9)
            }


            if (gamepadAPI.buttonsStatus.includes('RB') || gamepadAPI.buttonsStatus.includes('LB') || keysPressed['x'] || keysPressed['z']) {
                if (gamepadAPI.buttonsStatus.includes('LB') || keysPressed['x']) {
                    for (let t = 0; t < this.sproutventory.length; t++) {
                        if (this.sproutventory[t].grounded != 1) {
                            if (this.sproutventory[t].type == 0) {
                                if (this.sproutventory[t].attent == 1) {
                                    this.sproutventory[t].body.xmom = 13
                                    this.sproutventory[t].body.ymom = 13
                                }
                            }
                            if (this.sproutventory[t].type == 1) {
                                if (this.sproutventory[t].attent == 1) {
                                    this.sproutventory[t].body.xmom = -13
                                    this.sproutventory[t].body.ymom = 13
                                }
                            }
                            if (this.sproutventory[t].type == 2) {
                                if (this.sproutventory[t].attent == 1) {
                                    this.sproutventory[t].body.xmom = 0
                                    this.sproutventory[t].body.ymom = - 18.2
                                }
                            }
                        }
                        this.sproutventory[t].attent = -59
                    }
                } else {
                    for (let t = 0; t < this.sproutventory.length; t++) {
                        this.sproutventory[t].attent = -59
                    }
                }
            }
            canvas_context.imageSmoothingEnabled = false
            // canvas_context.drawImage(this.worldmap, 0, 0) ///, 1024, 1024, 0, 0, 10240, 10240)
            // canvas_context.drawImage(this.worldmap, Math.min(Math.max((this.body.x-640)*.25,0),10240*.25), Math.min(Math.max((this.body.y-360)*.25,0),10240*.25), 320,180, Math.min(Math.max(this.body.x-640,0),10240), Math.min(Math.max(this.body.y-360,0),10240), 1280, 720)///, 1024, 1024, 0, 0, 10240, 10240)
            // canvas_context.imageSmoothingEnabled = true
            canvas_context.drawImage(this.worldmap, 0, 0, this.worldmap.width, this.worldmap.height, 0, 0, 10240, 10240) ///, 1024, 1024, 0, 0, 10240, 10240)

            // let data = canvas_context.getImageData(-640, -940, 2560, 2560)
            // this.c1.draw()
            // this.c2.draw()
            // this.c3.draw()

            canvas_context.drawImage(pit, this.c3.x - 24, this.c3.y - 24)

            // for (let t = 0; t < this.nodes.length; t++) {
            //     let link = new LineOP(this.nodes[t], this.body)
            //     if(link.hypotenuse() < 600){
            //         this.nodes[t].color = `rgb(${this.nodes[t].priority*25},${this.nodes[t].priority*10},${128+(this.nodes[t].priority*4)})`
            //         this.nodes[t].draw()
            //         canvas_context.fillStyle = "#FFFF00"
            //         canvas_context.font = "30px arial"
            //         canvas_context.fillText(this.nodes[t].priority, this.nodes[t].x,this.nodes[t].y)
            //     }
            // }

            // for (let t = 0; t < this.paths.length; t++) {
            //     this.paths[t].color = `rgb(${this.paths[t].object.priority*25},${this.paths[t].object.priority*10},${128+(this.paths[t].object.priority*4)})`

            //     // let point = new Point((this.paths[t].object.x+this.paths[t].target.x)*.5, (this.paths[t].object.y+this.paths[t].target.y)*.5)

            //     this.paths[t].width = 4
            //     this.paths[t].draw()
            //     // canvas_context.fillStyle = "#00FF00"
            //     // canvas_context.font = "30px arial"
            //     // canvas_context.fillText(this.paths[t].object.priority+','+this.paths[t].target.priority, point.x,point.y)
            // }
            this.speedplay = 1
            this.volumeplay = 1
            let sum = 0
            this.ijklflag = 0

            if (keysPressed['l']) {
                this.lmom++
                if (this.lmom > 95) {
                    this.lmom = 95
                }
                this.seekx = ((this.seekx * 9) + (this.lmom)) / 10
                sum += 1
                if (!keysPressed[' ']) {
                    this.ijklflag = 1
                }
            } else {
                this.lmom = 50
            }
            if (keysPressed['j']) {
                this.jmom++
                if (this.jmom > 95) {
                    this.jmom = 95
                }
                this.seekx = ((this.seekx * 9) - (this.jmom)) / 10
                sum += 1
                if (!keysPressed[' ']) {
                    this.ijklflag = 1
                }
            } else {
                this.jmom = 50
            }
            if (keysPressed['i']) {
                this.imom++
                if (this.imom > 95) {
                    this.imom = 95
                }
                this.seeky = ((this.seeky * 9) - (this.imom)) / 10
                sum += 1
                if (!keysPressed[' ']) {
                    this.ijklflag = 1
                }
            } else {
                this.imom = 50
            }
            if (keysPressed['k']) {
                this.kmom++
                if (this.kmom > 95) {
                    this.kmom = 95
                }
                this.seeky = ((this.seeky * 9) + (this.kmom)) / 10
                sum += 1
                if (!keysPressed[' ']) {
                    this.ijklflag = 1
                }
            } else {
                this.kmom = 50
            }


            this.clingfilm = 0
            if (this.ijklflag == 1) {
                this.clingfilm = 1
            }
            if (this.guiding == 1) {
                this.clingfilm = 1
                this.seekx = ((this.seekx * 3) + (this.seekz)) * .25
                sum += 1
                this.seeky = ((this.seeky * 3) + (this.seekw)) * .25
            } else {
                if (Math.abs(gamepadAPI.axesStatus[2]) > 0.09 || Math.abs(gamepadAPI.axesStatus[3]) > 0.09) {
                    if (((gamepadAPI.buttonsStatus.includes('Axis-Right') || gamepadAPI.buttonsStatus.includes('DPad-Up')))) {
                        if (this.ijklflag == 1) {
                            this.clingfilm = 1
                        }
                    } else {
                        this.clingfilm = 1
                    }
                    sum += Math.abs(gamepadAPI.axesStatus[2]) * 1
                    this.seekx = ((this.seekx * 9) + ((gamepadAPI.axesStatus[2]) * 95)) * .1
                    sum += Math.abs(gamepadAPI.axesStatus[3]) * 1
                    this.seeky = ((this.seeky * 9) + ((gamepadAPI.axesStatus[3]) * 95)) * .1
                }
            }
            this.volumeplay = sum / 3

            charge.volume = Math.min(this.volumeplay, .9)
            if (!gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                charge.play()
            }

            if (this.grab < 0) {
                this.grab++
            }
            let xdiff = this.body.x
            let ydiff = this.body.y
            // control(this.body, 16)
            this.body.wasdflag = 0
            keycontrol(this.body, 6)
            if (this.body.wasdflag == 0) {
                gamepad_control(this.body, 6)
            }
            this.body.friction = 0.15

            if(this.health <= 0){

                this.health = 0
                this.body.xmom += Math.cos(this.playlink.angle())*20
                this.body.ymom += Math.sin(this.playlink.angle())*20
                if(this.c3.doesPerimeterTouch(this.body)){
                    this.health = this.maxhealth
                }else{
                    this.body.frictiveMove()
                }
            }
            for (let x = 0; x < 20; x++) {
                this.body.frictiveMove10(1)
                this.xcord = Math.floor((this.body.x) * .1) * ten
                this.xcord = Math.max(this.xcord, 0)
                this.xcord = Math.min(this.xcord, 10230)
                this.ycord = Math.floor((this.body.y) * .1) * ten
                this.ycord = Math.max(this.ycord, 0)
                this.ycord = Math.min(this.ycord, 10230)

                this.t = this.xcord
                this.k = this.ycord
                // ////console.log(this.xcord, this.ycord)
                if (throbert.road[`${this.xcord},${this.ycord}`].doesPerimeterTouch(this.body)) {
                    for (let t = Math.max(this.xcord - ten, 0); t < Math.min(this.xcord + 20, 10230); t += ten) {
                        for (let k = Math.max(this.ycord - ten, 0); k < Math.min(this.ycord + 20, 10230); k += ten) {

                            // if (true) {
                            // let point = 
                            const link = new LineOP(this.body, throbert.road[`${t},${k}`])

                            // let linkz = new LineOP(this.clingTo, point)
                            // if (this.clingTo.radius > 0) {

                            //     if (linkz.hypotenuse() <= 14 + this.clingTo.radius) {
                            //         if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .2) {
                            //         } else {
                            //             let link = new LineOP(throbert.c1, this.clingTo)
                            //             this.clingTo.x += Math.cos(link.angle() + (Math.PI * .5)) * 1.8
                            //             this.clingTo.y += Math.sin(link.angle() + (Math.PI * .5)) * 1.8
                            //             this.clingTo.x += Math.cos(linkz.angle()) * 1.8
                            //             this.clingTo.y += Math.sin(linkz.angle()) * 1.8
                            //         }
                            //     }
                            // }

                            const hyp = link.hypotenuse()
                            const angle = link.angle()
                            if (hyp <= eleven) {
                                if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .09) {
                                } else {
                                    if (hyp <= 11) {
                                        if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .1) {

                                        } else {
                                            if (throbert.road[`${t},${k}`].z > throbert.road[`${this.xcord},${this.ycord}`].z) {
                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2.3
                                                this.body.ymom = Math.sin(angle) * 2.3
                                                break
                                            }
                                        }
                                    } else if (hyp <= eleven) {
                                        if (Math.abs(throbert.road[`${t},${k}`].z - throbert.road[`${this.xcord},${this.ycord}`].z) <= .1) {

                                        } else {
                                            if (throbert.road[`${t},${k}`].z > throbert.road[`${this.xcord},${this.ycord}`].z) {
                                            } else {
                                                this.body.xmom = Math.cos(angle) * 2.3
                                                this.body.ymom = Math.sin(angle) * 2.3
                                                break
                                            }
                                        }
                                    }
                                }
                            }
                            // }
                        }
                    }
                }
            }

            this.body.x = Math.min(Math.max(Math.round(this.body.x), 0), 10240)
            this.body.y = Math.min(Math.max(Math.round(this.body.y), 0), 10240)
            xdiff = xdiff - this.body.x
            ydiff = ydiff - this.body.y
            this.seek.x = this.body.x + this.seekx
            this.seek.y = this.body.y + this.seeky
            this.seekline = new LineOP(this.seek, this.body, "magenta", 1)
            this.angf = this.seekline.angle()

            this.pointeredge = new PointD(this.seek.x-(Math.cos(this.angf)*this.seek.radius), this.seek.y-(Math.sin(this.angf)*this.seek.radius))


            this.seeklineedge = new LineOP(this.pointeredge, this.body, "magenta", 2)

            if(this.seek.doesPerimeterTouch(this.body)){

            }else{
                this.seeklineedge.draw()
            }

            // this.seekline.draw()
            this.seek.draw()

            // canvas_context.drawImage(this.captain, 0, 0, this.captain.width, this.captain.height, this.body.x - this.body.radius, this.body.y - this.body.radius, 2 * this.body.radius, 2 * this.body.radius)
            // this.body.draw()
            for (let t = 0; t < this.enemies.length; t++) {
                if (this.enemies[t].spliceout == 1) {
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        this.sproutventory[k].elinks.splice(t, 1)
                    }
                    let govsl = this.enemies[t].value
                    this.enemies.splice(t, 1)
                    if (govsl > 0) {
                        this.spawn(govsl)
                    }
                }
            }
            for (let t = 0; t < this.enemies.length; t++) {

                this.enemies[t].speedlimit()
                if (this.enemies[t].body.doesPerimeterTouch(this.c1)) {
                    this.enemies[t].body.xmom = 0
                    this.enemies[t].body.ymom = 0
                    this.enemies[t].body.sxmom = 0
                    this.enemies[t].body.symom = 0
                    this.enemies[t].body.x = this.c1.x
                    this.enemies[t].body.y = this.c1.y
                }
                this.enemies[t].body.k = t
                if (this.enemies[t].health <= 0) {
                    this.enemies[t].body.friction = .982
                    this.enemies[t].body.frictiveMove()
                }
                this.enemies[t].draw()

                this.enemies[t].body.x = Math.min(Math.max(Math.round(this.enemies[t].body.x), 0), 10240)
                this.enemies[t].body.y = Math.min(Math.max(Math.round(this.enemies[t].body.y), 0), 10240)



                if (this.enemies[t].playlink.hypotenuse() > 750) {
                    this.enemies[t].out = 1
                } else {
                    this.enemies[t].out = 0
                    if (this.enemies[t].health <= 0) {
                        this.enemies[t].marked = 1
                    }
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        if (this.sproutventory[k].grounded != 1) {  //&& (this.sproutventory[k].hittime % 2 == 0 || this.sproutventory[k].fly > 0)
                            const len = this.sproutventory[k].elinks[t].hypotenuse()
                            const angle = this.sproutventory[k].elinks[t].angle()
                            if (len > 400) {
                                continue
                            }
                            if (len < Math.min((this.enemies[t].body.radius * 5), (45+this.enemies[t].body.radius)) && this.enemies[t].body.capped != 1) {
                                if (this.sproutventory[k].fly > 0) {
                                    this.sproutventory[k].body.xmom -= Math.cos(angle) * 0.2
                                    this.sproutventory[k].body.ymom -= Math.sin(angle) * 0.2
                                } else if (this.sproutventory[k].attent < 1) {
                                    this.sproutventory[k].body.xmom -= Math.cos(angle) * 2.2
                                    this.sproutventory[k].body.ymom -= Math.sin(angle) * 2.2
                                }
                            }


                            if (this.enemies[t].body.doesPerimeterTouch(this.sproutventory[k].body)) {
                                if (this.enemies[t].body == this.sproutventory[k].clingTo) {
                                    this.enemies[t].health -= this.sproutventory[k].damage * (1 + (this.sproutventory[k].bloom * .2))
                                    if (this.sproutventory[k].fly > 0) {
                                        this.enemies[t].health -= (this.sproutventory[k].damage * (1 + (this.sproutventory[k].bloom * .2)) * this.sproutventory[k].fly)
                                        if (this.sproutventory[k].type == 2) {
                                            this.enemies[t].health -= ((this.sproutventory[k].damage * (1 + (this.sproutventory[k].bloom * .2)) * this.sproutventory[k].fly)) * .5
                                        }
                                    }
                                    if (this.enemies[t].health <= 0) {
                                        this.enemies[t].marked = 1
                                        this.sproutventory[k].carrying = 1
                                    } else {
                                        this.sproutventory[k].carrying = 0
                                    }
                                }
                            }

                            if (this.enemies[t].body.doesPerimeterTouch(this.sproutventory[k].body)) {
                                if (this.enemies[t].health <= 0) {
                                    this.enemies[t].marked = 1
                                    this.sproutventory[k].carrying = 1
                                } else {
                                    this.sproutventory[k].carrying = 0
                                }

                                if (this.clingfilm == 1 || this.sproutventory[k].fly > 0 || this.sproutventory[k].attent <= 0) {
                                    if (this.sproutventory[k].cling != 1) {
                                        this.sproutventory[k].clingTo = this.enemies[t].body
                                        this.sproutventory[k].clingx = -(this.enemies[t].body.x - this.sproutventory[k].body.x)
                                        this.sproutventory[k].clingy = -(this.enemies[t].body.y - this.sproutventory[k].body.y)
                                    }
                                    if (this.enemies[t].spliceout != 1) {
                                        if (this.sproutventory[k].cling != 1) {
                                            if (this.enemies[t].nectar != 1) {
                                                this.sproutventory[k].cling = 1
                                            }
                                        }
                                    }
                                } else {

                                    this.sproutventory[k].body.xmom += Math.cos(angle) * 2.2
                                    this.sproutventory[k].body.ymom += Math.sin(angle) * 2.2
                                }

                                if (this.enemies[t].pulse == 1) {
                                    if (this.sproutventory[k].cling == 1) {
                                        let link = new LineOP(this.sproutventory[k].body, this.sproutventory[k].clingTo)
                                        let hyp = link.angle()
                                        this.sproutventory[k].body.xmom = (Math.cos(hyp)) * 9  //-(this.sproutventory[t].clingTo.x - this.sproutventory[t].body.x) * 1
                                        this.sproutventory[k].body.ymom = (Math.sin(hyp)) * 9  //-(this.sproutventory[t].clingTo.y - this.sproutventory[t].body.y) * 1
                                    }
                                    this.sproutventory[k].cling = 0
                                }

                            }
                        }
                    }
                }

                if (this.enemies[t].body.doesPerimeterTouch(this.c1)) {
                    this.enemies[t].body.xmom = 0
                    this.enemies[t].body.ymom = 0
                    this.enemies[t].body.sxmom = 0
                    this.enemies[t].body.symom = 0
                    this.enemies[t].body.x = this.c1.x
                    this.enemies[t].body.y = this.c1.y
                }
            }

            if (keysPressed['u'] || keysPressed['q'] || gamepadAPI.buttonsStatus.includes('Right-Trigger') || this.whistling == 1) {
                for (let t = 0; t < this.sproutventory.length; t++) {
                    if (this.sproutventory[t].ignore != 1) {
                        if (this.sproutventory[t].grounded != 1) {
                            if (this.seek.doesPerimeterTouch(this.sproutventory[t].body)) {
                                this.sproutventory[t].body.xmom -= (this.sproutventory[t].body.x - this.body.x) / 100
                                this.sproutventory[t].body.ymom -= (this.sproutventory[t].body.y - this.body.y) / 100
                                this.sproutventory[t].attent = 1
                                this.sproutventory[t].fly = 0
                                if (this.sproutventory[t].cling == 1) {
                                    let link = new LineOP(this.sproutventory[t].body, this.sproutventory[t].clingTo)
                                    let hyp = link.angle()
                                    this.sproutventory[t].body.xmom = (Math.cos(hyp)) * 9  //-(this.sproutventory[t].clingTo.x - this.sproutventory[t].body.x) * 1
                                    this.sproutventory[t].body.ymom = (Math.sin(hyp)) * 9  //-(this.sproutventory[t].clingTo.y - this.sproutventory[t].body.y) * 1
                                    //this commented out alternate would make the pigmen take from 1 to 40 frames to dislodge from the boss depending on depth into it
                                }
                                this.sproutventory[t].cling = 0
                            }
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
                // if (keysPressed['u'] || keysPressed['q'] || gamepadAPI.buttonsStatus.includes('Right-Trigger') ){
                    // if(this.guiding != 1){
                    whistle.play()
                    // }
                // }
            } else {
                this.seek.radius = 8
                this.seek.color = "#FF00FF"

                whistle.pause()
            }

            this.magsetoff = 1.2 + (this.sproutventory.length * .002)
            this.magsetoffsmall = .4 + (this.sproutventory.length * .002 * .33)

            let omegahash = {}



            for (let t = 0; t < this.sproutventory.length; t++) {


                if (this.sproutventory[t].cling == 1) {
                    if (this.sproutventory[t].clingTo.health <= 0) {
                        if ((Object.keys(omegahash).includes(`${this.sproutventory[t].clingTo.k}`))) {
                            if (omegahash[`${this.sproutventory[t].clingTo.k}`].carriers > (1 / this.sproutventory[t].clingTo.weight) * 2) {
                                this.sproutventory[t].cling = 0
                                this.sproutventory[t].hittime = 1
                                this.sproutventory[t].clingTo.capped = 1
                            }else{
                                this.sproutventory[t].clingTo.capped = 0
                                if (omegahash[`${this.sproutventory[t].clingTo.k}`].carriers >= ((1 / this.sproutventory[t].clingTo.weight) * 2)-1) {
                                this.sproutventory[t].hittime = 1
                                this.sproutventory[t].clingTo.capped = 1
                                }
                            }
                            omegahash[`${this.sproutventory[t].clingTo.k}`].carriers++
                            if (this.sproutventory[t].type == 0) {
                                omegahash[`${this.sproutventory[t].clingTo.k}`].carriers++
                            }
                            // //console.log(this.sproutventory[t].clingTo.k, omegahash[`${this.sproutventory[t].clingTo.k}`])
                        } else {
                            this.sproutventory[t].clingTo.capped = 0
                            let obj = {}
                            this.sproutventory[t].smartpath()
                            obj.carriers = 1
                            if (this.sproutventory[t].type == 0) {
                                obj.carriers = 2
                            }
                            obj.x = airmail.x
                            obj.y = airmail.y
                            // //console.log(airmail)
                            omegahash[`${this.sproutventory[t].clingTo.k}`] = obj
                        }
                    }
                }


                if (this.sproutventory[t].attent <= -2) {
                    this.sproutventory[t].attent++
                } else {
                }

                const length = this.sproutventory[t].playlink.hypotenuse()


                if (length < ten) {
                    if (this.sproutventory[t].grounded != 1) {
                        if (this.sproutventory[t].attent > -109) { //-10
                            this.sproutventory[t].attent = 1
                        }
                    }
                }


                if (this.sproutventory[t].grab == 1) {
                    this.sproutventory[t].attent = 1
                    this.sproutventory[t].body.x = this.body.x
                    this.sproutventory[t].body.y = this.body.y

                    if (keysPressed[' '] || gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                        if (keysPressed[' '] || Math.abs(gamepadAPI.axesStatus[2]) > 0.09 || Math.abs(gamepadAPI.axesStatus[3]) > 0.09) {
                            this.grab = -3

                            // let link = new LineOP(throbert.body, throbert.seek)
                            if (this.sproutventory[t].type == 2) {
                                this.sproutventory[t].body.xmom = (Math.cos(this.angf) * 41.2)// (gamepadAPI.axesStatus[2] * 1) * 31.3
                                this.sproutventory[t].body.ymom = (Math.sin(this.angf) * 41.2)//(gamepadAPI.axesStatus[3] * 1) * 31.3
                                this.sproutventory[t].grab = 0
                                this.sproutventory[t].fly = 20
                            } else {

                                this.sproutventory[t].body.xmom = (Math.cos(this.angf) * 31.2)// (gamepadAPI.axesStatus[2] * 1) * 31.3
                                this.sproutventory[t].body.ymom = (Math.sin(this.angf) * 31.2)//(gamepadAPI.axesStatus[3] * 1) * 31.3
                                this.sproutventory[t].grab = 0
                                this.sproutventory[t].fly = 16
                            }
                        }
                    }
                }
                if (this.sproutventory[t].grounded != 1 && this.sproutventory[t].fly <= 0 && this.sproutventory[t].hittime % 3 == 0) {
                    for (let k = Math.max(t-1,0); k < this.sproutventory.length; k++) {  //not t? 0?
                        if (this.sproutventory[k].grounded != 1) {
                            if (this.sproutventory[k].attent == 1) {

                                if (t > k) {
                                    if (this.sproutventory[t].links[k].hypotenuse() < this.sproutventory[t].supersize) {
                                        if (this.sproutventory[k].fly >= 1) {
                                        } else {
                                            if (this.sproutventory[t].attent <= 0) {
                                                this.sproutventory[t].attent += 3
                                                if (this.sproutventory[t].attent > 1) {
                                                    this.sproutventory[t].attent = 1
                                                }
                                            } else {
                                                // if (this.sproutventory[t].playlink.hypotenuse() < 750) { //290???? does the other one even fire now that k = t?
                                                    this.sproutventory[t].attent = 1
                                                // }
                                            }
                                        }
                                        if (this.sproutventory[t].type != this.sproutventory[k].type) {
                                            const angle = this.sproutventory[t].links[k].angle()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoff  //1
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoff //1
                                        } else {
                                            const angle = this.sproutventory[t].links[k].angle()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoffsmall //.2
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoffsmall //.2
                                        }
                                    }
                                } else if (t < k) {

                                    if (this.sproutventory[t].links[k].hypotenuse() < this.sproutventory[t].supersize) {
                                        if (this.sproutventory[k].fly >= 1) {
                                        } else {
                                            if (this.sproutventory[t].attent <= 0) {
                                                this.sproutventory[t].attent += 3
                                                if (this.sproutventory[t].attent > 1) {
                                                    this.sproutventory[t].attent = 1
                                                }
                                            } else {
                                                // if (this.sproutventory[t].playlink.hypotenuse() < 750) { //290????
                                                    this.sproutventory[t].attent = 1
                                                // }
                                            }
                                        }
                                        if (this.sproutventory[t].type != this.sproutventory[k].type) {
                                            const angle = this.sproutventory[t].links[k].angleM()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoff  //1
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoff //1
                                        } else {
                                            const angle = this.sproutventory[t].links[k].angleM()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoffsmall //.2
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoffsmall //.2
                                        }
                                    }
                                }
                            } else {

                                if (t > k) {
                                    if (this.sproutventory[t].links[k].hypotenuse() < (this.sproutventory[t].supersize * .1428)) {
                                        if (this.sproutventory[t].type != this.sproutventory[k].type) {
                                            const angle = this.sproutventory[t].links[k].angleM()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * .2 * this.magsetoffsmall * .5 //1
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * .2 * this.magsetoffsmall * .5 //1
                                        } else {
                                            const angle = this.sproutventory[t].links[k].angleM()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoffsmall * .1 //.2
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoffsmall * .1 //.2
                                        }
                                    }
                                } else if (t < k) {
                                    if (this.sproutventory[t].links[k].hypotenuse() < (this.sproutventory[t].supersize * .1428)) {
                                        if (this.sproutventory[t].type != this.sproutventory[k].type) {
                                            const angle = this.sproutventory[t].links[k].angle()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * .2 * this.magsetoffsmall * .5 //1
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * .2 * this.magsetoffsmall * .5 //1
                                        } else {
                                            const angle = this.sproutventory[t].links[k].angle()
                                            this.sproutventory[t].body.xmom += Math.cos(angle) * this.magsetoffsmall * .1 //.2
                                            this.sproutventory[t].body.ymom += Math.sin(angle) * this.magsetoffsmall * .1 //.2
                                        }
                                    }
                                }

                            }
                        }
                    }
                }

                if (((gamepadAPI.buttonsStatus.includes('Axis-Right') || gamepadAPI.buttonsStatus.includes('DPad-Up')))) {
                    if (this.ijklflag == 1) {

                        if (this.sproutventory[t].grounded != 1 && this.sproutventory[t].fly <= 0) {
                            if (this.sproutventory[t].marked <= 0) {
                                if (this.sproutventory[t].cling != 1) {
                                    if (this.sproutventory[t].attent == 1) {
                                        if (!gamepadAPI.buttonsStatus.includes('Left-Trigger') && !gamepadAPI.buttonsStatus.includes('Right-Trigger')) {
                                            if (Math.abs(gamepadAPI.axesStatus[2]) > 0.09 || Math.abs(gamepadAPI.axesStatus[3]) > 0.09 || this.ijklflag == 1) {
                                                if (this.ijklflag == 1) {
                                                    if (!keysPressed[' ']) {
                                                        this.sproutventory[t].body.xmom += Math.cos(this.angf) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                        this.sproutventory[t].body.ymom += Math.sin(this.angf) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                        if (this.sproutventory[t].type == 0) {
                                                            this.sproutventory[t].body.xmom += Math.cos(this.angf) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                            this.sproutventory[t].body.ymom += Math.sin(this.angf) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                        }
                                                    }
                                                } else {

                                                    this.sproutventory[t].body.xmom += gamepadAPI.axesStatus[2] * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                    this.sproutventory[t].body.ymom += gamepadAPI.axesStatus[3] * 2.2 * (1 + (this.sproutventory[t].bloom * .2))

                                                    if (this.sproutventory[t].type == 0) {
                                                        this.sproutventory[t].body.xmom += gamepadAPI.axesStatus[2] * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                        this.sproutventory[t].body.ymom += gamepadAPI.axesStatus[3] * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                } else {

                    if (this.sproutventory[t].grounded != 1 && this.sproutventory[t].fly <= 0) {
                        if (this.sproutventory[t].marked <= 0) {
                            if (this.sproutventory[t].cling != 1) {
                                if (this.sproutventory[t].attent == 1) {
                                    if (!gamepadAPI.buttonsStatus.includes('Left-Trigger') && !gamepadAPI.buttonsStatus.includes('Right-Trigger')) {
                                        if (Math.abs(gamepadAPI.axesStatus[2]) > 0.09 || Math.abs(gamepadAPI.axesStatus[3]) > 0.09 || this.ijklflag == 1 || this.guiding == 1) {
                                            if (this.ijklflag == 1) {
                                                if (!keysPressed[' ']) {
                                                    this.sproutventory[t].body.xmom += Math.cos(this.angf) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                    this.sproutventory[t].body.ymom += Math.sin(this.angf) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                    if (this.sproutventory[t].type == 0) {
                                                        this.sproutventory[t].body.xmom += Math.cos(this.angf) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                        this.sproutventory[t].body.ymom += Math.sin(this.angf) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                    }
                                                }
                                            } else if (this.guiding == 1) {

                                                if (!keysPressed[' ']) {
                                                    const angle = this.sproutventory[t].cursorline.angle()
                                                    this.sproutventory[t].body.xmom += Math.cos(angle) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                    this.sproutventory[t].body.ymom += Math.sin(angle) * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                    if (this.sproutventory[t].type == 0) {
                                                        this.sproutventory[t].body.xmom += Math.cos(angle) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                        this.sproutventory[t].body.ymom += Math.sin(angle) * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                    }
                                                }
                                            } else {

                                                this.sproutventory[t].body.xmom += gamepadAPI.axesStatus[2] * 2.2 * (1 + (this.sproutventory[t].bloom * .2))
                                                this.sproutventory[t].body.ymom += gamepadAPI.axesStatus[3] * 2.2 * (1 + (this.sproutventory[t].bloom * .2))

                                                if (this.sproutventory[t].type == 0) {
                                                    this.sproutventory[t].body.xmom += gamepadAPI.axesStatus[2] * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                    this.sproutventory[t].body.ymom += gamepadAPI.axesStatus[3] * .1 * (1 + (this.sproutventory[t].bloom * .2))
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                this.sproutventory[t].draw()

                // this.sproutventory[t].body.frictiveMove()
                if (keysPressed['o'] || keysPressed['e'] || gamepadAPI.buttonsStatus.includes('A') || gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                    if (length < (this.supersize*2.2)) {
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

                if (keysPressed[' '] || gamepadAPI.buttonsStatus.includes('A') || gamepadAPI.buttonsStatus.includes('Left-Trigger')) {
                    if (this.grab == 0) {
                        let index = Math.floor(Math.random() * this.sproutventory.length)
                        if (this.sproutventory[index].grounded == 1) {
                        } else {
                            if (this.grab == 0) {
                                if (this.sproutventory[index].fly <= 0) {
                                    if (this.sproutventory[index].playlink.hypotenuse() <= (62 + (this.sproutventory.length * .27))) {
                                        if (this.sproutventory[index].cling != 1) {
                                            if (this.sproutventory[index].attent == 1) {
                                                this.sproutventory[index].grounded = -1
                                                this.sproutventory[index].grab = 1
                                                this.grab = 1
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                if (this.sproutventory[t].grounded != 1) {
                    if (this.sproutventory[t].cling != 1) {
                        if (this.sproutventory[t].attent == 1) {
                            if (length > (50 + (this.sproutventory.length * .27))) {
                                this.sproutventory[t].body.xmom -= ((this.sproutventory[t].body.x - this.body.x) * .01) * (1 + (this.sproutventory[t].bloom * .2))
                                this.sproutventory[t].body.ymom -= ((this.sproutventory[t].body.y - this.body.y) * .01) * (1 + (this.sproutventory[t].bloom * .2))
                            }
                        }
                    }
                }
            }


            let keys = Object.keys(omegahash)
            for (let t = 0; t < keys.length; t++) {
                if (omegahash[keys[t]].carriers >= this.enemies[keys[t]].weight) {
                    this.enemies[keys[t]].body.xmom += omegahash[keys[t]].x * omegahash[keys[t]].carriers
                    this.enemies[keys[t]].body.ymom += omegahash[keys[t]].y * omegahash[keys[t]].carriers
                } else {
                }
                if (this.enemies[keys[t]].health <= 0) {
                    if (this.enemies[keys[t]].out == 0) {
                        canvas_context.font = `${Math.max(this.enemies[keys[t]].body.radius * 2, 14)}px arial`
                        canvas_context.lineWidth = 2
                        canvas_context.fillStyle = "#0000FF"
                        canvas_context.strokeStyle = "#FFFFFF"
                        // canvas_context.imageSmoothingEnabled = true


                        let h = canvas_context.measureText(`${omegahash[keys[t]].carriers}`).actualBoundingBoxAscent + canvas_context.measureText(`${omegahash[keys[t]].carriers}`).actualBoundingBoxDescent


                        canvas_context.strokeText(`${omegahash[keys[t]].carriers}`, this.enemies[keys[t]].body.x - (canvas_context.measureText(`${omegahash[keys[t]].carriers}`).width * .5), this.enemies[keys[t]].body.y - (h * 2.4))
                        canvas_context.fillText(`${omegahash[keys[t]].carriers}`, this.enemies[keys[t]].body.x - (canvas_context.measureText(`${omegahash[keys[t]].carriers}`).width * .5), this.enemies[keys[t]].body.y - (h * 2.4))  //-(this.enemies[keys[t]].body.radius*.5)
                        this.enemies[keys[t]].healthbar.color = "#FFFFFF"
                        this.enemies[keys[t]].healthbar.y = (this.enemies[keys[t]].body.y - (h * 2.2))
                        this.enemies[keys[t]].healthbar.x = (this.enemies[keys[t]].body.x - this.enemies[keys[t]].body.radius)
                        this.enemies[keys[t]].healthbar.width = this.enemies[keys[t]].body.radius * 2
                        this.enemies[keys[t]].healthbar.height = 2
                        this.enemies[keys[t]].healthbar.draw()
                        canvas_context.font = `${Math.max(this.enemies[keys[t]].body.radius * 2, 14)}px arial`
                        canvas_context.lineWidth = 2
                        canvas_context.fillStyle = "#FF0000"
                        canvas_context.strokeStyle = "#000000"
                        canvas_context.strokeText(`${this.enemies[keys[t]].weight}`, this.enemies[keys[t]].body.x - (canvas_context.measureText(`${this.enemies[keys[t]].weight}`).width * .5), this.enemies[keys[t]].body.y - (h * .9))
                        canvas_context.fillText(`${this.enemies[keys[t]].weight}`, this.enemies[keys[t]].body.x - (canvas_context.measureText(`${this.enemies[keys[t]].weight}`).width * .5), this.enemies[keys[t]].body.y - (h * .9))
                        canvas_context.imageSmoothingEnabled = false
                    }
                }
            }

            for (let t = 0; t < this.sproutventory.length; t++) {
                if (this.sproutventory[t].away == 1) {
                    if (this.sproutventory[t].grab == 1) {
                        this.grab = 0
                    }
                    for (let k = 0; k < this.sproutventory.length; k++) {
                        this.sproutventory[k].links.splice(t, 1)
                        // this.sproutventory[t].links.splice(k, 1)
                    }
                    for (let k = 0; k < this.enemies.length; k++) {
                        this.enemies[k].elinks.splice(t, 1)
                    }
                    this.sproutventory.splice(t, 1)
                    // throbert.generate(0)
                }
            }

            canvas_context.drawImage(this.captain, 0, 0, this.captain.width, this.captain.height, Math.round(this.body.x - this.body.radius), Math.round(this.body.y - this.body.radius), 2 * this.body.radius, 2 * this.body.radius)

            this.smack--
            this.pulse = new CircleS(this.body.x, this.body.y, this.body.radius * 2, "white")
            if (this.pulse > 17) {
                this.pulse.draw()
            }
            if (gamepadAPI.buttonsStatus.includes('B') || keysPressed['b']) {
                if (this.smack > 0) {

                } else {
                    for (let t = 0; t < this.enemies.length; t++) {
                        if (this.enemies[t].playlink.hypotenuse() < ((this.body.radius * 2) + this.enemies[t].body.radius) * 1.01) {
                            this.enemies[t].health -= 50
                            this.smack = 20
                        }
                    }
                    this.pulse.draw()
                }
            }
            canvas_context.translate(xdiff, ydiff)


            canvas_context.lineWidth = 1// this.strokeWidth
            canvas_context.strokeStyle = `White`
            canvas_context.beginPath();
            canvas_context.arc(this.body.x - 600, this.body.y - 300, 30, 0, (Math.PI * 2), true)
            canvas_context.fillStyle = "black"
            canvas_context.fill()
            canvas_context.stroke();


            canvas_context.beginPath();
            canvas_context.arc(this.body.x - 600, this.body.y - 300, 30, 0, (Math.PI * ((this.health / this.maxhealth) * 2)), false)

            canvas_context.lineTo(this.body.x - 600, this.body.y - 300);
            canvas_context.lineTo((this.body.x - 600) + 30, this.body.y - 300);
            canvas_context.fillStyle = `rgb(${(1 - (this.health / this.maxhealth)) * 255}, ${((this.health / this.maxhealth) * 255)}, ${128})`
            canvas_context.fill()


            canvas_context.font = "20px arial"
            canvas_context.fillStyle = "orange"
            canvas_context.fillText(Math.floor(this.body.x) + "," + Math.floor(this.body.y), this.body.x - 620, this.body.y - 240)
            canvas_context.fillStyle = "red"
            canvas_context.fillText(this.sproutventory.length, this.body.x - 620, this.body.y - 210)
            canvas_context.fillStyle = "#FF00AA"
            canvas_context.fillText('FPS: ' + oldframes, this.body.x - 620, this.body.y - 180)
            // canvas_context.fillStyle = "white"
            // canvas_context.fillText('Priority: ' +globalPrio, this.body.x - 620, this.body.y - 150)
            // ////console.log(this)

            if (gamepadAPI.buttonsStatus.includes('RB') || gamepadAPI.buttonsStatus.includes('LB')) {
                for (let t = 0; t < this.sproutventory.length; t++) {
                    this.sproutventory[t].attent = -59
                    // //console.log("fssfff")
                }
                // //console.log("ffff")
            }


        }
    }


    let pit = new Image()
    pit.src = "piter.png"
    const throbert = new Throbert()
    let now = Date.now()
    let frames = 0
    let oldframes = 0
    function main() {

        if (Math.abs(now - Date.now()) > 1000) {
            oldframes = frames
            frames = 0
            now = Date.now()
        }
        frames++
        canvas_context.clearRect(-1000000, -1000000, canvas.width * 10000000, canvas.height * 10000000)
        gamepadAPI.update()
        throbert.draw()
        // if (keysPressed['-'] && recording == 0) {
        //     recording = 1
        //     video_recorder.record()
        //     keysPressed = {}
        // }
        // if (keysPressed['='] && recording == 1) {
        //     recording = 0
        //     video_recorder.stop()
        //     video_recorder.download('Warm.webm')
        // }
    }



})
