
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

          var modalInit = false;
          var dataPanelInit = false;

          var modalWindow, detailWindow, svgRect;

          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          var anchorID = anchor.getAttribute('data-cid');
          //anchor.classList.add('mySvgContainer');
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
              .attr("id", anchorID+"world-map-svg");

          //create modal
          if(!modalInit){
            modalWindow= window.document.createElement('div');
            modalWindow.id = anchorID+'world-map-hover-modal';
            modalWindow.classList.add('world-map-hover-modal');
            anchor.appendChild(modalWindow);
            $('#'+anchorID+"world-map-hover-modal" ).load( "/static/app/world_map_app/modal.html", function(){});
          }
          modalInit = true;

          //create data panel
          if(!dataPanelInit){
            panelWindow = window.document.createElement('div');
            panelWindow.id = anchorID+'world-map-data-panel';
            panelWindow.classList.add('world-map-data-panel');
            //build the id string for selection
            var panelID = '#'+anchorID+'world-map-data-panel';
            anchor.appendChild(panelWindow);

            myCustomD3Library.makeElementDraggable('.world-map-data-panel', anchor);

            $(panelID).load('/static/app/world_map_app/datapanel.html', function(){});
            panelWindow.addEventListener('contextmenu', function(e){
              e.preventDefault();
              panelWindow.classList.remove('visiblemodal');
            });
            panelWindow.addEventListener('mouseover', function(e){
              panelWindow.classList.add('hovered');
              var panelLocal = panelWindow.getAttribute('data-myid');
              console.log('panelLocal: '+panelLocal);
              var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelLocal+'"]');
              matchingPath.setAttribute('stroke', 'blue');
            });
            panelWindow.addEventListener('mouseleave', function(e){
              panelWindow.classList.remove('hovered');
              var panelLocal = panelWindow.getAttribute('data-myid');
              var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelLocal+'"]');
              matchingPath.setAttribute('stroke', 'red');
            });
            window.addEventListener('scroll', function(e){
              //var panelBox = document.querySelector(panelID).getBoundingClientRect();
              var panelBox = panelWindow.getBoundingClientRect();
              var anchorBox = document.querySelector('#'+anchorID+'world-map-svg').getBoundingClientRect();
              if(panelBox.top < anchorBox.top){
                panelWindow.style.top = anchorBox.top+'px';
              }
              else if(panelBox.bottom > anchorBox.bottom){
                panelWindow.style.top = anchorBox.bottom - panelBox.height+'px';
              }
            })
          }
          dataPanelInit = true;

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
              .attr("data-myid",function(){
                return anchorID+coordinatePairs[i][0].properties.myid;
              })
              .attr("marker-end","url(#triangle)")
              .on("mouseover", function(d){
                this.setAttribute('stroke', 'blue');
                selectedPath = this;
                if(this.dataset.myid == panelWindow.dataset.myid){
                  panelWindow.classList.add('hovered');
                }
                //show the preview modal only if the detail window is not currently showing this data

                if(this.dataset.myid !== panelWindow.dataset.myid || !panelWindow.classList.contains('visiblemodal')){
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
                modalWindow.classList.remove("visiblemodal");
                panelWindow.classList.add("visiblemodal");

                panelWindow.querySelector("#panel-src_ip").textContent = "Source IP: "+this.getAttribute("data-src_ip");
                panelWindow.querySelector("#panel-protocol").textContent = "Protocol: "+this.getAttribute("data-protocol");
                panelWindow.querySelector("#panel-src_location").textContent = "Source Location: "+this.getAttribute("data-src_location");
                panelWindow.querySelector("#panel-dest_ip").textContent = "Dest IP: "+this.getAttribute("data-dest_ip");
                panelWindow.querySelector("#panel-dest_port").textContent = "Dest Port: "+this.getAttribute("data-dest_port");
                panelWindow.querySelector("#panel-dest_location").textContent = "Dest Location: "+this.getAttribute("data-dest_location");
                panelWindow.querySelector("#panel-bytes").textContent = "Bytes: "+this.getAttribute("data-bytes");
                panelWindow.querySelector("#panel-bytes_in").textContent = "Bytes In: "+this.getAttribute("data-bytes_in");
                panelWindow.querySelector("#panel-bytes_out").textContent = "Bytes Out: "+this.getAttribute("data-bytes_out");
                panelWindow.querySelector("#panel-rule").textContent = "Rule: "+this.getAttribute("data-rule");
                panelWindow.querySelector("#panel-action").textContent = "Action: "+this.getAttribute("data-action");
                panelWindow.querySelector("#panel-City").textContent = "City: "+this.getAttribute("data-City");
                panelWindow.querySelector("#panel-Country").textContent = "Country: "+this.getAttribute("data-Country");
                panelWindow.querySelector("#panel-Region").textContent = "Region: "+this.getAttribute("data-Region");
                panelWindow.querySelector("#panel-_timediff").textContent = "Time Difference: "+this.getAttribute("data-_timediff");
                panelWindow.querySelector("#panel-end_lat").textContent = "End Lat: "+this.getAttribute("data-end_lat");
                panelWindow.querySelector("#panel-end_lon").textContent = "End Long: "+this.getAttribute("data-end_lon");
                panelWindow.querySelector("#panel-geo_info").textContent = "Geo Info: "+this.getAttribute("data-geo_info");

                panelWindow.querySelector("#panel-start_lat").textContent = "Start Lat: "+this.getAttribute("data-start_lat");
                panelWindow.querySelector("#panel-start_lon").textContent = "Start Long: "+this.getAttribute("data-start_lon");
                panelWindow.querySelector("#panel-status").textContent = "Status: "+this.getAttribute("data-status");
                panelWindow.setAttribute('data-myid', this.getAttribute('data-myid'));
                panelWindow.classList.add('hovered');

                //anchor.getBoundingClientRect();
                //document.querySelector('#'+anchorID+'world-map-svg').getBoundingClientRect();
                panelWindow.style.top = d3.event.clientY-10+'px';
                panelWindow.style.left = d3.event.clientX+20+'px';
              })
              .on("mouseleave", function(d){
                this.setAttribute('stroke', 'red');
                panelWindow.classList.remove('hovered');
                modalWindow.classList.remove("visiblemodal");
              });
            }
          }
        });
      })
