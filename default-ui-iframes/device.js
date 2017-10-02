const threeWidget = new Widgets.ThreeRendererWidget();
const datWidget   = new Widgets.DatGuiWidget({autoPlace: false});

document.body.appendChild(threeWidget.node);
document.body.appendChild(datWidget.node);


const twoCanvas      = $(`<div id="two-canvas" style="position: absolute;"></div>`)[0];
const container      = $(`<div id="container"></div>`)[0];
const statsOutput    = $(`<div id="Stats-output"></div>`)[0];
const controlHandles = $(`<svg id="controlHandles"></div>`)[0];

container.appendChild(statsOutput);
container.appendChild(controlHandles);
document.body.appendChild(twoCanvas);
document.body.appendChild(container);

const deviceView = new DeviceView(threeWidget, datWidget.gui);
const uicontroller = new UIController(deviceView);

$(threeWidget.node).css({overflow: "visible"});
$(threeWidget.canvas).css({position: "fixed", width: "100%", height: "100%"})
$(datWidget.node).css({ position: "fixed", left: "100%", marginLeft: "-119px"});

window.addEventListener( 'resize', resize, false );

function resize(){
    threeWidget.camera.aspect = window.innerWidth / window.innerHeight;
    threeWidget.camera.updateProjectionMatrix();
    threeWidget.renderer.setSize( window.innerWidth, window.innerHeight );
}

resize();