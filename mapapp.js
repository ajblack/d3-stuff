window.onload = function(){


  var width = 960,
      height = 480;

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var projection = d3.geoEquirectangular()
    .scale(153)
      .translate([width/2,height/2])


  var path = d3.geoPath()
      .projection(projection)

//mexico city, bejing, pyongyang, honolulu
  var latlong = {"type":"FeatureCollection","features":[
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-99.1332,19.4326]},"properties":{"timestampMs":1415894666875}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[116.4,39.9]},"properties":{"timestampMs":1415894666875}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[125.76,39.04]},"properties":{"timestampMs":1415894666875}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-157.8583,21.3069]},"properties":{"timestampMs":1415894666875}}
  ]};
      svg.append("g")
        .attr("class", "land")
      .selectAll("path")
        .data([topojson.object(world, world.objects.land)])
        .enter().append("path")
        .attr("d", path);
    svg.append("g")
        .attr("class", "boundary")
        .selectAll("boundary")
        .data([topojson.object(world, world.objects.countries)])
        .enter().append("path")
        .attr("d", path);
    svg.append( "g" ).selectAll("path")
      .data( latlong.features)
      .enter()
      .append("path")
      .attr("class","pin")
      .attr( "d", path );
}
