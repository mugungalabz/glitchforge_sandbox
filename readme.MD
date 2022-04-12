## Getting Started

Artists, you can fork this repo, or create your own branch in this repo. If you plan on contributing your glitch effects to the permanent library, it may be easier to create a branch in this repo... 

``git clone {me}``

```npm run dev```

All the code you edit should be in generator/
generate.js does the actual drawing to canvas, assets/ is a folder of assets (load them via preload)

## Usage

from the generator/ directory run "node test" to make sure the shell is working. If you run from the main directory, it may not find your assets
folder.

generate.js is the primary driver. Run glitch effects from there and import whatever effects and utilities you need. 

## Adding Effects

If you add your own effects, create a new file named after your project of artist name like this:
```
./generator
    effects.js
    util.js
    test.js
    generate.js
    MY-ADDED-EFFECTS.js
```

Keep your effect clean and reusable, and they may find their way into the permanent Glitchforge library for future use. 

Generic utilities like math formulas and can be added to util.js

Be careful when altering existing utility files like effects.js or util.js, so as not to break anything. You can fix functions to work better for your own project though. If you alter the logic drastically, consider making a new function altogether. 

## Difference from p5.js

In p5.js everything in p5.js is a global variable: `PI`, `circle()`, `line()`
Our generator is outside the global scope of p5.js, so any p5.js variables
and functions must be accessed via the skethc instance: `sketch.PI`,
`sketch.circle()`, `sketch.line()`

## Batch Testing
To create multiple outputs at one for batch testing, simply go to
generator/test.js and modify the `sketchCount` variable. 

Then run `node test` as usual


