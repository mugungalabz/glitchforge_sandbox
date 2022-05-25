// util functions
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
function circCollision(x1, y1, x2, y2, r1, r2) {
  let l = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  let r = (r1 + r2) ** 2;

  return l <= r;
}

// exports
export function drip(g) {
  let g2 = g.createGraphics(g.width, g.height);

  let circ_r = g.width / 3;
  let circ_x = g.width / 2;
  let circ_y = g.width / 2;

  g2.background(0);
  let _scale = getScale(g);

  let pts = [];
  for (let y = 0; y < g.height; y++) {
    let num = _scale * g.map(y, 0, g.height, 0.5, 3.5);
    // g2.strokeWeight(num);

    for (let x = 0; x < _scale * g.map(y, 0, g.height, 50, 500); x++) {
      let x1 = g.random(0, g.width) + g.random(-5, 5);
      let c = g.color(g.get(x1, y));

      g2.stroke(c);
      g2.strokeWeight(num);

      if (circCollision(x1, y, circ_x, circ_y, num, circ_r)) {
        for (let k = 0; k < g.random(1, 10); k++) {
          g2.strokeWeight(num * g.random(1, 4));
          g2.point(x1 + g.random(-3, 3), y + g.random(-3, 3));

          if (g.random() > 0.25) {
            pts.push({ x: x1, y: y, c: c });
          }
        }

        // g2.strokeWeight(num * 5);
      } //else
      // c.setAlpha(255);

      g2.point(x1, y);
    }
  }

  for (let p of pts) {
    let my = g.random(p.y, g.height);
    g2.stroke(p.c);
    for (let y = p.y; y < my; y++) {
      g2.point(p.x, y);
    }
  }
  return g2;
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
export function sliceUp(g) {
  console.log("heloo")
  let stitched = g.createGraphics(g.width, g.height);
  stitched.copy(g, 0, 0, g.width, g.height, 0, 0, g.width, g.height);

  for (let i = 0; i < 50; i++) {
    let slice = g.random(1, 100) | 0;
    let y = g.random(0, g.height - slice);

    let g2 = g.createGraphics(g.width, slice);
    g2.copy(g, 0, y, g.width, slice, 0, 0, g.width, slice);

    if (g.random() > 0.5)
      dither(g2);

    let y2 = g.random(0, g.height - slice);

    stitched.copy(g2, 0, 0, g2.width, g2.height, 0, y2, g2.width, g2.height);
  }

  return stitched;

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
export function pixelDrag(g) {
  // let g2 = g.createImage(g.width,g.height);
  // g2.copy(g,0,0,g.width,g.height,0,0,g.width,g.height);
  g.filter(g.THRESHOLD);

  // g.copy(g2,0,0,g.width,g.height,0,0,g.width,g.height);

}

// flow field
export function addFlow(g) {
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
  let t = g.random();
  for (let r = 0; r < g.height; r++) {
    grid[r] = [];
    for (let c = 0; c < g.width; c++) {
      let n = g.noise(c * 0.01, r * 0.01, z);


      // if (window.$fxhashFeatures['Flow Style'] == 'clean')
      // classy
      if (t < 0.3)
        grid[r][c] = g.map(n, 0.0, 1.0, 0.0, g.TWO_PI);

      // else
      // edgy
      else if (t < 0.6)
        grid[r][c] = Math.ceil(
          (g.map(n, 0.0, 1.0, 0.0, g.TWO_PI) * (g.PI / 4)) / (g.PI / 4)
        );

      else
        grid[r][c] = n;

      if ((c >= offset + g.random(-offset / 2, offset / 2) && c < g.width - offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= offset * 2 + g.random(-offset / 2, offset / 2)) ||
        (c >= offset + g.random(-offset / 2, offset / 2) && c <= 2 * offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)) ||
        (c >= g.width - 2 * offset + g.random(-offset / 2, offset / 2) && c <= g.width - offset + g.random(-offset / 2, offset / 2) && r >= offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)) ||
        (c >= offset + g.random(-offset / 2, offset / 2) && c <= g.width - offset + g.random(-offset / 2, offset / 2) && r >= g.height - 2 * offset + g.random(-offset / 2, offset / 2) && r <= g.height - offset + g.random(-offset / 2, offset / 2)))
        grid[r][c] = null;

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
  let particleMultiplier = g.random(10, 50);// window.$fxhashFeatures['Particle Multiplier'];
  for (let i = 0; i < g.width * particleMultiplier; i++) {
    let x = g.int(g.random(0, g.width));
    let y = g.int(g.random(0, g.height));
    let c = g.color(g.get(x, y));
    let s = g.random(0.5, 2.0);
    if (g.random() > 0.9) {
      c = g.color(0);
      s = g.random(2.0, 5.0);
    }
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