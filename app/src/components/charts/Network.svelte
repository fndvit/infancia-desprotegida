<script>
	import {linkVertical} from 'd3-shape';
    import {scaleOrdinal, scaleLinear} from 'd3-scale';
    import data from '../../data/xarxa.json';
    import {extent, group} from 'd3-array';
    
	export let margin = {top: 20, right: 5, bottom: 20, left: 5};
	export let title;
	export let desc;
	let layout = 'full';

	let width, height;

    $: x = scaleLinear()
		.range([margin.left, width - margin.left - margin.right]);
	
	$: y = scaleLinear()
		.domain(extent(data, (d) => d.level))
		.range([margin.top, height - margin.bottom - margin.top]);

    $: radius = width / 50;

    $: _n = [...new Set(data.map(d => d.source))]
        .map(d => data.find(e => e.source === d))

    $: levels = group(_n, (d) => d.level);

    $: nodes = _n.map(d => {

            let l = levels.get(d.level)
            x.domain([0, l.length])
            let i = l.indexOf(d)
            
            return {
                source: d.source,
                cy: y(d.level),
                cx: x(i),
            }
        });
    
    $: links = data.map(d => {
        let source = nodes.find(e => e.source === d.source)
        let target = nodes.find(e => e.source === d.target);

        if (target){
            return {
                source: [source.cx, source.cy - radius],
                target: [target.cx, target.cy - radius],
            }
        }
    }).filter(d => d !== undefined);


    $: linkPath = linkVertical()
        .source((d) => d.source)
        .target((d) => d.target)

	// $: path = line()
	// 	.x(d => x(d[key.x]))
	// 	.y0(d => y(0))
	// 	.y1(d => y(d[key.y]))

</script> 

<div class='graphic {layout}' bind:clientWidth={width} bind:clientHeight={height}>
{#if width}
<svg xmlns:svg='https://www.w3.org/2000/svg' 
	viewBox='0 0 {width - margin.right - margin.left} {height}'
	{width}
	{height}
	role='img'
	aria-labelledby='title desc'
	>
	<title id='title'>{title}</title>
	<desc id='desc'>{desc}</desc>
    <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#fff"/>
        </marker>
    </defs>
	<g>
        {#each nodes as node}
		<circle 
            cx={node.cx}
            cy={node.cy}
            r={radius}
            stroke='#fff'
		/>
        {/each}
	</g>
    
	<g>
        {#each links as link}
		<path 
            d={linkPath(link)}
            stroke='#fff'
            stroke-width=4
            fill='none'
            marker-end="url(#arrowhead)"
		/>
        {/each}
	</g>
</svg>
{/if}
</div>

<style>
    .graphic {
        height:100vh;
    }
</style>