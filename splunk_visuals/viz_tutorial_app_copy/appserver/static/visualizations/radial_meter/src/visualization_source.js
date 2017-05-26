
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

          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          $(anchor).empty();
          var world = myWorldGeoLibrary.worldGeo();
          //convert the coordinates into the features attribute of a geojson object
          var latlong = {"type":"FeatureCollection", "features":[]}

          var dataRet = myCustomDataLibrary.getData(data);
          latlong.features = dataRet[0];
          var coordinatePairs = dataRet[1];
          //latlong.features = retCords;

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
              .attr("data-src-ip", coordinatePairs[i][0].properties.src_ip)
              .attr("data-src-port", coordinatePairs[i][0].properties.src_port)
              .attr("data-src-location", coordinatePairs[i][0].properties.src_location)
              .attr("data-protocol", coordinatePairs[i][0].properties.protocol)
              .attr("data-dest-ip", coordinatePairs[i][0].properties.dest_ip)
              .attr("data-dest-port", coordinatePairs[i][0].properties.dest_port)
              .attr("data-dest-location", coordinatePairs[i][0].properties.dest_location)
              .attr("marker-end","url(#triangle)")
              .on("mouseover", function(d){
                //show selected path as blue
                d3.select(this).transition().style("stroke", "blue").duration(300);

                var modalWindow = document.getElementById('world-map-hover-modal');
                modalWindow.classList.add("visiblemodal");
                modalWindow.querySelector("#modal-src-ip").textContent = "Source IP: "+this.getAttribute("data-src-ip");
                modalWindow.querySelector("#modal-src-port").textContent = "Source Port: "+this.getAttribute("data-src-port");
                modalWindow.querySelector("#modal-src-location").textContent = "Source Location: "+this.getAttribute("data-src-location");
                modalWindow.querySelector("#modal-protocol").textContent = "Protocol: "+this.getAttribute("data-protocol");
                modalWindow.querySelector("#modal-dest-ip").textContent = "Dest IP: "+this.getAttribute("data-dest-ip");
                modalWindow.querySelector("#modal-dest-port").textContent = "Dest Port: "+this.getAttribute("data-dest-port");
                modalWindow.querySelector("#modal-dest-location").textContent = "Dest Location: "+this.getAttribute("data-dest-location");
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
