import { saveRandomSectionsOfImage, wAlpha } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";
import react from "react";
import { Linter } from "eslint";

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
export async function draw(sketch, raw_assets) {
  let startmilli = Date.now();
  random = Math.random()
  //Fixed Canvas Size
  W = 1000;
  H = 1000;
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
    for (let i = 1; i <= 1; i++) {
      console.log("creating image ##############: " + i)
      await layerImages(sk, i)

    }

    //Times how long the image takes to run
    console.log("Time: " + (Date.now() - startmilli) / 1000 + " seconds");

    return sketch.getCanvasDataURL(sketch);
  } catch (e) {
    console.error(e)
  }
}

async function applyRandomImage(sk, image_dir) {
  let currImgPath = "assets/" + image_dir + "/" + rFrom(global_raw_assets[image_dir])
  console.log("currImgPath: " + currImgPath)
  let currImg = await sk.loadImage(currImgPath);
  sk.image(currImg, 0, 0)
}

async function layerImages(sk, n) {
  sk.createCanvas(W, H);
  sk.clear();

  // sk.background(165, 165, 165)
  await applyRandomImage(sk, "bg")
  sk.saveCanvas(sk, "lostlvels" + n, 'png');

}
