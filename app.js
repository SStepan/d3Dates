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

function filterLastFluss(data, objectKeys, direction){
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

    var lastFlussesDailyKeys = Object.keys(dictionary);
    for (var i = 0; i< lastFlussesDailyKeys.length; i++){
        // var item = dictionary[lastFlussesDailyKeys[i]].reduce(reducer);

        var item;
        if(direction == "entry"){
            var nomintation = d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z09_entry));
            if(isNaN(nomintation) || nomintation == 0){
                nomintation = d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z14_entry));
            }

            item = {
                physicalFlow: d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z08)),
                nomination: nomintation,
            };
        }

        else{
            var nomintation = d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z09_exit));
            if(isNaN(nomintation) || nomintation == 0){
                nomintation = d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z14_exit));
            }

            item = {
                physicalFlow: d3.max(dictionary[lastFlussesDailyKeys[i]].map(t => t.lf_z08)),
                nomination: nomintation,
            };
        }

        result.push({date: lastFlussesDailyKeys[i], value: item});
    }

    return result;
}

// Main function.
function ready(capacities, direction, points) {

  var objectKeys = Object.keys(capacities['VIP France - Germany'].Data.Daily)
  var filtered = filterCapacityData(capacities['VIP France - Germany'].Data.Daily, objectKeys);

  var lastFlussKeys = Object.keys(capacities['VIP France - Germany'].Data.LastFluss);
  var lastFlusses = filterLastFluss(capacities['VIP France - Germany'].Data.LastFluss, lastFlussKeys, direction);

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

  var y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, maxTac])

  svg.append("g")
      .call(d3.axisLeft(y));

  var xFunc = function(d) { return x(moment(d[0], 'DD.MM.YYYY')); }
  var yFunc;
  var heightFunc;

    //draw bars for booked interruptable capacity
  if(direction == "entry") {
      yFunc = function(d) { return y(+d[17].replace(/\./g, '')); }
      heightFunc = function(d) { return height - y(+d[17].replace(/\./g, '')); }
  }
  else {
      yFunc = function(d) { return y(+d[15].replace(/\./g, '')); }
      heightFunc = function(d) { return height - y(+d[15].replace(/\./g, '')); }
  }
  var widthFunc = function(d) { return x(moment(filtered[1][0], 'DD.MM.YYYY')); }
  var color = "#2A928B";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);


    //draw bars for booked dzk capacity
    if(direction == "entry") {
        yFunc = function (d) {
            return y(+d[7].replace(/\./g, ''));
        }
        heightFunc = function (d) {
            return height - y(+d[7].replace(/\./g, ''));
        }
    }
    else{
        yFunc = function (d) {
            return y(+d[6].replace(/\./g, ''));
        }
        heightFunc = function (d) {
            return height - y(+d[6].replace(/\./g, ''));
        }
    }
    color = "#97B6CE";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);

    //draw bars for booked bfzk capacity
    if(direction == "entry") {
        yFunc = function (d) {
            return y(+d[6].replace(/\./g, ''));
        }
        heightFunc = function (d) {
            return height - y(+d[6].replace(/\./g, ''));
        }
        color = "#B5CBDC";
        drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);
    }

    //draw bars for booked fzk capacity
    yFunc = function(d) { return y(+d[5].replace(/\./g, '')); }
    heightFunc = function(d) { return height - y(+d[5].replace(/\./g, '')); }
    color = "#B5CBDC";
    drawBar(svg, filtered, xFunc, yFunc, widthFunc, heightFunc, color);

    lastFlusses = lastFlusses.sort((a, b) => {
        if(a < b)
            return -1;

        if(a > b)
            return 1;
        return 0;
    });
    lastFlusses.reverse();

    var tacLine = getTacArray(filtered, x, y);
  var physicalFlowLine = getPhysicalFlowArray(lastFlusses, filtered, x, y);
  var nominationLine = getNominationArray(lastFlusses, filtered, x, y);

  //draw Tac line
    color = "#C4C4C4";
    drawLine(svg, tacLine, color);

    //draw Nomination line
    color = "#E0A600";
    drawLine(svg, nominationLine, color)

    //draw Physical flow line
    color = "#B464A3";
    drawLine(svg, physicalFlowLine, color)
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
        .data(dataValues)
        .enter()
        .append("rect")
        .attr("x", xFunc)
        .attr("y", yFunc)
        .attr("width", widthFunc)
        .attr("height", heightFunc)
        .style("fill", color)
}

