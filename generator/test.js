import * as generator from './generate.js';
import p5 from 'node-p5';
import seedrandom from 'seedrandom';
import fs from 'fs';

async function run() {
  console.log("Setting up sketch: ");
  const random = seedrandom(Math.random() + "");
  // const random = seedrandom('45756');
  const txn_hash = "ooY6b3EDUB6zprbAiSByj3MFbgkLvSlVz8GSxLC4a1Szwzf12Mw";
  const sketchCount = 1;
  var assetPath = 'assets/'
  var files = fs.readdirSync(assetPath)
  console.log("files: " + files)
  let assetFolders = files.filter(f => fs.lstatSync(assetPath + f).isDirectory() && !f.startsWith('.'));
  let raw_assets = {}
  for (let af of assetFolders) {
    console.log("asset folder processing: " + af)
    let files = fs.readdirSync(assetPath + af).filter(f => f.endsWith('.png'));
    // raw_assets.push({ "name": af, "files": files });
    raw_assets[af] = files //use a dictionary instead
  }
  const all_metadata = {}
  console.log("assetFolders: " + assetFolders)
  const final = new Promise(async (resolve, reject) => {
    const promises = []
    for (let i = 0; i < sketchCount; i++) {
      promises.push(new Promise(async (resolve, reject) => {
        await p5.createSketch(async (sketch) => {
          console.log("sketch " + i + " created");
          sketch.setup = async () => {
            try {

              generator.init(random, txn_hash);

              // resolve(await generator.draw(sketch, raw_assets));
              await generator.draw(sketch, raw_assets);

              const { features, filename } = generator.getFeatures();
              console.log("test features: " + JSON.stringify(features))
              console.log("test filename: " + JSON.stringify(filename))
              all_metadata[filename] = features;
              const attributes = [];
              for (let feature in features) {
                let value = features[feature];
                attributes.push({ name: feature, value: value });
              }
              resolve()
            } catch (e) {
              console.log("Error running setup: ", e);
              reject();
            }
            sketch.noLoop();
          }
        })
      }))
    }

    await Promise.all(promises);
    // const output_json = JSON.stringify(all_metadata);
    // fs.writeFile('lost_levels.json', output_json, 'utf8', (err) => {
    //   if (err) throw err;
    //   console.log('The file has been saved!');
    // });
    resolve()
  });

  const dataURL = await final;

  // console.log("data: ", dataURL);
  // const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
  // const buffer = Buffer.from(base64, 'base64');
  // console.log("DONE!");
}

run();
