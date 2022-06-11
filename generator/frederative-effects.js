import { init } from "./effects.js";

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
  // let hasMaxSize = false;
  // return Math.ceil(1, g.map(g.width, 0, referenceSize, 0, 1, hasMaxSize));
}

//(x2-x1)^2 + (y2-y1)^2 <= (r1+r2)^2
function circCollision(x1, y1, x2, y2, r1, r2, rdiff_squared) {
  let l = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  // let r = (r1 + r2) ** 2;

  return l <= rdiff_squared;//r;
}

// exports
export function drip(g, features) {
  console.log('drip');
  let _scale = getScale(g);
  g.loadPixels();

  let drip_dir = features['Drip Direction'];//randArray(['horizontal', 'vertical', 'diagonal']);
  let crazy_directions = features['Drip Crazy'];//randArray([true, false]);
  let numParticles = 500;

  let particles = [];
  for (let i = 0; i < numParticles; i++) {
    let life = g.random(100, 1000);
    let p = { x: g.random(g.width), y: g.random(g.height), life: life, olife: life };

    let velo = randArray([1.0, -1.0]) * g.random(1.0, 3.0);
    if (drip_dir == 'horizontal') {
      p.vx = velo;
      p.vy = 0;
    } else if (drip_dir == 'vertical') {
      p.vy = velo;
      p.vx = 0;
    } else {
      p.vy = velo;
      p.vx = velo;
    }

    if (crazy_directions) {
      if (g.random() > 0.85)
        p.vx = g.random(-velo, velo);
      if (g.random() > 0.85)
        p.vy = g.random(-velo, velo);
    }

    p.color = g.get(p.x, p.y);
    if (g.random() > 0.95 && features['Accent Color'] !== false)
      p.color = g.color(features['Accent Color']);

    particles.push(p);
  }

  g.noStroke();
  while (particles.length > 0) {
    for (let i = particles.length - 1; i >= 0; i--) {
      let p = particles[i];
      let c = g.color(p.color);
      c.setAlpha(g.map(p.life, p.olife, 0, 255, 20));
      g.fill(c);
      g.circle(p.x, p.y, g.map(p.life, p.olife, 0, 5 * _scale, 0.25 * _scale));
      p.life--;
      p.x += p.vx;
      p.y += p.vy;

      if (p.life <= 0 || p.x < 0 || p.x > g.width - 1 || p.y < 0 || p.y > g.height - 1) {
        particles.splice(i, 1);
      }
    }
  }

  return g;

}

