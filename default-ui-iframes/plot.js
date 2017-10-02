const data = new Object();
data.x    = _.range(5);
data.y    = _.range(5);
data.type = "scatter";
data.mode = "markers";

const layout = new Object();
layout.margin = {l: 40, r: 10, b: 40, t: 10};
layout.xaxis  = {title: "time (s)"};
layout.yaxis  = {title: "capacitance (F)"};

const config = new Object();
config.showLink = false;
config.displaylogo = false;

const panel = new PhosphorWidgets.Panel();
const plotlyWidget = new PlotlyWidget({data: data, layout: layout, config: config});
panel.addWidget(plotlyWidget);

document.body.appendChild(panel.node);
$(document.body).css({position: "fixed", width:"100%", height: "100%"});
$(panel.node).css({position: "fixed", width:"100%", height: "100%"});
$(plotlyWidget.node).css({position: "fixed", width:"100%", height: "100%"});

function resize(e) {
    console.log(plotlyWidget);
    plotlyWidget._plotted = false;
    plotlyWidget.onResize(e);
    $(".js-plotly-plot").css({height: "100%"});
}
window.addEventListener('resize',resize.bind(this));
resize({width: window.innerWidth, height: window.innerHeight});

