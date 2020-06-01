<script>
    import {onDestroy, onMount} from "svelte";

    export let root = null;

    let element = null;
    let observer = null;

    let loaded = false;
    let observing = false;

    onMount(() => {
        observer = new IntersectionObserver(
                ([boundingClientRect]) => {
                    loaded = loaded || boundingClientRect.isIntersecting;
                    if(loaded) stop();
                }, {
                    rootMargin: "100px 0px 100px 0px",
                    root: root
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