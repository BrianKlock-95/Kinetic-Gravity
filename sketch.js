let myImage;
let canvasWidth = 800;
let canvasHeight = 800;
let center = {x:canvasWidth/2, y:canvasHeight/2};
let earthSize = Math.min(canvasWidth/2, canvasHeight/2);
let minArrowLength = 10;
let maxArrowLength = 40;
let headLength = 4;
let headAngle = 25;
let minArrowLengthScaleFactor = 0.5; //from this value up to a max of 1.0
let arrowLengthScaleFactor = 1.0;
let minRadius = (earthSize/2) + 5;
let maxRadius = minRadius + 170;

var points = [ ];
let GREEN;
let YELLOW;
let mySlider;
let panelHeight = 70; //room at bottom for the Absorption slider

async function setup() {
  GREEN = color(69, 212, 53);
  YELLOW = color(237, 237, 43);
  
  createCanvas(canvasWidth, canvasHeight + panelHeight);
  noLoop();
  
  //myImage = await loadImage("https://i.imgur.com/7svKoq5.jpeg");
  //myImage = await loadImage("https://i.imgur.com/Ob0LAHm.png");
  //myImage = await loadImage("https://i.imgur.com/RZ9BBu8.png");
  //myImage = await loadImage("https://i.imgur.com/PaSKlgU.png");
  //myImage = await loadImage("https://i.imgur.com/TW1rjyk.png");
  //myImage = await loadImage("https://i.imgur.com/k1JGyBn.png");
  //myImage = await loadImage("https://i.imgur.com/Os5994w.png");
  //myImage = await loadImage("https://i.imgur.com/WUPrZKK.png");
  //myImage = await loadImage("https://i.imgur.com/SRbvCmm.png");
  myImage = await loadImage("./images/Earth.png");
  
  
  //noLoop();
  await generateArrows(75);

  // Create a slider ranging from 0.00 to 1.00, starting at 0.00, with a step of 0.01
  mySlider = createSlider(0.00, 1.00, 0.00, 0.01);
  mySlider.style('background', '#dede00');
  
  // Size the slider to 75% width
  let sliderWidth = Math.floor(width * 0.75);
  mySlider.style('width', sliderWidth + 'px');
  
  // Position the slider dynamically in the center of the bottom panel
  let sliderX = (width - sliderWidth) / 2;
  let sliderY = height - (panelHeight / 2);
  mySlider.position(sliderX, sliderY);
  mySlider.size( Math.floor(width * 0.75) );
  mySlider.input(handleSliderUpdate);
  handleSliderUpdate();
}
async function handleSliderUpdate() {
  await redraw();
}
function generateArrows(arrowCount) {
  /*let p;
  for (let x=0; x<arrowCount; x++) {
    p = getRandomPointInAnnulus(center.x, center.y, 120, 190);
    points.push(p)
  }*/
  points = generateEvenAnnulusPoints(arrowCount, center.x, center.y, maxRadius, minRadius);
}

function draw() {
  background(0);
  
  //Draw the arrows from the points
  image(myImage,
        center.x - (earthSize/2), center.y - (earthSize/2), 
        earthSize, earthSize);

  let val = (mySlider.value() / 2.0) + 0.5; //it has a range from 0.5 to 1.0
  
  for (const p of points) {
    // Draw the dot (circle)
    fill(YELLOW);
    noStroke();
    circle(p.x, p.y, 5);
    
    //Draw the arrow from the circle toward the center of Earth
    scaleFactor = 0.25 + (mySlider.value()*0.75);
    stroke(YELLOW);

    let ARROW_LENGTH_THRESHOLD = 10;
    let altitude = getDistance(p, center);
    let distanceFactor = 1 - ( (altitude - minRadius) / (maxRadius-minRadius) );
    let arrowLengthSpan = maxArrowLength - minArrowLength;
    let arrowLength = scaleFactor * (minArrowLength + (arrowLengthSpan*distanceFactor));
    arrowLength = arrowLength * arrowLengthScaleFactor;
    if (arrowLength > ARROW_LENGTH_THRESHOLD) {
      strokeWeight(1.5);
      drawArrow(p, center, arrowLength, headLength, headAngle, 'TRIANGLE');
    } else {
      let quadArrowLength = 10;
      let n = {x: p.x, y: p.y - quadArrowLength};
      let s = {x: p.x, y: p.y + quadArrowLength};
      let e = {x: p.x + quadArrowLength, y: p.y};
      let w = {x: p.x - quadArrowLength, y: p.y};

      strokeWeight(0.75);
      drawArrow(p, n, quadArrowLength, headLength, headAngle, 'TRIANGLE');
      drawArrow(p, s, quadArrowLength, headLength, headAngle, 'TRIANGLE');
      drawArrow(p, e, quadArrowLength, headLength, headAngle, 'TRIANGLE');
      drawArrow(p, w, quadArrowLength, headLength, headAngle, 'TRIANGLE');
    }
  }
  
  // 2. Draw the Bottom Panel
  fill(40); // Dark gray background for the panel
  noStroke();
  rect(0, height - panelHeight, width, panelHeight);
  
  // 3. Optional: Add text labels inside the panel
  fill(200);
  textSize(18);
  textAlign(CENTER, TOP);
  text("Earth's Absorption of Neutrino/Subneutrino Momentum", width / 2, height - panelHeight + 8)
  //text("Slider Value: " + bgColor, width / 2, height - panelHeight + 8);
  let textHeight = 14;
  textSize(textHeight);
  text("none", 75, height - textHeight - 20);
  text("high", width - (width*0.125) + 30, height - textHeight - 20);
}

