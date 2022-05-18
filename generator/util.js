/*
  Commonly used Math, Color, and other utilities
*/

export function saveRandomSectionsOfImage(sk, image, n, H, W, name) {

  for (let i = 0; i < n; i++) {
    let section = randomSectionOfImage(sk, image, H, W);
    sk.image(section, 0, 0);
    sk.saveCanvas(sk, name + "-" + i, 'png');
  }
}

export function randomSectionOfImage(sk, img, H, W) {
  if (img.width < W) {
    console.log("image width too small: " + img.width + " < " + W)
    exit()
  }
  if (img.height < H) {
    console.log("image height too small: " + img.height + " < " + H)
    exit()
  }

  const copyStartX = Math.floor(Math.random() * (img.width - W));
  const copyStartY = Math.floor(Math.random() * (img.height - H));
  const imageSection = img.get(copyStartX, copyStartY, W, H);
  return imageSection;
}
/*
  Given a point and line defined by two points, return the 
  distance from the point to the line.

  A point is an POJO with x and y properties: {x: 0, y: 0}
    
*/
export function distancePoint2Line(p, lp1, lp2) {
  let dist = Math.abs((lp2.x - lp1.x) * (lp1.y - p.y) - (lp1.x - p.x) * (lp2.y - lp1.y)) / Math.sqrt((lp2.x - lp1.x) * (lp2.x - lp1.x) + (lp2.y - lp1.y) * (lp2.y - lp1.y));
  return dist;
}
export function processAndDisplayColorTally(colorHashTally, sk, options) {
  let thresh = options.threshold ? options.threshold : 10;
  let n = options.threshold ? options.n : 10;
  for (let i in colorHashTally) {
    let t = colorHashTally[i]
    var colorTalliesAsList = Object.entries(t.tally);
    colorTalliesAsList.sort((a, b) => {
      return b[1] - a[1];
    })
    t["tallyAsList"] = colorTalliesAsList
    // console.log(t["tallyAsList"])
    t["topColors"] = getTopColorWheel(t.tallyAsList, n, thresh, sk, "RGB", options)
    console.log(Object.keys(t))
  }


  //Display the Top colors in bands
  if (options.displayTopColors) {
    drawTopColors(colorHashTally, sk)
  }

}
export function drawTopColors(colorHashTally, sk) {
  sk.push()
  sk.colorMode(sk.RGB)
  sk.noStroke();
  sk.fill(0, 0, 0, 255)
  sk.rect(0, 0, sk.width * .9, sk.height * .15)

  let bandheight = sk.height / colorHashTally.length;
  for (let i = 0; i < colorHashTally.length; i++) {
    let bandWidth = sk.width / colorHashTally[i].topColors.rgb.length;
    if (bandWidth > 100) {
      bandWidth = 100;
    }
    let currY = (i) * bandheight + bandWidth * .5;
    for (let j = 0; j < colorHashTally[i].topColors.rgb.length; j++) {
      let currX = (j + .5) * bandWidth
      let color = colorHashTally[i].topColors.rgb[j]
      sk.fill(color[0], color[1], color[2]);
      sk.circle(currX, currY, bandWidth * .75);
    }
  }
  sk.pop()
}

/*
  Shorthand to determine if a color is Red, Green or Blue:

  Parameters:
    c -> color to check
    idx -> 0,1, or 2

  Returns:
    if idx is 0, returns true if c is red
    if idx is 1, returns true if c is green
    if idx is 2, returns true if c is blue
*/
export function colorIsMatched(c, idx) {
  if (idx == 0) {
    return colorIsRed(c);
  } else if (idx == 1) {
    return colorIsGreen(c);
  } else {
    return colorIsBlue(c);
  }
}
/*
  Given a color and a number n (0-255), increase the 
  green value of the color by n, and reduce the red and blue values by n/2.

  Assumes RGB mode
*/
export function greenify(color, n) {
  let newcolors = norm([color[0] -= n / 2, color[1] += n, color[2] -= n / 2, color[3]])
  return newcolors;
}

