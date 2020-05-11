<script>
    import {isLoadingStore} from "../persistence/persistence";
    import LoadingSpinner from "../persistence/LoadingSpinner.svelte";
    import {getContext} from "svelte";

    const {open, close} = getContext("simple-modal");

    isLoadingStore.subscribe(isLoading => {
        if(isLoading) {
            open(LoadingSpinner, {}, {
                closeButton: false,
                closeOnEsc: false,
                closeOnOuterClick: false,
                styleWindow: {
                    background: "transparent"
                }
            });
        } else {
            close();
        }
    })
</script>