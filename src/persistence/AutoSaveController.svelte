<script>
    import {getContext} from "svelte";
    import {modalOptions} from "../colors";
    import {root} from "../state/trackTree";
    import {load} from "./persistence";
    import HelpModal from "../about/HelpModal.svelte";
    import {afterUpdate} from "svelte";

    const {open} = getContext("simple-modal");

    afterUpdate(() => {
        const autoLoad = localStorage.getItem("autosave");
        if(autoLoad === null) {
            console.log(open);
            open(HelpModal, {}, modalOptions)
        }
        else {
            load(root, autoLoad);
        }
    })
</script>

<style>

</style>