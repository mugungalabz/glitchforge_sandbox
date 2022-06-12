import { lightenHSL, lighten, wAlpha, getAngleBetweenPoints, getIntersectionOfTwoLines, getTrianglePoints } from "../util.js"
import { addAuthorRoyalties } from "../royalties.js"
const AUTHOR_TEZOS_ADDRESS = "tz1heFSv4WcJ6AQR6xkPsp7jMsvCeEm11yrs"
/*
 Override Math.random() with the seeded random value
*/
let random = null;
export function init(rnd) {
  Math.random = rnd;
}
/*
  diceFrame creates a copy of the sketch sent to it, and dices the frame 
  into offset vertical sections. 

  Parameters:
  n -> How many vertical slices to create
  verticalOffsetPct -> percentage of the height of the sketch to move the slice
  sk -> The sketch is the target of the dice
  g -> The graphics object to dice and overlay on the sketch
  options -> An object containing options for the diceFrame function
*/
export function sliceFrame(n, verticalOffsetPct, sketch, graphic, options, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties)
  let DIM = sketch.width;
  let verticalOffset = sketch.height * verticalOffsetPct
  let minSliceWidth = options.minSliceWidth ? sketch.max(options.minSliceWidth, 1) : 1;
  let sliceWidth = DIM / n;
  let currSliceWidth = sliceWidth
  let xOffset = 0;
  let loopCounter = 0

  //Traverse from left to right, taking vertical slices and shifting them up or down
  while (xOffset < DIM) {
    if (loopCounter > (DIM / (minSliceWidth + 5))) break;
    let yOffset = (Math.random() * verticalOffset - verticalOffset / 2)// * (1 - Math.abs(xOffset - DIM / 2) / DIM / 2) * ((1 - Math.abs(xOffset - DIM / 2) / DIM / 2));
    let rplace = xOffset;
    if (options.randomReplace) {
      rplace = Math.random() * DIM
    }
    if (options.randomSliceWidth) {
      currSliceWidth = Math.floor(minSliceWidth + Math.random() * (sliceWidth - minSliceWidth));
    }
    sketch.image(graphic, xOffset, yOffset, currSliceWidth, DIM, rplace, 0, currSliceWidth, DIM)
    xOffset += currSliceWidth;
  }

}

/*
  Random Line Effect
*/
function hairlineThroughVertex(vertex, p1, p2, innerp1, innerp2, radii, c, sk, rnd, options) {
  let saveColorMode = sk._colorMode;
  let distance = sk.dist(p1.x, p1.y, p2.x, p2.y)
  let currDist = 0;
  let guidelineAngle = getAngleBetweenPoints({ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }, sk)
  let lCnt = 0;
  let lineColor = [c[0], 20 + rnd() * 80, 20 + rnd() * 60, 1]
  let currRGBColor;

  let linesToDraw = []
  while (currDist < distance) {

    let currX = p1.x + currDist * sk.cos(guidelineAngle)
    let currY = p1.y + currDist * sk.sin(guidelineAngle)
    let innerPoint = getIntersectionOfTwoLines(
      {
        p1: { x: innerp1.x, y: innerp1.y },
        p2: { x: innerp2.x, y: innerp2.y }
      },
      {
        p1: { x: vertex.x, y: vertex.y },
        p2: { x: currX, y: currY }
      });
    if (options.mode == "RefInner") {
      options.ref.colorMode(sk.RGB)
      currRGBColor = options.ref.get(innerPoint.x, innerPoint.y)
      let currHSLColor = sk.color(currRGBColor)
      lineColor = [sk.hue(currHSLColor), sk.saturation(currHSLColor), sk.lightness(currHSLColor), 1]
      sk.colorMode(sk.HSL)
      sk.stroke(lineColor);
    }
    linesToDraw.push({
      p1: { x: currX, y: currY },
      p2: { x: innerPoint.x, y: innerPoint.y },
      hsl: lineColor,
      rgb: currRGBColor,
      sortval: Math.random()
    })
    currDist += 1;
    lCnt++;
  }
  sk.colorMode(sk.HSL)
  sk.strokeWeight(2)
  linesToDraw.sort((a, b) => {
    return a.sortval - b.sortval
  })
  for (let i = 0; i < linesToDraw.length; i++) {
    let l = linesToDraw[i]
    sk.stroke(lightenHSL(l.hsl, 20))
    sk.line(l.p1.x, l.p1.y, l.p2.x, l.p2.y)
  }
  sk.colorMode(saveColorMode);
}

