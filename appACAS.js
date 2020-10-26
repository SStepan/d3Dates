var dateRegex = '(\\d){2}.(\\d){2}.(\\d){4}';

function filterCapacityData(data, objectKeys) {
    var result = [];

    for (var i = 0; i< objectKeys.length; i++){
        var item = data[objectKeys[i]];
        if(moment(item[0], 'DD.MM.YYYY') >= moment('01.10.2019', 'DD.MM.YYYY') &&
            moment(item[0], 'DD.MM.YYYY') <= moment('25.10.2019', 'DD.MM.YYYY')
        )
        {
            result.push(item);
        }
    }

    return result;
}

function filterLastFluss(data, objectKeys){
    var dictionary = {};
    var result = [];
    for (var i = 0; i < objectKeys.length; i++){
        if(typeof dictionary[moment(objectKeys[i]).format("YYYY-MM-DD")] !== 'undefined')
        {
            dictionary[moment(objectKeys[i]).format("YYYY-MM-DD")].push(data[objectKeys[i]]);
        }
        else {
            dictionary[moment(objectKeys[i]).format("YYYY-MM-DD")] = [data[objectKeys[i]]]
        }
    }

    var reducer = (accumulator, currentValue) => {
        return {
            lf_brennwerte: +accumulator.lf_brennwerte + +currentValue.lf_brennwerte,
            lf_werte: +accumulator.lf_werte + +currentValue.lf_werte,
            lf_z08: +accumulator.lf_z08 + +currentValue.lf_z08,
            lf_z09_entry: +accumulator.lf_z09_entry + +currentValue.lf_z09_entry,
            lf_z09_exit: +accumulator.lf_z09_exit + +currentValue.lf_z09_exit,
            lf_z14_entry: +accumulator.lf_z14_entry + +currentValue.lf_z14_entry,
            lf_z14_exit: +accumulator.lf_z14_exit + +currentValue.lf_z14_exit,
            lf_z15: +accumulator.lf_z15 + +currentValue.lf_z15
        }
    }
    var lastFlussesDailyKeys = Object.keys(dictionary);
    for (var i = 0; i< lastFlussesDailyKeys.length; i++){
        var item = dictionary[lastFlussesDailyKeys[i]].reduce(reducer);
        result.push({date: lastFlussesDailyKeys[i], value: item});
    }

    return result;
}

