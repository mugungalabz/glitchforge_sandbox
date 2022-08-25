import { init } from "./effects.js";
import { greenify } from "./util.js";
import { addAuthorRoyalties } from "./royalties.js"
const AUTHOR_TEZOS_ADDRESS = "tz1VPj5VZ2oomjz2ToAMyuyP5y7ii1NgY753";

// PLACEHOLDER
// function addAuthorRoyalties() {
//   return;
// }

const Y_AXIS = 1;
const X_AXIS = 2;

// util functions
// select random item from array
export function randArray(array) {
  return array[Math.floor(Math.random() * 10000 % array.length)];
}

function index(g, x, y) {
  return (x + y * g.width) * 4;
}


function getScale(g) {
  let referenceSize = 1000;
  return g.width / referenceSize;
}

//(x2-x1)^2 + (y2-y1)^2 <= (r1+r2)^2
function circCollision(x1, y1, x2, y2, r1, r2, rdiff_squared) {
  let l = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  // let r = (r1 + r2) ** 2;

  return l <= rdiff_squared;;
}

// exports

// Floyd-Steinberg dithering 
// (code based on this sketch: https://openprocessing.org/sketch/1192123)
function DivideBy255(value) {
  return (value + 1 + (value >> 8)) >> 8;
}
export function dither(g, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let referenceSize = 1000;
  let hasMaxSize = false;
  let _scale = Math.ceil(1, g.map(g.width, 0, referenceSize, 0, 1, hasMaxSize));
  g.loadPixels();
  for (let y = 0; y < g.height - _scale; y++) {
    for (let x = _scale; x < g.width - _scale; x++) {
      let oldr = g.pixels[index(g, x, y)];
      let oldg = g.pixels[index(g, x, y) + 1];
      let oldb = g.pixels[index(g, x, y) + 2];

      let newr = (DivideBy255(oldr) * 255) | 0;
      let newg = (DivideBy255(oldg) * 255) | 0;
      let newb = (DivideBy255(oldb) * 255) | 0;

      g.pixels[index(g, x, y)] = newr;
      g.pixels[index(g, x, y) + 1] = newg;
      g.pixels[index(g, x, y) + 2] = newb;

      for (let _y = 1; _y <= _scale; _y++) {
        for (let _x = 1; _x <= _scale; _x++) {
          g.pixels[index(g, x + _x, y)] += ((oldr - newr) * 7) >> 4;
          g.pixels[index(g, x + _x, y) + 1] += ((oldr - newr) * 7) >> 4;
          g.pixels[index(g, x + _x, y) + 2] += ((oldr - newr) * 7) >> 4;

          g.pixels[index(g, x - _x, y + _y)] += ((oldr - newr) * 3) >> 4;
          g.pixels[index(g, x - _x, y + _y) + 1] += ((oldr - newr) * 3) >> 4;
          g.pixels[index(g, x - _x, y + _y) + 2] += ((oldr - newr) * 3) >> 4;

          g.pixels[index(g, x, y + _y)] += ((oldr - newr) * 5) >> 4;
          g.pixels[index(g, x, y + _y) + 1] += ((oldr - newr) * 5) >> 4;
          g.pixels[index(g, x, y + _y) + 2] += ((oldr - newr) * 5) >> 4;

          g.pixels[index(g, x + _x, y + _y)] += ((oldr - newr) * 1) >> 4;
          g.pixels[index(g, x + _x, y + _y) + 1] += ((oldr - newr) * 1) >> 4;
          g.pixels[index(g, x + _x, y + _y) + 2] += ((oldr - newr) * 1) >> 4;
        }
      }
    }
  }
  g.updatePixels();
  return g;
}

// based on : https://p5js.org/examples/color-linear-gradient.html
function setGradient(x, y, w, h, c1, c2, axis, gfx, _sk) {
  gfx.noFill();
  if (axis === Y_AXIS) {
    // Top to bottom gradient
    for (let i = y; i <= y + h; i++) {
      let inter = _sk.map(i, y, y + h, 0, 1);
      let c = _sk.lerpColor(c1, c2, inter);
      gfx.stroke(c);
      gfx.line(x, i, x + w, i);
    }
  } else if (axis === X_AXIS) {
    // Left to right gradient
    for (let i = x; i <= x + w; i++) {
      let inter = _sk.map(i, x, x + w, 0, 1);
      let c = _sk.lerpColor(c1, c2, inter);
      gfx.stroke(c);
      gfx.line(i, y, i, y + h);
    }
  }
}

// draw shadow on object
// based on: https://p5js.org/reference/#/p5/drawingContext
export function drawShadow(g, x, y, b, c, _sk) {
  _sk.drawingContext.shadowOffsetX = x;
  _sk.drawingContext.shadowOffsetY = y;
  _sk.drawingContext.shadowBlur = b;
  _sk.drawingContext.shadowColor = _sk.color(c);
};

