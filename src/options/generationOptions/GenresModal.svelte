<script>
    import {getContext} from "svelte";
    import GenreOption from "./GenreOption.svelte";
    import {genres} from "../../constants";
    import colorLookup from "../../colors";
    import Tooltip from "../../tooltips/Tooltip.svelte";

    const {close} = getContext("simple-modal");

    const simpleGenres = [
        ["Chopin", "chopin"],
        ["Mozart", "mozart"],
        ["Rachmaninoff", "rachmaninoff"],
        ["Lady Gaga", "ladygaga"],
        ["Country", "country"],
        ["Disney", "disney"]
    ];

    const advancedGenres = [
        ["Jazz", "jazz"],
        ["Bach", "bach"],
        ["Beethoven", "beethoven"],
        ["Journey", "journey"],
        ["The Beatles", "thebeatles"],
        ["Video Games", "video"],
        ["Broadway", "broadway"],
        ["Frank Sinatra", "franksinatra"],
        ["Bluegrass", "bluegrass"],
        ["Tchaikovsky", "tchaikovsky"]
    ];

    const experimentalExclude = [...simpleGenres.map(pair => pair[1]), ...advancedGenres.map(pair => pair[1])];
    const experimentalGenres = genres.filter(genre => !experimentalExclude.includes(genre));
</script>

<style>
    h1 {
        margin-top: 0;
    }

    h2 {
        display: inline;
    }

    .genreContainer {
        margin-top: 8px;
        margin-bottom: 12px;
    }
</style>

<div>
    <h1 style={"color: " + colorLookup.text}>Genres</h1>

    <Tooltip>
        <h2 slot="trigger" style={"color: " + colorLookup.text}>Simple</h2>
        <span slot="content">
            These genres are the most reliable<br/>
            They are available in the official MuseNet tool
        </span>
    </Tooltip>

    <div class="genreContainer">
        {#each simpleGenres as [text, genre]}
            <GenreOption text={text} genre={genre}/>
        {/each}
    </div>

    <Tooltip>
        <h2 slot="trigger" style={"color: " + colorLookup.text}>Advanced</h2>
        <span slot="content">
           These genres are reliable<br/>
            They are available in the official MuseNet tool<br/>
            after clicking 'show advanced settings'
        </span>
    </Tooltip>

    <div class="genreContainer">
        {#each advancedGenres as [text, genre]}
            <GenreOption text={text} genre={genre}/>
        {/each}
    </div>

    <Tooltip>
        <h2 slot="trigger" style={"color: " + colorLookup.text}>Experimental</h2>
        <span slot="content">
            These genres are not reliable<br/>
            They are not supported by MuseNet, but usually work<br/>
            Don't be surprised if they sound very strange&#33;
        </span>
    </Tooltip>

    <div class="genreContainer">
        {#each experimentalGenres as genre}
            <GenreOption text={genre} genre={genre}/>
        {/each}
    </div>
</div>