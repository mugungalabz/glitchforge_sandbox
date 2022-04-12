import { distancePoint2Line, getTrianglePoints, drawTopColors, processAndDisplayColorTally, getTopColorWheel } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";

var G;
var sk;
var r; //assign random hash accees
var DIM; var WIDTH; var HEIGHT;
var random = null;

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
export async function draw(sketch, assets) {
  let startmilli = Date.now();
  //Fixed Canvas Size
  WIDTH = 640;
  HEIGHT = 640;
  DIM = Math.min(WIDTH, HEIGHT);
  // G = {}
  // G["WIDTH"] = WIDTH;
  // G["HEIGHT"] = HEIGHT;
  // G["DIM"] = DIM;
  // G["sketch"] = sketch;
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
    G["ref"] = sk.createGraphics(DIM, DIM);
    const copyStartX = Math.floor(random() * (assets[img_name].width - WIDTH));
    const copyStartY = Math.floor(random() * (assets[img_name].height - HEIGHT));
    G["ref"].copy(assets[img_name], copyStartX, copyStartY, DIM, DIM, 0, 0, DIM, DIM);

    /* Copy the Reference image to the main Sketch for manipulation */
    sk.image(G["ref"], 0, 0);

    /***********IMAGE MANIPULATION GOES HERE**********/
    let rainWeight = .5;
    diceFrame(DIM / 20, DIM * rainWeight, sk, sk.createGraphics(DIM, DIM), { randomX: true, minXOffset: 1 });
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

    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e);
  }
}
