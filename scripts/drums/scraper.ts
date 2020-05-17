import {downloadMuseNetAudio} from "../../src/audio/export";

export async function pullDrums() {
    const xs = [];
    for(let x = 3840; x < 3968; x++) {
        xs.push(x);
    }
    await Promise.all(xs.map(pullDrum));
    console.log("Done");
}

async function pullDrum(i: number) {
    const encoding = [];
    for(let j = 0; j < 20; j++) {
        // Layer drum to increase volume
        encoding.push(i);
    }
    for(let j = 0; j < 20; j++) {
        // Add pauses to ensure we get the full sample
        encoding.push(4090);
    }
    encoding.push(i);
    let done = false;
    while(!done) {
        console.log("Requesting " + i);
        await downloadMuseNetAudio(encoding, "wav", i.toString(10))
            .then(() => {done = true})
            .catch(() => {console.log(i, "failed")});
    }
    console.log(i, "Succeeded");
}