import { distancePoint2Line, getTrianglePoints, drawTopColors, processAndDisplayColorTally, getTopColorWheel } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";
import { randArray, centerDrip, smear, sliceUp, dither, drip, drawShadow, addFlow, glitchifyImg, pixelDrag } from "./frederative-effects.js";

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
  let files = [];
  let f = 'nukehype2/';
  for (let i = 1; i <= 12; i++)
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
  features['Slice Up'] = randArray([true, false]);
  features['Slice Up Detail'] = randArray(['small', 'medium', 'large']);

  features['Flow'] = randArray([true, false]);
  features['Flow Type'] = randArray(['Clean', 'Edgy', 'Random']);
  features['Flow Center'] = randArray([true, false]);
  features['Flow Multiplier'] = sketch.random(2, 50) | 0;

  features['Glitchify'] = randArray([true, false]);
  features['Border'] = randArray([true, false]);
  features['Accent Color'] = randArray([false, '#006600', '#000066']);

  features['Drip'] = randArray([true, false]);
  features['Drip Direction'] = randArray(['horizontal', 'vertical', 'diagonal']);
  features['Drip Crazy'] = randArray([true, false]);

  features['Smear'] = randArray([true, false]);
  features['Pixel Drag'] = randArray([true, false]);
  features['Number of Pixels'] = sketch.random(WIDTH / 8, WIDTH / 4) | 0;
  features['Pixel Drag Direction'] = randArray(["horizontal", "vertical", "diagonal"]);

  // fix up special features
  if (features['Drip'] === false && features['Slice Up'] === false && features['Flow'] === false && features['Smear'] === false && features['Pixel Drag'] === false) {
    let _r = sketch.random();
    if (_r > 0.80)
      features['Slice Up'] = true;
    else if (_r > 0.6)
      features['Drip'] = true;
    else if (_r > 0.40)
      features['Flow'] = true;
    else if (_r > 0.20)
      features['Smear'] = true;
    else
      features['Pixel Drag'] = true;
  }
  if (features['Slice Up'] === false) features['Slice Up Detail'] = 'N/A';
  if (features['Drip'] === false) {
    features['Drip Direction'] = 'N/A';
    features['Drip Crazy'] = 'N/A';
  }
  if (features['Flow'] === false) {
    features['Flow Type'] = 'N/A';
    features['Flow Center'] = 'N/A';
    features['Flow Multiplier'] = 'N/A';
  }
  if (features['Pixel Drag'] === false) {
    features['Number of Pixels'] = 'N/A';
    features['Pixel Drag Direction'] = 'N/A';
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

    // frederative - needs to be called prior to image copy
    sk.noiseDetail(8, 0.75);
    sk.pixelDensity(1);

    const copyStartX = Math.floor(random() * (assets[img_name].width - WIDTH));
    const copyStartY = Math.floor(random() * (assets[img_name].height - HEIGHT));
    referenceGraphic.copy(assets[img_name], copyStartX, copyStartY, DIM, DIM, 0, 0, DIM, DIM);

    /* Copy the Reference image to the main Sketch for manipulation */
    sk.image(referenceGraphic, 0, 0);

    /***********IMAGE MANIPULATION GOES HERE**********/
    // let rainWeight = .5;
    // diceFrame(DIM / 20, DIM * rainWeight, sk, sk.createGraphics(DIM, DIM), { randomX: true, minXOffset: 1 });
    console.log(features);

    // testing
    // sk = sliceUp(sk, features);
    // sk = drip(sk, features);
    // sk = addFlow(sk, features);
    sk = centerDrip(sk, features); // broken // too slow
    // still has some issues
    // sk = smear(sk, features);
    // sk = pixelDrag(sk, features);


    // if (features['Slice Up'] === true)
    //   sk = sliceUp(sk, features);
    // else if (features['Flow'] === true)
    //   sk = addFlow(sk, features);
    // else if (features['Drip'] === true)
    //   sk = drip(sk, features);
    // else if (features['Smear'] === true)
    //   sk = smear(sk, features);
    // else { // catch in case if all are false - shouldn't happen but don't just return raw image
    //   console.log("Error");
    // }

    // can be called regardless of other technique
    if (features['Glitchify'] === true)
      sk = glitchifyImg(sk);

    // border entity
    if (features['Border'] === true) {
      sk.noFill();
      let o = sk.width * 0.05;
      sk.stroke(sk.color(0, 220, 0));
      sk.rect(o, o, sk.width - 2 * o, sk.height - 2 * o);
    }

    // dither regardless
    sk = dither(sk);
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
