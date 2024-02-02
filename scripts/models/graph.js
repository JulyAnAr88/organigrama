const express = require('express');
const router = express.Router();

module.exports = {

    initMyChart(getElementById, json, layoutGraph) {
        // Initialize the echarts instance based on the prepared dom
        var myChart = echarts.init(getElementById);

        // Specify the configuration items and data for the chart

        myChart.showLoading();
        $.getJSON(json, function (graph) {
            option = getJSON(graph, myChart, layoutGraph)
            // Display the chart using the configuration items and data just specified.
            myChart.setOption(option);
        }
        );
    },

    getJSON(graph, myChart, layout) {

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
                    orient: 'vertical',
                    right: 'right',
                    top: 'middle',
                    data: graph.categories.map(function (a) {
                        return a.name;
                    })
                }
            ],
            series: [
                {
                    //name: 'Organigrama de la estructura municipal',
                    type: 'graph',
                    layout: layout,
                    symbol: 'circle',
                    emphasis: {
                        focus: 'series'
                    },
                    data: graph.nodes,
                    links: graph.links,
                    categories: graph.categories,
                    roam: true,
                    label: {
                        show: false,
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
                        gravity: 0.5,
                        repulsion: 30,
                        edgeLength: 15
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
        return option
    },
}

module.exports = router;