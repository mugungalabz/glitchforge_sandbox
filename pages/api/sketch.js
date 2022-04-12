import { preload, setup } from '../../generator/generate.js';
import p5 from 'node-p5';
import seedrandom from 'seedrandom';


export default async function handler(req, res) {
  console.log("Setting up sketch: ");
  const txn_hash = "ooG6bAiSByg3MFbgkLvSVVz8GSxLCb3ESzwzf12MDUB6zpr4a1w";
  const random = seedrandom(req.query.rnd);
  const sketchCount = 3;
  const final = new Promise(async (resolve, reject) => {
    for (let i = 0; i < sketchCount; i++) {
      let p5instance = await p5.createSketch(async (sketch) => {
        console.log("sketch " + i + " created");
        sketch.setup = async () => {
          try {
            // Load assets...
            // console.log("Loading assets!");
            var fs = require('fs');
            var files = fs.readdirSync('./generator/assets/').filter(f => f.endsWith('.png'));
            const assets = [];
            let imageName = files[Math.floor(Math.random() * files.length)]
            // let imageName = files[Math.floor(random() * files.length)]
            assets.push(await sketch.loadImage('./generator/assets/' + imageName));
            // console.log(assets[0])
            // if (preload) {
            //   for (let aname of preload) {
            //     console.log("Preloading: ", aname);
            //     if (!aname.includes('..')) {
            //       console.log(process.cwd())
            //     }
            //   }
            // }
  
            console.log("Calling setup..");
            resolve(await setup(sketch, txn_hash, random, assets));
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
  const base64 = dataURL.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64, 'base64');
  // console.log("DONE!");


  res.status(200).send(buffer);
}
