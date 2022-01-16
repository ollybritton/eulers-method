var num = 500;
var limit = 800;
var particles = [];
var h = 1;
var normalise = true;
var sketchHeight = 0.7;

var minX, minY, maxX, maxY = 0;
var inputFunction, buttonUpdate, sliderH, checkboxNormalise;
var f = (x, y) => x/Math.abs(y);


function windowResized() {
  resizeCanvas(windowWidth, windowHeight * sketchHeight);
  
  minX = -width / 2
  maxX = width / 2
  minY = -height / 2
  maxY = height / 2
}

function setup() {
  createCanvas(windowWidth, windowHeight * sketchHeight).parent("sketch");
  noStroke();

  minX = -width / 2
  maxX = width / 2
  minY = -height / 2
  maxY = height / 2
  
  inputFunction = createInput()
  inputFunction.parent("controls-input-function")
  inputFunction.attribute("placeholder", "x/abs(y)")

  buttonUpdate = createButton("Update")
  buttonUpdate.parent("controls-button-update")
  buttonUpdate.mousePressed(updateFunction)
  
  sliderH = createSlider(0.01, 10, 5, 0.001)
  sliderH.parent("controls-slider-h")
  sliderH.input(updateH)
  sliderLimit = createSlider(1, 1000, 800, 1)
  sliderLimit.parent("controls-slider-limit")
  sliderLimit.input(updateLimit)

  checkboxNormalise = createCheckbox("Variable step size?", true)
  checkboxNormalise.parent("controls-checkbox-normalise")
  checkboxNormalise.changed(() => { normalise = !normalise })

  for (let i = 0; i < num; i++) {
    var loc = createVector(random(minX * 1.5, maxX * 1.5), random(minY * 1.5, maxY * 1.5), 2)
    particles[i] = new Particle(loc)
  }
}

function updateH() {
  h = sliderH.value()**2/25
  document.getElementById("step-size").innerHTML = Math.round(h * 1000)/1000
}

function updateLimit() {
  limit = sliderLimit.value()
  document.getElementById("particle-limit").innerHTML = limit
}

function updateFunction() {
  candidate = eval(`(x, y) => ${inputFunction.value()}`)
  
  try {
    candidate(0, 0)
  } catch (error) {
    document.getElementById("error").innerHTML = `Hmmm. That didn't work. Javascript said: <pre>${error}</pre>`
    return
  }
  
  f = candidate
  document.getElementById("error").innerHTML = ""
}

function newPoint() {
  var loc = createVector(
    map(mouseX, 0, width, minX, maxX),
    map(mouseY, height, 0, minY, maxY),
    3,
  )

  particles.push(
    new Particle(loc)
  )
}

function mouseClicked() {
  newPoint();
}

function mouseDragged() {
  newPoint();
}

function draw() {
  fill(0, 10);

  line(-width / 2)

  noStroke(0);
  rect(0, 0, width, height);

  translate(width / 2, height / 2)
  scale(1, -1)

  line(0, minY, 0, maxY)
  line(minX, 0, maxX, 0)

  for (let i = 0; i < particles.length; i++) {
    particles[i].run()
  }
  
  // for (let i = 0; i < particles.length - limit; i++) {
  //   var loc = createVector(random(minX * 1.5, maxX * 1.5), random(minY * 1.5, maxY * 1.5), 2)
  //   particles.push(new Particle(loc))
  // }
}

class Particle {
  constructor(loc) {
    this.loc = loc;
    this.mag = 0;
  }

  run() {
    this.move();
    this.checkEdges();
    this.update();
  }

  move() {
    let vec = createVector(1, f(this.loc.x, this.loc.y))
    this.mag = vec.mag()

    if (normalise) {
      // Work around to stop really big magnitudes making the point freeze.
      if (vec.mag() > 1_000_000) {
        this.loc = createVector(-1_000_000, 1_000_000)
      }

      vec.mult(h / this.mag)
    } else {
      vec.mult(h)
    }

    this.loc.add(vec)
  }

  checkEdges() {
    if (this.loc.x < minX || this.loc.x > maxX || this.loc.y < minY || this.loc.y > maxY) {
      if (particles.length < limit) {
        this.loc.x = random(minX * 1.5, maxX * 1.5)
        this.loc.y = random(minY * 1.5, maxY * 1.5)
      } else {
        particles.splice(particles.indexOf(this), 1);
      }
    }
  }

  update() {
    fill(color(255, 255, 255));
    ellipse(this.loc.x, this.loc.y, this.loc.z)
  }
}

// This code sets up the click-to-preview examples.
for (let elem of document.querySelectorAll(".example")) {
  elem.addEventListener("click", () => {
    
    inputFunction.value(elem.getAttribute("data-expr"))
    updateFunction()
    window.scrollTo({top: 0, behavior: 'smooth'});
  })
}