/*
  Very specifc effect for drawing lines that fan out from the triangle. 
*/
export function hairTriangle(vertex, angle, innerRadius, outerRadius, c, sk, rnd, options) {
  sk.noFill()
  sk.strokeWeight(1)
  let PI = sk.PI;
  let innerCorners = [
    vertex.x + innerRadius * sk.cos(angle),
    vertex.y + innerRadius * sk.sin(angle),
    vertex.x + innerRadius * sk.cos((angle + 2 * PI / 3) % (2 * PI)),
    vertex.y + innerRadius * sk.sin((angle + 2 * PI / 3) % (2 * PI)),
    vertex.x + innerRadius * sk.cos((angle + 4 * PI / 3) % (2 * PI)),
    vertex.y + innerRadius * sk.sin((angle + 4 * PI / 3) % (2 * PI)),
  ]
  let corners = [
    vertex.x + outerRadius * sk.cos(angle),
    vertex.y + outerRadius * sk.sin(angle),
    vertex.x + outerRadius * sk.cos((angle + 2 * PI / 3) % (2 * PI)),
    vertex.y + outerRadius * sk.sin((angle + 2 * PI / 3) % (2 * PI)),
    vertex.x + outerRadius * sk.cos((angle + 4 * PI / 3) % (2 * PI)),
    vertex.y + outerRadius * sk.sin((angle + 4 * PI / 3) % (2 * PI)),
  ]
  if (options.mode && options.mode == "RefInnerSliding") {
    let topN = options.topN ? options.topN : 8;
  }
  hairlineThroughVertex(
    vertex,
    { x: corners[2], y: corners[3] },
    { x: corners[0], y: corners[1] },
    { x: innerCorners[2], y: innerCorners[3] },
    { x: innerCorners[0], y: innerCorners[1] },
    outerRadius,
    c,
    sk,
    rnd,
    options
  )
  hairlineThroughVertex(
    vertex,
    { x: corners[4], y: corners[5] },
    { x: corners[0], y: corners[1] },
    { x: innerCorners[4], y: innerCorners[5] },
    { x: innerCorners[0], y: innerCorners[1] },
    outerRadius,
    c,
    sk,
    rnd,
    options
  )
  let bottom = true;
  if (bottom) {
    hairlineThroughVertex(
      vertex,
      { x: corners[4], y: corners[5] },
      { x: corners[2], y: corners[3] },
      { x: innerCorners[4], y: innerCorners[5] },
      { x: innerCorners[2], y: innerCorners[3] },
      outerRadius,
      c,
      sk,
      rnd,
      options
    )
  }

}

export function outerMaskTriangle(graphic, center, radius, scale, angles) {
  let outerRadius = radius * scale;
  graphic.beginShape();
  graphic.vertex(center[0] + radius * graphic.cos(angles[0]),
    center[1] + radius * graphic.sin(angles[0]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[0]),
    center[1] + outerRadius * graphic.sin(angles[0]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[1]),
    center[1] + outerRadius * graphic.sin(angles[1]))
  graphic.vertex(center[0] + radius * graphic.cos(angles[1]),
    center[1] + radius * graphic.sin(angles[1]))
  graphic.endShape();
  graphic.beginShape();
  graphic.vertex(center[0] + radius * graphic.cos(angles[1]),
    center[1] + radius * graphic.sin(angles[1]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[1]),
    center[1] + outerRadius * graphic.sin(angles[1]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[2]),
    center[1] + outerRadius * graphic.sin(angles[2]))
  graphic.vertex(center[0] + radius * graphic.cos(angles[2]),
    center[1] + radius * graphic.sin(angles[2]))
  graphic.endShape();
  graphic.beginShape();
  graphic.vertex(center[0] + radius * graphic.cos(angles[0]),
    center[1] + radius * graphic.sin(angles[0]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[0]),
    center[1] + outerRadius * graphic.sin(angles[0]))
  graphic.vertex(center[0] + outerRadius * graphic.cos(angles[2]),
    center[1] + outerRadius * graphic.sin(angles[2]))
  graphic.vertex(center[0] + radius * graphic.cos(angles[2]),
    center[1] + radius * graphic.sin(angles[2]))
  graphic.endShape();
}

/*
  Draw a z Shaped pipe
  
  Parameters:
    vertex -> x,y starting position of the Z-shape
    graphic -> p5.js graphics object
    val -> arbitrary value between 0 and 1 used to determine juxtaposition of the Z-line
    len -> Size of the Z-shape
*/
export function zLines(vertex, graphic, val, len) {
  let x = vertex.x;
  let y = vertex.y;
  if (val < .25) {
    graphic.line(x, y, x - len, y);
    graphic.line(x, y, x + len, y - len);
    graphic.line(x + len, y - len, x + len * 2, y - len);
  } else if (val < .5) {
    graphic.line(x, y, x - len, y)
    graphic.line(x, y, x + len, y + len)
    graphic.line(x + len, y + len, x + len * 2, y + len)
  } else if (val < .75) {
    graphic.line(x, y, x + len, y);
    graphic.line(x, y, x - len, y + len);
    graphic.line(x - len, y + len, x - len * 2, y + len);
  } else {
    graphic.line(x, y, x + len, y);
    graphic.line(x, y, x - len, y - len);
    graphic.line(x - len, y - len, x - len * 2, y - len);

  }
}


