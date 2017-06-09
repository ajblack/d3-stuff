
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
          var dataShowing = 'unmanaged';

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

          var dataRet = myCustomDataLibrary.getData(data, dataShowing);
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
              var panelLocal = panelWindow.getAttribute('data-myid');
              console.log('panelLocal: '+panelLocal);
              var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelLocal+'"]');
              if(matchingPath.dataset.status == "Unmanaged"){
                matchingPath.setAttribute('stroke', 'red');
                matchingPath.setAttribute('marker-end','url(#triangleUnmanaged)');
              }
              else{
                matchingPath.setAttribute('stroke', 'green');
                matchingPath.setAttribute('marker-end','url(#triangleManaged)');
              }
            });
            panelWindow.addEventListener('mouseover', function(e){
              panelWindow.classList.add('hovered');
              var panelLocal = panelWindow.getAttribute('data-myid');
              console.log('panelLocal: '+panelLocal);
              var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelLocal+'"]');
              matchingPath.setAttribute('stroke', 'blue');
              matchingPath.setAttribute('marker-end','url(#triangleSelected)');
            });
            panelWindow.addEventListener('mouseleave', function(e){
              panelWindow.classList.remove('hovered');
              var panelLocal = panelWindow.getAttribute('data-myid');
              var matchingPath = window.document.querySelector('#'+anchorID+'world-map-svg').querySelector('[data-myid="'+panelLocal+'"]');
              if(matchingPath.dataset.status == "Unmanaged"){
                matchingPath.setAttribute('stroke', 'red');
                matchingPath.setAttribute('marker-end','url(#triangleUnmanaged)');
              }
              else{
                matchingPath.setAttribute('stroke', 'green');
                matchingPath.setAttribute('marker-end','url(#triangleManaged)');
              }
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




          //this is a definition for use later
          svg.append("svg:defs").append("svg:marker")
              .attr("id", "triangleManaged")
              .attr("refX", 6)
              .attr("refY", 2)
              .attr("markerWidth", 30)
              .attr("markerHeight", 30)
              .attr("orient", "auto")
              .append("path")
              .attr("d", "M 0 0 4 2 0 4 1 2")
              .attr("fill", "green");

          svg.append("svg:defs").append("svg:marker")
              .attr("id", "triangleUnmanaged")
              .attr("refX", 6)
              .attr("refY", 2)
              .attr("markerWidth", 30)
              .attr("markerHeight", 30)
              .attr("orient", "auto")
              .append("path")
              .attr("d", "M 0 0 4 2 0 4 1 2")
              .attr("fill", "red");

          svg.append("svg:defs").append("svg:marker")
              .attr("id", "triangleSelected")
              .attr("refX", 6)
              .attr("refY", 2)
              .attr("markerWidth", 30)
              .attr("markerHeight", 30)
              .attr("orient", "auto")
              .append("path")
              .attr("d", "M 0 0 4 2 0 4 1 2")
              .attr("fill", "blue");


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
/*
          svg.append( "g" )
            .attr("class","pin")
            .selectAll("path")
            .data( latlong.features)
            .enter()
            .append("path")
            .attr( "d", pathGenerator);*/

            //using the coordinate pair object construct lines between coordinates
            for(var i=0;i<coordinatePairs.length;i++){
              var p1 = projection([coordinatePairs[i][0].geometry.coordinates[0],coordinatePairs[i][0].geometry.coordinates[1]])
              var p2 = projection([coordinatePairs[i][1].geometry.coordinates[0],coordinatePairs[i][1].geometry.coordinates[1]])
              svg.append("path")
              //.attr("d", draw_curve(p1[0],p1[1],p2[0],p2[1],5))
              .attr("d", myCustomD3Library.draw_curve(p1[0],p1[1],p2[0],p2[1],5))
              .attr("stroke-width", "2px")
              .attr("stroke", function(d){
                if(coordinatePairs[i][0].properties.status === "Unmanaged"){
                  return 'red';
                }
                else{
                  return 'green';
                }
              })
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
              .attr("marker-end", function(d){
                if(coordinatePairs[i][0].properties.status === "Unmanaged"){
                  return 'url(#triangleUnmanaged)';
                }
                else{
                  return 'url(#triangleManaged)';
                }
              })
              .on("mouseover", function(d){
                myCustomD3Library.handlePathMouseover(this, modalWindow, panelWindow, d3.event);
              })
              .on("click", function(d){
                myCustomD3Library.handlePathClick(this, modalWindow, panelWindow, d3.event);
              })
              .on("mouseleave", function(d){
                myCustomD3Library.handlePathMouseleave(this, modalWindow, panelWindow, d3.event);

              });
            }
          }
        });
      })
