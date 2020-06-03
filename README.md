# MuseTree

MuseTree is a custom front-end for [OpenAi's MuseNet](https://openai.com/blog/musenet/), the AI music generator.
The official app is a toy designed to show off the research.
In contrast, MuseTree is designed for real music production, and has been built from the ground-up with that in mind.

MuseTree is still in active development. I'm very happy to take suggestions, so please open a GitHub issue or comment on an existing one with your ideas!
If you want to chat with me in real time, I [live-code on twitch.tv](http://twitch.tv/stevenwaterman) Mon-Fri 10:30am-3pm BST.
At the minute, those streams are mostly my work on MuseTree, so come along and say hi!

The latest version of MuseTree is always available online at http://musetree.stevenwaterman.uk

![Screenshot of Musetree](musetree.png)

## Features

* Full tree support:
    * Generate more than 4 options
    * Develop multiple tracks at once
* More generation options:
    * 604 genres available
    * Generate up to 1000 tokens at a time
    * Set the max response length to prevent MuseNet errors and generate compositions of unlimited length
    * Change the temperature to escape repeating patterns or overfitting to real songs
* Full persistence options:
    * Save/Load the full tree to work on later
    * Export `wav` audio
    * Import/Export `midi`
* Fixes some MuseNet bugs
    * Notes that last forever
    * Failed requests automatically retry
    * No length limit

## Developer instructions

MuseTree uses the [svelte](https://svelte.dev/) web framework with TypeScript.

**Quick Start:**

* `git clone`
* `npm i`
* `npm run dev`

**Contributing:**

MuseTree is still in an early state.
Any and all contributions are welcome!
Please have a look at the [issue list](https://github.com/stevenwaterman/musetree/issues) and have a go at fixing one, or add more!
I'm friendly, I promise.]
