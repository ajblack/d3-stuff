
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
            this.$el.addClass('world-map-app');
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
          var controlsInit = false;
          var modalInit = false;
          var dataPanelInit = false;


          var modalWindow, detailWindow, svgRect, controlsWindow, svg, controlsDim;



          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          var anchorID = anchor.getAttribute('data-cid');
          //anchor.classList.add('mySvgContainer');
          $(anchor).empty();
          var world = myWorldGeoLibrary.worldGeo();
          //convert the coordinates into the features attribute of a geojson object
          //var latlong = {"type":"FeatureCollection", "features":[]}
          myCustomD3Library.getD3(d3);
          var dataRet = myCustomDataLibrary.getData(data, myCustomDataLibrary.getDataShowing());
          //latlong.features = dataRet[1];
          var coordinatePairs = dataRet;
          //latlong.features = retCords;

          var anchorDims = anchor.getBoundingClientRect(),
              width = anchorDims.width,
              height = anchorDims.height;

            console.log('width: '+width);


          var ftest = topojson.feature(world, world.objects.countries).features;
          var fCollection = {type: 'FeatureCollection', features: ftest};
          var bounds = d3.geoBounds(fCollection);
          var center = d3.geoCentroid(fCollection);
          var distance = d3.geoDistance(bounds[0], bounds[1]),
            scale = height / distance;





          var offsetX = (width-(height*2))/2;

          var projection = d3.geoEquirectangular()
            .scale(scale)
            //.center(center) (width-(height*2))/2
            .translate([(width/2)+80,height/2]) //offest x translate by 90px to move the map to right edge of anchor

          var pathGenerator = d3.geoPath()
              .projection(projection)


          //create controls container
          if(!controlsInit){

            // 6/11 manually creating control panel because jquery load promise was giving me a headache
            controlsWindow = document.createElement('div');
            controlsWindow.id = anchorID+'world-map-controls';
            controlsWindow.classList.add('world-map-controls');
            anchor.appendChild(controlsWindow);
            var tCom = document.createElement('div')
            tCom.id='toggleContainer';
            var tSpanAll = document.createElement('span');
            tSpanAll.id = 'toggleContainerAll';
            tSpanAll.textContent = "All";
            var tSpanMan = document.createElement('span');
            tSpanMan.id = 'toggleContainerManaged';
            tSpanMan.textContent = "Known";
            var tSpanUnman = document.createElement('span');
            tSpanUnman.id = 'toggleContainerUnmanaged';
            tSpanUnman.textContent = "Unknown";
            controlsWindow.appendChild(tCom);
            tCom.appendChild(tSpanAll);
            tCom.appendChild(tSpanMan);
            tCom.appendChild(tSpanUnman);

          }
          controlsInit = true;

          svg = d3.select(anchor).append("svg")
              .attr("width", width)
              //.attr("width", height*2)
              .attr("height", height)
              //.attr("transform", "translate(" + 0 + "," + 0 + ")")
              //.attr("transform", "translate("+214 + "," + 0 + ")")
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
          var toggleContainer = document.querySelector('#toggleContainer');
          //toggleContainer.setAttribute('min-width',width-(height*2)+'px');
          var allToggle = toggleContainer.querySelector('#toggleContainerAll');
          var managedToggle = toggleContainer.querySelector('#toggleContainerManaged');
          var unmanagedToggle = toggleContainer.querySelector('#toggleContainerUnmanaged');

          allToggle.addEventListener('click', function(e){
            managedToggle.classList.remove('selected');
            unmanagedToggle.classList.remove('selected');
            allToggle.classList.add('selected');
            myCustomDataLibrary.setDataShowing("All");
            var newData = myCustomDataLibrary.getData(data, myCustomDataLibrary.getDataShowing());
            d3.selectAll('.missileLine').remove();
            myCustomD3Library.drawMissileLines(projection, svg, newData, anchorID, modalWindow, panelWindow);

          });
          managedToggle.addEventListener('click', function(e){
            allToggle.classList.remove('selected');
            unmanagedToggle.classList.remove('selected');
            managedToggle.classList.add('selected');
            myCustomDataLibrary.setDataShowing("Managed");
            var newData = myCustomDataLibrary.getData(data, myCustomDataLibrary.getDataShowing());
            d3.selectAll('.missileLine').remove();
            myCustomD3Library.drawMissileLines(projection, svg, newData, anchorID, modalWindow, panelWindow);
          });

          unmanagedToggle.addEventListener('click', function(e){
            allToggle.classList.remove('selected');
            managedToggle.classList.remove('selected');
            unmanagedToggle.classList.add('selected');
            myCustomDataLibrary.setDataShowing("Unmanaged");
            var newData = myCustomDataLibrary.getData(data, myCustomDataLibrary.getDataShowing());
            d3.selectAll('.missileLine').remove();
            myCustomD3Library.drawMissileLines(projection, svg, newData, anchorID, modalWindow, panelWindow);
          });




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

            myCustomD3Library.drawMissileLines(projection, svg, coordinatePairs, anchorID, modalWindow, panelWindow);
          }
        });
      })
