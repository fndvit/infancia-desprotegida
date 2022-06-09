<script>
	import {linkVertical, curveStep} from 'd3-shape';
    import {scaleOrdinal, scaleLinear} from 'd3-scale';
    import data from '../../data/xarxa.json';
    import {extent, group} from 'd3-array';
    
	export let margin = {top: 50, right: 5, bottom: 20, left: 5};
	export let title;
	export let desc;
	let layout = 'full';

	let width, height;

    $: x = scaleLinear()
        .domain([1,25])
		.range([margin.left, width - margin.left - margin.right]);

	
	$: y = scaleLinear()
		.domain(extent(data, (d) => d.level))
		.range([margin.top, height - margin.bottom - margin.top]);

    $: radius = width / 40;

    $: _n = [...new Set(data.map(d => d.source))]
        .map(d => data.find(e => e.source === d))

    $: nodes = _n.map(d => {
            return {
                source: d.source,
                cy: y(d.level),
                cx: x(d.col),
            }
        });
    
    $: links = data.map(d => {
        let source = nodes.find(e => e.source === d.source);
        let target = nodes.find(e => e.source === d.target);

        if (target){
            return {
                id: source.source,
                source: [source.cx, source.cy + radius],
                target: [target.cx, target.cy - radius - 10],
            }
        }
    }).filter(d => d !== undefined);

    $:selectedLinks = [];
    $:selectedNode = []

    $: linkPath = linkVertical(curveStep)
        .source((d) => d.source)
        .target((d) => d.target)

	// $: path = line()
	// 	.x(d => x(d[key.x]))
	// 	.y0(d => y(0))
	// 	.y1(d => y(d[key.y]))

    const handleOver = (datum) => {
        selectedLinks = links.filter(d => d.id === datum.source);
        selectedNode = nodes.filter(d => d.source === datum.source);
        console.log(datum)
    }

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
        <marker id="arrowhead" viewBox="0 0 4 4" refX="2" refY="2"
        markerWidth="3" markerHeight="3"
        orient="auto-start-reverse">
            <path d="M 0 0 L 3 2 L 0 4 z" fill="#abd4ff" />
        </marker>
        <marker id="arrowheadwhite" viewBox="0 0 4 4" refX="2" refY="2"
        markerWidth="3" markerHeight="3"
        orient="auto-start-reverse">
            <path d="M 0 0 L 3 2 L 0 4 z" fill="#fff" />
        </marker>
    </defs>
    <g>
        {#each links as link}
		<path 
            d={linkPath(link)}
            stroke='#abd4ff'
            opacity={.7}
            stroke-width=5
            fill='none'
            marker-end="url(#arrowhead)"
		/>
        {/each}
	</g>
    <g>
        {#each selectedLinks as link}
		<path 
            d={linkPath(link)}
            stroke='#fff'
            opacity={1}
            stroke-width=5
            fill='none'
            marker-end="url(#arrowheadwhite)"
		/>
        {/each}
	</g>
    <g>
        {#each nodes as node}
		<circle 
            cx={node.cx}
            cy={node.cy}
            r={radius}
            stroke='none'
            fill='#abd4ff'
            on:mouseover={() => handleOver(node)}
		/>
        {/each}
	</g>
    <g>
        {#each selectedNode as node}
		<circle 
            cx={node.cx}
            cy={node.cy}
            r={radius}
            stroke='none'
            fill='#fff'
            class='not-interactive'
		/>
        {/each}
	</g>
</svg>
<div class="annotations">
    {#each nodes as node}
		<p class="label" style="width: {radius * 2}px; top: {node.cy - radius / 2}px; left: {node.cx - radius}px; text-align:center">{node.source}</p>
    {/each}
</div>

{/if}
</div>

<style>
    .graphic {
        height:200vh;
        position:relative;
        width:calc(100% - 10rem);
        margin: 0 auto;
    }
    .annotations {
        position: absolute;
        pointer-events: none;
        width:calc(100% - 10);
        height:calc(100% - 70);
        top:0;
        left:5px;
    }
    .label {
        position: absolute;
        margin:0;
        padding:0;
        font-size: .8rem;
        line-height: 1.2;
        text-align: center;
        font-family: 'Montserrat' sans-serif;
        color: #252426;
    }
    .not-interactive {
        pointer-events: none;
    }
</style>