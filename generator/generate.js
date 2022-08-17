import { distancePoint2Line, getTrianglePoints, drawTopColors, processAndDisplayColorTally, getTopColorWheel } from "./util.js";
// import { calculateRoyalties } from "./royalties.js";
import { diceFrame, init as eInit } from "./effects.js";
import { randArray, drawPoints, dither, glitchify, turtle, overdot, overdrive, blackhole } from "./frederative-effects.js";

var G;
var sk;
var r; //assign random hash accees
var DIM; var WIDTH; var HEIGHT;
var random = null;
var royalties;

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
  let files = [];
  let f = 'nukehype2/';
  for (let i = 1; i <= 114; i++)
    files.push(`${f}${i}.png`)

  let retval = randArray(files);
  console.log(`image: ${retval}`)

  return {
    // background: 'awaken_raw_' + id + '.png',
    // background: id + '.jpg',
    // background: 'nukehype/4v2.png',
    background: retval,
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
function rbtw(a, b, random) {
  return a + (b - a) * random();
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

// Receives:
// sketch: a p5js instance
// txn_hash: the transaction hash that minted this nft (faked in sandbox)
// random: a function to replace Math.random() (based on txn_hash)
// assets: an object with preloaded image assets from `export getAssets`, keyname --> asset
export async function draw(sketch, assets, raw_asset_folders) {
  let startmilli = Date.now();

  //Fixed Canvas Size, change as needed
  WIDTH = 2500;
  HEIGHT = 2500;

  //Populate the features object like so, it is automatically exported. 
  features['Dithered'] = randArray([true, false]);
  features['Glitchify'] = randArray([false, false, true]);
  features['Overdot'] = randArray([false, false, true]);
  features['Blackhole'] = randArray([false, false, true]);
  features['Base'] = randArray(['Pointillism', 'Turtle', 'Overdrive']);

  // placeholders for base features as they'll show up via rendering (i think)
  features['Pointillism-Mode'] = null;
  features['Pointillism-Direction'] = null;
  features['Pointillism-Size'] = null;
  features['Pointillism-Life'] = null;
  features['Pointillism-TrailOff'] = null;
  features['TurtleNumber'] = null;
  features['TurtleSize'] = null;
  features['TurtleVarySize'] = null;
  features['TurtleJagged'] = null;
  features['Glitchify-Density'] = null;
  features['Glitchify-Shadows'] = null;

  if (features['Base'] == 'Pointillism') {
    features['Pointillism-Mode'] = randArray(['square', 'circle']);
    features['Pointillism-Direction'] = randArray(['left', 'right', 'up', 'down']);
    features['Pointillism-Size'] = randArray(['small', 'medium', 'large']);
    features['Pointillism-Life'] = randArray(['long', 'short', 'random']);
    features['Pointillism-TrailOff'] = randArray([true, false]);
  } else if (features['Base'] == 'Turtle') {
    features['TurtleNumber'] = randArray(['few', 'average', 'many']),
    features['TurtleSize'] = randArray(['small', 'large']);
    features['TurtleVarySize'] = randArray([true, false]);
    features['TurtleJagged'] = randArray([true, false]);
  }

  if (features['Glitchify'] === true) {
    features['Glitchify-Density'] = randArray(["maximal", "minimal"]);
    features['Glitchify-Shadows'] = randArray([true, false]);
  }

  DIM = Math.min(WIDTH, HEIGHT);

  sk = sketch;
  console.log("Starting");
  sketch.createCanvas(WIDTH, HEIGHT);

  try {
    console.log("Looping...");
    console.log("WIDTH, HEIGHT: ", WIDTH, HEIGHT);
    // const img_name = 'awaken_raw_' + Math.floor((random() * preload.length) + 1) + EXT;
    const img_name = 'background';

    /*
     Make a copy of the raw image for reference. 
     If the raw image is too large, a random section is chosen to match our fixed canvas size.
    */
    let referenceGraphic = sk.createGraphics(DIM, DIM);

    // frederative - needs to be called prior to image copy for flow / dithering
    sk.noiseDetail(8, 0.75);
    sk.pixelDensity(1);

    const copyStartX = Math.floor(random() * (assets[img_name].width - WIDTH));
    const copyStartY = Math.floor(random() * (assets[img_name].height - HEIGHT));
    referenceGraphic.copy(assets[img_name], copyStartX, copyStartY, DIM, DIM, 0, 0, DIM, DIM);

    /* Copy the Reference image to the main Sketch for manipulation */
    sk.image(referenceGraphic, 0, 0);

    /***********IMAGE MANIPULATION GOES HERE**********/
    let royalty_tally = {};
    // let rainWeight = .5;
    // diceFrame(DIM / 20, DIM * rainWeight, sk, sk.createGraphics(DIM, DIM), { randomX: true, minXOffset: 1 });
    console.table(features);

    // draw points with circles or squares
    if (features['Base'] == 'Pointillism')
      sk = drawPoints(sk, features, royalties);
    // trying to kind of paint over image in a breathy fashion
    else if (features['Base'] == 'Overdrive')
      sk = overdrive(sk, royalties);
    else // tuuuuurtle line drawing
      sk = turtle(sk, features, royalties);
  
    // black hole
    if (features['Blackhole'] === true)
      sk = blackhole(sk, features, royalties);
  
    // matheson's red dot feature request
    if (features['Overdot'] === true)
      sk = overdot(sk, royalties);

    // glitch up a touch by copy/pasting regions
    if (features['Glitchify'] === true)
      sk = glitchify(sk, features, royalties);

  // dither me timbers
  if (features['Dithered'] === true)
    sk = dither(sk, royalties);

    /***********IMAGE MANIPULATION ENDS HERE**********/


    /*
      -Display original source image in top right, 
      -Used to compare the original with added effects.
      -Comment this out before production. 
    */
    // sk.copy(G["ref"], 0, 0, DIM, DIM, DIM - DIM / 5, 0, DIM / 5, DIM / 5,);


    //Saves the image for test review: Remove from production
    sk.saveCanvas(sk, "" + Math.floor(Math.random() * 10000), 'png');

    //Times how long the image takes to run
    console.log("Time: " + (Date.now() - startmilli) / 1000 + " seconds");

    // royalties = {
    //   "decimals": 3,
    // }
    // calculateRoyalties(royalties, royalty_tally)

    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e);
  }
}
