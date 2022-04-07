<script>
    import Text from './Text.svelte';
    export let text;
    export let header;
    export let list;
    export let id;
    export let chapter;

    let pos, element;

    $:if (element) chapter[id] = {pos: element.offsetTop, id: element.id};
</script>

{#if id !== 'thanks'}
<section class='col-text' {id} bind:this={element}>
    <Text 
        {text}
        {header}
        dropcap = false
    />
    <ul>
        {#each list as li}
        <li>{@html li}</li>
        {/each}
    </ul>
</section>

{:else}
<section class='col-text {id}'>
    <Text 
        {text}
        {header}
        dropcap = false
    />
    <ul>
        {#each list as li}
        <li>{@html li}</li>
        {/each}
    </ul>
</section>
{/if}

<style>
    section {
        margin-top: 6rem;
        padding-bottom: 2rem;
        border-top:2rem solid #76767633;
    }
    :global(.thanks p, .thanks ul) {
        font-size: .9rem !important;
        font-family: montserrat, sans-serif;
        line-height: 1.8rem;
        color:#767676;
    }
</style>