// N.B. Different js files still use the same var name space!


  /* *********** */
 /* Filter Code */
/* *********** */
// This goes first because we need to define the filters before we can query 
// the database as the map loads.

var selectedYearStart = '';
d3.select("#yearStartDropdown")
  .on("change", function() { 
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue === "") { selectedYearStart = ''; }
    else {
      selectedYearStart = 'AND year >= ' + selectedValue;
    }
    query_then_update_map();
  });

var selectedYearEnd = '';
d3.select("#yearEndDropdown")
  .on("change", function() {  
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue === "") { selectedYearEnd = ''; }
    else {
      selectedYearEnd = 'AND year <= ' + selectedValue;
    }
    query_then_update_map();
  });

var selectedProvince = '';
d3.select("#provinceDropdown")
  .on("change", function() {  
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue === "") { selectedProvince = ''; }
    else {
      selectedProvince = 'AND agency = ' + selectedValue;
    }
    query_then_update_map();
  });
    
var selectedCauseOfFire = '';
d3.select("#causeOfFireDropdown")
  .on("change", function() {  
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue == -1) { selectedCauseOfFire = ''; }
    else {
      selectedCauseOfFire = 'AND firecaus = ' + selectedValue;
    }
    query_then_update_map();
  });

var selectedCluster = '';
d3.select("#clusterDropdown")
  .on("change", function() {  
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue === "") { selectedCluster = ''; }
    else {
      selectedCluster = 'AND Cluster = ' + selectedValue;
    }
    query_then_update_map();
  });


/* **************** */
/* Leaflet Map Code */
/* **************** */

var map = L.map('map');
var firefeatures;

