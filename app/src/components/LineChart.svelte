<script>
    import Multiline from './charts/Multiline.svelte';
    import trobada from '../data/trobada.json';
    import locale from '@reuters-graphics/d3-locale';

    export let header;

    const layout = 'linechart col-text'
    const loc = new locale('es');

    const format = {
		x: loc.formatTime('%Y'),
        y: loc.format(',.1d'),
    }

    const data = trobada.map(d => ({
        families: +d.families,
        infants: +d.infants,
        time: new Date(d.any),
    }));

</script>

<p class="col-text title bold">{header}</p>
<div class="legend col-text">
    <div class="dot infants"></div><p class="dot legend-item">Infants</p>
    <div class="dot families"></div><p class="dot legend-item">Famílies</p>
</div>
<Multiline 
    {data}
    title='Title' desc='Description'
    key={{x: 'any', y: ['families', 'infants']}}
    {format}
    color={['#f27aa1','#7c499d']}
    {layout}
/>

<style>
    :global(.linechart) {
        height: 50vh;
    }
    .dot {
        width:.8rem;
        height:.8rem;
        border-radius: 50%;
        display: inline-block;
        margin-right: .3rem;
    }
    .infants { background-color: #7c499d; }
    .families { background-color: #f27aa1; }
    .title {
        padding-top:2rem;
    }
    .bold {
        font-weight: bold;
    }
    .legend-item {
        display: inline-block;
        padding-right: 4rem;
        font-family: montserrat, serif;
        font-size: .9rem;
    }

</style>