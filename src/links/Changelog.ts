type ChangelogEntry = {
    version: [number, number, number],
    date: Date;
    commitHash: string;
    changes: string[];
}

type Changelog = ChangelogEntry[];

const changelog: Changelog = [
    {
        version: [2,1,7],
        date: new Date(2020, 5, 21),
        commitHash: "TODO",
        changes: [
            "Fixed issue #2, improved colour scheme",
            "Fixed import modal buttons, disabling them when encoding box is empty"
        ]
    },
    {
        version: [2,1,6],
        date: new Date(2020, 5, 21),
        commitHash: "eaad8693e3c4f18cff8e11bbbfe21d459954ffc3",
        changes: [
            "Added this changelog modal"
        ]
    },
    {
        version: [2,1,5],
        date: new Date(2020, 5, 21),
        commitHash: "630c8c2a119353abb893e6efcaf489a9957a18f3",
        changes: [
            "Fixed issue #40, rightmost column should be dark theme",
            "All modals made dark theme"
        ]
    },
    {
        version: [2,1,4],
        date: new Date(2020, 5, 21),
        commitHash: "bc5e79d479d4ae8e6fd723f3bab911277b0902a9",
        changes: [
            "Fixed issue #41, drums missing/incorrect in MIDI export"
        ]
    },
    {
        version: [2,1,3],
        date: new Date(2020, 5, 20),
        commitHash: "411924dde1796c0ab6975121cac10517990c5c60",
        changes: [
            "Fixed issue #44, notes lasting forever"
        ]
    },
    {
        version: [2,1,2],
        date: new Date(2020, 5, 20),
        commitHash: "de8f1cec607da56cb2c81c28eebf7aaa9af453c7",
        changes: [
            "Fixed issue #42, tempo incorrect on imported midi"
        ]
    },
    {
        version: [2,1,1],
        date: new Date(2020, 5, 18),
        commitHash: "312560c1f72448cda816d2cadaa132b2a0884bc5",
        changes: [
            "Disabled 'under selected' option in import modal if nothing is selected"
        ]
    },
    {
        version: [2,1,0],
        date: new Date(2020, 5, 18),
        commitHash: "93ef56a3c56924f674a8fbdde6dcac2ff17db9c9",
        changes: [
            "Added midi import functionality"
        ]
    },
    {
        version: [2,0,0],
        date: new Date(2020, 5, 17),
        commitHash: "739d69b3a54a05e1f5e5bd46c84f3e3dc062eef3",
        changes: [
            "Version 2 released"
        ]
    }
]

changelog[0].date.toLocaleDateString()

export default changelog;