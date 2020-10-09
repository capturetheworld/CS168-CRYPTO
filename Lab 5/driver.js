"use strict";

let blindSignatures = require('blind-signatures');

let SpyAgency = require('./spyAgency.js').SpyAgency;

function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

function blind(msg, n, e) {
  return blindSignatures.blind({
      message: msg,
      N: agency.n,
      E: agency.e,
  });
}

function unblind(blindingFactor, sig, n) {
  return blindSignatures.unblind({
      signed: sig,
      N: n,
      r: blindingFactor,
  });
}


let agency = new SpyAgency();


let letters =[];
let blindDocs = [];
let blindFactors = [];

//spy does not have privateKey


['Stephen','Daniel','Greg','Josiah','Jordan','Colton','Matthew','Patrick','Rafael','Nathan'].forEach(name => {
  let doc = makeDocument(name);
  letters.push(doc); //identity
  let { blinded, r } = blind(doc, agency.n, agency.e) //using blind-signatures we blind in the document
  blindDocs.push(blinded); //blined hash
  blindFactors.push(r); //r is blinding factor used to unblind
});



agency.signDocument(blindDocs, (selected, verifyAndSign) => {

  //get the blinding factors for all EXCEPT the one selected (CUT AND CHOOSE)

  let bfs = blindFactors.slice();//returns array in new array (cloning)
  delete bfs[selected]; //delete selected blinding factor DO not send factor so they cant unblind

  let letterSansSelected = letters.slice();
  delete letterSansSelected[selected];

  let blindSig = verifyAndSign(bfs,letterSansSelected);
  let sig = unblind(blindFactors[selected], blindSig, agency.n); //agency public key modulus

  let valid = blindSignatures.verify({
    unblinded: sig,
    N: agency.n,
    E: agency.e,
    message: letters[selected],
  });

  console.log(`Doc: ${letters[selected]}\n`);
  console.log(`The signature ${valid ? "is" : "is not"} valid`);
});