// Floyd-Steinberg dithering 
// (code based on this sketch: https://openprocessing.org/sketch/1192123)
function DivideBy255(value) {
  return (value + 1 + (value >> 8)) >> 8;
}
export function dither(g) {
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
// export function dither(g) {
//   g.loadPixels();

//   let _scale = getScale(g);
//   for (let y = 0; y < g.height - _scale; y++) {
//     for (let x = _scale; x < g.width - _scale; x++) {
//       let oldr = g.pixels[index(g, x, y)];
//       let oldg = g.pixels[index(g, x, y) + 1];
//       let oldb = g.pixels[index(g, x, y) + 2];

//       let factor = 1.0;
//       let newr = g.round((factor * oldr) / 255) * (255 / factor);
//       let newg = g.round((factor * oldg) / 255) * (255 / factor);
//       let newb = g.round((factor * oldb) / 255) * (255 / factor);

//       g.pixels[index(g, x, y)] = newr;
//       g.pixels[index(g, x, y) + 1] = newg;
//       g.pixels[index(g, x, y) + 2] = newb;

//       for (let _y = 1; _y <= _scale; _y++) {
//         for (let _x = 1; _x <= _scale; _x++) {
//           g.pixels[index(g, x + _x, y)] += ((oldr - newr) * 7) >> 4;
//           g.pixels[index(g, x + _x, y) + 1] += ((oldr - newr) * 7) >> 4;
//           g.pixels[index(g, x + _x, y) + 2] += ((oldr - newr) * 7) >> 4;

//           g.pixels[index(g, x - _x, y + _y)] += ((oldr - newr) * 3) >> 4;
//           g.pixels[index(g, x - _x, y + _y) + 1] += ((oldr - newr) * 3) >> 4;
//           g.pixels[index(g, x - _x, y + _y) + 2] += ((oldr - newr) * 3) >> 4;

//           g.pixels[index(g, x, y + _y)] += ((oldr - newr) * 5) >> 4;
//           g.pixels[index(g, x, y + _y) + 1] += ((oldr - newr) * 5) >> 4;
//           g.pixels[index(g, x, y + _y) + 2] += ((oldr - newr) * 5) >> 4;

//           g.pixels[index(g, x + _x, y + _y)] += ((oldr - newr) * 1) >> 4;
//           g.pixels[index(g, x + _x, y + _y) + 1] += ((oldr - newr) * 1) >> 4;
//           g.pixels[index(g, x + _x, y + _y) + 2] += ((oldr - newr) * 1) >> 4;
//         }
//       }
//     }
//   }
//   g.updatePixels();
//   return g;
// };

// slice up an image and stitch back together
export function sliceUp(g, features) {
  console.log("slice")
  let stitched = g.createGraphics(g.width, g.height);
  stitched.copy(g, 0, 0, g.width, g.height, 0, 0, g.width, g.height);

  let amt = 50;
  let detail = features['Slice Up Detail'];
  if (detail == 'small') {
    amt = g.random(10, 20) | 0;
  } else if (detail == 'medium') {
    amt = g.random(40, 60) | 0;
  } else {
    amt = g.random(125, 175) | 0;
  }

  for (let i = 0; i < amt; i++) {
    let slice = g.random(1, 100) | 0;
    let y = g.random(0, g.height - slice);

    let g2 = g.createGraphics(g.width, slice);
    g2.copy(g, 0, y, g.width, slice, 0, 0, g.width, slice);

    if (g.random() > 0.5)
      dither(g2);

    let y2 = g.random(0, g.height - slice);

    stitched.copy(g2, 0, 0, g2.width, g2.height, 0, y2, g2.width, g2.height);
  }

  g.copy(stitched, 0, 0, stitched.width, stitched.height, 0, 0, g.width, g.height);
  return g;
}

// draw shadow on object
// based on: https://p5js.org/reference/#/p5/drawingContext
export function drawShadow(g, x, y, b, c) {
  g.drawingContext.shadowOffsetX = x;
  g.drawingContext.shadowOffsetY = y;
  g.drawingContext.shadowBlur = b;
  g.drawingContext.shadowColor = g.color(c);
};

// pixel sort-ish
export function pixelDrag(g, features) {
  console.log("pixel drag")
  let _scale = getScale(g);

  g.loadPixels();
  for (let i = 0; i < features['Number of Pixels']; i++) {
    let x = g.random(0, g.width - 1) | 0;
    let y = g.random(0, g.width - 1) | 0;

    let col = g.color(g.get(x, y));

    let initSize = (g.random(1, 10) | 0) * _scale;

    if (features["Pixel Drag Direction"] == "vertical") {
      let y2 = g.random(y + (g.height - y) / 2, g.height - y);
      g.strokeWeight(1.0 * _scale);
      for (let _y = y; _y < y2; _y++) {
        if (g.random() > g.random()) col = g.color(g.get(x, _y));
        let a = g.map(_y, y, y2, 255, 0);
        if (g.random() > g.random()) a = g.random(0, 255) | 0;
        col.setAlpha(a);
        g.fill(g.color(col));
        g.square(x, _y, (g.random(-1.0, 1.0) * _scale) + g.map(_y, y, y2, initSize, 0.25 * _scale));
      }
    } else if (features["Pixel Drag Direction"] == "horizontal") {
      let x2 = g.random(x + (g.width - x) / 2, g.width - x);
      g.strokeWeight(1.0 * _scale);
      for (let _x = x; _x < x2; _x++) {
        if (g.random() > g.random()) col = g.color(g.get(_x, y));
        let a = g.map(_x, x, x2, 255, 0);
        if (g.random() > g.random()) a = g.random(0, 255) | 0;
        col.setAlpha(a);
        g.fill(g.color(col));
        g.square(_x, y, (g.random(-1.0, 1.0) * _scale) + g.map(_x, x, x2, initSize, 0.25 * _scale));
      }
    } else { // diag
      let y2 = g.random(y + (g.height - y) / 2, g.height - y);
      g.strokeWeight(1.0 * _scale);
      for (let _y = y; _y < y2; _y++) {
        if (g.random() > g.random()) col = g.color(g.get(x, _y));
        let a = g.map(_y, y, y2, 255, 0);
        if (g.random() > g.random()) a = g.random(0, 255) | 0;
        col.setAlpha(a);
        g.fill(g.color(col));
        g.square(x, _y, (g.random(-1.0, 1.0) * _scale) + g.map(_y, y, y2, initSize, 0.25 * _scale));
        x++;
        if (x > g.width - 1) break;
      }
    }
  }


  return g;
}

export function smear(g, features) {
  console.log('smear');
  let _scale = getScale(g);

  let x = g.random(0, g.width - 1);
  let y = g.random(0, g.height - 1);
  let w = g.random(1, 3) * _scale;

  let g2 = g.createImage(w, g.height);
  let g3 = g.createImage(w, g.height);

  g2.copy(g, x, 0, w, g.height, 0, 0, w, g.height);
  g3.copy(g, 0, y, g.width, w, 0, 0, g.width, w);

  // for (let i = 0; i < g.random(1, 3) | 0; i++) {

    for (let _x = 0; _x < g.width; _x++) {
      if (g.random() > g.random()) {
        // if (g.random() > 0.95) {//g.random()) {
        //   // if (g.random() > g.random())
        //     g.translate(g.width / 2, g.height / 2);

        //   g.rotate(randArray([90, 180]));//g.random(0, 360));
        // }

        g.copy(g2, 0, 0, w, g.height, _x, 0, w, g.height);
      }
    }

    for (let _y = 0; _y < g.height; _y++) {
      if (g.random() > g.random()) {
        // if (g.random() > 0.95) {//g.random()) {
        //   // if (g.random() > g.random())
        //     g.translate(g.width / 2, g.height / 2);

        //   g.rotate(randArray([90, 180]));//g.random(0, 360));
        // }
        g.copy(g3, 0, 0, g.width, w, 0, _y, g.width, w);
      }
    }
  // }

  return g;
}

// center drip
// TOO SLOW
export function centerDrip(g, features) {
  console.log('center drip');

  let circ_r = g.width / g.random(1.5, 3);
  let _scale = getScale(g);

  g.loadPixels();
  g.push();
  g.translate(g.width/2, g.height/2);
  for (let i = 0; i < 1000; i++) {
    g.strokeWeight((g.random(0.5, 10.0)|0) * _scale);
    let r = g.random(0,circ_r)|0;
    let theta = g.random(0.0, g.TWO_PI);

    let x = r * Math.cos(theta);
    let y = r * Math.sin(theta);

    let col = g.color(g.get(x, y));

    let y2 = g.random(y+1, g.height-y)|0;
    for (let _y = y; _y < y2; _y++) {
      col.setAlpha(g.map(_y, y, y2, 180, 0));
      g.stroke(col);
      g.point(x, _y);
    }
  }
  g.pop();

  return g;
}

// flow field
export function addFlow(g, features) {
  console.log("flow")
  // let g = sk.createGraphics(sk.width, sk.height);
  // g.pixelDensity(1);
  let _scale = getScale(g);

  // g.fill(g.color(0, 0, 0, 80));
  let offset = g.width * 0.15;
  // g.noStroke();
  // g.rect(offset, offset, g.width - 2 * offset, offset);
  // g.rect(offset, offset, offset, g.height - 2 * offset);
  // g.rect(offset, g.height - 2 * offset, g.width - 2 * offset, offset);
  // g.rect(g.width - 2 * offset, offset, offset, g.height - 2 * offset);

  console.log(`Scale: ${_scale}`);

  // setup noise field
  let grid = [];
  let z = g.random(10000) | 0;

  let flow_type = features['Flow Type'];
  let t = g.random();
  for (let r = 0; r < g.height; r++) {
    grid[r] = [];
    for (let c = 0; c < g.width; c++) {
      let n = g.noise(c * 0.01, r * 0.01, z);


      // if (window.$fxhashFeatures['Flow Style'] == 'clean')
      // classy
      if (flow_type == 'Clean')
        grid[r][c] = g.map(n, 0.0, 1.0, 0.0, g.TWO_PI);

      // else
      // edgy
      else if (flow_type == 'Edgy')
        grid[r][c] = Math.ceil(
          (g.map(n, 0.0, 1.0, 0.0, g.TWO_PI) * (g.PI / 4)) / (g.PI / 4)
        );

      else // random
        grid[r][c] = n;

      // if (g.random() > 0.5) {
      if (features['Flow Center'] === true) {
        if ((c >= offset + g.random(-offset / 2, offset / 2) && c < g.width - offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= offset * 2 + g.random(-offset / 2, offset / 2)) ||
          (c >= offset + g.random(-offset / 2, offset / 2) && c <= 2 * offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)) ||
          (c >= g.width - 2 * offset + g.random(-offset / 2, offset / 2) && c <= g.width - offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)) ||
          (c >= offset + g.random(-offset / 2, offset / 2) && c <= g.width - offset + g.random(-offset / 2, offset / 2) && r >= g.height - 2 * offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)))
          grid[r][c] = null;
      }

      // if (window.$fxhashFeatures['Flow Avoid'] != 'off') {
      // let _col = g.get(c, r);
      // if (window.$fxhashFeatures['Flow Avoid'] == 'dark') {
      // avoid darker
      // if (_col[0] < 50 && _col[1] < 50 && _col[2] < 50)
      // grid[r][c] = null;
      // avoid lighter
      // else
      // if (_col[0] > 220 && _col[1] > 220 && _col[2] > 220) grid[r][c] = null;
      // }
      // }
    }
  }


  /// POSSIBLY ADD IN BLACK / OTHER COLORS?

  // add particles
  let particles = [];
  g.loadPixels();
  let particleMultiplier = features['Flow Multiplier'];
  for (let i = 0; i < g.width * particleMultiplier; i++) {
    let x = g.int(g.random(0, g.width));
    let y = g.int(g.random(0, g.height));
    let c = g.color(g.get(x, y));
    let s = g.random(0.5, 2.0);
    if (g.random() > 0.9) {
      c = g.color(0);
      s = g.random(2.0, 5.0);
    }
    if (g.random() > 0.9 && features['Accent Color'] !== false)
      c = g.color(features['Accent Color']);
    // if (window.$fxhashFeatures['Particle Cyberpunk'])
    // if (random() > 0.9) c = randArray([color(255, 0, 255), color(0, 255, 0)]);

    // if (g.random() > 0.98) 
    //   c = g.random([g.color(255, 0, 255), g.color(0, 255, 0)]);

    particles.push({ x: x, y: y, s: s * _scale, col: g.color(c) });
  }

  // iterate and draw
  for (let p of particles) {
    g.noStroke();

    // let nextCol = randArray([color(255,0,255), color(0,255,0), color(0,0,255)]);
    let num = g.int(g.random(100, 1000));
    for (let i = 0; i < num; i++) {
      // let c = lerpColor(p.col, nextCol, map(i,0,num,0.0,1.0));
      p.col.setAlpha(g.map(i, 0, num, 255, 0));
      g.fill(p.col);//c);
      let col = g.int(p.x);//int(x / cellsize);
      let row = g.int(p.y);//int(y / cellsize);

      if (row in grid && col in grid[row]) {
        if (grid[row][col] == null) { break; }
        else {
          let angle = grid[row][col];
          let xstep = 1 * g.cos(angle);
          let ystep = 1 * g.sin(angle);

          let _locscale = p.s;
          if (angle >= g.PI >> 1 && angle < (3 * g.PI) >> 1) _locscale = g.map(p.s, g.PI >> 1, 3 * g.PI >> 1, 1.0, 2.0);

          g.square(p.x, p.y, _locscale);//*_scale);

          p.x += xstep;
          p.y += ystep;
        }

        if (p.x < 0 || p.x > g.width - 1 || p.y < 0 || p.y > g.height - 1) break;
      } else break;
    }
  }
  return g;
}

// glitchify image
export function glitchifyImg(g) {
  console.log("glitchify");

  let g2 = g.createGraphics(g.width, g.height);

  g.loadPixels();
  let cellsize = g.width * 0.05;
  let cs = cellsize / 2;
  g2.noStroke();
  g2.rectMode(g.CENTER);
  for (let y = 0; y < g.height; y += cellsize) {
    for (let x = 0; x < g.width; x += cellsize) {
      let c = g.color(g.get(x + cs, y + cs));
      c.setAlpha(g.int(g.random(0, 155)));
      g2.fill(c);
      g2.square(x, y, cellsize + g.random(-5, 5));
    }
  }

  g.copy(g2, 0, 0, g2.width, g2.height, 0, 0, g.width, g.height);
  return g;
}