function getTacArray(data, x, y){
    var tacLine = [];
    var x1 = 0;
    for (var i = 0; i < data.length; i++){
        var y1 = y(+data[i][1].replace(/\./g, ''));
        var x2 = x1 + x(moment(data[1][0], 'DD.MM.YYYY'));
        tacLine.push([x1, y1], [x2, y1])
        x1 = x2;
    }

    return tacLine;
}

function getPhysicalFlowArray(lastFlusses, data, x, y){
    var physicalFlowLine = [];
    var x1 = 0;
    for (var i = 0; i < lastFlusses.length; i++){
        if(isNaN(lastFlusses[i].value.lf_z08)){
            continue;
        }
        var y1 = y(Math.abs(lastFlusses[i].value.lf_z08));
        var x2 = x1 + x(moment(data[1][0], 'DD.MM.YYYY'));
        physicalFlowLine.push([x1, y1], [x2, y1])
        x1 = x2;
    }

    return physicalFlowLine;
}

function getNominationArray(lastFlusses, data, x, y){
    var nominationLine = [];
    var x1 = 0;
    for (var i = 0; i < lastFlusses.length; i++){
        if(isNaN(lastFlusses[i].value.lf_z09_entry)){
            continue;
        }
        var y1 = y(Math.abs(lastFlusses[i].lf_z09_entry));
        var x2 = x1 + x(moment(data[1][0], 'DD.MM.YYYY'));
        nominationLine.push([x1, y1], [x2, y1])
        x1 = x2;
    }

    return nominationLine;
}

var points = ["IP Gernsheim", "IP Medelsheim"];
var promises = [];
var results = [];

var urls = points.map(t => `https://www.grtgaz-deutschland.de/sites/default/modules/custom/kapazitaeten/xenriched.php?sent=1&csv=1&lang=en&archiv=&r=E&nodes=${t.replaceAll(' ', '%20')}&von_jahr=2019&von_monat=01&bis_jahr=2020&bis_monat=10&gg=34075&von=20201001&bis=20201031`)
var promises = points.map(t => d3.json(`https://www.grtgaz-deutschland.de/sites/default/modules/custom/kapazitaeten/xenriched.php?sent=1&csv=1&lang=en&archiv=&r=E&nodes=${t.replaceAll(' ', '%20')}&von_jahr=2019&von_monat=01&bis_jahr=2020&bis_monat=10&gg=34075&von=20201001&bis=20201031`))

Promise.all(promises).then(values => {
    values.map(t => t.get(function (ff) {
        return ff;
    }));
    Promise.resolve()
})
// let requestsArray = [`https://www.grtgaz-deutschland.de/sites/default/modules/custom/kapazitaeten/xenriched.php?sent=1&csv=1&lang=en&archiv=&r=E&nodes=${points[0].replaceAll(' ', '%20')}&von_jahr=2019&von_monat=01&bis_jahr=2020&bis_monat=10&gg=34075&von=20201001&bis=20201031`].map((url) => {
//     let request = new Request(url, {
//         headers: new Headers({
//             'Content-Type': 'text/json'
//         }),
//         method: 'GET'
//     });
//
//     return request;
// });
//
// Promise.all(requestsArray.map((request) => {
//     return fetch(request).then((response) => {
//         return response.json();
//     }).then((data) => {
//         return data;
//     });
// })).then((values) => {
//     console.log('values', values);
// });

