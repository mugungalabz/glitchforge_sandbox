import { getRandomImage } from "./util.js";
import { calculateRoyalties } from "./royalties.js";
import { sliceFrame, init as eInit } from "./effects/tartaria.js";

var r; //assign random hash accees
var WIDTH; var HEIGHT;
var random = null;
var royalties;

// Guaranteed to be called first.
export function init(rnd, txn_hash) {
  Math.random = rnd;
  random = rnd;
  eInit(rnd);
}

// Guaranteed to be called after setup(), can build features during setup
// Add your rarity traits and attributes to the features object
const features = {};
export function getFeatures() {
  return features;
}
export function getMetadata() {
  return {
    "features": features,
    "royalties": royalties
  }
}
/*
  Get a random number between a and b
*/
function rbtw(a, b, random) {
  return a + (b - a) * random();
}


function getMask(DIM) {
  var mask = sketch.createGraphics(DIM, DIM);
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
  sketch.image(clone, 0, 0);
}

// Receives:
// sketch: a p5js instance
// txn_hash: the transaction hash that minted this nft (faked in sandbox)
// random: a function to replace Math.random() (based on txn_hash)
// assets: an object with preloaded image assets from `export getAssets`, keyname --> asset
export async function draw(sketch, assets) {
  let startmilli = Date.now();

  //Fixed Canvas Size, change as needed
  WIDTH = 640;
  HEIGHT = 640;

  let royalty_tally = {}
  //Populate the features object like so, it is automatically exported. 
  features['Trait Name'] = "Trait Value";

  console.log("---Processing Starting---");
  sketch.createCanvas(WIDTH, HEIGHT);
  try {
    /*
     Make a copy of the raw image for reference. 
     If the raw image is too large, a random section is chosen to match our fixed canvas size.
    */
    let referenceGraphic = sketch.createGraphics(WIDTH, HEIGHT);
    let image = await getRandomImage(assets, 'samples', sketch)
    const copyStartX = Math.floor(random() * (image.width - WIDTH));
    const copyStartY = Math.floor(random() * (image.height - HEIGHT));
    referenceGraphic.copy(image, copyStartX, copyStartY, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);

    /* Copy the Reference image to the main Sketch for manipulation */
    sketch.image(referenceGraphic, 0, 0);

    /***********IMAGE MANIPULATION GOES HERE**********/
    sketch.background(0, 0, 0)
    sliceFrame(WIDTH, .05, sketch, referenceGraphic, {}, royalty_tally);
    /***********IMAGE MANIPULATION ENDS HERE**********/



    /* HELPFUL DEBUG CODE
      -Display original source image in top right, 
      -Used to compare the original with added effects.
      -Comment this out before production. 
    */
    // sk.copy(G["ref"], 0, 0, DIM, DIM, DIM - DIM / 5, 0, DIM / 5, DIM / 5,);


    //Saves the image for test review: Remove from production
    sketch.saveCanvas(sketch, "" + Math.floor(Math.random() * 10000), 'png');

    //Times how long the image takes to run
    console.log("---Processing Complete---")
    console.log("Time: " + (Date.now() - startmilli) / 1000 + " seconds");
    royalties = {
      "decimals": 3,
    }
    calculateRoyalties(royalties, royalty_tally)
    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e);
  }
}
