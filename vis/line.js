
import * as d3 from "https://cdn.skypack.dev/d3@7";

export default function LineVis(visQuerySelector, datasource, geojson, _cfg) {
    const {meta, data} = datasource;
    const prefix = selector => `${visQuerySelector} ${selector}`
    const dataIndexMap = new Map(data.map( (x, i) => [x["Country Code"], i] ))

    const dateParser = d3.utcParse("%Y")

    const margin = {top: 30, right: 30, bottom: 70, left: 80}

    const defaults = {
        width: 500,
        height: 500,
        legendWidth: 150,
        legendBarWidth: 30,
        scaleType: d3.scaleSymlog, //used because it can handle 0 in domain
        colorInterp: d3.interpolateInferno,
        stroke: "blue"
    }

    const cfg = Object.assign(defaults, _cfg)

    const width = cfg.width - margin.left - margin.right
    const height = cfg.height - margin.top - margin.bottom

    const xScale = d3.scaleTime()
        .domain([dateParser(meta.years[0]), dateParser(meta.years[1])])
        .range([0, width])

    const yScale = d3.scaleLinear()
        .range([height, 0])

    const svg = d3.select(visQuerySelector)
        .append("svg")
            .attr("width", cfg.width)
            .attr("height", cfg.height)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)

    const xAxis = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)) 


    const yAxis = svg.append("g")

    const path = svg.append("path")

    const title = svg.append("text")
            .classed("title", true)
            .attr("x", cfg.width/2)
            .attr("y", 20)
            .attr("text-anchor", "middle")

    const sourcetext = d3.select(prefix("svg"))
        .append("a")
            .attr("href", meta.url)
            .append("text")
                .attr("x", 0)
                .attr("y", 20)
                .attr("font-size", "6pt")
                .classed("url", true)
                .text(`Source: ${meta.source}`)

    const updateCountry = countryCode => {
        const idx = dataIndexMap.get(countryCode)
        title.text(`${meta.title} - ${data[idx]["Country Name"]} (${meta.units})`)
        const lineData = Object.entries(data[idx]).filter(([key, _]) => key.length === 4)
            .map( ([year, val]) => [dateParser(year), val] )
        
        yScale.domain(d3.extent(lineData, ([year, val]) => val*1.2))
        yAxis.call(d3.axisLeft(yScale))

        const t = d3.transition()
            .duration(1000);

        path.datum(lineData)
            .transition(t)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(([year, val]) => xScale(year))
                .y(([year, val]) => yScale(val))
                .defined(([year, val]) => val)
            )

    }
    
    const hide = () => d3.select(visQuerySelector).style("display", "none")

    const show = () => d3.select(visQuerySelector).style("display", "initial")

    const updateYear = () => null

    return {updateCountry, updateYear, hide, show};
}
