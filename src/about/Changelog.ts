import { minNoteLengths } from "../bridge/postProcessSettings";

type ChangelogEntry = {
  version: [number, number, number],
  date: Date;
  commitHash: string;
  changes: string[];
}

type Changelog = ChangelogEntry[];

const changelog: Changelog = [
  {
    version: [2,21,2],
    date: new Date(2020, 11, 21),
    commitHash: "54f2941133b73cfe971f0fea0281be9fa2fa96e2",
    changes: [
      "Stop retrying failed requests to prevent infinite loop that DOS attacks MuseNet"
    ]
  },
  {
    version: [2,21,1],
    date: new Date(2020, 5, 30),
    commitHash: "b41f977d5f81bc9ed8f2e5106a9575a1530b9d3c",
    changes: [
      "Fixed postprocessing bugs",
      "Add midi import setTempo support"
    ]
  },
  {
    version: [2,21,0],
    date: new Date(2020, 5, 30),
    commitHash: "428bfe02120286f505472c2ef0e5b9b63ffb3281",
    changes: [
      "Add export high-quality MuseTree wav"
    ]
  },
  {
    version: [2,20,1],
    date: new Date(2020, 5, 30),
    commitHash: "23f2870c102322266555b9412176c0a867be4478",
    changes: [
      "Fixed behaviour when clicking on tree view edge",
      "Fixed space bar to play/pause"
    ]
  },
  {
    version: [2,20,0],
    date: new Date(2020, 5, 30),
    commitHash: "c92c8e9ac167f5588ea61e0fbf87ee2a77b95d54",
    changes: [
      "Rework postprocessing of encodings to add min length, max length, and min note separation"
    ]
  },
  {
    version: [2,19,5],
    date: new Date(2020, 5, 28),
    commitHash: "2886957a38886ca02ef242d53898072400f53f59",
    changes: [
      "Fix context menu placement in chrome",
      "Fix track length in track info when 1 section long"
    ]
  },
  {
    version: [2, 19, 4],
    date: new Date(2020, 5, 27),
    commitHash: "c7a5d61693847b3002e349649f2b5cb0a6aff26e",
    changes: [
      "Big conversion of all svelte components to typescript, fixing small issues that were revealed in the"
    ]
  },
  {
    version: [2, 19, 3],
    date: new Date(2020, 5, 25),
    commitHash: "9c9d56baa297867b056e16e6d9abde8a94895f1d",
    changes: [
      "Replace tooltip code duplication with a styled component"
    ]
  },
  {
    version: [2, 19, 2],
    date: new Date(2020, 5, 4),
    commitHash: "ef29e9ecce10577e8c9e0ac6651a0da15850dc41",
    changes: [
      "Fix placeholder text in top left"
    ]
  },
  {
    version: [2, 19, 1],
    date: new Date(2020, 5, 4),
    commitHash: "a8887f3972e8691aef9c30a6e8770cd8ae125751",
    changes: [
      "Can click on red/green edges to start playing",
      "Prevent clicking translucent nodes"
    ]
  },
  {
    version: [2, 19, 0],
    date: new Date(2020, 5, 4),
    commitHash: "ca2a3a61a32e7e5d3ad6ad4857c2ede347058507",
    changes: [
      "Allowed hiding the sidebar"
    ]
  },
  {
    version: [2, 18, 3],
    date: new Date(2020, 5, 4),
    commitHash: "31889933cce14e6dba309077aab327c1cf1f5261",
    changes: [
      "Show all 3 measures of instrument use",
      "Remove 'section x' text from section canvas",
      "Renamed track info to stats",
      "Improved stats reliability",
      "Allowed choosing stats for track or section"
    ]
  },
  {
    version: [2, 18, 2],
    date: new Date(2020, 5, 4),
    commitHash: "b0ecb45f1557d4a81a2219112b0713d2db051a08",
    changes: [
      "Changed instrument prevalence bars to stacked bar chart",
      "Removed prevalence bars labels"
    ]
  },
  {
    version: [2, 18, 1],
    date: new Date(2020, 5, 4),
    commitHash: "a65a699beac80b1f936e202d0f220e37c3d156b7",
    changes: [
      "Fixed silence info when longest silence is at the end of the track",
      "Fixed crash when deleting selected node",
      "Added bars showing the prevalence of each instrument to track info"
    ]
  },
  {
    version: [2, 18, 0],
    date: new Date(2020, 5, 3),
    commitHash: "5cd30b2551e2e0ae96a1655606351915825605ec",
    changes: [
      "Added track info section"
    ]
  },
  {
    version: [2, 17, 2],
    date: new Date(2020, 5, 3),
    commitHash: "664ff5e23ff91edfe02372211a8ac80b07df3867",
    changes: [
      "Fixed critical bug with transitions"
    ]
  },
  {
    version: [2, 17, 1],
    date: new Date(2020, 5, 3),
    commitHash: "497bc1efd60271453a2c883594a8fe514b56c185",
    changes: [
      "Changed 'Generation Length' to just 'length'",
      "Made tree vis edge's green progress indicator straight when no x-offset between parent and child",
      "Made green progress smoother on transition between sections"
    ]
  },
  {
    version: [2, 17, 0],
    date: new Date(2020, 5, 3),
    commitHash: "9e790f098e2c4a66b9f17af9cd15766fad61da9d",
    changes: [
      "Made instrument selection easier to use and more compact",
      "Made edges between nodes much thicker",
      "Showed play progress on edge above node rather than below",
      "Nodes on selected path become translucent when track is playing",
      "Edges on selected path show on top of non-selected edges",
      "Moved display options into the sidebar",
      "Added advanced options modal for generation and display options",
      "Added ability to hide instruments in track view"
    ]
  },
  {
    version: [2, 16, 6],
    date: new Date(2020, 5, 3),
    commitHash: "0cd5de7587e08f3e2a5f1ebf4e3b8573c82d61ee",
    changes: [
      "Fix loading bar errors after cancelling load",
      "Scroll to selected section in track view",
      "Improve lazy loading reliability"
    ]
  },
  {
    version: [2, 16, 5],
    date: new Date(2020, 5, 3),
    commitHash: "55d44f1e18ff281fe7d6a2a14133951022f80c7d",
    changes: [
      "Fix midi import"
    ]
  },
  {
    version: [2, 16, 4],
    date: new Date(2020, 5, 3),
    commitHash: "67df9b020be286bcd184fb7535acb7de1aab81a3",
    changes: [
      "Added validation to import modal"
    ]
  },
  {
    version: [2, 16, 3],
    date: new Date(2020, 5, 3),
    commitHash: "6f23613e8f9764cebf678b112c053dcf07f71f4e",
    changes: [
      "Cancelling load actually cancels it instead of just hiding it"
    ]
  },
  {
    version: [2, 16, 2],
    date: new Date(2020, 5, 2),
    commitHash: "5bf2fa2e513d46d450f22f508335ae709c42a69e",
    changes: [
      "Animate edge colour change with color wipe to show progress"
    ]
  },
  {
    version: [2, 16, 1],
    date: new Date(2020, 5, 2),
    commitHash: "bec44310d5198ebbc8453dd16119f12285bc8273",
    changes: [
      "Improve green node logic",
      "Edges also highlight green when playign"
    ]
  },
  {
    version: [2, 16, 0],
    date: new Date(2020, 5, 2),
    commitHash: "e6834a41cd6ce8c64fbc9f716a43a400bbec1937",
    changes: [
      "Nodes in tree vis highlight green when playing"
    ]
  },
  {
    version: [2, 15, 4],
    date: new Date(2020, 5, 2),
    commitHash: "b58309bfff89b980a0e4a2f0dbfa12342dd4c014",
    changes: [
      "Changed from ending all notes at end of section to truncating notes after a specified max length"
    ]
  },
  {
    version: [2, 15, 3],
    date: new Date(2020, 5, 2),
    commitHash: "3b6c833e785f4ade85a0f5b4927c449b16cc1a6c",
    changes: [
      "Increase max length to 5000"
    ]
  },
  {
    version: [2, 15, 2],
    date: new Date(2020, 5, 1),
    commitHash: "82af479c07f0ea431f72b9c391c2654a50ca6117",
    changes: [
      "Lazy-load the section SVGs",
      "Improve async loading performance of tall narrow trees",
      "Improve SVG render performance"
    ]
  },
  {
    version: [2, 15, 1],
    date: new Date(2020, 5, 1),
    commitHash: "1759ff6afaab49577f2f626361888f8b09f20b0a",
    changes: [
      "Dynamic X-Range on Track View"
    ]
  },
  {
    version: [2, 15, 0],
    date: new Date(2020, 5, 1),
    commitHash: "d10f2c0c84273c4f941598ea4a3db8267be9a376",
    changes: [
      "Swap to using SVG for track view"
    ]
  },
  {
    version: [2, 14, 2],
    date: new Date(2020, 4, 29),
    commitHash: "d8d46682664a1fe5f6285b2a20944f9a00aaccc1",
    changes: [
      "Improve tree performance",
      "Drastically improved node selection performance",
      "Fixed type issues",
      "Made loading bar start centered and grow outwards"
    ]
  },
  {
    version: [2, 14, 1],
    date: new Date(2020, 4, 29),
    commitHash: "38a9dfda2416a400a974cd4735b4b64e25ce701b",
    changes: [
      "Removed logging that was accidentally left in",
      "Improved autorequest performance slightly",
      "Removed all bad uses of get_store_value because it's slow"
    ]
  },
  {
    version: [2, 14, 0],
    date: new Date(2020, 4, 28),
    commitHash: "5f43060b6743f2c3cec0bab172b869f028e6c76c",
    changes: [
      "Added first-time help"
    ]
  },
  {
    version: [2, 13, 2],
    date: new Date(2020, 4, 28),
    commitHash: "db889e7098ea0ee298a65d23960b83ed7936df4c",
    changes: [
      "Removed accidental logging of undo buffer",
      "Fixed bug where you could not load the same file twice in a row"
    ]
  },
  {
    version: [2, 13, 1],
    date: new Date(2020, 4, 28),
    commitHash: "ac7857241e1dd7eb11fffbd261cbcf1f46dea9cd",
    changes: [
      "Clear the undo buffer when deleting from root",
      "Add confirmation modal to deleting from root"
    ]
  },
  {
    version: [2, 13, 0],
    date: new Date(2020, 4, 28),
    commitHash: "02b45deda57ae4868728615e6f99b6bf36cffffe",
    changes: [
      "Add autosave functionality",
    ]
  },
  {
    version: [2, 12, 1],
    date: new Date(2020, 4, 28),
    commitHash: "497968dabbf38d183c53a86c5f37cde70b41c919",
    changes: [
      "Improved piano loading speed"
    ]
  },
  {
    version: [2, 12, 0],
    date: new Date(2020, 4, 28),
    commitHash: "8e07d30c40e0f580d1529e704559e4e7e6f7d0d7",
    changes: [
      "Added undo button",
      "Added undo keyboard shortcut"
    ]
  },
  {
    version: [2, 11, 2],
    date: new Date(2020, 4, 27),
    commitHash: "8c0291d2b7a92bd4e5c70e22543a29e5502cab4c",
    changes: [
      "Fix error when loading but closing modal"
    ]
  },
  {
    version: [2, 11, 1],
    date: new Date(2020, 4, 27),
    commitHash: "9fb73015044a2348a86e96a350390865eb06b998",
    changes: [
      "Cancelling load is now *much* faster",
      "Can now cancel Midi loading",
      "Fixed orange colour sometimes appearing twice",
      "Fixed node colours note updating after loading mst file"
    ]
  },
  {
    version: [2, 11, 0],
    date: new Date(2020, 4, 27),
    commitHash: "6f5bb9bfa717b48961f718117d973d354b4f14bb",
    changes: [
      "Loading spinner shows approx progress",
      "Loading can be cancelled"
    ]
  },
  {
    version: [2, 10, 2],
    date: new Date(2020, 4, 27),
    commitHash: "4b707931d33bd19ce0b75b4426ee2ed754b6e60d",
    changes: [
      "Made space bar start/stop audio playback, the same as clicking the play button at the bottom"
    ]
  },
  {
    version: [2, 10, 1],
    date: new Date(2020, 4, 27),
    commitHash: "7817d4281d38502482e3a83f8d6ce416c0c3e318",
    changes: [
      "Added keyboard shortcuts to context menu",
      "Added keyboard shortcuts when hovering a node",
      "Remove fade from pending load in tree view",
      "Remove right-click to deselect from section canvas",
      "Buttons in about modal are spread rather than left-aligned",
      "Made nodes in tree vis grow when hovered",
      "Transitioned stroke colour in lines between nodes",
      "Fixed orange node colour so it works in all cases"
    ]
  },
  {
    version: [2, 10, 0],
    date: new Date(2020, 4, 26),
    commitHash: "fa911066380c45032e45e9d59fc41d528cab79de",
    changes: [
      "Added right-click menu to the tree visualisation",
      "Removed controls in track view",
      "Updated import & export modals to work based on which node you right-clicked",
      "Removed ctrl+left click shortcut to load more in tree view"
    ]
  },
  {
    version: [2, 9, 0],
    date: new Date(2020, 4, 25),
    commitHash: "9efd1d6b3491b965df075ea71bf8c53a9ea806fe",
    changes: [
      "Added labels to the import modal",
      "Coloured text inputs to be light background colour instead of dark",
      "Add export modal",
      "Prevent error if you don't select anything in file input",
      "Added encoding export option"
    ]
  },
  {
    version: [2, 8, 0],
    date: new Date(2020, 4, 25),
    commitHash: "46ab3ceb9464a42efdc5ae108c5a612ffed92e0a",
    changes: [
      "Made track controls full-width",
      "Moved load + save buttons to track controls",
      "Moved import + export buttons to section controls"
    ]
  },
  {
    version: [2, 7, 1],
    date: new Date(2020, 4, 25),
    commitHash: "0dcb5d7dc4dffd57a973155acd78bd8e2e2c2890",
    changes: [
      "Fix favicon on live site using relative path"
    ]
  },
  {
    version: [2, 7, 0],
    date: new Date(2020, 4, 25),
    commitHash: "8f2e17a397d20a444b698746a2c6daf26227d146",
    changes: [
      "Added 'About' modal to replace links.svelte",
      "Fixed height of buttons in track controls"
    ]
  },
  {
    version: [2, 6, 4],
    date: new Date(2020, 4, 25),
    commitHash: "18be619c88ad49064b7b196409a447a8a321ccfe",
    changes: [
      "Allow dragging the midi into the encoding box in import modal",
      "Improve scroll bar in import modal textarea",
      "Prevent import modal textarea resizing",
      "Prevent loading spinner having a scroll bar"
    ]
  },
  {
    version: [2, 6, 3],
    date: new Date(2020, 4, 25),
    commitHash: "e1721671c2aa4ef072af60c99d1c1f99d21ad805",
    changes: [
      "Fix the track controls having white bar at bottom in chrome",
      "Changelog links now open in a new tab"
    ]
  },
  {
    version: [2, 6, 2],
    date: new Date(2020, 4, 25),
    commitHash: "28c79f3bb3c8f0124c0cd5128fdfcdd59b9e9cba",
    changes: [
      "Hide scrollbar in options when possible"
    ]
  },
  {
    version: [2, 6, 1],
    date: new Date(2020, 4, 24),
    commitHash: "5118bda71d2830d9970eec205671605747b2cd78",
    changes: [
      "Improve play/stop button",
      "Change favicon",
      "Improve import modal examples selection"
    ]
  },
  {
    version: [2, 6, 0],
    date: new Date(2020, 4, 24),
    commitHash: "54437db7ef38530c0d842760259d5c13c653c164",
    changes: [
      "Added examples to the import modal",
      "Changed header colour in modals",
      "Allow the options column to scroll on low-res screens"
    ]
  },
  {
    version: [2, 5, 1],
    date: new Date(2020, 4, 24),
    commitHash: "ecf0e5aea21dd04af80e84690d4c17c189a10203",
    changes: [
      "Adjusted column widths in save options",
      "The button that opens this modal now displays the current version",
      "Improve tree vis line shape"
    ]
  },
  {
    version: [2, 5, 0],
    date: new Date(2020, 4, 24),
    commitHash: "ee86226aa80db94681b4fd4bb0c0a5111aea0cb1",
    changes: [
      "Github issue #6, allow changing size of each view"
    ]
  },
  {
    version: [2, 4, 1],
    date: new Date(2020, 4, 24),
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
    date: new Date(2020, 4, 24),
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
    date: new Date(2020, 4, 23),
    commitHash: "4c299141bda04c07760cdfcb96eda27e9d9ab66c",
    changes: [
      "Add support for custom MIDI tempos"
    ]
  },
  {
    version: [2, 2, 1],
    date: new Date(2020, 4, 23),
    commitHash: "6370688f82de45d5de4b5238a36e617acfa09fc0",
    changes: [
      "Improved visual look of lines connecting nodes in tree view"
    ]
  },
  {
    version: [2, 2, 0],
    date: new Date(2020, 4, 23),
    commitHash: "13628ec1f3d72b6cc51012b6c284ca3e4057673e",
    changes: [
      "Fixed 'pending load' text colour in tree visualisation",
      "Fixed issue #39, Added lines between nodes in tree visualisation"
    ]
  },
  {
    version: [2, 1, 7],
    date: new Date(2020, 4, 21),
    commitHash: "fb1bd9b720f31b3bdcded4faf25e8797c3e9f630",
    changes: [
      "Fixed issue #2, improved colour scheme",
      "Fixed import modal buttons, disabling them when encoding box is empty"
    ]
  },
  {
    version: [2, 1, 6],
    date: new Date(2020, 4, 21),
    commitHash: "eaad8693e3c4f18cff8e11bbbfe21d459954ffc3",
    changes: [
      "Added this changelog modal"
    ]
  },
  {
    version: [2, 1, 5],
    date: new Date(2020, 4, 21),
    commitHash: "630c8c2a119353abb893e6efcaf489a9957a18f3",
    changes: [
      "Fixed issue #40, rightmost column should be dark theme",
      "All modals made dark theme"
    ]
  },
  {
    version: [2, 1, 4],
    date: new Date(2020, 4, 21),
    commitHash: "bc5e79d479d4ae8e6fd723f3bab911277b0902a9",
    changes: [
      "Fixed issue #41, drums missing/incorrect in MIDI export"
    ]
  },
  {
    version: [2, 1, 3],
    date: new Date(2020, 4, 20),
    commitHash: "411924dde1796c0ab6975121cac10517990c5c60",
    changes: [
      "Fixed issue #44, notes lasting forever"
    ]
  },
  {
    version: [2, 1, 2],
    date: new Date(2020, 4, 20),
    commitHash: "de8f1cec607da56cb2c81c28eebf7aaa9af453c7",
    changes: [
      "Fixed issue #42, tempo incorrect on imported midi"
    ]
  },
  {
    version: [2, 1, 1],
    date: new Date(2020, 4, 18),
    commitHash: "312560c1f72448cda816d2cadaa132b2a0884bc5",
    changes: [
      "Disabled 'under selected' option in import modal if nothing is selected"
    ]
  },
  {
    version: [2, 1, 0],
    date: new Date(2020, 4, 18),
    commitHash: "93ef56a3c56924f674a8fbdde6dcac2ff17db9c9",
    changes: [
      "Added midi import functionality"
    ]
  },
  {
    version: [2, 0, 0],
    date: new Date(2020, 4, 17),
    commitHash: "739d69b3a54a05e1f5e5bd46c84f3e3dc062eef3",
    changes: [
      "Version 2 released"
    ]
  }
]

changelog[0].date.toLocaleDateString()

export default changelog;