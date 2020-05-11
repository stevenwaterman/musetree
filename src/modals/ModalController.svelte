<script>
    import {getContext} from "svelte";
    import LoadingSpinner from "./LoadingSpinner.svelte";
    import {isLoadingStore} from "./ModalState";

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
            close()
        }
    })
</script>