// Keep the layout responsive if the window resizes
function windowResized() {
  //resizeCanvas(windowWidth, windowHeight);
  
  let sliderWidth = Math.floor(width * 0.75);
  mySlider.style('width', sliderWidth + 'px');
  
  let sliderX = (width - sliderWidth) / 2;
  let sliderY = height - (panelHeight / 2);
  mySlider.position(sliderX, sliderY);
}

function rad(degrees) {
  let degreesToRadians = Math.PI / 180.0;
  return degrees * degreesToRadians;
}
function drawArrow(start, center, len, headLen, headAngle, type) {
  // 1. Calculate the angle from start point toward the center point
  let angle = atan2(center.y - start.y, center.x - start.x);
  
  // 2. Calculate the end point of the arrow shaft based on the variable length
  let endPoint = {
    x: start.x + len * cos(angle),
    y: start.y + len * sin(angle)
  };

  // 3. Draw the main arrow shaft (Line 1)
  //stroke(0);
  //strokeWeight(2);
  line(start.x, start.y, endPoint.x, endPoint.y);

  // 4. Calculate the geometry for the arrowhead wings
  // The wings point backward from the end point
  //let angleAdjust = 44.95;
  let leftWingAngle = angle + Math.PI + rad(headAngle);
  let rightWingAngle = angle + Math.PI - rad(headAngle);

  let leftWing = {
    x: endPoint.x + headLen * cos(leftWingAngle),
    y: endPoint.y + headLen * sin(leftWingAngle)
  };

  let rightWing = {
    x: endPoint.x + headLen * cos(rightWingAngle),
    y: endPoint.y + headLen * sin(rightWingAngle)
  };

  // 5. Draw the variable shape arrowhead
  if (type === 'LINES') {
    // Draw 2 independent lines branching from the tip (Lines 2 and 3)
    //noFill();
    line(endPoint.x, endPoint.y, leftWing.x, leftWing.y);
    line(endPoint.x, endPoint.y, rightWing.x, rightWing.y);
  } else if (type === 'TRIANGLE') {
    // Draw a filled triangle connecting the tip and both wings
    //fill(0);
    triangle(endPoint.x, endPoint.y, leftWing.x, leftWing.y, rightWing.x, rightWing.y);
  }
}

function getDistanceFromCenter(cx, cy, x, y) {
  return Math.hypot(x - cx, y - cy);
}

function getDistance(p1, p2) {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

/**
 * Generates evenly spaced 2D points within an annulus (ring).
 * 
 * @param {number} count - Total number of points to generate.
 * @param {number} centerX - X-coordinate of the center.
 * @param {number} centerY - Y-coordinate of the center.
 * @param {number} maxRadius - The outer radius of the bounding circle.
 * @param {number} minRadius - The inner radius to exclude.
 * @returns {Array<{x: number, y: number}>} Array of point objects.
 */
function generateEvenAnnulusPoints(count, centerX, centerY, maxRadius, minRadius) {
    const points = [];
    
    // Golden angle in radians (~137.5 degrees)
    const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); 
    
    for (let i = 0; i < count; i++) {
        // Normalize the index between 0 and 1
        // (Using i + 0.5 avoids placing a point directly on the boundary)
        const t = (i + 0.5) / count;
        
        // Map linearly to area to ensure uniform density across the ring
        // Radius increases with the square root of area to maintain spacing
        const radius = Math.sqrt((1 - t) * Math.pow(minRadius, 2) + t * Math.pow(maxRadius, 2));
        
        // Spiral angle increases by the golden angle for each step
        const angle = i * GOLDEN_ANGLE;
        
        // Convert polar coordinates (radius, angle) to Cartesian (x, y)
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        points.push({ x, y });
    }
    
    return points;
}

/**
 * Generates a random 2D point between an inner and outer radius.
 * @param {number} centerX - The X coordinate of the center.
 * @param {number} centerY - The Y coordinate of the center.
 * @param {number} innerRadius - Perimeter of the inner boundary (points must be outside this).
 * @param {number} outerRadius - Perimeter of the outer boundary (points must be inside this).
 * @return {{x: number, y: number}} The generated 2D point.
 */
function getRandomPointInAnnulus(centerX, centerY, innerRadius, outerRadius) {
    // 1. Get a random uniform angle between 0 and 2*PI radians
    const angle = Math.random() * 2 * Math.PI;
    
    // 2. Scale the radius uniformly relative to the surface area.
    // Using the square root prevents points from bunching up near the inner ring.
    const r = Math.sqrt(Math.random() * (outerRadius * outerRadius - innerRadius * innerRadius) + innerRadius * innerRadius);
    
    // 3. Convert polar coordinates (r, angle) back to Cartesian coordinates (x, y)
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    
    return { x, y };
}

// === Example Usage ===
/**const center = { x: 500, y: 500 };
const innerBound = 150; // Points will be outside this radius
const outerBound = 400; // Points will be inside this radius

const randomPoint = getRandomPointInAnnulus(center.x, center.y, innerBound, outerBound);
console.log(`Generated Point: X = ${randomPoint.x.toFixed(2)}, Y = ${randomPoint.y.toFixed(2)}`);
*/
