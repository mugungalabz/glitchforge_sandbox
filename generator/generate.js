import { saveRandomSectionsOfImage, wAlpha } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";
import react from "react";
import { Linter } from "eslint";

var G;
var globalPadding
var sk;
var r; //assign random hash accees
var DIM; var W; var H;
var random = null;
var few_shapes = []
var backgrounds = []
var many_shapes = []
var cubes = []
var mainColor
var blackColor
var l, t, r, b, fw, fh
var orthShape

//TESTING CHANGES

// Guaranteed to be called first.
export function init(rnd, txn_hash) {
  Math.random = rnd;
  random = rnd;
  eInit(rnd);
}

// Guaranteed to be called second (after init), to load required assets.
// Returns a map of assets, keyname --> filename
export function getAssets() {
  let id = Math.floor(Math.random() * 2 + 1);
  if (id < 10) {
    id = "0" + id;
  }
  return {
    // background: 'awaken_raw_' + id + '.png',
    background: id + '.jpg',
  };
}

// Guaranteed to be called after setup(), can build features during setup
// Add your rarity traits and attributes to the features object
const features = {};
export function getFeatures() {
  return features;
}
/*
  Get a random number between a and b
*/
function rbtw(a, b, r) {
  return a + (b - a) * Math.random();
}

function rFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function ibtw(a, b, r) {
  return Math.floor(rbtw(a, b, Math.random()));
}

function getMask(DIM) {
  var mask = sk.createGraphics(DIM, DIM);
  mask.noStroke();
  mask.fill(255, 255, 255, 255);
  return mask;
}
/*
  Apply a mask, used for cutting shapes out of one canvas 
  and pasting them onto another.
*/
function applyMask(source, target) {
  let clone;
  (clone = source.get()).mask(target.get());
  sk.image(clone, 0, 0);
}

function p(n) {
  return Math.random() < n;
}

// Receives:
// sketch: a p5js instance
// txn_hash: the transaction hash that minted this nft (faked in sandbox)
// random: a function to replace Math.random() (based on txn_hash)
// assets: an object with preloaded image assets from `export getAssets`, keyname --> asset
export async function draw(sketch, assets, raw_assets) {
  let startmilli = Date.now();
  random = Math.random()
  //Fixed Canvas Size
  W = 2000;
  H = 3000;
  globalPadding = .05
  // DIM = Math.min(WIDTH, HEIGHT);
  l = W * globalPadding;
  t = W * globalPadding;
  r = W * (1 - globalPadding);
  b = W * (1 - globalPadding);
  fw = r - l;
  fh = b - t;

  sk = sketch;
  sk.blendMode(sk.BLEND);
  console.log("Starting");
  mainColor = sk.color("#CD5061")
  blackColor = sk.color(13, 13, 13)
  try {
    console.log("Looping...");
    console.log("W, H: ", W, H);

    //organize the shapes into categories
    few_shapes = []
    backgrounds = []
    many_shapes = []
    for (let ra of raw_assets) {
      if (ra["name"].includes("CUBE")) {
        cubes.push(ra)
      } else if (ra["name"].includes("FEW")) {
        few_shapes.push(ra)
      } else if (ra["name"].includes("MANY")) {
        many_shapes.push(ra)
      } else if (ra["name"].includes("Background")) {
        backgrounds.push(ra)
      } else {
        console.log("Unknown Category: " + ra["name"])
      }
    }

    /* Chop up the background image into sections */
    // console.log("backgrounds to processs:" + backgrounds[0]["files"].length)
    // for (let i = 0; i < backgrounds[0]["files"].length; i++) {
    //   let imgPath = "assets/" + backgrounds[0]["name"] + "/" + backgrounds[0]["files"][i]
    //   console.log("Loading Background Image: " + imgPath)
    //   let image = await sketch.loadImage(imgPath)
    //   saveRandomSectionsOfImage(sk, image, 50, H, W, "shrunk_backgrounds/" + backgrounds[0]["files"][i])
    // }
    for (let i = 1; i <= 13; i++) {
      console.log("creating image ##############: " + i)
      await createDapp(sk, i)

    }
    //Choose a Background and display a section of it. 


    //Times how long the image takes to run
    console.log("Time: " + (Date.now() - startmilli) / 1000 + " seconds");

    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e)
  }
}