// draw circle or square with some random jitter
function drawPoint(x, y, R, gfx, _sk, dmode, _scale = 1.0) {
  let _r = _sk.random(R - R / 4, R + R / 4) * _scale / 2;

  //Don't draw the actual point - removing this
  //saves about 10 seconds
  // if (dmode == 'square') {
  //   gfx.rectMode(_sk.CENTER);
  //   gfx.square(x, y, _r);
  // } else if (dmode == 'circle')
  //   gfx.circle(x, y, _r);
  // else
  //   gfx.point(x, y);

  //Reducing the number of points here is a large factor in overall reduction
  // for (let _ = 0; _ < _sk.random(2, 8); _++) {
  let numPoints = randArray([1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 4, 5,])
  for (let _ = 0; _ < numPoints; _++) {
    if (dmode == 'square')
      gfx.square(x + _sk.random(-3, 3) * _scale, y + _sk.random(-3, 3) * _scale, _r);
    else if (dmode == 'circle')
      gfx.ellipse(x + _sk.random(-3, 3) * _scale, y + _sk.random(-3, 3) * _scale, _r + _sk.random(-3, 3) * _scale, _r + _sk.random(-3, 3) * _scale);
    // gfx.circle(x + _sk.random(-3, 3), y + _sk.random(-3, 3), _r);
    else
      gfx.point(x, y);
  }
}

// pointillism feature
export function drawPoints(g, features, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let smearPoints = [];
  let g2 = g.createGraphics(g.width, g.height);
  console.log('drawPoints');

  let _scale = getScale(g);

  let _size = features['Pointillism-Size'];
  let dir = features['Pointillism-Direction'];
  let dmode = features['Pointillism-Mode'];
  // let plife = features['Pointillism-Life'];

  let R;
  //increasing the sizes here means we create more "noise" 
  //by drawing fewer circles. 
  if (_size == "small")
    // R = g.random(2, 4) * _scale;
    R = g.random(0.5, 2) * _scale;
  else if (_size == "medium")
    // R = g.random(5, 7) * _scale;
    R = g.random(3, 6) * _scale;
  else
    R = g.random(7, 12) * _scale;
  console.log("R: " + R);
  let R2 = R * 2; // diameter

  g2.textAlign(g.CENTER, g.CENTER);
  g2.textFont("Courier");
  g2.textSize(R);

  g.loadPixels();

  // g2.background(0);
  // let bgcol = g.color(g.get(g.random(0, g.width), g.random(0, g.height)));
  // bgcol.setAlpha(g.random(10, 220));
  // setGradient(0, 0, g2.width, g2.height, g.color(0), bgcol, Y_AXIS, g2, g);

  g2.noStroke();
  //Move life outside the loop, having constant live per smear
  //maintains a similar effect on the granular level. 
  let plife = features['Pointillism-Life'];
  let life = g.random(5, 10) * _scale;
  if (plife == 'random')
    life = g.random(2, 20) * _scale;
  else if (plife == 'long')
    life = g.random(12, 20) * _scale;
  console.log("Loop!")
  g2.noStroke()
  for (let y = 0; y < g.height; y += R2) {
    for (let x = 0; x < g.width; x += R2) {

      let col = g.color(g.get(x, y));
      let col2 = g.color(g.get(x, y));
      col2.setAlpha(128);
      if (g.random() > 0.98) {
        g2.stroke(0);

        smearPoints.push({ R: R, x: x, y: y, life: life, olife: life });
        // }
      } else {
        let _a = g.random(0, 255) | 0;
        col.setAlpha(_a);
        col2.setAlpha(_a);
        g2.stroke(col);
        g2.fill(col2);
      }


      drawPoint(x, y, R, g2, g, dmode, _scale);
    }
  }

  // smear with a timeout 
  let timeout = 1000;
  //set the smear shift outside of the loop
  //to avoid if processing for each point.
  let shift_x = 0
  let shift_y = 0
  if (dir == 'left')
    shift_x = 0 - R / 2
  else if (dir == 'right')
    shift_x = R / 2
  else if (dir == 'up')
    shift_y = 0 - R / 2
  else
    shift_y = R / 2
  //process each smearpoint 1 by one to reduce context switching
  for (let p of smearPoints) {
    g2.stroke(g.color(0, 0, 0, g.random(10, 100)));
    g2.fill(g.color(0, 0, 0, g.random(10, 100)));
    while (p.life > 0 && p.x > 0 && p.x < g2.width && p.y > 0 && p.y < g2.height) {
      let _r = p.R / 2;
      if (features['Pointillism-TrailOff'] === true)
        _r = g.map(p.life, p.olife, 0, p.R / 2, 0);

      g2.strokeWeight(_r);
      drawPoint(p.x, p.y, _r, g2, g, dmode, _scale);
      p.x += shift_x
      p.y += shift_y
      p.life--;
    }
  }
  // while (smearPoints.length > 0) {
  //   for (let i = smearPoints.length - 1; i >= 0; i--) {
  //     g2.stroke(g.color(0, 0, 0, g.random(10, 100)));
  //     g2.fill(g.color(0, 0, 0, g.random(10, 100)));
  //     let p = smearPoints[i];

  //     let _r = p.R / 2;
  //     if (features['Pointillism-TrailOff'] === true)
  //       _r = g.map(p.life, p.olife, 0, p.R / 2, 0);

  //     g2.strokeWeight(_r);
  //     drawPoint(p.x, p.y, _r, g2, g, dmode);

  //     if (dir == 'left')
  //       p.x -= p.R / 2
  //     else if (dir == 'right')
  //       p.x += p.R / 2
  //     else if (dir == 'up')
  //       p.y -= p.R / 2
  //     else
  //       p.y += p.R / 2

  //     p.life--;
  //     if (p.x < 0 || p.x > g2.width || p.y < 0 || p.y > g2.height || p.life <= 0) smearPoints.splice(i, 1);
  //   }
  //   timeout--;
  //   if (timeout <= 0) {
  //     console.log("pointillism smear bailed out");
  //     break;
  //   }
  // }

  // overwrite the main sketch and return
  g.image(g2, 0, 0);
  return g;
}

