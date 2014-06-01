// Html5 Canvas based eyeball
// 20140518 Rob: v1.0 release to Github
/*

The MIT License (MIT)
[OSI Approved License]

The MIT License (MIT)

Copyright (c) 2014 "Rob Davis", "rob_on_earth"

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/



// Eyeball class from here on
function Eyeball(elementId) {
    var eyeball = this; // context 
    // settings
    eyeball.targetId = elementId;
    eyeball.centerX = 0;
    eyeball.centerY = 0; 
    eyeball.irisColours = [{"red":0, "green":255, "blue":0}, {"red":255, "green":255, "blue":0}, {"red":0, "green":255, "blue":255}]
    eyeball.hideRenderLayers = true;
    eyeball.hideMarkers = true;
    eyeball.useCircleScaling = true;
    eyeball.numLinesIris = 400;
    eyeball.eyeColour = {"red":0, "green":255, "blue":0};
    eyeball.irisOuterColour = {"red":100, "green":100, "blue":100, "alpha":0.0 };
    eyeball.irisInternalColour = {"red":0, "green":0, "blue":0};
    eyeball.eyeballGradient1 = {"red":255, "green":255, "blue":255};
    eyeball.eyeballGradient2 = {"red":255, "green":238, "blue":238};
    eyeball.eyeballGradient3 = {"red":238, "green":221, "blue":221};
    eyeball.veinColour = {"red":255, "green":180, "blue":180};
    eyeball.veinWidth = 1.0;
    eyeball.veinBranches = 5;
    eyeball.travel = 1.0;
    eyeball.pupilScale = 1.0;
    eyeball.animatePupil = true;
    eyeball.pupilColour = {"red":0, "green":0, "blue":0};
    eyeball.highlight1 = {"x":.35, "y":.35, "width":.16, "height":.1, "colour1" : {"red":200, "green":200, "blue":200, "alpha" : 0.4}, "colour2" : {"red":0, "green":0, "blue":0, "alpha" : 0.0}};
    eyeball.highlight2 = {"x":.64, "y":.64, "width":.04, "height":.02, "colour1" : {"red":200, "green":200, "blue":200, "alpha" : 0.2}, "colour2" : {"red":0, "green":0, "blue":0, "alpha" : 0.3}};
    // internal vars
    var isDrawing=false; 
    // all the different layers that are created dynamically
    var canvases = [{"name":'canvasMain'}, {"name":'canvasBackground'}, {"name":'canvasVeins'}, {"name":'canvasIris'}, {"name":'canvasHighlights'}];
    var animatedPupilScale = 0.0;
    var pupilAnimationIntervalId = 0;
    var pupilChange = 0.0;
    var lastMouseX = 0;
    var lastMouseY = 0;
    var diameter = 0;
    var maxDistanceFromCenter = 0;
    var offsetLocationX = 0; 
    var offsetLocationY = 0;

    // Colour can be supplied or pulled from the irisColours bank randomly
    // If "animatePupil" setting is not disabled the pupil will also animate
    eyeball.setIris = function(colour) {
        if (colour) {
            this.eyeColour.red = (colour.red) ? colour.red : 0;
            this.eyeColour.green = (colour.green) ? colour.green : 0;
            this.eyeColour.blue = (colour.blue) ? colour.blue : 0;
        } else {
            this.eyeColour = this.irisColours[Math.floor(this.getRandomRange(0, this.irisColours.length))];
        }
        var iris = this.getCanvas('canvasIris');
        this.doDrawIris(iris, this.getCanvas('canvasMain').canvas.width);
        if (this.animatePupil) {
            pupilChange = 1.0;
            clearInterval(pupilAnimationIntervalId);
            pupilAnimationIntervalId = setInterval(function (eyeball) {
                animatedPupilScale = 1.0 - eyeball.circ(1.0 - pupilChange);
                pupilChange -= 0.02;
                if (pupilChange < 0.0) {
                    pupilChange = 0.0;
                    clearInterval(pupilAnimationIntervalId);
                }
                eyeball.doDraw(lastMouseX, lastMouseY, eyeball.centerX, eyeball.centerY);
            }, (1000 / 30), eyeball);
        }
		
	}

	// allow backward compatibilty
    eyeball.setPupil = function(colour) {
		this.setIris(colour);
    };
    
    // Toggle the visibility of layers
    // optionally force state
    eyeball.toggle = function(name, forceShow){
        var layer = this.getCanvas(name);
        if (!layer) return;
        var current = layer.display;
        if (!current || forceShow) {
            layer.display = true;
        }
        if (current || !forceShow) {
            layer.display = false;
        }
    };

    // Create a new canvas wrapper object
    // or return the existing one
    eyeball.newCanvas = function(targetId, canvasName) {
        var canvasObject = this.getCanvas(canvasName);
        if (!canvasObject) {
            var canvas = document.createElement('canvas');
            canvas.className = canvasName;
            var context = canvas.getContext("2d");
            return { "name": canvasName, "canvas":canvas, "context":context, "display":true};
        } 
        return canvasObject;
    };

    // Get a canvas wrapper object based on the name
    eyeball.getCanvas = function(name) {
        for (var i = 0; i < canvases.length; i++) {
            if (canvases[i].name == name && canvases[i].canvas) {
                return canvases[i];
            }
        }
        return;
    };

	// Initialise the canvases and render the components
	// this needs to be done before calling the doDraw() method
	eyeball.init = function() {
		var targetDiv = document.getElementById(this.targetId);
		for (var i=0;i<canvases.length;i++) {
		    if (this.getCanvas(canvases[i].name)) break;
		    canvases[i]=this.newCanvas(this.targetId, canvases[i].name);
		    if (this.hideRenderLayers && canvases[i].name!=='canvasMain' ) {
		        canvases[i].canvas.style.display = 'none';
		    }
		    targetDiv.appendChild(canvases[i].canvas);
		}
		// setup the canvas parameters and pre-renders
		// Main
		var main = this.getCanvas('canvasMain');
		main.canvas.width = targetDiv.offsetWidth;
		main.canvas.height = targetDiv.offsetHeight;
		// Background
		var background = this.getCanvas('canvasBackground');
		background.canvas.width = main.canvas.width;
		background.canvas.height = main.canvas.height;
		this.doDrawBackground (background, background.canvas.width);
		// Veins
		var veins = this.getCanvas('canvasVeins');
		veins.canvas.width = main.canvas.width * 2;
		veins.canvas.height = main.canvas.height * 2;
		this.doDrawVeins(veins, veins.canvas.width);
		// Iris
		var iris = this.getCanvas('canvasIris');
		iris.canvas.width = main.canvas.width / 2;
		iris.canvas.height = main.canvas.height / 2;
		this.doDrawIris(iris, main.canvas.width);
		// Highlights
		var highlights = this.getCanvas('canvasHighlights');
		highlights.canvas.width = main.canvas.width;
		highlights.canvas.height = main.canvas.height;
		this.doDrawHighlights(highlights, main.canvas.width)
		
		diameter = main.canvas.width/2;
		this.centerX = diameter; // set eyeball looking -
		this.centerY = diameter; //  - as if the mouse was at its center
		maxDistanceFromCenter=diameter * 0.75; // can be altered with the "travel" setting
		var offset = this.getOffset(targetDiv);
		offsetLocationX = offset.Left;
		offsetLocationY = offset.Top;
	};

	// Draw all the required canvas layers making up the "eye"
    // Most commonly called from a "OnMouseMove" type event but can called directly
	eyeball.doDraw = function(mX, mY) {
		if (isDrawing) return; // already trying to draw this eyeball
		var cX = this.centerX;
		var cY = this.centerY;
		lastMouseX = mX;
		lastMouseY = mY;
		var main = this.getCanvas('canvasMain');
		var canvas = main.canvas;
		var context = main.context;
		var eyeBallDiameter = canvas.width; 
		var irisWidth = eyeBallDiameter / 2;
		var offset = this.calculateScaleAndOffset(mX, mY, cX, cY);
		var newPoint = this.getNewPoint(offset.radians, offset.distance)
		var background = this.getCanvas('canvasBackground');
		if (background.display)
		    context.drawImage(background.canvas, 0, 0);
		var veins = this.getCanvas('canvasVeins');
		if (veins.display) {
		    context.drawImage(veins.canvas, -diameter + newPoint.x, -diameter + newPoint.y);
			// Use a circlular mask to hide the veins not on the eyeball 
			context.save();
			context.globalCompositeOperation = 'destination-in';
			context.beginPath();
			context.arc(cX, cY, diameter, 0, 2 * Math.PI, false);
			context.fill();
			context.restore();
		}
		var iris = this.getCanvas('canvasIris');
		if (iris.display)
		    this.updateIris(context, iris.canvas, cX, cY, offset, newPoint, diameter / 2);
		var highlights = this.getCanvas('canvasHighlights');
		if (highlights.display) {
		    context.save();
		    context.globalCompositeOperation = 'lighter';
		    context.drawImage(highlights.canvas, 0, 0);
		    context.restore();
		}
		isDrawing = false; // clear flag
	};

	// Draw the iris onto the requested layer
	eyeball.doDrawIris = function(layer, eyeBallDiameter) 
	{
		var canvas = layer.canvas;
		var context = layer.context;
		var irisDiameter = eyeBallDiameter / 2;
		canvas.width = irisDiameter;
		canvas.height = irisDiameter;
		var numberOfLines = this.numLinesIris;
		var offset = 0;
		context.translate(offset, offset);
		this.drawIris(context,irisDiameter, this.eyeColour, this.irisOuterColour, this.irisInternalColour, numberOfLines);
	};

	// Draw the veins onto the requested layer
	eyeball.doDrawVeins = function(layer, eyeBallDiameter){
		var context = layer.context;
		context.save();
		var veinColour = this.obj2Colour(this.veinColour);
		context.translate(eyeBallDiameter / 2, eyeBallDiameter / 2);
		var a = this.getRandomRange(0, 60);
		for (var c = 0; a < 360; c += 1) {
		    this.genArm(context, 0, eyeBallDiameter / 2, eyeBallDiameter / 10, 90, 0.24, 0, this.veinBranches + 1, veinColour, this.veinWidth); 
		    context.rotate(this.deg2Rad(a));
		    a += this.getRandomRange(25, 60);
		 }
		context.restore();
	};
    
	// Draw the eyeball "ball" onto the requested layer
	eyeball.doDrawBackground = function(layer, width)
	{
		var context = layer.context;
		context.beginPath();
		var radius = width / 2; 
		var gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
		var eyeballGradient1 = this.obj2Colour(this.eyeballGradient1);
		var eyeballGradient2 = this.obj2Colour(this.eyeballGradient2);
		var eyeballGradient3 = this.obj2Colour(this.eyeballGradient3);
		gradient.addColorStop(0.75, eyeballGradient1);
		gradient.addColorStop(0.85, eyeballGradient2);
		gradient.addColorStop(1.0, eyeballGradient3);
		context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
		context.fillStyle = gradient;
		context.fill();
		context.closePath();
	};

	// Draw the two highlights onto the requested layer
	eyeball.doDrawHighlights = function(layer, diameter)
	{
		var context = layer.context;
		// top highlight
		var centerX = diameter * this.highlight1.x;
		var centerY = diameter * this.highlight1.y;
		var hlWidth = diameter * this.highlight1.width;
		var hlHeight = diameter * this.highlight1.height;
		// correct coords once in the drawEllipse method
		var topHighlight = function(context) {
			gradient = context.createRadialGradient(1, 1, 0, 1, 1, 1); 
			gradient.addColorStop(0.5, eyeball.obj2Colour(eyeball.highlight1.colour1)); 
			gradient.addColorStop(1.0, eyeball.obj2Colour(eyeball.highlight1.colour2)); 
			return gradient;
		};
		this.drawEllipse(context, centerX, centerY, hlWidth, hlHeight, topHighlight);	
		// bottom highlight
		var centerX = diameter * this.highlight2.x;
		var centerY = diameter * this.highlight2.y;
		var hlWidth = diameter * this.highlight2.width;
		var hlHeight = diameter * this.highlight2.height;
		// correct coords once in the drawEllipse method
		var bottomHighlight = function(context) {
			gradient = context.createRadialGradient(1, 1, 0, 1, 1, 1); 
			gradient.addColorStop(0.5, eyeball.obj2Colour(eyeball.highlight2.colour1)); 
			gradient.addColorStop(1.0, eyeball.obj2Colour(eyeball.highlight2.colour2)); 
			return gradient;
		};
		this.drawEllipse(context, centerX, centerY, hlWidth, hlHeight, bottomHighlight);	
	};

	// Render the iris with background colour and the iris pattern
	eyeball.drawIris = function (contextIris, diameter, eyeColour, irisOuterColour, irisInternalColour, numberOfLines)
	{
		radius = diameter / 2;
		pupilRadius = diameter / 6;
		this.drawEyeIrisBackground(contextIris, eyeColour, irisInternalColour, radius);
		this.drawEyeIrisForeground(numberOfLines, contextIris, pupilRadius, radius, eyeColour, irisOuterColour);
	};

	// Render the iris background as a shaded circle
	eyeball.drawEyeIrisBackground = function(context, eyeColour, irisOuterColour, radius)
	{
		context.beginPath();
		gradient = context.createRadialGradient(radius, radius, 0, radius, radius, radius);
		gradient.addColorStop(0.3, this.obj2Colour(eyeColour));
		gradient.addColorStop(1.0, this.obj2Colour(irisOuterColour));
		context.arc(radius, radius, radius, 0, 2 * Math.PI, false);
		context.fillStyle = gradient;
		context.fill();
		context.closePath();
	};

	// Render the iris pattern by adding lines of different angles and length
	eyeball.drawEyeIrisForeground = function(numberOfLines, context, pupilRadius, radius, eyeColour, irisOuterColour)
	{
		var angle = 0;
		for (var c = 0; c < numberOfLines; c++) {
		    angle = Math.random()*360;
			this.drawLine (angle, context, 0, pupilRadius, 0, radius, radius, eyeColour, irisOuterColour);
		}
	};

	// Render the pupil
	eyeball.drawPupil = function(context, radius, pupilRadius)
	{
		context.beginPath();
		context.arc(radius, radius, pupilRadius, 0, 2 * Math.PI, false);
		var pupilColour = this.obj2Colour(this.pupilColour);
		context.fillStyle = pupilColour;
		context.fill();
		context.closePath();
	};

	// Render a single line with two blended colours and rotate to the specified angle
	eyeball.drawLine = function(angle, context, lineX1, lineY1, lineX2, lineY2, radius, colour1, colour2, lineWidth) {
		context.save();                
		context.beginPath();
		context.translate(radius,radius);
		context.rotate(this.deg2Rad(angle));
		gradient = context.createLinearGradient(lineX1, lineY1, lineX2, lineY2);
		gradient.addColorStop(0, this.obj2Colour(colour1));
		gradient.addColorStop(this.getRandom(), this.obj2Colour(colour2)); 
		context.strokeStyle = gradient;
		context.moveTo(lineX1,lineY1); 
		context.lineWidth = lineWidth;
		context.lineJoin = "round";	
		context.lineTo(lineX2, lineY2);
		context.stroke();
		context.closePath();
		context.restore();
	};

	// Render an "arm" and try and create two branches at the end
	// This is recursive, large values of maxCount (greater than 5) WILL slow your machine
	eyeball.genArm = function(context, pPointX, pPointY, pLength, pAngle, pAngleRange, count, maxCount, style, lineWidth) {
		count += 1;
		if (count >= maxCount) return; // no more branches to make
		var length = (pLength * this.getRandomRange(0.2, 1)); 
		var angle = pAngle ;
		var angleRad = this.deg2Rad(angle);
		var x = pPointX + (0 - length) * Math.cos(angleRad);
		var y = pPointY + (0 - length) * Math.sin(angleRad);
		context.save();
		context.beginPath();
		context.moveTo(pPointX, pPointY);
		context.lineTo(x, y);
		context.strokeStyle=style;
		context.lineWidth = lineWidth;
		context.stroke();
		context.restore();
		// two new arms from this point, note the +/- angle changes
		this.genArm (context, x, y, length, angle - (angle * this.getRandomRange(0.1, pAngleRange)), pAngleRange, count, maxCount, style, lineWidth);
		this.genArm (context, x, y, length, angle + (angle * this.getRandomRange(0.1, pAngleRange)), pAngleRange, count, maxCount, style, lineWidth);
	};

	// Render a correctly scaled, rotated and located iris
	// If setting "hideMarkers" is overridden then also renders the "spikes" indicating direction and "travel"
	eyeball.updateIris = function(context, canvasIris, cX, cY, offset, newPoint, radius) {
		context.save();
		context.translate(cX, cY);
		if (!this.hideMarkers) {
		    context.fillStyle = 'yellow';
		    context.fillRect(-3, -3 , 6, 6);
		    this.drawSpike(context, offset.angle, 'red', 1.0);
		}
		context.translate(newPoint.x, newPoint.y);
		context.save();
		context.rotate(this.deg2Rad(offset.angle));
		context.scale(1.0, offset.scale);
		context.rotate(this.deg2Rad(-offset.angle));
		context.drawImage(canvasIris, -radius, -radius);
		var pupilScale = (radius / 3) * this.pupilScale;
	   	this.drawPupil(context, 0, pupilScale * (1.0 + animatedPupilScale) );
		context.restore();
		if (!this.hideMarkers) {
		    this.drawSpike(context, offset.angle, 'green', offset.scale);
		}
		context.restore();
	};

	// Calculate the scale and offset from mX,mY (mouse) to cX,cY(center)
	// The "useCircleScaling" setting set to false allows you to see the old linear scaling method
	eyeball.calculateScaleAndOffset = function(mX, mY, cX, cY) {
		// offset
		cX += offsetLocationX;
		cY += offsetLocationY;
		// set angle
		var radians = Math.atan2(mY - cY, mX - cX);
		var angle = 90 + this.rad2Deg(radians);
		// new location based on distance restricted to the edge taking into account the "travel" setting
		var userMaxDistanceFromCenter = maxDistanceFromCenter * this.travel;
		var distance = this.getDistance(mX, mY, cX, cY);
		if (distance > userMaxDistanceFromCenter) {
		    distance = userMaxDistanceFromCenter;
		}
		// the percentage of distance to maxDistanceFromCenter
		// defines the inverse scale
		// now with linear to circular curve
		// FYI: I do see all those 1.0- inverters, but it works
		var perct = 1.0-this.circ(1.0 - (distance / maxDistanceFromCenter));
		var scale = 1.0-(perct * .50); 
		if (!this.useCircleScaling) {
		    perct = distance / maxDistanceFromCenter;
		    scale = 1.0 - ((perct == 0) ? 0 : (perct * .50)); 
		}
		return { "radians":radians, "angle":angle, "distance":distance, "percentageFromCenter":perct, "scale":scale}
	};

	// Render a triangle, used as markers when "hideMarkers" setting is false
	eyeball.drawSpike = function(context, angle, style, yScale) {
		context.save();
		context.rotate(this.deg2Rad(angle));
		context.scale(1.0, yScale);
		context.beginPath();
		context.moveTo(-10, 0);
		context.lineTo(10, 0);
		context.lineTo(0, -80);
		context.fillStyle = style;
		context.closePath();
		context.fill();
		context.strokeStyle = 'black';
		context.stroke();
		context.restore();
	};

	// Utility functions from here onwards


	// return random value between 0 and 1.0
	eyeball.getRandom = function() {
		return Math.random();
	};

	// return random float value between min and max (including min and up to but not including the whole number max)
	eyeball.getRandomRange = function(min,max) {
		return min + ( max * this.getRandom());
	};

	// Get the distance between two points
	eyeball.getDistance  = function(p1X, p1Y, p2X, p2Y) {
		var xDist = p1X - p2X;
		var yDist = p1Y - p2Y;
		return Math.sqrt(xDist * xDist + yDist * yDist);
	};

	// Get a new point relative to 0,0 based on supplied angle and distance
	// object returned as {x,y}
	eyeball.getNewPoint = function(radians, distance) {
		var x = distance * Math.cos(radians);
		var y = distance * Math.sin(radians);
		return {"x":x, "y":y};
	};

	// Convert degrees to radians
	eyeball.deg2Rad = function(degrees) {
		return degrees * Math.PI / 180;
	};
		
	// Convert radians to degrees
	eyeball.rad2Deg = function(radians) {
		return radians * (180 / Math.PI);
	};

	// Draw an Ellipse
	// fill can be a simple style or a function that returns a gradient
	eyeball.drawEllipse = function(context, cx, cy, rx, ry, fill){
		context.save(); 
		context.beginPath();
		context.translate(cx-rx, cy-ry);
		context.scale(rx, ry);
		var ellipseFill;
		if (typeof(fill)==='function') {
			ellipseFill=fill(context);
		} else {
			ellipseFill=fill;
		}
		context.arc(1, 1, 1, 0, 2 * Math.PI, false);
		context.fillStyle = ellipseFill;
		context.fill();
		context.closePath();
		context.restore(); 
	};

	// plots n as x on a semi circle and returns the y
	// n cannot be outside the range 0.0 - 1.0 or the fabric of space maybe imperceptibly altered.
	// work to create this was done visually here http://jsfiddle.net/rob_on_earth/7b2bx/ and http://jsfiddle.net/rob_on_earth/BLASN/
	eyeball.circ = function(n) {
		var angle90 = Math.PI / 2;
		var radius = 1;
		var y = radius * Math.sin(angle90 * n);
		return y;
	};

	// Convert an object into a colour string
	// avoid sending around seperate variables for colour components.
	eyeball.obj2Colour = function(obj) {
		var isAlpha = (typeof obj.alpha !== "undefined");
		var colour = '(' + obj.red + ',' + obj.green + ',' + obj.blue + (isAlpha? ',' + obj.alpha : '') + ')';
		return (isAlpha? 'rgba' : 'rgb') + colour;
	};

	// Get the pixel offset of the DOM element taking into account the page being scrolled.
	// from http://javascript.info/tutorial/coordinates
	eyeball.getOffset = function(elem) {
			var box = elem.getBoundingClientRect()
			var body = document.body
			var docElem = document.documentElement
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
			var clientTop = docElem.clientTop || body.clientTop || 0
			var clientLeft = docElem.clientLeft || body.clientLeft || 0
			var top  = box.top +  scrollTop - clientTop
			var left = box.left + scrollLeft - clientLeft
			return { "Top": Math.round(top), "Left": Math.round(left) }
		};
		
} // end of Eyeball class