async function findAngleOfShape(sk, i) {
  let pointsFound = 0
  //Angle from Right
  let points = []
  let y = sk.round(Math.random() * H)
  while (pointsFound < 2) {
    // console.log("y to test:" + y)
    let x = 0
    let solidFound = false
    while (!solidFound && x < W) {
      // console.log("point vals: " + i.get(x, y))
      if (i.get(x, y)[3] > 0) {
        solidFound = true
        points.push([x, y])
        pointsFound++
      }
      x++
    }
    y = (y + .02 * H) % H
  }
  let angle = sk.atan2(points[1][1] - points[0][1], points[1][0] - points[0][0])
  return [angle, points]

}
function randomPointInRectangle(x1, x2, y1, y2) {
  return [Math.random() * (x2 - x1) + x1, Math.random() * (y2 - y1) + y1]

}

function randomPointInFrame() {
  return randomPointInRectangle(W * globalPadding, W * (1 - globalPadding), W * globalPadding, W * (1 - globalPadding))
}

async function createDapp(sk, n) {
  orthShape = p(.5) ? 0 : 1
  sk.createCanvas(W, H);
  sk.clear();
  sk.strokeCap(sk.SQUARE)
  // sk.noStroke()
  // sk.fill(200, 200, 200)
  sk.background(165, 165, 165)
  let bg = backgrounds[0]["files"][Math.floor(Math.random() * backgrounds[0]["files"].length)]
  let bg_path = "assets/" + backgrounds[0]["name"] + "/" + bg
  // console.log("bg: " + bg_path)
  let bgImg = await sk.loadImage(bg_path);
  // console.log("bg w/h: " + bgImg.width + ", " + bgImg.height)
  // const copyStartX = Math.floor(Math.random() * (bgImg.width - W));
  // const copyStartY = Math.floor(Math.random() * (bgImg.height - H));
  // sk.copy(bgImg, copyStartX, copyStartY, W, H, 0, 0, W, H);
  let frameColor = blackColor
  let accentColor = mainColor
  let linesColor = p(.80) ? mainColor : blackColor
  let shapeColor = p(.80) ? mainColor : blackColor
  // if (p(.5)) 
  let partBlack = p(1.5)
  if (partBlack) {
    sk.fill(blackColor)
    sk.noStroke()
    switch (rFrom([0, 1, 2, 3])) {
      case 0:
        sk.rect(l, t, r - l, (b - t) / 2)
        break;
      case 1:
        sk.rect(l, t, (r - l) / 2, b - t)
        break;
      case 2:
        sk.rect(r - (r - l) / 2, t, (r - l) / 2, b - t)
        break;
      case 3:
        sk.rect(l, b - (b - t) / 2, r - l, (b - t) / 2)

    }
  }

  //Draw a frame and set stroke, 
  sk.strokeWeight(H / 200)
  sk.stroke(p(.5) ? blackColor : mainColor)
  sk.noFill()
  sk.rect(W * globalPadding, W * globalPadding, W * .9, W * .9)
  if (p(1.005)) { //normal frame
    sk.rect(W * globalPadding, W * globalPadding, W * .9, W * .9)

  } else if (p(.0005)) {
    //corner frame
    sk.stroke(mainColor)
    linesColor = blackColor
    shapeColor = blackColor
    // line()
  }
  //rays, ignore for now
  // else { //rays
  //   sk.fill(mainColor)
  //   linesColor = blackColor
  //   shapeColor = blackColor
  //   sk.noStroke()
  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * globalPadding, W * (1 - globalPadding))
  //   sk.vertex(W * (globalPadding + .2), W * (1 - globalPadding))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()

  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (globalPadding + .4), W * (1 - globalPadding))
  //   sk.vertex(W * (globalPadding + .6), W * (1 - globalPadding))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()

  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (globalPadding + .8), W * (1 - globalPadding))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .10))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()

  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .20))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .35))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()

  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .45))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .60))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()

  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .65))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .75))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()
  //   sk.beginShape()
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .80))
  //   sk.vertex(W * (1 - globalPadding), W * (1 - globalPadding - .85))
  //   sk.vertex(W * globalPadding, W * globalPadding)
  //   sk.endShape()
  // }

  //Draw random lines
  // for (let i = 0; i < 3; i++) {
  //   sk.line(Math.random() * W, Math.random() * W, Math.random() * W, Math.random() * W)
  // }

  //get 3 random numbers
  // let n = 2
  // let folders_to_use = []
  // while (folders_to_use.length < n) {
  //   let r = Math.floor(Math.random() * raw_assets.length)
  //   if (!folders_to_use.includes(r)) {
  //     folders_to_use.push(r)
  //   }
  //   if (raw_assets.length < n) {
  //     console.log("LOOKING FOR MORE FOLDER THAN EXISTS")
  //     break
  //   }
  // }

  //determine which shapes to use
  let currImages = []
  if (p(.005)) {
    let many = rFrom([1])
    for (let i = 0; i < many; i++) {
      let dirIdx = ibtw(0, many_shapes.length)
      // let file = rFrom(many_shapes[dirIdx]["files"])
      let currImgPath = "assets/" + many_shapes[dirIdx]["name"] + "/" + rFrom(many_shapes[dirIdx]["files"])
      console.log("currImgPath: " + currImgPath)
      let currImg = await sk.loadImage(currImgPath);
      currImages.push(currImg)
    }
    // many_shapes
    // sk.image(currImg, W * .05, W * .05, W * .9, W * .9);
  } else {
    let few = rFrom([2, 4])
    for (let i = 0; i < few; i++) {
      let dirIdx = ibtw(0, few_shapes.length)
      // let file = rFrom(many_shapes[dirIdx]["files"])
      let currImgPath = "assets/" + few_shapes[dirIdx]["name"] + "/" + rFrom(few_shapes[dirIdx]["files"])
      let currImg = await sk.loadImage(currImgPath);
      currImages.push(currImg)
    }
    // few_shapes
    // sk.image(currImg, W * .05, W * .05, W * .9, W * .9);
  }
  //add cube: 
  let dirIdx = ibtw(0, cubes.length)
  // let file = rFrom(many_shapes[dirIdx]["files"])
  let currImgPath = "assets/" + cubes[dirIdx]["name"] + "/" + rFrom(cubes[dirIdx]["files"])
  console.log("currImgPath: " + currImgPath)
  let currImg = await sk.loadImage(currImgPath);
  currImages.push(currImg)
  // if (p(1.75)) {

  //   squaresToDraw.push(...randomPointInFrame(), Math.random() * W * .5 + W * .1)
  // }


  // console.log("currImages: " + currImages.length)
  //Draw the images
  // sk.strokeWeight(H / 1000)
  sk.noStroke()
  if (p(1.75)) {
    // console.log("drawing squares")
    let hasTwin = p(.00025)
    let identicalTwin = p(.25)
    let angle = Math.random() * 2 * sk.PI
    let side = W * .05 + Math.random() * W * (Math.random() < .25 ? .4 : .3)
    let numSides = 4
    sk.fill(shapeColor)
    let minDistFromFrame = Math.sqrt(2 * (side / 2) * (side / 2))
    if (!hasTwin) {
      let shapeX = l + minDistFromFrame + Math.random() * (fw - minDistFromFrame * 2)
      let shapeY = t + minDistFromFrame + Math.random() * (fh - minDistFromFrame * 2)
      randomShape(sk, shapeX, shapeY, side, angle, numSides)
    }
    // else {
    //   if (p(.5)) { //hoprizontal shape

    //   } else { //vertical shape
    //     let shapeX1 = l + minDistFromFrame + Math.random() * (fw - minDistFromFrame)

    // }
    // sk.fill(mainColor)
    // if (p(.25)) { //add twin
    //   sk.fill(shapeColor)
    //   if (p(.25)) { //identical twin
    //     randomShape(sk, Math.random() * W, Math.random() * W, side, angle, numSides)
    //   } else {
    //     let twinAngle = Math.random() * 2 * sk.PI
    //     let twinSide = W * .05 + Math.random() * W * (Math.random() < .25 ? .6 : .4)
    //     let twinNumSides = 4
    //     randomShape(sk, Math.random() * W, Math.random() * W, twinSide, twinAngle, twinNumSides)
    //   }
    // }

  }

  //drawlines
  if (p(5.5)) {
    console.log("lines")
    sk.stroke(linesColor)
    sk.strokeWeight(H / 200)
    if (p(.5)) {
      console.log("image lines")
      let linesFromImage = rFrom(currImages)
      let shapeAngle = await findAngleOfShape(sk, linesFromImage)
      let d = Math.random() * W * .5 + W * .3
      sk.line(
        shapeAngle[1][0][0] - H * .1,
        shapeAngle[1][0][1],
        shapeAngle[1][0][0] - H * .1 + d * Math.cos(shapeAngle[0]),
        shapeAngle[1][0][1] + d * Math.sin(shapeAngle[0])
      )
      if (p(.4)) {
        let perp = shapeAngle[0] + Math.PI / 2
        let px = Math.random() * fw + l
        let py = Math.random() * fh + t
        sk.strokeWeight(H / 200)
        sk.line(px, py, px + d * Math.cos(perp), py + d * Math.sin(perp))
      }
    } else {
      console.log("set lines")
      let lineVert = p(.5)
      let offset = W * rbtw(globalPadding, 1 - globalPadding * 3)
      let hpct = rbtw(.5, 1 - globalPadding)
      let lineHeight = W * hpct
      let hstart = W * rbtw(globalPadding, 1 - hpct - globalPadding)
      if (lineVert) {
        sk.line(hstart, offset, hstart + lineHeight, offset)
        if (p(0.6)) {
          offset += W * .05
          sk.line(hstart, offset, hstart + lineHeight, offset)
          if (p(.6)) {
            offset += W * .05
            sk.line(hstart, offset, hstart + lineHeight, offset)
          }
        }
      } else {
        sk.line(offset, hstart, offset, hstart + lineHeight)
        if (p(5.5)) {
          offset += W * .05
          sk.line(offset, hstart, offset, hstart + lineHeight)
          if (p(5.5)) {
            offset += W * .05
            sk.line(offset, hstart, offset, hstart + lineHeight)
          }
        }
      }
    }

  }

  //draw the shapes
  for (let img of currImages) {
    sk.image(img, W * .05 + 3, W * .05 + 3, W * .9 - 3, W * .9 - 3)
  }
  //   sk.image(currImg, W * .05, W * .05, W * .9, W * .9);
  // sk.image(currImg, W * .05, W * .05, W * .9, W * .9);
  // for (let f of folders_to_use) {
  //   // let folder = raw_assets[i]["name"]
  //   console.log("get image: " + raw_assets[f]["name"] + "," + file)
  //   let currImg = await sketch.loadImage(currImgPath);
  //   imagesUsed.push(currImg);
  //   sk.image(currImg, H * .05, H * .05, H * .9, H * .9);
  // }


  /*
    -Display original source image in top right, 
    -Used to compare the original with added effects.
    -Comment this out before production. 
  */
  // sk.copy(G["ref"], 0, 0, DIM, DIM, DIM - DIM / 5, 0, DIM / 5, DIM / 5,);
  // sk.blendMode(sk.SCREEN);
  sk.blendMode(sk.MULTIPLY);
  // console.log("About to tint")
  // sk.tint(255, 127)
  // const copyStartX = Math.floor(Math.random() * (bgImg.width - W));
  // const copyStartY = Math.floor(Math.random() * (bgImg.height - H));
  sk.image(bgImg, 0, 0)


  // sk.copy(bgImg, copyStartX, copyStartY, W, H, 0, 0, W, H);
  sk.blendMode(sk.BLEND);
  sk.noStroke()
  sk.fill(255, 255, 255, 20)
  sk.rect(0, 0, W, H)
  //Saves the image for test review: Remove from production
  sk.saveCanvas(sk, "dappCon" + n, 'png');

}


function randomShape(sk, x, y, r, a, sides) {
  // fill(0, 0, 0)
  console.log("drawing shape" + " at " + x + ", " + y)
  console.log("r: " + r + ", a: " + a + ", sides: " + sides)
  if (orthShape == 0) {
    sk.circle(x, y, r)
  } else {
    sk.beginShape()
    for (let i = 0; i <= sides; i++) {
      sk.vertex(x + sk.cos(a) * r, y + sk.sin(a) * r)
      a += (2 * sk.PI) / sides
    }
    sk.endShape()
  }
}
