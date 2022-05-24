import * as d3 from "https://cdn.skypack.dev/d3@7";

export default function BarVis(visQuerySelector, datasource, geojson, _cfg) {
    const countryCodes = geojson.features.map(c => c.id) 
    const data = datasource.data.filter(row => countryCodes.includes(row["Country Code"]))
    const meta = datasource.meta;
    const prefix = selector => `${visQuerySelector} ${selector}`
    
    const margin = {top: 30, right: 30, bottom: 70, left: 80}

    const defaults = {
        width: 500,
        height: 500,
        color: "blue"
    }

    const cfg = Object.assign(defaults, _cfg)

    const width = cfg.width - margin.left - margin.right;
    const height = cfg.height - margin.bottom - margin.top;

    const svg = d3.select(visQuerySelector)
        .append("svg")
        .classed("bar", true)
        .attr("width", cfg.width)
        .attr("height", cfg.height)
        .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(.2)

    const y = d3.scaleLinear()
        .range([height, 0])

    const xAxis = svg.append("g")
        .classed("xaxis", true)
        .attr("transform", `translate(0, ${height})`)

    const yAxis = svg.append("g")
        .classed("yaxis", true)
    
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

    const updateYear = (year) => {
        title.text(`${year} ${meta.title} (${meta.units})`)
        const t = d3.transition()
            .duration(1000);

        const maxval = d3.max(data, d => d[year])

        let vals = Array.from(data.values()).sort((a, b) => +a[year] < +b[year] ? 1 : -1)
        const topten = vals.slice(0, 10)
        console.log(topten)

        x.domain(topten.map(d => d["Country Name"]))
        y.domain([0, maxval])

        svg.selectAll("rect.bar")
            .data(topten, d => d["Country Name"] + year)
            .enter()
            .append("rect")
                .classed("bar", true)
                    .attr("x", d => x(d["Country Name"]))
                    .attr("y", d => y(d[year]))
                    .attr("width", x.bandwidth())
                    .attr("height", d => height - y(d[year]))
                    .attr("fill", cfg.color)
            .exit()
            .remove()

        xAxis.call(d3.axisBottom(x))
        yAxis.call(d3.axisLeft(y))

        xAxis.selectAll("text")
            .attr("transform", `translate(-10,0)rotate(-45)`)
            .style("text-anchor", "end")

    }

    const hide = () => d3.select(visQuerySelector).style("display", "none")

    const show = () => d3.select(visQuerySelector).style("display", "initial")
    
    const updateCountry = () => null;

    return {updateYear, updateCountry, hide, show}
}
