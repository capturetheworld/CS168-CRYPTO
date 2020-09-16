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



let coverIDS = ['Stephen','Daniel','Greg','Josiah','Jordan','Colton','Matthew','Patrick','Rafael','Nathan'];
agency.e = agency.get_e();
agency.n = agency.get_n();

let agencyrecords = { "originaldocs":[], "blindeddocs":[], "blindingfactors":[]}

for(let ID in coverID){
  let message = makeDocument(coverIDS[ID]);
  let {blinded, r } = blind(message,agency.get_n(),agency.get_e
  agencyrecords.originaldocs[ID]=message;
  agencyrecords.blindeddocs[ID]=blinded;
  agencyrecords.blindingfactors[ID]=r;
}

let blindedArray = agencyrecords.blindeddocs;
let originalArray = agencyrecords.originaldocs;
let factorsArray = agencyrecords.blindingfactors;



agency.signDocument(blindDocs, (selected, verifyAndSign) => {

  let selected_factor = agencyrecords.blindingfactors[selected];
  let selected_doc = agencyrecords.originaldocs[selected];
  delete agencyrecords.blindingfactors[selected];
  delete agencyrecords.originaldocs[selected];
  let signed = verifyAndSign(agencyrecords.blindingfactors,agencyrecords.originaldocs);
  let unblinded = unblind(selected_factor,signed,agency.n);
  
  //verify
  let toVerify = blindSignatures.verify({
   
    N: agency.get_n();,
    E: agency.get_e();,
    unblinded: unblinded,
    message: selected_doc,
  });
  
  console.log(toVerify);

});


