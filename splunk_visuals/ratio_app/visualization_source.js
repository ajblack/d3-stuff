
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3',
            'ratioAppD3Library.js'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3,
            rAD3
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.addClass('splunk-ratio_app');
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
          console.log('original data: ');
          console.log(data);
          var data = data;
          if(data.fields[0] == undefined || data.fields[0].name !== 'total_assets'){
            console.log('data doesnt match schema so making dummy data');
            data = {
              "fields":
              [
                {"name":"total_assets"},
                {"name":"total_man_assets"},
                {"name":"total_unman_assets"}
              ],
              "rows":
              [
                ['26','8','18']
              ]
            }
          }

          console.log('new data: ');
          console.log(data);

          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          anchor.classList.add('mySvgContainer');
          $(anchor).empty();
          var totalAssets = data.rows[0][0];
          var manAssets = data.rows[0][1];
          var unmanAssets = data.rows[0][2];



          myRatioAppD3Library.addComponents(anchor, data);


          myRatioAppD3Library.createModal(anchor);
          var modalDiv =  anchor.querySelector('.circle-hover-modal');

          var handleMouseMove = function(e){
            var modalDiv =  anchor.querySelector('.circle-hover-modal');
            modalDiv.style.top = e.clientY-10+'px';
            modalDiv.style.left = e.clientX+20+'px';
          }

          var svgContainer = d3.select(anchor).select('.circleContainer').append("svg")
            .attr("width", 200)
            .attr("height", 200)
            .attr('class', 'circleContainer')
            .append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");

          var scale = d3.scaleLinear()
            .domain([0,totalAssets])
            .range([0,100]);

          var totalAssetJson =
          {
            "radius": totalAssets,
            "num": totalAssets,
            "class": "totalAssetCircle",
            "text": 'Total Assets'
          },
          manAssetJson =
          {
            "radius": manAssets,
            "num": manAssets,
            "class": "manAssetCircle",
            "text":"Known Assets"
          },
          unmanAssetJson =
          {
            "radius": unmanAssets,
            "num": unmanAssets,
            "class": "unmanAssetCircle",
            "text": 'Unknown Assets'
          };
          /*
          this logic ensures that the circles are added to the view in order from largest to smallest
          this makes it easy to register hover events that will hit the smallest ones since they will be up in DOM
          */
          var jsonCircles =[totalAssetJson];
          if(parseInt(manAssets) > parseInt(unmanAssets)){
            jsonCircles.push(manAssetJson, unmanAssetJson);
          }
          else{
            jsonCircles.push(unmanAssetJson, manAssetJson);
          }

          var circles = svgContainer.selectAll("circle")
            .data(jsonCircles)
            .enter()
            .append("circle");

          var circleAttributes = circles
            .attr("r", function(d) {
              return scale(d.radius);
            })
            .attr("class", function(d) {
              return d.class
            })
            .attr("data-num", function(d){
              return d.num
            })
            .on('mouseover', function(d){
              this.classList.add('hovered');
              modalDiv.classList.add('hovered');
              anchor.querySelector(".circle-hover-modal-detail").textContent = d.text+": "+d.num;
              this.addEventListener('mousemove',handleMouseMove);
            })
            .on('mouseleave', function(d){
              this.classList.remove('hovered');
              modalDiv.classList.remove('hovered');
              this.removeEventListener('mousemove',handleMouseMove);
            });

          d3.select(anchor).select(".totalAssetCircle")
            .attr('class', 'totalAsset');

          d3.select(anchor).select(".unmanAssetCircle")
            .attr("class", "unmanAsset")
            .attr("cx", function(d) {
              return -Math.sqrt(Math.pow(100-scale(unmanAssets),2)/2);
            })
            .attr("cy", function(d) {
              return -Math.sqrt(Math.pow(100-scale(unmanAssets),2)/2);
            });
          //radius of large circle - radius of small circle is hypotenuse in equation
          d3.select(anchor).select(".manAssetCircle")
            .attr("class", "manAsset")
            .attr("cx", function(d) {
              return -Math.sqrt(Math.pow(100-scale(manAssets),2)/2);
            })
            .attr("cy", function(d) {
              return -Math.sqrt(Math.pow(100-scale(manAssets),2)/2);
            });
          }
      });
    })
