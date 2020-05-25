<script>
    import Button from "../buttons/Button.svelte";
    import {getContext} from "svelte";
    import AboutModal from "./AboutModal.svelte";
    import {modalOptions} from "../colors";

    const {open} = getContext("simple-modal");
    function openAboutModal(){
        open(AboutModal, {}, modalOptions)
    }
</script>

<style>

</style>

<Button on:click={openAboutModal}>About</Button>