import * as generator from './generate.js';
import p5 from 'node-p5';
import seedrandom from 'seedrandom';
import fs from 'fs';

async function run() {
  console.log("Setting up sketch: ");
  let randomSeed = Math.random() + ""
  let constantSeed = "ADSFSEED"

  //Uncomment this to change seed with every run
  const random = seedrandom(randomSeed);
  //Uncomment this to use the same seed each run
  // const random = seedrandom(constantSeed);

  const txn_hash = "ooY6b3EDUB6zprbAiSByj3MFbgkLvSlVz8GSxLC4a1Szwzf12Mw";
  const sketchCount = 1;

  let assetPath = "./assets/nukehype";
  let files = [];

  console.log("DEBUG")
  let assetFolders = files.filter(f => fs.lstatSync(assetPath + f).isDirectory() && !f.startsWith('.'));
  console.log(assetFolders)
  let raw_asset_folders = []
  for (let af of assetFolders) {
    let files = fs.readdirSync(assetPath + af).filter(f => f.endsWith('.png'));
    raw_asset_folders.push({ "name": af, "files": files });
  }
  console.log(files);
  console.log("/DEBUG")

  const final = new Promise(async (resolve, reject) => {
    for (let i = 0; i < sketchCount; i++) {
      let p5instance = await p5.createSketch(async (sketch) => {
        console.log("sketch " + i + " created");
        sketch.setup = async () => {
          try {

            generator.init(random, txn_hash);

            // Load assets...
            const assets = {};
            const preload = generator.getAssets()
            console.log(preload);
            console.log("Loading assets: ", preload);
            if (preload) {
              for (let index in preload) {
                let filename = preload[index];
                console.log("Preloading: ", filename, " Index: ", index);
                if (!filename.includes('..')) {
                  console.log("aCurrent directory:", process.cwd())
                  assets[index] = await sketch.loadImage('./assets/' + filename);
                }
              }
            }

            console.log("Calling setup..");
            resolve(await generator.draw(sketch, assets, raw_asset_folders));

            const features = generator.getFeatures();
            const attributes = [];
            for (let feature in features) {
              let value = features[feature];
              attributes.push({ name: feature, value: value });
            }

            console.log("Attributes are: ");
            console.dir(attributes);
          } catch (e) {
            console.log("Error running setup: ", e);
            reject();
          }
          sketch.noLoop();
        }
      });
    }
  });

  // console.log("Calling generate()");
  const dataURL = await final;
  // console.log("data: ", dataURL);
  // const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
  // const buffer = Buffer.from(base64, 'base64');
  // console.log("DONE!");
}

run();
