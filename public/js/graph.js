// Initialize the echarts instance based on the prepared dom
var myChart = echarts.init(document.getElementById('.orgraph'));

// Specify the configuration items and data for the chart


myChart.showLoading();
$.getJSON('/json/organigrama.json', function (graph) {
  myChart.hideLoading();
  graph.nodes.forEach(function (node) {
    node.label = {
      show: node.symbolSize > 30
    };
  });
option = {
  tooltip: {},
  legend: [
    {
      data: graph.categories.map(function (a) {
        return a.name;
      })
    }
  ],
  series: [
    {
      //name: 'Organigrama',
      type: 'graph',
      layout: 'force',
      data: graph.nodes,
      links: graph.links,
      categories: graph.categories,
      roam: true,
      label: {
        show: true,
        position: 'center',
        formatter: '{b}'
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            icon: {
              zoom: 'path://',
              back: 'path://',
            },
          },
          saveAsImage: {},
        }
      },
      force: {
        //initLayout: 'star',
        //gravity: 0.5,
        repulsion: 500,
        edgeLength: 5
      },
      labelLayout: {
        hideOverlap: false
      },
      scaleLimit: {
        min: 0.6,
        max: 3
      },
      lineStyle: {
        color: 'source',
        curveness: 0.3
      }
    }
  ]
};

// Display the chart using the configuration items and data just specified.
myChart.setOption(option);
});