/*
  Given a color, assuming HSL mode, normalize the values to be
  valid H, S, or L values. 
*/
export function normHSL(color) {
  // console.log("pre normeD: " + colors)
  if (color[0] > 360) {
    color[0] = 360;
  }
  if (color[1] > 100) {
    color[1] = 100;
  }
  if (color[2] > 100) {
    color[2] = 100;
  }
  if (color[0] < 0) {
    color[0] = 0;
  }
  if (color[1] < 0) {
    color[1] = 0;
  }
  if (color[2] < 0) {
    color[2] = 0;
  }
  // console.log("post normeD: " + colors)
  return color
}
/*
  Given an RGB color, ensure the values are valid.
*/
export function norm(colors) {
  for (let i = 0; i < colors.length; i++) {
    if (colors[i] > 255) {
      colors[i] = 255;
    }
    if (colors[i] < 0) colors[i] = 0;
  }
  return colors
}
/*
  Given an RGB color, add n to each of the values.
*/
export function lighten(color, n) {
  return norm([color[0] + n, color[1] + n, color[2] + n, color[3]])
}
/*
  Given an HSL color, add n to the the Saturation and Brightness
*/
export function lightenHSL(color, n) {
  let newcolors = normHSL([color[0], color[1] += n, color[2] += n, color[3]])
  return newcolors;
}
/*
  Override the alpha value of a color with the value a

  Parameters:
    color -> color to override
    a -> new alpha value
*/
export function wAlpha(color, a, sk) {
  return [sk.red(color), sk.green(color), sk.blue(color), a];
}
/*
  Given two lines, get the intersection point 

  This does not handle parallel lines or lines that are coincident.

  A Line is defined by this two points via this data structure:
  line : {
    p1 : {x: x1, y: y1},
    p2 : {x: x2, y: y2}
  }
*/
export function getIntersectionOfTwoLines(l1, l2) {
  let x1 = l1.p1.x;
  let y1 = l1.p1.y;
  let x2 = l1.p2.x;
  let y2 = l1.p2.y;
  let x3 = l2.p1.x;
  let y3 = l2.p1.y;
  let x4 = l2.p2.x;
  let y4 = l2.p2.y;
  let denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
  let numeratorI = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  let numeratorII = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);;
  return ({ x: numeratorI / denominator, y: numeratorII / denominator })
}
/*
  Given two points, return the angle in radians
*/
export function getAngleBetweenPoints(p1, p2, sk) {
  return (sk.atan2(p2.y - p1.y, p2.x - p1.x) + 2 * sk.PI) % (2 * sk.PI);
}

/*
  Convert a list of RGB colors to HSL colors. Provide the sketch 'sk'
*/
function convertRgbList2Hsb(rgbList, sk) {
  // console.log("convert RSB list 2 HSB:", rgbList)
  let hsbList = [];
  for (let i = 0; i < rgbList.length; i++) {
    let rgb = sk.color(rgbList[i][0], rgbList[i][1], rgbList[i][2]);
    let hsv = [sk.hue(rgb), sk.saturation(rgb), sk.lightness(rgb)];
    hsbList.push(hsv);
  }
  return hsbList;
}

function colorHashToColor(hash) {
  let c = hash.split(".")
  for (let i = 0; i < c.length; i++) {
    c[i] = parseInt(c[i], 10);
  }
  return c
}