export function glitchify(g, features, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let _scale = getScale(g);

  if (features["Glitchify-Shadows"] === true)
    drawShadow(g, 0, 0, 10 * _scale, g.color(20), g);
  else
    drawShadow(g, 0, 0, 0, 0, g);

  let minVal = 10;
  let maxVal = 50;
  if (features['density'] == 'maximal') {
    minVal = 100;
    maxVal = 400;
  }
  let glitchCount = Math.floor(g.random(minVal, maxVal))
  let clone = g.createGraphics(g.width, g.height)
  clone.copy(g, 0, 0, g.width, g.height, 0, 0, g.width, g.height);
  for (let _ = 0; _ < glitchCount | 0; _++) {
    let w = g.random(10 * _scale, g.width / 2) | 0;
    let h = g.random(10 * _scale, g.height) | 0;
    let x = g.random(0, g.width - w) | 0;
    let y = g.random(0, g.height - h) | 0;
    let x2 = g.random(0, g.width - w) | 0;
    let y2 = g.random(0, g.height - h) | 0;
    g.copy(clone, x, y, w, h, x2, y2, w, h)
  }

  return g;
}

export function overdot(g, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let g2 = g.createGraphics(g.width, g.height);
  let _scale = getScale(g);

  for (let _2 = 0; _2 < g.random(1, 2) | 0; _2++) {
    let _r = g.random(g.width / 4, g.width / 16);
    let _x = g.random(_r / 2, g.width - _r / 2);
    let _y = g.random(_r / 2, g.height - _r / 2);

    let col = g2.color(255, 0, 0, 100);
    g.loadPixels();
    if (g.random() > 0.5)
      col = g.color(g.get(g.random(0, g.width), g.random(0, g.height)));

    g2.fill(col)
    g2.noStroke();

    let pt_r = 0.5 * _scale;
    let r_sq = (pt_r + _r) ** 2;

    drawShadow(g2, 0, 0, 10, g.random([g.color(255, 0, 255), g.color(0, 255, 0)]), g);

    for (let _y2 = _y + _r; _y2 < g2.height; _y2 += g.random(1.0, 3.0) * _scale) {
      drawPoint(_x + g.random(-3, 3) * _scale, _y2, pt_r, g2, g, 'square');
    }

    for (let _y2 = _y - _r; _y2 < _y + _r; _y2 += g.random(1.0, 3.0) * _scale) {
      let pnum = g.map(_y2, _y - _r, _y + _r, 0.8, 0.05) * 2 * _r;
      for (let _ = 0; _ < pnum; _++) {
        let _x2 = g.random(_x - _r, _x + _r);
        if (g.random() > 0.4 && circCollision(_x2, _y2, _x, _y, 1.0, _r, r_sq))
          drawPoint(_x2, _y2, pt_r, g2, g, 'circle');
      }
    }
  }

  g.image(g2, 0, 0);
  return g;
}

