
define([
            'jquery',
            'underscore',
            'api/SplunkVisualizationBase',
            'api/SplunkVisualizationUtils',
            'd3'
        ],
        function(
            $,
            _,
            SplunkVisualizationBase,
            SplunkVisualizationUtils,
            d3
        ) {

    return SplunkVisualizationBase.extend({

        initialize: function() {
            // Save this.$el for convenience
            this.$el = $(this.el);

            // Add a css selector class
            this.$el.addClass('splunk-real_time_app');
            //this.isInitializedDom = false;
        },

        formatData: function(data){
          return data;
        },

        getInitialDataParams: function() {
            return ({
                outputMode: SplunkVisualizationBase.COLUMN_MAJOR_OUTPUT_MODE,
                count: 10000
            });
        },

        updateView: function(data, config) {
          this.$el.empty();
          //this is the original world map viz with 4 set points
          var anchor = this.el;
          //anchor.classList.add('mySvgContainer');
          $(anchor).empty();

          var data =
          {
            "fields":
            [
              {"name": "_time"},
              {"name": "10.42.4.135"},
              {"name": "10.42.4.21"},
              {"name": "10.42.4.228"}
            ],
            "columns":
            [
              ["2017-06-12 17:07:45","2017-06-12 17:07:50","2017-06-12 17:07:55","2017-06-12 17:08:00","2017-06-12 17:08:05","2017-06-12 17:08:10"],
              ['0','1','0','3','2','3'],
              ['1','2','2','0','1','4'],
              ['3','1','1','1','2','1']
            ]
          };


          var newD = [];

          for(var j=1;j<data.fields.length;j++){
            var vals = [];
            for(var g=0;g<data.columns[0].length;g++){
              vals.push({"time":data.columns[0][g], "metric":data.columns[j][g]});
            }
            var r = {'ip':data.fields[j].name, 'values':vals};
            newD.push(r)
          }
          data = newD;
          console.log('data is: ');
          console.log(newD);

          /*
          data =
          [
          {
          "ip":"10.42.4.135",
          "values":
          [
            {"time":"2017-06-12 17:07:45","metric":"0"},
            {"time":"20111001","metric":"0"},
            {"time":"2017-06-12 17:07:50","metric":"1"},
            {"time":"2017-06-12 17:07:55","metric":"0"},
            {"time":"2017-06-12 17:08:00","metric":"3"},
            {"time":"2017-06-12 17:08:05","metric":"2"},
            {"time":"2017-06-12 17:08:10","metric":"3"}
          ]
          },
          {
          "ip":"10.42.4.21",
          "values":
          [
            {"time":"2017-06-12 17:07:45","metric":"1"},
            {"time":"2017-06-12 17:07:50","metric":"2"},
            {"time":"2017-06-12 17:07:55","metric":"2"},
            {"time":"2017-06-12 17:08:00","metric":"0"},
            {"time":"2017-06-12 17:08:05","metric":"1"},
            {"time":"2017-06-12 17:08:10","metric":"4"}
          ]
          },
          {
          "ip":"10.42.4.228",
          "values":
          [
            {"time":"2017-06-12 17:07:45","metric":"3"},
            {"time":"2017-06-12 17:07:50","metric":"1"},
            {"time":"2017-06-12 17:07:55","metric":"1"},
            {"time":"2017-06-12 17:08:00","metric":"1"},
            {"time":"2017-06-12 17:08:05","metric":"2"},
            {"time":"2017-06-12 17:08:10","metric":"1"}
          ]
          }
          ];
          */

          var width = 960, height = 500;

          var svg = d3.select(anchor).append('svg')
          .attr('width', width)
          .attr('height', height);
          var margin = {top: 20, right: 80, bottom: 30, left: 50},
          width = svg.attr("width") - margin.left - margin.right,
          height = svg.attr("height") - margin.top - margin.bottom,
          g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var x = d3.scaleTime().range([0, width]),
          y = d3.scaleLinear().range([height, 0]),
          z = d3.scaleOrdinal(d3.schemeCategory10);


          var minD = new Date(data[0].values[0].time)
          var maxD = new Date(data[0].values[data[0].values.length-1].time)
          x.domain([minD, maxD]);


          y.domain([
          d3.min(data, function(c) {
          return d3.min(c.values, function(d) {
          return d.metric;
          });
          }),
          d3.max(data, function(c) {
          return d3.max(c.values, function(d) {
           return d.metric;
          });
          })
          ]);

          z.domain(data.map(function(c) { return c.ip; }));

          var line = d3.line()
          .curve(d3.curveBasis)
          .x(function(d) { console.log(x(new Date(d.time)));return x(new Date(d.time)); })
          .y(function(d) { console.log(y(d.metric));return y(d.metric); });



          var xAxis = d3.axisBottom(x)
          var yAxis = d3.axisLeft(y);
          yAxis.ticks(y.domain()[1]-y.domain()[0]);


          g.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

          g.append("g")
          .attr("class", "axis axis--y")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          //.attr("y", 6)
          .attr("dy", "0.71em")
          .attr("fill", "#000")

          .text("Num Occurences");

          var city = g.selectAll(".city")
          .data(data)
          .enter().append("g")
          .attr("class", "city");


          city.append("path")
          .attr("class", "line")
          .attr("d", function(d) { return line(d.values); })
          .style("stroke", function(d) { return z(d.ip); });

          city.append("text")
          .datum(function(d) {return {ip: d.ip, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(new Date(d.value.time)) + "," + y(d.value.metric) + ")"; })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px sans-serif")
          .text(function(d) { return d.ip; });
        }
      });
    })