/*
  Helper method for determining top color
*/
export function getTopColorWheel(colorList, numColors, threshold, sk, options) {

  let topColorCounter = {}
  // let similarColorCount = 0;
  let totalTally = 0
  for (let chash of colorList) {
    // if (topColors.length >= numColors) break;
    let c = colorHashToColor(chash[0], sk)
    totalTally += chash[1];
    let similarColor = false;
    for (let k of Object.keys(topColorCounter)) {
      let tc = topColorCounter[k]
      // console.log("comparing colors", c, "...",tc.rgb)

      if ((sk.abs(c[0] - tc.rgb[0]) + sk.abs(c[1] - tc.rgb[1]) + sk.abs(c[2] - tc.rgb[2])) / 3 < threshold) {
        // console.log("found similar color:", c, "...",tc.rgb)
        similarColor = true;
        if (options.favorGlitch) {
          let c1 = sk.color(c)
          let c2 = sk.color(tc.rgb)
          let c1val = Math.abs(50 - sk.lightness(c1))
          let c2val = Math.abs(50 - sk.lightness(c2))
          if ((c2val - c1val) + (sk.saturation(c1) - sk.saturation(c2)) > 0) {
            console.log("replace top color counter")
          }

        }
        // similarColorCount++;
        tc.count += chash[1];
        break;
      }
    }
    if (!similarColor) {
      topColorCounter[chash[0]] = { count: chash[1], rgb: c }
    }

  }

  var topColorCounterList = Object.keys(topColorCounter).map((key) => [key, topColorCounter[key].count, topColorCounter[key].rgb]);
  topColorCounterList.sort((a, b) => {
    return b[1] - a[1];
  })
  let topColors = []
  if (topColorCounterList.length > numColors) {
    topColorCounterList = topColorCounterList.slice(0, numColors)
  }
  let i = 0;
  while (i < topColorCounterList.length) {
    topColors.push(topColorCounterList[i][2])
    // console.log("topColo:", topColorCounterList[i][0] + " " + (topColorCounterList[i][1] / totalTally))
    i++;
  }
  return {
    total: totalTally,
    rgb: topColors,
    hsb: convertRgbList2Hsb(topColors, sk),
    topColorCounter: topColorCounter,
    topColorCounterList: topColorCounterList
  };
}

const TWO_THIRDS = Math.PI * (2 / 3);
const FOUR_THIRDS = Math.PI * (4 / 3);

/*
  Given minimal parameters, determine the points of an equilateral triangle:
  shape: {
    center: {x: x, y: y},
    radius: r,
    angle: a
  }
*/
export function getTrianglePoints(shape) {
  let pts = [
    shape.center.x + shape.radius * Math.cos(shape.angle),
    shape.center.y + shape.radius * Math.sin(shape.angle),
    shape.center.x + shape.radius * Math.cos(shape.angle + TWO_THIRDS),
    shape.center.y + shape.radius * Math.sin(shape.angle + TWO_THIRDS),
    shape.center.x + shape.radius * Math.cos(shape.angle + FOUR_THIRDS),
    shape.center.y + shape.radius * Math.sin(shape.angle + FOUR_THIRDS),
  ]
  // console.log("triangle points: " + pts)
  return pts
}

/*
  Amplify a color by n

  If it is blue, amplify the blue value

  Green, amplify the green value

  Red, amplify the red value
*/
export function amplify(color, n) {
  if (colorIsBlue(color)) {
    return blueify(color, n)
  } else if (colorIsRed(color)) {
    let newc = redify(color, n)
    // console.log("newc red", newc);
    return newc
  } else {
    let newc = greenify(color, n)
    // console.log("newc grn", newc);
    return newc
  }
}
/*
  Increase the Red of an RGB color by n
*/
export function redify(color, n) {
  return norm([color[0] += n, color[1] -= n / 2, color[2] -= n / 2, color[3]]);
}
/*
  Increase the Blue of an RGB color by n
*/
export function blueify(color, n) {
  return norm([color[0] -= n / 2, color[1] -= n / 2, color[2] += n, color[3]]);
}
/*
  Return true or false whether a color is Green
*/
export function colorIsGreen(color) {
  if (!(color[1] > color[0] && color[1] > color[2])) return false;
  if (color[0] + color[1] + color[2] >= 600) return false;
  return true;
}
/*
  Return true or false whether a color is Blue
*/
export function colorIsBlue(color) {
  if (!(color[2] > color[0] && color[2] > color[1])) return false;
  if (color[0] + color[1] + color[2] >= 600) return false;
  return true;
}
/*
  Return true or false whether a color is Red
*/
export function colorIsRed(color) {
  if (!(color[0] > color[1] && color[0] > color[1])) return false;
  if (color[0] + color[1] + color[2] >= 600) return false;
  return true;
}
