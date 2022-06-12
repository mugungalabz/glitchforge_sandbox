import { addAuthorRoyalties } from "../royalties.js"
const AUTHOR_TEZOS_ADDRESS = "tz1heFSv4WcJ6AQR6xkPsp7jMsvCeEm11yrs"
/*
    My amazing effect
*/
export function myAmazingEffect(parm1, parm2, sketch, options, royalties) {
    //add the author of the effect's address to the royalties
    addAuthorRoyalties(AUTHOR_TEZOS_ADDRESS, royalties);

    //perform you effect. 
}