// Define the dimensions and margins for the map
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG element to the container
const svg = d3.select("#choropleth")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch the data
Promise.all([
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
    d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([countiesData, educationData]) => {
    // Map the education data to FIPS codes
    const educationByFips = {};
    educationData.forEach(d => {
        educationByFips[d.fips] = d;
    });

    // Define color scale
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain(d3.extent(educationData, d => d.bachelorsOrHigher));

    // Draw counties
    svg.selectAll(".county")
        .data(topojson.feature(countiesData, countiesData.objects.counties).features)
        .enter().append("path")
        .attr("class", "county")
        .attr("data-fips", d => d.id)
        .attr("data-education", d => educationByFips[d.id].bachelorsOrHigher)
        .attr("fill", d => colorScale(educationByFips[d.id].bachelorsOrHigher))
        .attr("d", d3.geoPath())
        .on("mouseover", (event, d) => {
            const tooltip = d3.select("#tooltip");
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`${educationByFips[d.id].area_name}, ${educationByFips[d.id].state}: ${educationByFips[d.id].bachelorsOrHigher}%`)
                .attr("data-education", educationByFips[d.id].bachelorsOrHigher)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            d3.select("#tooltip").transition().duration(200).style("opacity", 0);
        });

    // Create legend
    const legendValues = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    const legend = d3.select("#legend");

    legend.selectAll("div")
        .data(legendValues)
        .enter().append("div")
        .style("background-color", d => colorScale(d))
        .attr("class", "legend-block")
        .append("span")
        .text(d => d + "%");
});