export function overdrive(g, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let g2 = g.createGraphics(g.width, g.height);
  let _scale = getScale(g);

  g.loadPixels();
  g2.noStroke();

  let col1 = g.color(g.get(g.random(0, g.width), g.random(0, g.height)));
  let col2 = g.color(g.get(g.random(0, g.width), g.random(0, g.height)));
  let timeout = 100;
  while (col1 == col2) {
    col2 = g.color(g.get(g.random(0, g.width), g.random(0, g.height)));

    timeout--;
    if (timeout <= 0) break;
  }
  setGradient(0, 0, g.width, g.height, col1, col2, Y_AXIS, g2, g);

  for (let y = 0; y < g.height; y += g.random(1.0, 4.0) * _scale) {
    let pnum = g.map(y, 0, g.height, 0.13, 0.05) * g.width;

    let bactive = false;
    drawShadow(g2, 0, 0, 0, 0, g);
    if (g.random() > 0.9) {
      bactive = true;
      drawShadow(g2, 0, 0, 10, g.color(0, 255, 0, g.random(20, 120)), g);
    }
    for (let _2 = 0; _2 < pnum; _2++) {
      let x = g.random(0, g.width) | 0;
      let col;
      if (bactive) col = g.color(255, 0, 255, 40);
      else {
        col = g.color(g.get(x, y));
        col.setAlpha(g.random(20, 180));
      }
      g2.fill(col);
      drawPoint(x, y, g.random(0.5, 5.0) * _scale, g2, g, g.random(['square', 'circle']));
    }
  }

  g.image(g2, 0, 0);
  return g;
}

export function turtle(g, features, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let g2 = g.createGraphics(g.width, g.height);
  let _scale = getScale(g);

  let particles = [];

  let numTurtles = g.random(5, 30);
  if (features['TurtleNumber'] == 'average')
    numTurtles = g.random(50, 100) | 0;
  else if (features['TurtleNumber'] == 'many')
    numTurtles = g.random(150, 500) | 0;

  for (let _ = 0; _ < numTurtles; _++) {
    let life = g.random(50, 1000);

    let vx, vy;
    if (g.random() > 0.5) {
      vx = g.random([-1, 1]);
      vy = 0;
    } else {
      vy = g.random([-1, 1]);
      vx = 0;
    }
    let x = g.random(0, g.width - 1);
    let y = g.random(0, g.height - 1)
    let c = g.color(g.get(x, y))

    if (g.random() > 0.8) {
      c = g.random([
        g.color(255, 0, 255),
        g.color(0, 255, 0),
        g.color(0, 0, 255),
        g.color(255, 0, 0),
      ]);
      c.setAlpha(g.random(120, 220));
    }

    let s;
    if (features['TurtleSize'] == 'small')
      s = g.random(0.25, 1.0) * _scale;
    else
      s = g.random(0.5, 5.0) * _scale;


    particles.push({
      shadow: c,
      s: s,
      x: x, y: y,
      life: life, olife: life, timer: 50,
      vx: vx, vy: vy
    });
  }

  let timeout = 1000;

  g2.stroke(0);
  while (timeout > 0) {
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      drawShadow(g2, 0, 0, 10, p.shadow, g);

      if (features['TurtleVarySize'])
        g2.strokeWeight(p.s + (g.random([-1, 1]) * p.s / g.random(2.0, 4.0)));
      else
        g2.strokeWeight(p.s);

      g2.stroke(g.color(g.get(p.x, p.y)));

      if (features['TurtleJagged'])
        drawPoint(p.x, p.y, p.s, g2, g, 'point');
      else
        g2.point(p.x, p.y);

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > g2.width - 1) p.vx *= -1.0;
      if (p.y < 0 || p.y > g2.height - 1) p.vy *= -1.0;

      p.timer--;
      if (p.timer <= 0) {
        p.timer = 50;
        if (g.random() > 0.5) {
          p.vx = g.random([-1, 1]);
          p.vy = 0;
        } else {
          p.vy = g.random([-1, 1]);
          p.vx = 0;
        }
      }

      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
    timeout--;

    if (particles.length == 0) {
      break;
    }
  }

  g.image(g2, 0, 0);
  return g;
}

export function blackhole(g, royalties) {
  addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);
  let g2 = g.createGraphics(g.width, g.height);
  let _scale = getScale(g);

  let _x = g.width / 2;
  let _y = g.height / 2;
  let _size = g.random(g.width / 4, g.width / 8);

  drawShadow(g2, 0, 0, 10, g.color(0), g);

  let col = g.color(0);
  col.setAlpha(g.random(100, 220));
  g2.stroke(col);
  let _r = 0;

  for (let R = 0; R < _size * 2.0; R += g.random(0.5, 2.0) * _scale) {
    let tstart = g.random(0, g.TWO_PI);
    for (let T = tstart; T < tstart + g.TWO_PI; T += g.PI / g.random(8, 64)) {
      g2.strokeWeight(g.random(0.5, 2.0) * _scale);
      let x = _x + (R * g.cos(T));
      let y = _y + (R * g.sin(T));
      drawPoint(x, y, 1, g2, g, 'point');
    }
  }

  g.image(g2, 0, 0);
  return g;
}