export type Instrument = "bass" | "drum" | "guitar" | "harp" | "piano" | "violin" | "cello" | "flute" | "trumpet" | "clarinet";
export const instruments: Instrument[] = ["bass", "drum", "guitar", "harp", "piano", "violin", "cello", "flute", "trumpet", "clarinet"];
export const instrumentSettings: Record<Instrument, {color: string}> = {
    bass: {
        color: "rgba(255, 0, 0, 1)"
    },
    drum: {
        color: "rgba(0, 255, 0, 1)"
    },
    guitar: {
        color: "rgba(0, 0, 255, 1)"
    },
    harp: {
        color: "rgba(255, 150, 0, 1)"
    },
    piano: {
        color: "rgba(0, 255, 255, 1)"
    },
    violin: {
        color: "rgba(255, 0, 255, 1)"
    },
    cello: {
        color: "rgba(255, 0, 255, 1)"
    },
    flute: {
        color: "rgba(255, 255, 255, 1)"
    },
    trumpet: {
        color: "rgba(255, 255, 255, 1)"
    },
    clarinet: {
        color: "rgba(255, 255, 255, 1)"
    },
};

export const instrumentCategories = [
    "bass",
    "drums",
    "guitar",
    "harp",
    "piano",
    "strings",
    "winds"
] as const;
export type InstrumentCategory = typeof instrumentCategories[number];

export const genres = [
    "gershwin",
    "chopin",
    "dvorak",
    "schumann",
    "schubert",
    "brahms",
    "rachmaninoff",
    "faure",
    "albeniz",
    "debussy",
    "ravel",
    "granados",
    "franck",
    "satie",
    "liszt",
    "back",
    "tchaikovsky",
    "mendelssohn",
    "byrd",
    "scarlatti",
    "beethoven",
    "pachelbel",
    "clementi",
    "haydn",
    "mozart",
    "wagner",
    "nineinchnails",
    "robbiewilliams",
    "greenday",
    "queen",
    "spicegirls",
    "madonna",
    "elvispresley",
    "britneyspears",
    "mariahcarey",
    "fleetwoodmac",
    "thebeachboys",
    "enya",
    "shaniatwain",
    "michaeljackson",
    "bobmarley",
    "arethafranklin",
    "jazz",
    "blues",
    "thebeatles",
    "joplin",
    "broadway",
    "disney",
    "african",
    "journey",
    "bonjovi",
    "whitneyhouston",
    "rickymartin",
    "ladygaga",
    "katyperry",
    "adele",
    "indian",
    "video"
] as const;
export type Genre = typeof genres[number];

export const pitchMin: number = 20;
export const pitchMax: number = 120;
export const pitchRange: number = pitchMax - pitchMin;
