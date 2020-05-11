<script>
    import {getContext} from "svelte";
    import GenreOption from "./GenreOption.svelte";
    import {genres} from "../constants";

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

    .TT_trigger {
    }

    .TT_text {
        visibility: hidden;
        border: 1px solid black;
        background-color: white;
        padding: 5px;
        font-weight: 400;
        font-size: 12px;
        margin-left: 12px;

        position: absolute;
        z-index: 1;
    }

    .TT_trigger:hover .TT_text {
        visibility: visible;
    }

    .genreContainer {
        margin-top: 8px;
        margin-bottom: 12px;
    }
</style>

<div>
    <h1>Genres</h1>

    <h2 class="TT_trigger">
        Simple
        <span class="TT_text">
            These genres are the most reliable<br/>
            They are available in the official MuseNet tool
        </span>
    </h2>

    <div class="genreContainer">
        {#each simpleGenres as [text, genre]}
            <GenreOption text={text} genre={genre}/>
        {/each}
    </div>

    <h2 class="TT_trigger">
        Advanced
        <span class="TT_text">
            These genres are reliable<br/>
            They are available in the official MuseNet tool<br/>
            after clicking 'show advanced settings'
        </span>
    </h2>

    <div class="genreContainer">
        {#each advancedGenres as [text, genre]}
            <GenreOption text={text} genre={genre}/>
        {/each}
    </div>

    <h2 class="TT_trigger">
        Experimental
        <span class="TT_text">
            These genres are not reliable<br/>
            They are not supported by MuseNet, but usually work<br/>
            Don't be surprised if they sound very strange&#33;
        </span>
    </h2>

    <div class="genreContainer">
        {#each experimentalGenres as genre}
            <GenreOption text={genre} genre={genre}/>
        {/each}
    </div>
</div>