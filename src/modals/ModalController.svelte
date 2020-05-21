<script>
    import {isLoadingStore} from "../persistence/persistence";
    import LoadingSpinner from "../persistence/LoadingSpinner.svelte";
    import {getContext} from "svelte";
    import colorLookup from "../colors";

    const {open, close} = getContext("simple-modal");

    isLoadingStore.subscribe(isLoading => {
        if(isLoading) {
            open(LoadingSpinner, {}, {
                closeButton: false,
                closeOnEsc: false,
                closeOnOuterClick: false,
                styleWindow: {
                    background: "transparent",
                    color: colorLookup.text
                }
            });
        } else {
            close();
        }
    })
</script>