// Main function.
function ready(capacities, nominations) {
  var  objectKeys = Object.keys(capacities['VIP France - Germany'].Data.Daily)
  var filtered = filterCapacityData(capacities['VIP France - Germany'].Data.Daily, objectKeys);

  var lastFlussKeys = Object.keys(capacities['VIP France - Germany'].Data.LastFluss);
  var lastFlusses = filterLastFluss(capacities['VIP France - Germany'].Data.LastFluss, lastFlussKeys);

  var margin = {top: 10, right: 30, bottom: 30, left: 100},
      width = filtered.length * 28,
      height = 400 - margin.top - margin.bottom;

  const svg = d3
      .select('.bar-chart-container')
      .append('svg')
      .attr('viewBox', `0 0 ${width+200} 400`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  var x = d3.scaleTime()
      .domain([moment('01.10.2019', 'DD.MM.YYYY'), moment('25.10.2019', 'DD.MM.YYYY')])
      .range([0, width]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m-%d")));

  var maxTac = d3.max(filtered, t => +t[1].replace(/\./g, ''))
  var gg = filtered[20][1].replace(/\./g, '');

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, maxTac])

  svg.append("g")
      .call(d3.axisLeft(y));

  var xFunc = function(d) { return x(moment(d[0], 'DD.MM.YYYY')); }
  var yFunc = function(d) { return y(+d[17].replace(/\./g, '')); }
  var widthFunc = function(d) { return x(moment(filtered[1][0], 'DD.MM.YYYY')); }
  var heightFunc = function(d) { return height - y(+d[17].replace(/\./g, '')); }
  var color = "#2A928B";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);

  //draw bars for booked interruptible capacity
  svg.selectAll("rect")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d[0], 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d[17].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1][0], 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d[17].replace(/\./g, '')); })
      .style("fill", "#2A928B");

    yFunc = function(d) { return y(+d[7].replace(/\./g, '')); }
    heightFunc = function(d) { return height - y(+d[7].replace(/\./g, '')); }
    color = "#97B6CE";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);

  //draw bars for booked dzk capacity
  svg.selectAll("rect2")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d[0], 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d[7].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1][0], 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d[7].replace(/\./g, '')); })
      .style("fill", "#97B6CE")


    yFunc = function(d) { return y(+d[6].replace(/\./g, '')); }
    heightFunc = function(d) { return height - y(+d[6].replace(/\./g, '')); }
    color = "#B5CBDC";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);
    //draw bars for booked fzfk capacity
  svg.selectAll("rect3")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d[0], 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d[6].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d[6].replace(/\./g, '')); })
      .style("fill", "#B5CBDC")

    yFunc = function(d) { return y(+d[5].replace(/\./g, '')); }
    heightFunc = function(d) { return height - y(+d[5].replace(/\./g, '')); }
    color = "#B5CBDC";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);

    //draw bars for booked fzk capacity
  svg.selectAll("rect4")
      .data(filtered)
      .enter()
      .append("rect")
      .attr("x", function(d) { return x(moment(d[0], 'DD.MM.YYYY')); })
      .attr("y", function(d) { return y(+d[5].replace(/\./g, '')); })
      .attr("width", function(d) { return x(moment(filtered[1].Datum, 'DD.MM.YYYY')) ; })
      .attr("height", function(d) { return height - y(+d[5].replace(/\./g, '')); })
      .style("fill", "#E0E9F1");


  var tacLine = [];
  var x1 = 0;
  for (var i = 0; i < filtered.length; i++){
      var y1 = y(+filtered[i][1].replace(/\./g, ''));
      var x2 = x1 + x(moment(filtered[1][0], 'DD.MM.YYYY'));
      tacLine.push([x1, y1], [x2, y1])
      x1 = x2;
  }

  //draw Tac line
    svg.append("path")
        .datum(tacLine)
        .attr("fill", "none")
        .attr("stroke", "#C4C4C4")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
        );

  var lastFlussesDailyKeys = Object.keys(lastFlusses);
  lastFlusses = lastFlusses.sort((a, b) => {
      if(a < b)
          return -1;

      if(a > b)
          return 1;
      return 0;
  });
    lastFlusses.reverse();
    var physicalFlowLine = [];
    var nominationLine = [];
    x1 = 0;
  for (var i = 0; i < lastFlusses.length; i++){
      if(isNaN(lastFlusses[i].value.lf_z08)){
          continue;
      }
      var y1 = y(Math.abs(lastFlusses[i].value.lf_z08));
      var x2 = x1 + x(moment(filtered[1][0], 'DD.MM.YYYY'));
      physicalFlowLine.push([x1, y1], [x2, y1])
      x1 = x2;
  }

    for (var i = 0; i < lastFlusses.length; i++){
        if(isNaN(lastFlusses[i].value.lf_z09_entry)){
            continue;
        }
        var y1 = y(Math.abs(lastFlusses[i].lf_z09_entry));
        var x2 = x1 + x(moment(filtered[1][0], 'DD.MM.YYYY'));
        nominationLine.push([x1, y1], [x2, y1])
        x1 = x2;
    }


    //draw Tac line
    svg.append("path")
        .datum(nominationLine)
        .attr("fill", "none")
        .attr("stroke", "#E0A600")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
        );

    //draw Tac line
    svg.append("path")
        .datum(physicalFlowLine)
        .attr("fill", "none")
        .attr("stroke", "#B464A3")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
        );
}

function drawLine(svg, data, color){
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("d", d3.line()
            .x(function(d) { return d[0] })
            .y(function(d) { return d[1] })
        );
}

function drawBar(svg, dataValues, xFunc, yFunc, widthFunc, heightFunc, color){
    //draw bars for booked interruptible capacity
    svg.selectAll("rect")
        .data(filtered)
        .enter()
        .append("rect")
        .attr("x", xFunc)
        .attr("y", yFunc)
        .attr("width", widthFunc)
        .attr("height", heightFunc)
        .style("fill", color)
}

d3.json('https://www.grtgaz-deutschland.de/sites/default/modules/custom/kapazitaeten/xenriched.php?sent=1&csv=1&lang=en&archiv=&r=E&nodes=VIP%20France%20-%20Germany&von_jahr=2019&von_monat=01&bis_jahr=2020&bis_monat=10&gg=34075&von=20201001&bis=20201031')
    .get(function (data){
        ready(data)
    });

