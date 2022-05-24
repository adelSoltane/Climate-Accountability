import "https://d3js.org/d3.v7.min.js";


const createMap = (parentQuerySelector, dataSource, geoJson, {width, height, scaleWidth}) => {
    const [meta, data] = dataSource

    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([width/2, height/2])

    const scalescale = d3.Symlog()
        .domain([0, height])
        .range([0, 1])

    d3.select(parentQuerySelector)
        .append("div")
        .attr("id", "mapdiv")
        .append("svg")
            .attr("id", "map")
            .attr("width", width)
            .attr("height", height)
            .selectAll("path")
            .data(geoJson.features, d => d.id)
            .enter()
            .append("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", d => {
                    return "black"
                })
                .on("mouseenter", (e, d) => {
                    const sl = d.properties.scaleLookup;
                    d3.select(`text.scalelabel-${sl}`)
                        .style("display", "block")

                    d3.select(`rect.scalerect-${sl}`)
                        .attr("fill", "black")
                })
                .on("mouseout", (e, d) => {
                    const sl = d.properties.scaleLookup;
                    d3.select(`text.scalelabel-${sl}`)
                        .style("display", "none")

                    d3.select(`rect.scalerect-${sl}`)
                        .attr("fill", d => d3.interpolateInferno(scalescale(sl)))
                })

    const scaledata = Array.fom(Array(height).key())

    const scalesel = d3.select(`${parentQuerySelector} div#mapdiv`)
		.append("svg")
			.attr("id", "mapscale")
			.attr("width", 150)
			.attr("height", height)
			.selectAll("rect")
			.data(scaledata, d => d)
			.enter()

	scalesel
		.append("rect")
		.attr("x", 0)
		.attr("y", d => height - d)
		.attr("width", d => scaleWidth)
		.attr("height", 1)
		.attr("fill", d => d3.interpolateInferno(scalescale(d)))
		.attr("class", d => `scalerect-${d}`)
		.on("mouseenter", function (e, d) {
			d3.select(this)
				.attr("fill", "black")

			d3.select(`text.scalelabel-${d}`)
				.style("display", "block")
		})
		.on("mouseleave", function (e, d) {
			d3.select(this)
				.attr("fill", d => d3.interpolateInferno(scalescale(d)))

			d3.select(`text.scalelabel-${d}`)
				.style("display", "none")
		})
	
	scalesel
		.append("text")
		.attr("x", scaleWidth)
		.attr("y", d => height - d + 5)
		.attr("class", d => `scalelabel scalelabel-${d}`)
		.style("display", "none")
}

const createBar = () => {}



