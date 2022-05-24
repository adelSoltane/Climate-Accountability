import * as d3 from "https://cdn.skypack.dev/d3@7";

export default function MapVis(visQuerySelector, datasource, geojson, _cfg) {
    const {meta, data} = datasource;
    const prefix = selector => `${visQuerySelector} ${selector}`

    const dataIndexMap = new Map(data.map( (x, i) => [x["Country Code"], i] ))

    const defaults = {
        sideLen: 500,
        legendWidth: 150,
        legendBarWidth: 30,
        scaleType: d3.scaleSymlog, //used because it can handle 0 in domain
        colorInterp: d3.interpolateInferno,
    }

    const cfg = Object.assign(defaults, _cfg)

    const projection = d3.geoMercator()
        .scale(70)
        .center([0, 20])
        .translate([cfg.sideLen/2, cfg.sideLen/2])

    const scaleScale = cfg.scaleType()
        .domain([0, cfg.sideLen])
        .range([0, 1])
    //big div
    //  map svg
    //  scale svg
    d3.select(visQuerySelector)
        .append("div")
        .classed("mapdiv", true)
        .append("svg")
            .classed("map", true)
            .attr("width", cfg.sideLen)
            .attr("height", cfg.sideLen)
            .selectAll("path")
            .data(geojson.features, d => d.id)
            .enter()
            .append("path")
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", () => {
                    return "black"
                })
                .on("mouseenter", (e, d) => {
                    const sl = d.properties.scaleLookup;
                    d3.select(prefix(`text.scalelabel-${sl}`))
                        .style("display", "block")

                    d3.select(prefix(`rect.scalerect-${sl}`))
                        .attr("fill", "black")
                })
                .on("mouseout", (e, d) => {
                    const sl = d.properties.scaleLookup;
                    d3.select(prefix(`text.scalelabel-${sl}`))
                        .style("display", "none")

                    d3.select(prefix(`rect.scalerect-${sl}`))
                        .attr("fill", d => cfg.colorInterp(scaleScale(sl)))
                })


    
    const scaledata = Array.from(Array(cfg.sideLen).keys())

    const scalesel = d3.select(prefix("div.mapdiv"))
        .append("svg")
            .classed("mapscale", true)
            .attr("width", cfg.legendWidth)
            .attr("height", cfg.sideLen)
            .selectAll("rect")
            .data(scaledata, d => d)
            .enter()

    scalesel
        .append("rect")
        .attr("x", 0)
        .attr("y", d => cfg.sideLen - d)
        .attr("width", d => cfg.legendBarWidth)
        .attr("height", 1)
        .attr("fill", d => cfg.colorInterp(scaleScale(d)))
        .attr("class", d => `scalerect-${d}`)
        .on("mouseenter", function (e, d) {
            d3.select(this)
                .attr("fill", "black")

            d3.select(prefix(`text.scalelabel-${d}`))
                .style("display", "block")
        })
        .on("mouseleave", function (e, d) {
            d3.select(this)
                .attr("fill", d => cfg.colorInterp(scaleScale(d)))

            d3.select(prefix(`text.scalelabel-${d}`))
                .style("display", "none")
        })
    
    scalesel
        .append("text")
        .attr("x", 50)
        .attr("y", d => cfg.sideLen - d + 5)
        .attr("class", d => `scalelabel scalelabel-${d}`)
        .style("display", "none")
    
    const title = d3.select(prefix("svg.map"))
        .append("text")
            .classed("title", true)
            .attr("x", cfg.sideLen/2)
            .attr("y", 20)
            .attr("text-anchor", "middle")

    const sourcetext = d3.select(prefix("svg.map"))
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
        const max_val = d3.max(data, d => d[year]);
        const colorScale = cfg.scaleType() //this MUST be symlog for the domain to include 0
            .domain([0, max_val])
            .range([0, 1])


        const t = d3.transition()
            .duration(1000);

        d3.select(prefix("svg.map"))
            .selectAll("path")
            .transition(t)
            .attr("fill", d => {
                const idx = dataIndexMap.get(d.id) //get index from country code
                if (!idx) return "black"
                const val = data[idx][year]


                const scaleLookup = Math.trunc(scaleScale.invert(colorScale(val)))
                d.properties.scaleLookup = scaleLookup;
                const color = cfg.colorInterp(colorScale(val))
                return color;
            })


        d3.selectAll(prefix("text.scalelabel"))
            .text(d => {
                return Math.trunc(colorScale.invert(scaleScale(d))) + " " + meta.units
            })

    }

    const hide = () => d3.select(visQuerySelector).style("display", "none")

    const show = () => d3.select(visQuerySelector).style("display", "initial")

    const updateCountry = () => null

    return {updateYear, updateCountry, hide, show};
}
        
