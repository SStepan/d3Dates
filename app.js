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
  var margin = {top: 10, right: 30, bottom: 30, left: 100},
      width = 1000 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var filtered = filterData(capacities);

  const svg = d3
      .select('.bar-chart-container')
      .append('svg')
      .attr('viewBox', '0 0 1200 400')
      .attr('preserveAspectRatio', 'xMidYMid meet')
      // .attr("width", width + margin.left + margin.right)
      // .attr("height", height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  var x = d3.scaleTime()
      .domain([moment('01.10.2019', 'DD.MM.YYYY'), moment('01.11.2019', 'DD.MM.YYYY')])
      .range([0, width]);

  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d")));


  var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, 14000000])

  svg.append("g")
      .call(d3.axisLeft(y));

  svg.selectAll("rect")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d.Datum, 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d['Booked Interrupltible Capacity'].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d['Booked Interrupltible Capacity'].replace(/\./g, '')); })
      .style("fill", "#2A928B")

  svg.selectAll("rect2")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d.Datum, 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d['Booked DZK'].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d['Booked DZK'].replace(/\./g, '')); })
      .style("fill", "#97B6CE")

  svg.selectAll("rect3")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d.Datum, 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d['Booked bFZK'].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d['Booked bFZK'].replace(/\./g, '')); })
      .style("fill", "#B5CBDC")

  svg.selectAll("rect4")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d.Datum, 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d['Booked FZK'].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d['Booked FZK'].replace(/\./g, '')); })
      .style("fill", "#E0E9F1")
}




// Load data.
d3.csv('data/kapazitaeten-20201015-103532.csv').then(res => {
  ready(res);
});
