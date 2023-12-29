html5eyeball
============

Html5 Canvas/JavaScript based semi-realistic eyeball

![Eyeball rendered with yellow iris](/screenshots/eyeball_yellow.jpg?raw=true "Eyeball example, yellow iris")

![Eyeball rendered with green iris](/screenshots/eyeball_green.jpg?raw=true "Eyeball example, green iris")

Architected from the ground up to be fully configurable. From iris colour and eyeball size to vein complexity and rotation limits.

There are over twenty user settings allowing ultra-realistic renderings to bizarre and frightening Halloween visions of horror.

Sensible defaults means nothing other than the div to render to is required.

Framework agnostic: Uses vanilia javascript. 

Examples

[Live demo with image cut-outs](http://robgithub.github.io/html5eyeball/examples/cutout.html)

[Live demo with image cut-outs, eyeballs linked](http://robgithub.github.io/html5eyeball/examples/cutout_linked.html)

[Live demo twelve independent eyeballs](http://robgithub.github.io/html5eyeball/examples/twelve_eyeballs.html)

[Live demo alter eyeball settings and see changes](http://robgithub.github.io/html5eyeball/examples/select_your_eyeball.html)

## Usage

Include the **html5eyeball.js** and create the *eyeball* object by calling the constructor with the *id* of the html element you want to hold the *eyeball*.

```javascript
var eyeball = new Eyeball("eyeball"); 
```

Once you have the **eyeball** object you can set properties on it and call methods.

```javascript
eyeball.travel = 0.6; 
```

to generate or re-generate the *eyeball* call **init()**

```javascript
eyeball.init(); 
```

The *CSS* size of the element hosting the *eyeball* defines the diameter of the *eyeball*

## Settings

### travel
Distance the iris is allowed to travel within the eyeball. 

### numLinesIris
Number of random lines that are projected from the centre of the iris. 

### eyeColour
Initial iris colour. [[1]](#colour "Colour JSON Definition")

### irisOuterColour
This is the colour that the iris lines fade to randomly, normally a highly transparent colour. [[1]](#colour "Colour JSON Definition")

### irisInternalColour
Is the ambient iris colour where no **eyeColour** or **irisOuterColour** rendered pixels exist. Normally set to black. [[1]](#colour "Colour JSON Definition")

### eyeballGradient1
The central part of the background eyeball's colour, often white, takes up 75%. [[1]](#colour "Colour JSON Definition")

### eyeballGradient2
The next 10% of the eyeball background gradient. [[1]](#colour "Colour JSON Definition")

### eyeballGradient3
The last 15% of the eyeball background gradient, the edge. [[1]](#colour "Colour JSON Definition")

### veinColour
Colour of the veins. [[1]](#colour "Colour JSON Definition")

### veinWidth
The width of the veins. Where "1.0" sets a line to have a 1px width, non-anti aliased. Any non whole number creates an nice smooth anti aliased result. 

### veinBranches
The number of times the vein algorithm will create a new branch. A value of "1" creates no branches only the initial single starting line.

WARNING! Setting high values will slow your computer down exponentially and as each branch gets shorter you will not see them anyway. 

### pupilScale
Set to "1.0" the pupil will be drawn with a diameter of 1/6th the diameter of the eyeball. 

### animatePupil
When **setIris()** is called the pupil will be drawn twice its current size and then at 30 frames per second it will shrink back to it's normal diameter. The scaling algorithm uses the non-linear circle scaling method. 

### pupilColour
Colour of the pupil, I suggest black. [[1]](#colour "Colour JSON Definition")

### highlight1/highlight2
These two parameters define the location, size and appearance of the two highlights.

The setting is a JSON string defining
+ **x** horizontal location as a decimal of total width. e.g. 0.5 is half way.
+ **y** vertical location as a decimal of total height. e.g. 0.0 is the top.
+ **width** width as a decimal of total width. e.g. 0.5 is half the total size.
+ **height** height as a decimal of total height. e.g. 1.0 is the same as the full height.
+ **colour1** inner colour [[1]](#colour "Colour JSON Definition")
+ **colour2** outer or edge colour [[1]](#colour "Colour JSON Definition")

```javascript
{"x":.35, "y":.35, "width":.16, "height":.1, "colour1" : {"red":200, "green":200, "blue":200, "alpha" : 0.4}, "colour2" : {"red":0, "green":0, "blue":0, "alpha" : 0.0}};
```

### irisColours
An array of colours [[1]](#colour "Colour JSON Definition") used as a random pool when the **setIris()** method is called. 

### hideRenderLayers 
If **false** does not set the CSS *display:none* on the canvas layers that make up the *eyeball*.

### hideMarkers 
If **false** renders triangle markers on the *eyeball* for diagnostics.

### useCircleScaling 
If **false** uses a linear method of scaling the iris.

### targetId
This is the string *id* of the element you want to contain the eyeball. It is set via the constructor and I can not think of a good reason why you would set it manually. 

## Methods

### init()
Call after the settings are correct, it will recreate all the required layers. 

### doDraw(mx, my)
With no parameters centres the eye. Often called with the mouse coordinates to set the eye to look at the mouse location. 

```javascript
$(window).mousemove(function (event) {
    eyeball.doDraw(event.pageX, event.pageY);
}); 
```
### setIris()
When called with no parameters sets the iris to a random colour from the **irisColours** array. As this is truly random, there is a possibility that the colour chosen will the colour already in use.
If **animatePupil** is **true** then the pupil is animated.

NOTE If **animatePupil** is **false** then the iris colour is updated but *not* redrawn, call **doDraw()**.

## History and related links

+ [birth of the html5eyeball project](http://www.jumpstation.co.uk/flog/May2014.html#p220520142234) An overview of where this project came from.
+ [eyeball scaling is number one](http://www.jumpstation.co.uk/flog/May2014.html#p230520142146) Discussion about allowing the *eyeball* to be rendered at any size.
+ [the importance of eyeball canvas layering](http://www.jumpstation.co.uk/flog/May2014.html#p240520142112) Detailing the canvas layers and layering.
+ [non linear circular scaling for a better eyeball](http://www.jumpstation.co.uk/flog/May2014.html#p250520141135) How the circular scaling method came about.
+ [Lightning strikes a cord with veins in the html5 eyeball](http://www.jumpstation.co.uk/flog/May2014.html#p250520142238) History of the veins recursive algorithm.
+ [tie up your pupil in an iris](http://www.jumpstation.co.uk/flog/May2014.html#p280520142221) Notes on the iris and pupil drawing. Includes the **setPupil()** method that has been superseded by **setIris()**.
+ [html5eyeball highlights the highlights](http://www.jumpstation.co.uk/flog/May2014.html#p280520142248) Setting the highlights.
+ [Hating jQuery is overrated](http://www.jumpstation.co.uk/flog/May2014.html#p290520142028) Explaining the removal of jQuery as a requirement and the JavaScript object model used.
+ [auto offsets make eyeball life easy](http://www.jumpstation.co.uk/flog/Jun2014.html#p010620141159) Code required to *find* the offset of an *eyeball* on the page.
+ [html5eyeball settings and methods](http://www.jumpstation.co.uk/flog/Jun2014.html#p010620142040) The basis of the *settings* and *methods* on this page.

## notes

### Colour
Defined as a JSON object with "red", "green" and "blue" with values from 0 to 255 and "alpha" which is a value between 0.0 and 1.0 

```javascript
{"red":0,   "green":255, "blue":255};
{"red":100, "green":100, "blue":100, "alpha":0.5}
```

