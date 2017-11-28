'use strict'
var canvas = undefined;
var ctx = undefined;
var firstRun = true;
var accurate = false;
var playBool = true;
var frames = 100;
var framesLimit = 10;
var xSpot = 0;
var grid = [];
var temp = [];
var width = 20;
var height = 8;
//size of each cell in px
var cellSize = 40;
//max amount of times a cell can be consecutively alive before dying.
var maxAge = 10;
//how fast it changes color (higher  = quicker)
var colorRate = 6;
//color values for bg
var colorMode = "default";
//color of cells
var colorVal = null;
//live neighbor count
var liveCount = 0;
//create an audioCtx  
var audCtx = undefined;
// create an oscillator
var osc = undefined;

var playNote = function (frequency, attack, decay, cmRatio, index) {
  //let audCtx = new AudioContext();
  // create our primary oscillator
  const carrier = audCtx.createOscillator();
  carrier.type = 'sine';
  carrier.frequency.value = frequency;
  // create an oscillator for modulation
  const mod = audCtx.createOscillator();
  mod.type = 'sine';
  // The FM synthesis formula states that our modulators 
  // frequency = frequency * carrier-to-modulation ratio.
  mod.frequency.value = frequency * cmRatio;
  const modGainNode = audCtx.createGain();
  // The FM synthesis formula states that our modulators 
  // amplitude = frequency * index
  modGainNode.gain.value = frequency * index;
  mod.connect(modGainNode);
  // plug the gain node into the frequency of
  // our oscillator
  modGainNode.connect(carrier.frequency);
  const envelope = audCtx.createGain();
  envelope.gain.linearRampToValueAtTime(1, audCtx.currentTime + attack);
  envelope.gain.linearRampToValueAtTime(0, audCtx.currentTime + attack + decay);
  carrier.connect(envelope);
  envelope.connect(audCtx.destination);
  mod.start(audCtx.currentTime);
  carrier.start(audCtx.currentTime);
  mod.stop(audCtx.currentTime + attack + decay);
  carrier.stop(audCtx.currentTime + attack + decay);
  //osc.close();
}

var init = function () {
  console.log("app.main.init() called");
  // initialize properties
  canvas = document.querySelector('canvas');
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;
  ctx = canvas.getContext('2d');
  //set up controls
  controls();
  console.log("init ran");
  audCtx = new AudioContext();
  // create an oscillator
  osc = audCtx.createOscillator();
  // change waveform of oscillator
  osc.type = 'sawtooth';
  // start the oscillator running
  osc.start();
  //set up grid on first init only
  if (firstRun) {
    gridSetup();
    firstRun = false;
  }
  //playNote(880, .01, 1, 1.5307, 1);
  update();
}

//create grid using default or user modified values
var gridSetup = function () {
  grid = [];
  temp = [];
  //create canvas at appropriate size
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, 3000, 3000);
  //instantiate spaces in arrays
  for (let y = 0; y < height; y++) {
    grid[y] = [[]];
    temp[y] = [[]];
    for (let x = 0; x < width; x++) {
      //fill with random values 
      grid[y][x] = [0];
      temp[y][x] = [0];
      //create border
      if (x == 0 || y == 0 || x == width - 1 || y == height - 1) {
        grid[y][x] = 0;
      }
    }
  }
}

//set up value controllers
var getMousePos = function (canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((evt.clientX - rect.left) / cellSize),
    y: Math.floor((evt.clientY - rect.top) / cellSize)
  };
}
var clickEffect = function (xCoord, yCoord) {
  if (grid[yCoord][xCoord][0] == 0) {
    let freqVal = parseFloat(document.getElementById("freq").value);
    let attackVal = parseFloat(document.getElementById("attack").value);
    let decayVal = parseFloat(document.getElementById("decay").value);
    let cmVal = parseFloat(document.getElementById("cm").value);
    let indexVal = parseFloat(document.getElementById("indexV").value);
    //playNote(freqVal, attackVal, decayVal, cmVal, indexVal);
    grid[yCoord][xCoord][0] = 1;
    grid[yCoord][xCoord][1] = freqVal;
    grid[yCoord][xCoord][2] = attackVal;
    grid[yCoord][xCoord][3] = decayVal;
    grid[yCoord][xCoord][4] = cmVal;
    grid[yCoord][xCoord][5] = indexVal;
  } else {
    for (let i = 0; i < grid[yCoord][xCoord].length; i++) {
      grid[yCoord][xCoord][i] = 0;
    }
  }
  //console.log(xCoord + "," + yCoord);
}
var controls = function () {
    document.querySelector("canvas").addEventListener('click', function (evt) {
      var mousePos = getMousePos(canvas, evt);
      var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
      //console.log(message);
      clickEffect(mousePos.x, mousePos.y);
      console.log("canvas click");
    }, false);
  document.querySelector("#play").onclick = function (e) {
    play();
  };
  document.querySelector("#forward").onclick = function (e) {
    forward();
  };
  document.querySelector("#speed").onchange = function (e) {
    framesLimit = e.target.value;
    document.querySelector("#speedVal").value = e.target.value;
  };
}
var runAutomata = function () {
  // loop through every cell
  // look at cell neighbors and count live ones
  // determine next cell state based on neighbor count
  // set temp [y][x] -> new cell state
  liveCount = 0;
  //loop through and count live neighbors
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {}
  }
  // after for loop swap grid and temp arrays
  let swap = grid;
  grid = temp;
  //swap if conway rules is selected by user
  if (accurate) {
    temp = swap;
  }
}
var draw = function (xSpot) {
  ctx.fillStyle = 'black';
  ctx.strokeStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x][0] == 1) {
        //fill and stroke rects
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
      }
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
  for (let y = 0; y < height; y++) {
    if (grid[y][xSpot][0] == 1) {
      playNote(grid[y][xSpot][1], grid[y][xSpot][2], grid[y][xSpot][3], grid[y][xSpot][4], grid[y][xSpot][5]);
    }
    ctx.fillStyle = "rgba(40, 240, 10, 0.4)";
    ctx.fillRect(xSpot * cellSize, y * cellSize, cellSize, cellSize);
  }
}
var play = function () {
  if (playBool) {
    playBool = false;
  } else {
    playBool = true;
  }
  console.log("play");
}
var forward = function () {
  //draw();
  xSpot++;
}
var update = function () {
  var animationID = requestAnimationFrame(update.bind());
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  //only draw once threshold is passed
  if (playBool) {
    if (frames >= framesLimit) {
      draw(xSpot);
      frames = 0;
      if (xSpot < width - 1) {
        xSpot = xSpot + 1;
      } else {
        xSpot = 0;
      }
    }
    frames++;
  } else if (!playBool) {
    draw(xSpot);
  }
  //stop tracking fps
  //window.requestAnimationFrame(update);
}

window.addEventListener('load', function () {
  console.log("window.onload ran");
  init();
});
