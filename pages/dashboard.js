const width = 500;
const height = 500;

Promise.all([
	d3.text("../data-raw/co2 emissions by country/API_EN.ATM.CO2E.KT_DS2_en_csv_v2_3011692.csv"),
	d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
]).then(res => {

	const [text, geojson] = res; //get responses
	const rows = d3.csvParse(text.split("\n").slice(4).join("\n"));
	const countries = geojson.features.map(c => c.id);
	const data_map = new Map();
	rows.filter(row => countries.includes(row["Country Code"])) 
		.forEach(row => data_map.set(row["Country Code"], row)) //fill data with valid countries

	const update_map = setup_map(geojson, data_map);
	const update_bars = setup_bar(data_map);

	//setup slider
	d3.select("div#controls")
		.append("input")
			.attr("type", "range")
			.attr("id", "points")
			.attr("min", 1970)
			.attr("max", 2010)
			.on("change", function (e) {
				const year = d3.select(this).node().value
				d3.select("span.sliderlabel")
					.text(() => year);
				
				update_map(year);
				update_bars(year);
			})

	d3.select("#select")
		.on("change", e => {
			const val = d3.select("#select").node().value;
			d3.selectAll("svg")
				.style("display", "none");

			d3.select(`svg#${val}`)
				.style("display", "block");

			if (val == "map") d3.select("#mapscale").style("display", "initial")

		})

	update_map(1970);
	update_bars(1970);

});


function setup_map (geojson, data) {

	const path = d3.geoPath();
	const projection = d3.geoMercator()
		.scale(70)
		.center([0, 20])
		.translate([width/2, height/2])

	const scalescale = d3.scaleSymlog()
		.domain([0, 500])
		.range([0, 1])

	d3.select("div#vis")
		.append("div")
		.attr("id", "mapdiv")
		.append("svg")
			.attr("id", "map")
			.attr("width", width)
			.attr("height", height)
			.selectAll("path")
			.data(geojson.features, d => d.id)
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


	
	const scaledata = Array.from(Array(500).keys())

	const scalesel = d3.select("div#vis div#mapdiv")
		.append("svg")
			.attr("id", "mapscale")
			.attr("width", 150)
			.attr("height", 500)
			.selectAll("rect")
			.data(scaledata, d => d)
			.enter()

	scalesel
		.append("rect")
		.attr("x", 0)
		.attr("y", d => 500 - d)
		.attr("width", d => 30)
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
		.attr("x", 30)
		.attr("y", d => 500 - d + 5)
		.attr("class", d => `scalelabel scalelabel-${d}`)
		.style("display", "none")
	


	d3.select("div#controls")
		.append("span")
			.classed("sliderlabel", true)
			.text(1970)
	
	const update = (year) => {
		const max_val = d3.max(data, d => +d[1][year]);
		const colorScale = d3.scaleSymlog() //this MUST be symlog for the domain to include 0
			.domain([0, max_val*1.1])
			.range([0, 1])


		const t = d3.transition()
			.duration(1000);

		d3.select("svg#map")
			.selectAll("path")
			.transition(t)
			.attr("fill", d => {
				if (!data.get(d.id)) {
					console.log(d.id);
					return "black";
				}

				const scaleLookup = Math.trunc(scalescale.invert(colorScale(+data.get(d.id)[year])))
				d.properties.scaleLookup = scaleLookup;
				const color = d3.interpolateInferno(colorScale(+data.get(d.id)[year]))
				return color;
			})


		d3.selectAll("text.scalelabel")
			.text(d => {
				return Math.trunc(colorScale.invert(scalescale(d))) + " kt"
			})

	}

	return update;
}

function setup_bar (data) {
	const margin = {top: 30, right: 30, bottom: 70, left: 80}
	const width = 500 - margin.left - margin.right;
	const height = 500 - margin.bottom - margin.top;

	const svg = d3.select("div#vis")
		.append("svg")
		.attr("id", "bar")
		.attr("width", 500)
		.attr("height", 500)
		.style("display", "none")
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

	const update = (year) => {
		const maxval = d3.max(data, d => +d[1][year])

		let vals = Array.from(data.values()).sort((a, b) => +a[year] < +b[year] ? 1 : -1)
		const topten = vals.slice(0, 10)

		x.domain(topten.map(d => d["Country Name"]))
		y.domain([0, maxval])

		svg.selectAll("rect.bar")
			.data(topten, d => d["Country Name"] + year)
			.enter()
			.append("rect")
				.classed("bar", true)
					.attr("x", d => x(d["Country Name"]))
					.attr("y", d => y(+d[year]))
					.attr("width", x.bandwidth())
					.attr("height", d => height - y(d[year]))
					.attr("fill", "blue")
			.exit()
			.remove()

		xAxis.call(d3.axisBottom(x))
		yAxis.call(d3.axisLeft(y))

		xAxis.selectAll("text")
			.attr("transform", `translate(-10,0)rotate(-45)`)
			.style("text-anchor", "end")

	}

	return update
}



	// 	d3.select("#select")
	// 		.on("change", e => {
	// 			const val = d3.select("#select").node().value;
	// 			d3.selectAll("svg")
	// 				.style("display", "none");

	// 			d3.select(`svg#${val}`)
	// 				.style("display", "block");

	// 		})
	// })

