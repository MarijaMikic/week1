const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        //function creates proof using groth16 for circuit HelloWord with wittness a=1 and b=2 
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        //Print on terminal c in HelloWorld
        console.log('1x2 =',publicSignals[0]);
        //converts publicSignals to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //converts proof to BigInt
        const editedProof = unstringifyBigInts(proof);
        //export data
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //makes array argv which converts data in string (elements of array are strings)
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // creates a, b, c and Input
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        //function which verify the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        // creates a, b, c and d for fake proof
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];
         //function which verify the proof
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //function Multiplier3 creates proof using groth16 for circuit with wittness in1=1 and in2=2 and in3=3
        const { proof, publicSignals } = await groth16.fullProve({"in1":"1","in2":"2","in3":"3"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");
        //Print on terminal out in Multiplier3
        console.log('1x2x3 =',publicSignals[0]);
        //converts publicSignals to BigInt
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //converts proof to BigInt
        const editedProof = unstringifyBigInts(proof);
        //export data
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //makes array argv which converts data in string (elements of array are strings)
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
        // creates a, b, c and Input 
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        //function which verify the proof
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        // creates a, b, c and d for fake proof
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0];
        //function which verify the proof
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("_plonkMultiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
         //function Multiplier3 creates proof using PLONK for circuit with wittness in1=1 and in2=2 and in3=3
         const { proof, publicSignals } = await plonk.fullProve({"in1":"1","in2":"2","in3":"3"}, "contracts/circuits/_plonkMultiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/_plonkMultiplier3/circuit_0000.zkey");
         //Print on terminal out in Multiplier3
         console.log('1x2x3 =',publicSignals[0]);
         //converts publicSignals to BigInt
         const editedPublicSignals = unstringifyBigInts(publicSignals);
         //converts proof to BigInt
         const editedProof = unstringifyBigInts(proof);
         //export data
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        //makes array argv 
        var argv = calldata.split(',');
        //function which verify the proof, method parse constucting tha JavaScript value described by the string
        expect(await verifier.verifyProof(argv[0], JSON.parse(argv[1]))).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        // creates a and b for fake proof
        let a = '0x00';
        let b = ['1'];
        //function which verify the proof
        expect(await verifier.verifyProof(a, b)).to.be.false;
    });
});