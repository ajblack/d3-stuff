
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
          anchor.classList.add('mySvgContainer');
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


          var svg = d3.select(anchor).append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("id", "world-map-svg");

          myCustomD3Library.createModal();
          myCustomD3Library.createDataPanel();
          var detailWindow = document.getElementById('world-map-data-panel');
          var selectedPath = null;

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
              //.style("stroke", "red")
              .attr("stroke", "red")
              .attr("stroke-width", 2)
              .attr("class","customline")
              .attr("fill", "none")

              .attr("data-src_ip", coordinatePairs[i][0].properties.src_ip)
              .attr("data-src_port", coordinatePairs[i][0].properties.src_port)
              .attr("data-protocol", coordinatePairs[i][0].properties.protocol)
              .attr("data-src_location", coordinatePairs[i][0].properties.src_location)
              .attr("data-dest_ip", coordinatePairs[i][0].properties.dest_ip)
              .attr("data-dest_port", coordinatePairs[i][0].properties.dest_port)
              .attr("data-dest_location", coordinatePairs[i][0].properties.dest_location)
              .attr("data-bytes", coordinatePairs[i][0].properties.bytes)
              .attr("data-bytes_in", coordinatePairs[i][0].properties.bytes_in)
              .attr("data-bytes_out", coordinatePairs[i][0].properties.bytes_out)
              .attr("data-rule", coordinatePairs[i][0].properties.rule)
              .attr("data-action", coordinatePairs[i][0].properties.action)
              .attr("data-City", coordinatePairs[i][0].properties.City)
              .attr("data-Country", coordinatePairs[i][0].properties.Country)
              .attr("data-Region", coordinatePairs[i][0].properties.Region)
              .attr("data-_timediff", coordinatePairs[i][0].properties._timediff)
              .attr("data-end_lat", coordinatePairs[i][0].properties.end_lat)
              .attr("data-end_lon", coordinatePairs[i][0].properties.end_lon)
              .attr("data-geo_info", coordinatePairs[i][0].properties.geo_info)
              .attr("data-start_lat", coordinatePairs[i][0].properties.start_lat)
              .attr("data-start_lon", coordinatePairs[i][0].properties.start_lon)
              .attr("data-status", coordinatePairs[i][0].properties.status)
              .attr("data-myid",coordinatePairs[i][0].properties.myid)
              .attr("marker-end","url(#triangle)")
              .on("mouseover", function(d){
                //show selected path as blue

                //d3.select(this).transition().style("stroke", "blue").duration(300);
                this.setAttribute('stroke', 'blue');
                selectedPath = this;
                var modalWindow = document.getElementById('world-map-hover-modal');
                var detailWindow = document.getElementById('world-map-data-panel');
                if(this.dataset.myid == detailWindow.dataset.myid){
                  detailWindow.classList.add('hovered');
                }
                //show the preview modal only if the detail window is not currently showing this data

                if(this.dataset.myid !== detailWindow.dataset.myid || !detailWindow.classList.contains('visiblemodal')){
                  modalWindow.classList.add("visiblemodal");
                  modalWindow.querySelector("#modal-src_ip").textContent = "Source IP: "+this.getAttribute("data-src_ip");
                  modalWindow.querySelector("#modal-src_port").textContent = "Source Port: "+this.getAttribute("data-src_port");
                  modalWindow.querySelector("#modal-src_location").textContent = "Source Location: "+this.getAttribute("data-src_location");
                  modalWindow.querySelector("#modal-protocol").textContent = "Protocol: "+this.getAttribute("data-protocol");
                  modalWindow.querySelector("#modal-dest_ip").textContent = "Dest IP: "+this.getAttribute("data-dest_ip");
                  modalWindow.querySelector("#modal-dest_port").textContent = "Dest Port: "+this.getAttribute("data-dest_port");
                  modalWindow.querySelector("#modal-dest_location").textContent = "Dest Location: "+this.getAttribute("data-dest_location");
                  modalWindow.setAttribute('data-myid', this.getAttribute('data-myid'));
                  modalWindow.style.top = d3.event.clientY-10+'px';
                  modalWindow.style.left = d3.event.clientX+20+'px';
                }

              })
              .on("click", function(d){
                var modalWindow = document.getElementById('world-map-hover-modal');
                var detailWindow = document.getElementById('world-map-data-panel');
                modalWindow.classList.remove("visiblemodal");
                detailWindow.classList.add("visiblemodal");
                detailWindow.querySelector("#panel-src_ip").textContent = "Source IP: "+this.getAttribute("data-src_ip");
                detailWindow.querySelector("#panel-protocol").textContent = "Protocol: "+this.getAttribute("data-protocol");
                detailWindow.querySelector("#panel-src_location").textContent = "Source Location: "+this.getAttribute("data-src_location");
                detailWindow.querySelector("#panel-dest_ip").textContent = "Dest IP: "+this.getAttribute("data-dest_ip");
                detailWindow.querySelector("#panel-dest_port").textContent = "Dest Port: "+this.getAttribute("data-dest_port");
                detailWindow.querySelector("#panel-dest_location").textContent = "Dest Location: "+this.getAttribute("data-dest_location");
                detailWindow.querySelector("#panel-bytes").textContent = "Bytes: "+this.getAttribute("data-bytes");
                detailWindow.querySelector("#panel-bytes_in").textContent = "Bytes In: "+this.getAttribute("data-bytes_in");
                detailWindow.querySelector("#panel-bytes_out").textContent = "Bytes Out: "+this.getAttribute("data-bytes_out");
                detailWindow.querySelector("#panel-rule").textContent = "Rule: "+this.getAttribute("data-rule");
                detailWindow.querySelector("#panel-action").textContent = "Action: "+this.getAttribute("data-action");
                detailWindow.querySelector("#panel-City").textContent = "City: "+this.getAttribute("data-City");
                detailWindow.querySelector("#panel-Country").textContent = "Country: "+this.getAttribute("data-Country");
                detailWindow.querySelector("#panel-Region").textContent = "Region: "+this.getAttribute("data-Region");
                detailWindow.querySelector("#panel-_timediff").textContent = "Time Difference: "+this.getAttribute("data-_timediff");
                detailWindow.querySelector("#panel-end_lat").textContent = "End Lat: "+this.getAttribute("data-end_lat");
                detailWindow.querySelector("#panel-end_lon").textContent = "End Long: "+this.getAttribute("data-end_lon");
                detailWindow.querySelector("#panel-geo_info").textContent = "Geo Info: "+this.getAttribute("data-geo_info");

                detailWindow.querySelector("#panel-start_lat").textContent = "Start Lat: "+this.getAttribute("data-start_lat");
                detailWindow.querySelector("#panel-start_lon").textContent = "Start Long: "+this.getAttribute("data-start_lon");
                detailWindow.querySelector("#panel-status").textContent = "Status: "+this.getAttribute("data-status");
                detailWindow.setAttribute('data-myid', this.getAttribute('data-myid'));
                detailWindow.classList.add('hovered');

                var svgRect = document.querySelector('#world-map-svg').getBoundingClientRect();
                detailWindow.style.top = d3.event.clientY-10+'px';
                detailWindow.style.left = d3.event.clientX+20+'px';
              })
              .on("mouseleave", function(d){
                this.setAttribute('stroke', 'red');
                var modalWindow = document.getElementById('world-map-hover-modal');
                var detailWindow = document.getElementById('world-map-data-panel');
                detailWindow.classList.remove('hovered');
                modalWindow.classList.remove("visiblemodal");
              });
            }
          }
        });
      })
