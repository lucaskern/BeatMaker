'use strict'
const app = {
  canvas: undefined,
  ctx: undefined,
  firstRun: true,
  accurate: false,
  playBool: true,
  frames: 100,
  framesLimit: 10,
  xSpot: 0,
  grid: [],
  temp: [],
  width: 20,
  height: 20
    //size of each cell in px

    ,
  cellSize: 40
    //max amount of times a cell can be consecutively alive before dying.

    ,
  maxAge: 10
    //how fast it changes color (higher : quicker)

    ,
  colorRate: 6
    //color values for bg

    ,
  colorMode: "default"
    //color of cells

    ,
  colorVal: null
    //live neighbor count

    ,
  liveCount: 0
    //create an audioCtx  

    ,
  audCtx: undefined
    // create an oscillator

    ,
  osc: undefined,
  playNote: function (frequency, attack, decay, cmRatio, index) {
    //let audCtx = new AudioContext();
    // create our primary oscillator
    const carrier = this.audCtx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = frequency;
    // create an oscillator for modulation
    const mod = this.audCtx.createOscillator();
    mod.type = 'sine';
    // The FM synthesis formula states that our modulators 
    // frequency = frequency * carrier-to-modulation ratio.
    mod.frequency.value = frequency * cmRatio;
    const modGainNode = this.audCtx.createGain();
    // The FM synthesis formula states that our modulators 
    // amplitude = frequency * index
    modGainNode.gain.value = frequency * index;
    mod.connect(modGainNode);
    // plug the gain node into the frequency of
    // our oscillator
    modGainNode.connect(carrier.frequency);
    const envelope = this.audCtx.createGain();
    envelope.gain.linearRampToValueAtTime(1, this.audCtx.currentTime + attack);
    envelope.gain.linearRampToValueAtTime(0, this.audCtx.currentTime + attack + decay);
    carrier.connect(envelope);
    envelope.connect(this.audCtx.destination);
    mod.start(this.audCtx.currentTime);
    carrier.start(this.audCtx.currentTime);
    mod.stop(this.audCtx.currentTime + attack + decay);
    carrier.stop(this.audCtx.currentTime + attack + decay);
    //this.osc.close();
  },
  init: function () {
      console.log("app.main.init() called");
      // initialize properties
      this.canvas = document.querySelector('canvas');
      this.canvas.width = this.width * this.cellSize;
      this.canvas.height = this.height * this.cellSize;
      this.ctx = this.canvas.getContext('2d');
      //set up controls
      this.controls();
      console.log("init ran");
      this.audCtx = new AudioContext();
      // create an oscillator
      this.osc = this.audCtx.createOscillator();
      // change waveform of oscillator
      this.osc.type = 'sawtooth';
      // start the oscillator running
      this.osc.start();
      //set up grid on first init only
      if (this.firstRun) {
        this.gridSetup();
        this.firstRun = false;
      }
      //this.playNote(880, .01, 1, 1.5307, 1);
      this.update();
    }
    //create grid using default or user modified values

    ,
  gridSetup: function () {
      this.grid = [];
      this.temp = [];
      //create canvas at appropriate size
      this.canvas.width = this.width * this.cellSize;
      this.canvas.height = this.height * this.cellSize;
      this.ctx.fillStyle = "black";
      this.ctx.fillRect(0, 0, 3000, 3000);
      //instantiate spaces in arrays
      for (let y = 0; y < this.height; y++) {
        this.grid[y] = [[]];
        this.temp[y] = [[]];
        for (let x = 0; x < this.width; x++) {
          //fill with random values 
          this.grid[y][x] = [0];
          this.temp[y][x] = [0];
          //create border
          if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
            this.grid[y][x] = 0;
          }
        }
      }
    }
    //set up value controllers

    ,
  getMousePos: function (canvas, evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor((evt.clientX - rect.left) / this.cellSize),
      y: Math.floor((evt.clientY - rect.top) / this.cellSize)
    };
  },
  clickEffect: function (xCoord, yCoord) {

    if (this.grid[yCoord][xCoord][0] == 0) {
      let freqVal = parseFloat(document.getElementById("freq").value);
      let attackVal = parseFloat(document.getElementById("attack").value);
      let decayVal = parseFloat(document.getElementById("decay").value);
      let cmVal = parseFloat(document.getElementById("cm").value);
      let indexVal = parseFloat(document.getElementById("indexV").value);

      //this.playNote(freqVal, attackVal, decayVal, cmVal, indexVal);

      this.grid[yCoord][xCoord][0] = 1;
      this.grid[yCoord][xCoord][1] = freqVal;
      this.grid[yCoord][xCoord][2] = attackVal;
      this.grid[yCoord][xCoord][3] = decayVal;
      this.grid[yCoord][xCoord][4] = cmVal;
      this.grid[yCoord][xCoord][5] = indexVal;
    } else {
      for (let i = 0; i < this.grid[yCoord][xCoord].length; i++){
       this.grid[yCoord][xCoord][i] = 0;
      }
    }

    //console.log(xCoord + "," + yCoord);
  },
  controls: function () {
    let thisRef = this;
    document.querySelector("canvas").addEventListener('click', function (evt) {
      var mousePos = thisRef.getMousePos(this.canvas, evt);
      var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
      //console.log(message);
      thisRef.clickEffect(mousePos.x, mousePos.y);
    }, false);
    document.querySelector("#play").onclick = function (e) {
      thisRef.play();
    };
    document.querySelector("#forward").onclick = function (e) {
      thisRef.forward();
    };
    document.querySelector("#speed").onchange = function (e) {
      thisRef.framesLimit = e.target.value;
      document.querySelector("#speedVal").value = e.target.value;
    };
  },
  runAutomata: function () {
    // loop through every cell
    // look at cell neighbors and count live ones
    // determine next cell state based on neighbor count
    // set temp [y][x] -> new cell state
    this.liveCount = 0;
    //loop through and count live neighbors
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {}
    }
    // after for loop swap grid and temp arrays
    let swap = this.grid;
    this.grid = this.temp;
    //swap if conway rules is selected by user
    if (this.accurate) {
      this.temp = swap;
    }
  },
  draw: function (xSpot) {
    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = 'red';
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.grid[y][x][0] == 1) {
          //fill and stroke rects
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize)

        }
      }
    }

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
      }
    }

    
    for (let y = 0; y < this.height; y++) {
      if (this.grid[y][xSpot][0] == 1) {
        this.playNote(this.grid[y][xSpot][1], this.grid[y][xSpot][2], this.grid[y][xSpot][3], this.grid[y][xSpot][4], this.grid[y][xSpot][5]);

      }
      this.ctx.fillStyle = "rgba(40, 240, 10, 0.4)";
      this.ctx.fillRect(xSpot * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
  },
  play: function () {
    if (this.playBool) {
      this.playBool = false;
    } else {
      this.playBool = true;
    }
    console.log("play");
  },
  forward: function () {
    //this.draw();
    this.xSpot++;
  },
  update: function () {
    this.animationID = requestAnimationFrame(this.update.bind(this));
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //only draw once threshold is passed
    if (this.playBool) {
      if (this.frames >= this.framesLimit) {
        this.draw(this.xSpot);
        this.frames = 0;

        if (this.xSpot < this.width - 1) {
          this.xSpot = this.xSpot + 1;
        } else {
          this.xSpot = 0;
        }
      }
      this.frames++;
    } else if (!this.playBool) {
      this.draw(this.xSpot);
    }
    //stop tracking fps
    //window.requestAnimationFrame(update);
  }
}
module.exports = app;