map.on('load', function() { query_then_update_map(); });
map.setView([54.75,-120.52], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function get_colour(cluster) {
  return cluster == 1 ? '#ab5e0c' :
          cluster == 2  ? '#0c17ab' :
                    '#ab0c9e';
};

var cluster_colours = ['#ab5e0c', '#0c17ab', '#ab0c9e'];
var legend = L.control({position: 'topright'});
legend.onAdd = function (map) {
  var div = L.DomUtil.create('div', 'info legend');
  labels = ['<strong>Cluster Category</strong>'],
  categories = ['1', '2', '3'];
  for (var i = 0; i < categories.length; i++) {
          div.innerHTML += 
          labels.push(
              '<i class="circle" style="background:' + get_colour(categories[i]) + '"></i> ' +
          (categories[i] ? categories[i] : '+'));
      }
      div.innerHTML = labels.join('<br>');
  return div;
  };

legend.addTo(map);

function colour_by_cluster(feature) {
  return {
    fillColor: get_colour(feature.properties.Cluster),
    fillOpacity: 0.3,
    color: 'black',
    weight: 0.5
  };
};

var request = null;
function query_then_update_map() {
  map.spin(true);

  var sw = map.getBounds().getSouthWest().wrap();
  var ne = map.getBounds().getNorthEast().wrap();
  var n = ne.lat;
  var e = ne.lng;
  var s = sw.lat;
  var w = sw.lng;
  var coords = {
              'west': w,
              'north': n,
              'east': e,
              'south': s,
              'yearStart': selectedYearStart,
              'yearEnd': selectedYearEnd,
              'prov': selectedProvince,
              'cause': selectedCauseOfFire,
              'cluster': selectedCluster
            }
  console.log(coords);

    // $.ajax({
    //   url: '/getfirequery',
    //   data: coords,
    //   type: 'POST',
    //   success: function(response) {
    //     console.log(response);
    // },
    // error: function(error) {
    //     console.log(error);
    // }
    // });
  console.log('querying...');

  // Will cancel new requests for new ones but server will still process all requests (i.e. still slow, just doesnt show intermediary steps on UI)
  if(request && request.readyState != 4){
    request.abort();
  }

  request = $.ajax({
    url: '/getfires',
    data: coords,
    type: 'POST',
    success: function(response) {
      if (map.hasLayer(firefeatures)) {map.removeLayer(firefeatures);}
  //       map.removeLayer(datalayer);
      fires = response;
      firefeatures = new L.geoJson(fires, {style: colour_by_cluster}).addTo(map);
  //       datalayer.addTo(map);
      // console.log(response);
      console.log('Post-query results:', fires);
      draw_burn_circle();
      write_burn_area();
      write_burn_football();  
      draw_burn_squares();
      console.log("loading KPI Charts")
      load_KPI_Chart();
      console.log('Finished query!');
      map.spin(false);
  },
  error: function(error) {
      console.log(error);
      map.spin(false);
  }
  });
};

// Query the database for new data after the map moves.
map.on('moveend', function() {
  query_then_update_map();
});


// set the dimensions and margins of the graph
var margin = { top: 50, right: 50, bottom: 50, left: 150 },
  width = 1250 - margin.left - margin.right,
  height = 570 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#Wildfire").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

// // add tooltip
// var tip = d3.tip()
//   .attr("id", "tooltip")
//   .attr('class', 'd3-tip')
//   .offset([-10, 0])


// Create color map
var z = d3.scaleOrdinal(d3.schemeCategory10);


// Read data from a file or directly import from SQL




// Add X axis


// Add Y axis


// Plot maps


// Add the text label for X Axis


// Add the text label for Y axis



// Add title
svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").append("text")
  .attr("id", "Fire Plot")
  .attr("x", (width) / 4)
  .attr("y", -30)
  .attr("font-size", "24px")
  .text("Wildfire Plot");



// Add legend



// Mouseover function
var mouseoverHandler = function (d, i) {
}

// Mouseout function
var mouseoutHandler = function (d, i) {
}


d3.selectAll("circle")
  .on("mouseover", mouseoverHandler)
  .on("mouseout", mouseoutHandler)


  /* *********** */
 /* Filter Code */
/* *********** */

var selectedYearStart = '';
d3.select("#yearStartDropdown")
  .on("change", function() { 
    var selectedValue = d3.select(this).property("value"); 
    if (selectedValue === "") { selectedYearStart = ''; }
    else {
      selectedYearStart = 'AND year >= ' + selectedValue;
    }
    query_then_update_map();
  });

var selectedYearEnd = '';
  d3.select("#yearEndDropdown")
    .on("change", function() {  
      var selectedValue = d3.select(this).property("value"); 
      if (selectedValue === "") { selectedYearEnd = ''; }
      else {
        selectedYearEnd = 'AND year <= ' + selectedValue;
      }
      query_then_update_map();
    });

var selectedProvince = '';
  d3.select("#provinceDropdown")
    .on("change", function() {  
      var selectedValue = d3.select(this).property("value"); 
      if (selectedValue === "") { selectedProvince = ''; }
      else {
        selectedProvince = 'AND agency = ' + selectedValue;
      }
      query_then_update_map();
    });
    
var selectedCauseOfFire = '';
  d3.select("#causeOfFireDropdown")
    .on("change", function() {  
      var selectedValue = d3.select(this).property("value"); 
      if (selectedValue == -1) { selectedCauseOfFire = ''; }
      else {
        selectedCauseOfFire = 'AND firecaus = ' + selectedValue;
      }
      query_then_update_map();
    });

var selectedCluster = '';
  d3.select("#clusterDropdown")
    .on("change", function() {  
      var selectedValue = d3.select(this).property("value"); 
      if (selectedValue === "") { selectedCluster = ''; }
      else {
        selectedCluster = 'AND Cluster = ' + selectedValue;
      }
      query_then_update_map();
    });
  // .on("change", function() {  
  //     selectedCluster = 'AND Cluster = ' + d3.select(this).property("value");
  //     query_then_update_map();
  // })



/* ********************* */
/* Burn Area Circle Code */
/* ********************* */
var map_center = [40.75, -73.98] // Manhattan
var burn_area_map = L.map('burn_area_map').setView(map_center, 10);
L.control.scale({ maxWidth: 100 }).addTo(burn_area_map);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(burn_area_map);

// Test code: Generate random number between [50000, 500000) to simulate dynamic changing values
// var burn_area = 4046;
// function randomize_burn_area() {
//   burn_area = Math.random() * 500000 + 50000;
//   // burn_area = Math.random() * 10**7 + 10**6; 
//   // burn_area = 4046;

//   // TO DO: code in edge cases for < 1 ha or acres
//   // burn_area = Math.random() * 10**-7 + 1  ; 
// };

// var area_burned = 535;
var area_burned = fires.features.map(fire => fire.properties.adj_ha).reduce((total, area) => total + area); // in hectares

function calc_area_burned() {
  // var area_burned = burn_area;
  if (fires.features.length == 0) { return 0;}
  else {area_burned = fires.features.map(fire => fire.properties.adj_ha).reduce((total, area) => total + area);} // in hectares
  return area_burned;
  // return 481;
};

function calc_burn_radius() {
  area_burned = calc_area_burned();
  var burn_radius = Math.sqrt(area_burned * 10000 / Math.PI); // in metres
  return burn_radius;
};

// Initialize burned_area_circle
var burn_circle; // var needs to exist for js to check if it's a layer
draw_burn_circle();

function draw_burn_circle() {
  if (burn_area_map.hasLayer(burn_circle)) { burn_area_map.removeLayer(burn_circle); }
  // burn_area_map.removeLayer(burn_circle);
  burn_circle = new L.circle(map_center, { radius: calc_burn_radius() }).setStyle({ 'className': 'burn_circle' }).addTo(burn_area_map);
  burn_area_map.fitBounds(burn_circle.getBounds());
};

//Initialize burn_area_text
var burn_area_text; // var needs to exist for js to check if it's a layer
write_burn_area(calc_area_burned());

function write_burn_area() {
  if (burn_area_map.hasLayer(burn_area_text)) {
    burn_area_map.removeLayer(burn_area_text);
  }
  var km_burned = calc_area_burned() * 0.01;
  burn_area_text = new L.tooltip({
    permanent: true,
    direction: 'center',
    className: 'burn_area_text'
  }).setContent(String(Math.round(km_burned)) + " km" + '\u00B2')
    .setLatLng(map_center)
    .addTo(burn_area_map);
};

/* ********************** */
/* Burn area squares code */
/* ********************** */
function get_footballs_burned() { return calc_area_burned() * 1.872 }; // converts ha to football fields

function get_football_units() {
  var units = Math.floor(Math.log10(get_footballs_burned())) - 1;
  units = 10 ** units
  return units;
}
function get_num_football_squares() {
  return d3.range(Math.floor(get_footballs_burned() / get_football_units()));
};
// x = 1234
// int(log(1234)) --> 3 
// f(x): x - 1 --> 2
// f(x): print(1 square = 10^x footballs)

// how many squares to show? x = footballs
// f(x): Math.floor(x/(output of above function))

var squareDim = 15, // pixel dimensions of square
  burn_area_squares_width = 700, //svg dimensions
  burn_area_squares_height = 700;

var burn_area_football_legend = d3.select('#burn_area_legend')
  .append('svg')
  .classed('burn-area-football-legend-svg', true);

function write_burn_football() {
  var area = Math.round(get_footballs_burned());
  var units = get_football_units();
  burn_area_football_legend.selectAll("*").remove();
  burn_area_football_legend.append('text')
    .text(area + " football fields burned")
    .attr("id", "football-total-burn-text")
    .attr("x", '50%')
    .style("text-anchor", "middle")
    .style("dominant-baseline", "middle")
    .attr("y", 16);

  burn_area_football_legend.append('rect')
    .attr('width', squareDim)
    .attr('height', squareDim + 5)
    .style('fill', '#f88706')
    .attr('x', 120 - squareDim)
    .attr('y', 30);

  burn_area_football_legend.append('text')
    .text(' = ' + units + ' football fields')
    .attr("id", "football-scale-text")
    .attr('x', 120 + 10)
    .attr('y', 48);

}
write_burn_football();

var burn_area_squares = d3.select('#burn_area_squares')
  .append('svg')
  .classed('burn-area-squares-svg', true);

function draw_burn_squares() {
  burn_area_squares.selectAll('rect').remove();
  burn_area_squares.selectAll('rect')
    .data(get_num_football_squares())
    .enter()
    .append('rect')
    .attr('width', squareDim)
    .attr('height', squareDim + 5)
    .attr('x', function (d) { return (d % 20) * (squareDim + 2); })
    .attr('y', function (d) { return Math.floor(d / 20) * (squareDim + 2 + 5); })
    .transition()
    .duration(700)
    .style('fill', '#f88706');
};

draw_burn_squares();


load_KPI_Chart();
