
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3',
            'topojson',
            'world-50m.js',
            'customD3Library.js',
            'customDataLibrary.js'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            topojson,
            w,
            cD3,
            cData
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.addClass('splunk-radial-meter');
            //this.isInitializedDom = false;
        },

        formatData: function(data){
          return data;
        },

        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.ROW_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        updateView: function(data, config) {

          myCustomDataLibrary.initializeData(data);
          var data = myCustomDataLibrary.getData();

          var data =
          {
            "fields":
            [
              {"name":"start_lat"},
              {"name":"start_lon"},
              {"name":"end_lat"},
              {"name":"end_lon"}
            ],
            "rows":
            [
              ["-122.6795","45.5128","-46.62890","-23.54640"],
              ["-122.6795","45.5128","151.19820","-33.86120"],

              //new ones
              ["-122.6795","45.5128","72.82580","18.97500"],
              ["-122.6795","45.5128","103.85650","1.28550"],
              ["-122.6795","45.5128","-121.26924","37.33002"],
              ["-122.6795","45.5128","-79.67436","39.38558"],
              ["-122.6795","45.5128","126.73170","37.45360"],
              ["-122.6795","45.5128","139.76770","35.64270"],
              ["-122.6795","45.5128","-119.71617","45.89048"],
              ["-122.6795","45.5128","-73.58330","45.50000"]
            ]
          }

          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          $(anchor).empty();
          var world = myWorldGeoLibrary.worldGeo();
          var retCords = []
          for(var i=0;i<data.rows.length*2;i++){
            var ret = {"type":"Feature","geometry":{"type":"Point","coordinates":[0,0]},"properties":{"timestampMs":0}};
            retCords.push(ret);
          }

          var coordinatePairs = [];
          for(var i=0;i<data.rows.length;i++){
            var r1 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][0],data.rows[i][1]]},"properties":{"timestampMs":0}};
            var r2 = {"type":"Feature","geometry":{"type":"Point","coordinates":[data.rows[i][2],data.rows[i][3]]},"properties":{"timestampMs":0}};
            coordinatePairs.push([r1,r2])
          }

          //map the coordinates of each row value (set of two coordinates) individually to a retCords coordinate
          var currentRet = 0;
          for(var j=0;j<data.rows.length;j++){
            retCords[currentRet].geometry.coordinates[0] = data.rows[j][0];
            retCords[currentRet].geometry.coordinates[1] = data.rows[j][1];
            currentRet++;
            retCords[currentRet].geometry.coordinates[0] = data.rows[j][2];
            retCords[currentRet].geometry.coordinates[1] = data.rows[j][3];
            currentRet++;
          }

          //convert the coordinates into the features attribute of a geojson object
          var latlong = {"type":"FeatureCollection", "features":[]}
          latlong.features = retCords;

          var anchorDims = anchor.getBoundingClientRect(),
              width = anchorDims.width,
              height = anchorDims.height;
          myCustomD3Library.createModal();


          var svg = d3.select(anchor).append("svg")
              .attr("width", width)
              .attr("height", height);

          //this is a definition for use later
          svg.append("svg:defs").append("svg:marker")
              .attr("id", "triangle")
              .attr("refX", 6)
              .attr("refY", 2)
              .attr("markerWidth", 30)
              .attr("markerHeight", 30)
              .attr("orient", "auto")
              .append("path")
              .attr("d", "M 0 0 4 2 0 4 1 2")
              .style("fill", "red");


          var projection = d3.geoEquirectangular()
            .scale(153)
            .translate([width/2,height/2])

          var pathGenerator = d3.geoPath()
              .projection(projection)

          svg.append("g")
            .attr("class", "land")
            .selectAll("path")
            .data([topojson.feature(world, world.objects.land)])
            .enter()
            .append("path")
            .attr("d", pathGenerator);

          svg.append("g")
              .attr("class", "boundary")
              .selectAll("boundary")
              .data([topojson.feature(world, world.objects.countries)])
              .enter()
              .append("path")
              .attr("d", pathGenerator);

          svg.append( "g" )
            .attr("class","pin")
            .selectAll("path")
            .data( latlong.features)
            .enter()
            .append("path")
            .attr( "d", pathGenerator);

            //using the coordinate pair object construct lines between coordinates
            for(var i=0;i<coordinatePairs.length;i++){
              var p1 = projection([coordinatePairs[i][0].geometry.coordinates[0],coordinatePairs[i][0].geometry.coordinates[1]])
              var p2 = projection([coordinatePairs[i][1].geometry.coordinates[0],coordinatePairs[i][1].geometry.coordinates[1]])
              svg.append("path")
              //.attr("d", draw_curve(p1[0],p1[1],p2[0],p2[1],5))
              .attr("d", myCustomD3Library.draw_curve(p1[0],p1[1],p2[0],p2[1],5))
              .style("stroke", "red")
              .attr("stroke-width", 2)
              .attr("class","customline")
              .attr("fill", "none")

              .attr("marker-end","url(#triangle)")
              .on("mouseover", function(d){
                //show selected path as blue
                d3.select(this).transition().style("stroke", "blue").duration(300);
                //add opaque div for a text area

                var modalWindow = document.getElementById('world-map-hover-modal');
                modalWindow.classList.add("visiblemodal");
                modalWindow.style.top = d3.event.clientY-10+'px';
                modalWindow.style.left = d3.event.clientX+20+'px';

              })
              .on("click", function(d){
                console.log("clicking on: "+d);
              })
              .on("mouseleave", function(d){
                d3.select(this).transition().style("stroke", "red").duration(500);

                var modalWindow = document.getElementById('world-map-hover-modal');
                modalWindow.classList.remove("visiblemodal");
              });
            }
          }
        });
      })
