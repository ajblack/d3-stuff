define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3',
            'topojson'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            topojson
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.addClass('splunk-radial-meter');
        },

        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        updateView: function(data, config) {
                //$.getScript("../world-50m.js", function(){
                this.$el.empty();

                console.log(this.el);
                var anchor = this.el;



                d3.json("https://gist.githubusercontent.com/abenrob/787723ca91772591b47e/raw/8a7f176072d508218e120773943b595c998991be/world-50m.json", function(error, world){
                  console.log("past jquery");
                  var width = 960,
                  height = 480;
/*
                  var svgContainer = d3.select(anchor).append('svg').attr("width", 100).attr("height", 100);
                  var circle = svgContainer.append("circle")
                          .attr("cx", 30)
                          .attr("cy", 30)
                          .attr("r", 20);
                  console.log("past new svg");*/

                  var svg = d3.select(anchor).append("svg")
                      .attr("width", width)
                      .attr("height", height);
                  console.log("past first append");
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
                    .data([topojson.feature(world, world.objects.land)])
                    .enter().append("path")
                    .attr("d", path);
                  svg.append("g")
                      .attr("class", "boundary")
                      .selectAll("boundary")
                      .data([topojson.feature(world, world.objects.countries)])
                      .enter().append("path")
                      .attr("d", path);
                  svg.append( "g" ).selectAll("path")
                    .data( latlong.features)
                    .enter()
                    .append("path")
                    .attr("class","pin")
                    .attr( "d", path );
                  })
        }
    });
});
