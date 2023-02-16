import { saveRandomSectionsOfImage, wAlpha } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";
import react from "react";
import { Linter } from "eslint";
import * as fs from 'fs';

var G;
var globalPadding
var sk;
var r; //assign random hash accees
var W; var H;
var random = null;
var global_raw_assets
var l, t, r, b, fw, fh

//TESTING CHANGES

// Guaranteed to be called first.
export function init(rnd, txn_hash) {
  Math.random = rnd;
  random = rnd;
  eInit(rnd);
}

// Guaranteed to be called second (after init), to load required assets.
// Returns a map of assets, keyname --> filename

// Guaranteed to be called after setup(), can build features during setup
// Add your rarity traits and attributes to the features object
var features = {};
const metadata = {}
var filename = ""
export function getFeatures() {
  console.log("getFeatures:" + JSON.stringify({
    features: features,
    filename: filename
  }))
  return {
    features: features,
    filename: filename
  }
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
export async function draw(sketch, raw_assets) {
  let startmilli = Date.now();
  random = Math.random()
  //Fixed Canvas Size
  W = 3840;
  H = 3600;
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
  global_raw_assets = raw_assets
  try {
    console.log("Looping...");
    console.log("W, H: ", W, H);
    let folders = Object.keys(global_raw_assets)
    for (let i = 1; i <= 10; i++) {
      console.log("creating image ##############: " + i)
      await layerImages(sk, i)

    }

    //Times how long the image takes to run
    console.log("Time: " + (Date.now() - startmilli) / 1000 + " seconds");
    // const output_json = JSON.stringify(metadata);

    // fs.writeFile('lost_levels.json', output_json, 'utf8', (err) => {
    //   if (err) throw err;
    //   console.log('The metadarta has been saved!');
    // });
    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e)
  }
}

async function applyRandomImage(sk, image_dir) {
  let imageName = rFrom(global_raw_assets[image_dir])
  let currImgPath = "assets/" + image_dir + "/" + imageName
  let currImg = await sk.loadImage(currImgPath);
  sk.image(currImg, 0, 0)
  return currImgPath
}

async function layerImages(sk, n) {
  sk.createCanvas(W, H);
  sk.clear();
  // sk.background(165, 165, 165)
  let currFilepath = await applyRandomImage(sk, "bg")
  const bg_val = currFilepath.substring(currFilepath.lastIndexOf("/") + 1);
  await applyRandomImage(sk, "bg_overlay")
  const overlay_val = currFilepath.substring(currFilepath.lastIndexOf("/") + 1);
  await applyRandomImage(sk, "thick")
  const thick_val = currFilepath.substring(currFilepath.lastIndexOf("/") + 1);
  await applyRandomImage(sk, "thin")
  const thin_val = currFilepath.substring(currFilepath.lastIndexOf("/") + 1);
  await applyRandomImage(sk, "details")
  const details_val = currFilepath.substring(currFilepath.lastIndexOf("/") + 1);
  filename = "lostlvels" + n
  console.log("filename: " + filename)
  features = {
    "bg": bg_val,
    "bg_overlay": overlay_val + thick_val,
    "thin": thin_val + details_val
  }
  metadata[filename] = features
  // console.log("features: " + features)
  sk.saveCanvas(sk, filename, 'png');
  const output_json = JSON.stringify(features);
  const dir = "./metadata/";

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log('Directory created!');
  } else {
    console.log('Directory already exists.');
  }
  fs.writeFile("metadata/" + filename + ".json", output_json, 'utf8', (err) => {
    if (err) throw err;
    console.log('The metadarta has been saved!');
  });

}
