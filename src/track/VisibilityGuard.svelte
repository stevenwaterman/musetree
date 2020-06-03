<script>
    import {onDestroy, onMount} from "svelte";

    export let root = null;

    let element = null;
    let observer = null;

    let loaded = false;
    let observing = false;

    onMount(() => {
        observer = new IntersectionObserver(
                (entries) => {
                    loaded = loaded || entries.some(entry => entry.isIntersecting);
                    if(loaded) stopObserving();
                }, {
                    rootMargin: "100px",
                    root: root,
                    threshold: 0
                }
        );
        observer.observe(element);
        observing = true;
    });

    onDestroy(() => {
        if (observing) stopObserving();
    })

    function stopObserving() {
        observer.unobserve(element);
        observing = false;
    }
</script>

<style>
   .guard {
       position: relative;
       height: 100%;
   }
</style>

<div bind:this={element} class="guard">
    <slot {loaded}/>
</div>