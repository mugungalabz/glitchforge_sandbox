import { distancePoint2Line, wAlpha, getTrianglePoints, drawTopColors, processAndDisplayColorTally, getTopColorWheel } from "./util.js";
import { diceFrame, init as eInit } from "./effects.js";
import react from "react";
import { Linter } from "eslint";

var G;
var sk;
var r; //assign random hash accees
var DIM; var W; var H;
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
function rbtw(a, b, r) {
  return a + (b - a) * Math.random();
}

function ibtw(a, b, r) {
  return Math.floor(rbtw(a, b, Math.random()));
}
// {
//   "volume": 1,
//     "name": "Dapp",
//       "project": "dapp",
//         "colors": [
//           "#C5C3A8",
//           "#B7B6A4",
//           "#A72517",
//           "#07090F"
//         ]
// },
// {
//   "volume": 1,
//     "name": "DappII",
//       "project": "dapp",
//         "colors": [
//           "#B7B6A4",
//           "#71726C",
//           "#A72517",
//           "#7C1F18",
//           "#322D28",
//           "#320502",
//           "#07090F"
//         ]
// },
// {
//   "volume": 1,
//     "name": "DappIII",
//       "project": "dapp",
//         "colors": [
//           "#B7B6A4",
//           "#9F9F8E",
//           "#8F8A6E",
//           "#71726C",
//           "#58544D",
//           "#A72517",
//           "#7C1F18",
//           "#322D28",
//           "#50120C",
//           "#2E0402",
//           "#080A10"
//         ]
// }

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
export async function draw(sketch, assets, raw_assets) {
  let startmilli = Date.now();
  random = Math.random()
  //Fixed Canvas Size
  W = 2000;
  H = 3000;
  // DIM = Math.min(WIDTH, HEIGHT);

  // G = {}
  // G["WIDTH"] = WIDTH;
  // G["HEIGHT"] = HEIGHT;
  // G["DIM"] = DIM;
  // G["sketch"] = sketch;
  sk = sketch;
  console.log("Starting");
  sketch.createCanvas(W, H);
  let mainColor = sk.color("#CD5061")
  try {
    console.log("Looping...");
    console.log("W, H: ", W, H);
    // const img_name = 'awaken_rawwAlpha_' + Math.floor((random() * preload.length) + 1) + EXT;
    const img_name = 'background';

    //           "#B7B6A4",
    //           "#9F9F8E",
    //           "#8F8A6E",
    //           "#71726C",
    //           "#58544D",
    //           "#A72517",
    //           "#7C1F18",
    //           "#322D28",
    //           "#50120C",
    //           "#2E0402",
    //           "#080A10"

    /*
     Make a copy of the raw image for reference. 
     If the raw image is too large, a random section is chosen to match our fixed canvas size.
    */
    // const copyStartX = Math.floor(random() * (assets[img_name].width - WIDTH));
    // const copyStartY = Math.floor(random() * (assets[img_name].height - HEIGHT));
    // G["ref"].copy(assets[img_name], copyStartX, copyStartY, DIM, DIM, 0, 0, DIM, DIM);
    let imgPath = "assets/" + raw_assets[0]["name"] + "/" + raw_assets[0]["files"][0]
    console.log("raw_assets[]0 name: " + raw_assets[0]["name"])
    console.log("file name: " + imgPath)
    let img = await sketch.loadImage(imgPath);
    /* Copy the Reference image to the main Sketch for manipulation */
    sk.image(img, 0, 0);
    sk.background(243, 243, 243)

    let imagesUsed = []

    // console.log("maincolor: " + mainColor)
    // let k = wAlpha(mainColor, 100, sk)
    // sk.fill(k)
    // console.log("k alpha:" + k)
    // sk.rect(0, 0, W, H)
    //One from each asset folder

    /***********IMAGE MANIPULATION GOES HERE**********/
    // let rainWeight = .5;
    // diceFrame(DIM / 20, DIM * rainWeight, sk, sk.createGraphics(DIM, DIM), { randomX: true, minXOffset: 1 });
    /***********IMAGE MANIPULATION ENDS HERE**********/
    sk.strokeWeight(H / 200)
    sk.stroke(13, 13, 13)
    sk.rect(W * .05, W * .05, W * .9, W * .9)
    sk.stroke(mainColor)

    for (let i = 0; i < 3; i++) {
      sk.line(Math.random() * H, Math.random() * H, Math.random() * H, Math.random() * H)
    }
    //get 3 random numbers
    let n = 2
    let folders_to_use = []
    while (folders_to_use.length < n) {
      let r = Math.floor(Math.random() * raw_assets.length)
      if (!folders_to_use.includes(r)) {
        folders_to_use.push(r)
      }
      if (raw_assets.length < n) {
        console.log("LOOKING FOR MORE FOLDER THAN EXISTS")
        break
      }
    }
    console.log("FOLDER INDEXES FOUIND: " + folders_to_use)
    for (let f of folders_to_use) {
      // let folder = raw_assets[i]["name"]
      let file = ibtw(0, raw_assets[f]["files"].length)
      console.log("get image: " + raw_assets[f]["name"] + "," + file)
      let currImgPath = "assets/" + raw_assets[f]["name"] + "/" + raw_assets[f]["files"][file]
      let currImg = await sketch.loadImage(currImgPath);
      imagesUsed.push(currImg);
      sk.image(currImg, H * .05, H * .05, H * .9, H * .9));
    }


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
    console.error(e)
  }
}