export function centeredTriangle(dims, G) {
  G["sketch"].triangle(dims[0], dims[1],
    (G["WIDTH"] - dims[2]) / 2, dims[1] + dims[3],
    dims[2] + (G["WIDTH"] - dims[2]) / 2, dims[1] + dims[3]
  );
}

/*
  Draw a fading glow around an equilateral triangle
  
  Parameters:
    center -> Center x, y vertex of the triangle
    angle -> starting angle of the triangle
    radius -> "radius" of the triangle is the center to the tip
    c -> color
    options -> nuance parameters
    graphic -> p5.js graphics object to draw on
    DIM -> Dimensions of the canvas (Assumes a Square)
*/
export function fadeTriangle(center, angle, radius, c, options, graphic, DIM) {
  // graphic.fill(0, 0, 0, 1)
  // graphic.circle(DIM/2, DIM/2, radius)
  let x = center.x
  let y = center.y
  // console.log("BEGIN FADE TRIANGLE:" + c);
  let startC = [c[0], c[1], c[2]]
  let glowPixels = options.glowPixels ? options.glowPixels : DIM / 8;
  // glowPixels = 5;
  let alphaMultiplier = options.rgbMode ? 255 : 1;
  if (options.rgbMode && options.maxAlpha) {
    alphaMultiplier = options.maxAlpha;
  }
  //  console.log("Max Alpha for fade triangle:", alphaMultiplier);
  let rev = options.rev
  let haloRev = options.outerBrightnessRev;
  let cycles = options.cycles ? options.cycles : 1;
  let outerBrightness = options.outerBrightness ? options.outerBrightness : c[2];
  let curveMultiplier = options.curveMultiplier ? options.curveMultiplier : 1;
  // console.log("outerBrightness: " + outerBrightness)
  // console.log("color: " + c)
  radius += glowPixels;
  graphic.noFill();
  var glowColor = [c[0], c[1], c[2], 0];
  // console.log("starting triangle...on glowcolor: " + glowColor)

  //debug outline
  graphic.strokeWeight(2);
  graphic.stroke(c);
  let tri = getTrianglePoints({ center: { x: x, y: y }, angle: angle, radius: radius }, graphic);
  graphic.triangle(tri[0], tri[1], tri[2], tri[3], tri[4], tri[5])
  let tcounter = 0;
  graphic.strokeWeight(1);
  for (let i = 0; i < glowPixels; i++) {
    tcounter++;
    graphic.stroke(glowColor);
    let tri = getTrianglePoints({ center: { x: x, y: y }, angle: angle, radius: radius }, graphic);
    graphic.triangle(tri[0], tri[1], tri[2], tri[3], tri[4], tri[5])
    radius--;
    let pval = Math.cos(Math.pow((i / glowPixels), curveMultiplier) * graphic.PI / 2)
    if (pval > .999999) pval = 1;
    if (haloRev) {
      glowColor[2] = (startC[2] + (1 - pval) * (outerBrightness - startC[2]))
    } else {
      glowColor[2] = (startC[2] + pval * (outerBrightness - startC[2]))
    }
    if (rev) {
      glowColor[3] = alphaMultiplier * (1 - pval);
    } else {
      glowColor[3] = alphaMultiplier * pval; //Start full alpha and reduce
    }
  }
}

/*
  Draw a jailbar effect across the canvas

  Parameters:
    c -> color of the bar
    w -> width of the bar
    fade -> fading glow of each bar
    spacing -> distance between each bar
    WIDTH -> width of the canvas
    HEIGHT -> height of the canvas
    random -> function to provide a random number (random())
    sk -> p5.js sketch object
*/
export function jailbars(c, w, fade, spacing, WIDTH, HEIGHT, random, sk) {
  var x = Math.floor(spacing / 2);
  while (x < WIDTH) {
    sk.strokeWeight(1);
    let y_fade = Math.floor(random() * HEIGHT);
    let rcolor;
    for (let i = 0; i <= fade; i++) {
      rcolor = graphic.get(x + i, y_fade);
      sk.stroke(wAlpha(rcolor, Math.floor(255 * (i / fade))));
      sk.line(x + i, 0, x + i, HEIGHT);
      rcolor = graphic.get(x + 2 * fade + w - i, y_fade);
      sk.stroke(wAlpha(rcolor, Math.floor(255 * (i / fade))));
      sk.line(x + 2 * fade + w - i, 0, x + 2 * fade + w - i, HEIGHT);
    }
    sk.fill(rcolor);
    sk.noStroke();
    sk.rect(x + fade, 0, w, HEIGHT);
    x += 2 * fade + w + spacing;
  }
}
