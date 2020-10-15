var dateRegex = '(\\d){2}.(\\d){2}.(\\d){4}';

function filterData(data) {
  return data.filter(d => {
    return (
        d.Datum.match(dateRegex) &&
        moment(d.Datum, 'DD.MM.YYYY') >= moment('01.10.2019', 'DD.MM.YYYY') &&
        moment(d.Datum, 'DD.MM.YYYY') <= moment('01.11.2019', 'DD.MM.YYYY')
    );
  });
}

// Main function.
function ready(capacities) {
  var margin = {top: 10, right: 30, bottom: 30, left: 40},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var filtered = filterData(capacities);

  const svg = d3
      .select('.bar-chart-container')
      .append('svg')
      // .attr('viewBox', '0 0 960 500')
      // .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  var x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, width]);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  var histogram = d3.histogram()
      .value(function(d) { return +d['Booked Interrupltible Capacity']; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      // .thresholds(x.ticks(40)); // then the numbers of bins

  var bins1 = histogram(filtered);

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(filtered, function (d) { return d.TAC; })])
  ;


  svg.append("g")
      .call(d3.axisLeft(y));

  svg.selectAll("rect")
      .data(bins1)
      .enter()
      .append("rect")
      .attr("x", 1)
      .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
      .attr("width", function(d) { return x(d.x1) - x(d.x0) ; })
      .attr("height", function(d) { return 500 - y(d.length); })
      .style("fill", "#69b3a2")
      .style("opacity", 0.6)
}




// Load data.
d3.csv('data/kapazitaeten-20201015-103532.csv').then(res => {
  ready(res);
});
