type ChangelogEntry = {
    version: [number, number, number],
    date: Date;
    commitHash: string;
    changes: string[];
}

type Changelog = ChangelogEntry[];

const changelog: Changelog = [
    {
        version: [2, 5, 1],
        date: new Date(2020, 5, 24),
        commitHash: "ecf0e5aea21dd04af80e84690d4c17c189a10203",
        changes: [
            "Adjusted column widths in save options",
            "The button that opens this modal now displays the current version",
            "Improve tree vis line shape"
        ]
    },
    {
        version: [2, 5, 0],
        date: new Date(2020, 5, 24),
        commitHash: "ee86226aa80db94681b4fd4bb0c0a5111aea0cb1",
        changes: [
            "Github issue #6, allow changing size of each view"
        ]
    },
    {
        version: [2, 4, 1],
        date: new Date(2020, 5, 24),
        commitHash: "33835b36cc2c7ba94dd49242ebfcb60f13dd784b",
        changes: [
            "Updated readme for real this time",
            "Coloured the instruments in the options panel",
            "Added tooltips to the options panel",
            "Converted all links to buttons in 'About'",
            "Changed colour & center aligned headers in options panel",
            "Fixed pending load display on branch nodes"
        ]
    },
    {
        version: [2, 4, 0],
        date: new Date(2020, 5, 24),
        commitHash: "321ecf89124925cc7beefb542925ea37bc155f58",
        changes: [
            "Add temperature to generation options",
            "Prevented the 'Load more' and 'Log' buttons going on separate lines",
            "Fixed the gaps between sections in the track view",
            "Added border between sections and scroll bar in track view",
            "Prevented timeline from scrolling you off the page on low-resolution screens",
            "Improve alignment of persistence options buttons",
            "Remove margin around headers in options",
            "Update readme"
        ]
    },
    {
        version: [2, 3, 0],
        date: new Date(2020, 5, 23),
        commitHash: "4c299141bda04c07760cdfcb96eda27e9d9ab66c",
        changes: [
            "Add support for custom MIDI tempos"
        ]
    },
    {
        version: [2, 2, 1],
        date: new Date(2020, 5, 23),
        commitHash: "6370688f82de45d5de4b5238a36e617acfa09fc0",
        changes: [
            "Improved visual look of lines connecting nodes in tree view"
        ]
    },
    {
        version: [2, 2, 0],
        date: new Date(2020, 5, 23),
        commitHash: "13628ec1f3d72b6cc51012b6c284ca3e4057673e",
        changes: [
            "Fixed 'pending load' text colour in tree visualisation",
            "Fixed issue #39, Added lines between nodes in tree visualisation"
        ]
    },
    {
        version: [2, 1, 7],
        date: new Date(2020, 5, 21),
        commitHash: "fb1bd9b720f31b3bdcded4faf25e8797c3e9f630",
        changes: [
            "Fixed issue #2, improved colour scheme",
            "Fixed import modal buttons, disabling them when encoding box is empty"
        ]
    },
    {
        version: [2, 1, 6],
        date: new Date(2020, 5, 21),
        commitHash: "eaad8693e3c4f18cff8e11bbbfe21d459954ffc3",
        changes: [
            "Added this changelog modal"
        ]
    },
    {
        version: [2, 1, 5],
        date: new Date(2020, 5, 21),
        commitHash: "630c8c2a119353abb893e6efcaf489a9957a18f3",
        changes: [
            "Fixed issue #40, rightmost column should be dark theme",
            "All modals made dark theme"
        ]
    },
    {
        version: [2, 1, 4],
        date: new Date(2020, 5, 21),
        commitHash: "bc5e79d479d4ae8e6fd723f3bab911277b0902a9",
        changes: [
            "Fixed issue #41, drums missing/incorrect in MIDI export"
        ]
    },
    {
        version: [2, 1, 3],
        date: new Date(2020, 5, 20),
        commitHash: "411924dde1796c0ab6975121cac10517990c5c60",
        changes: [
            "Fixed issue #44, notes lasting forever"
        ]
    },
    {
        version: [2, 1, 2],
        date: new Date(2020, 5, 20),
        commitHash: "de8f1cec607da56cb2c81c28eebf7aaa9af453c7",
        changes: [
            "Fixed issue #42, tempo incorrect on imported midi"
        ]
    },
    {
        version: [2, 1, 1],
        date: new Date(2020, 5, 18),
        commitHash: "312560c1f72448cda816d2cadaa132b2a0884bc5",
        changes: [
            "Disabled 'under selected' option in import modal if nothing is selected"
        ]
    },
    {
        version: [2, 1, 0],
        date: new Date(2020, 5, 18),
        commitHash: "93ef56a3c56924f674a8fbdde6dcac2ff17db9c9",
        changes: [
            "Added midi import functionality"
        ]
    },
    {
        version: [2, 0, 0],
        date: new Date(2020, 5, 17),
        commitHash: "739d69b3a54a05e1f5e5bd46c84f3e3dc062eef3",
        changes: [
            "Version 2 released"
        ]
    }
]

changelog[0].date.toLocaleDateString()

export default changelog;