if (!window.widgets) window.widgets = new Object();

// TODO: Find better method for inter-widget communication
window.eventHandler = new Object();
Object.assign(window.eventHandler, Backbone.Events);

eventHandler.on("plugin-loaded", (msg) => {
  // Load device view only when all dependent widges are loaded
  const name   = msg.name;
  const widget = msg.widget;
  const twoCanvas      = $(`<div id="two-canvas" style="position: absolute;"></div>`)[0];
  const container      = $(`<div id="container"></div>`)[0];
  const statsOutput    = $(`<div id="Stats-output"></div>`)[0];
  const controlHandles = $(`<svg id="controlHandles"></div>`)[0];
  window.widgets[name] = widget;

  if (!window.widgets.three) return;
  if (!window.widgets.dat) return;
  if (!window.widgets.electrode) return;

  container.appendChild(statsOutput);
  container.appendChild(controlHandles);
  document.body.appendChild(twoCanvas);
  document.body.appendChild(container);

  deviceView = new DeviceView(widgets.three, widgets.dat.gui);
  window.uicontroller = new UIController(deviceView);
});

class UIController extends MQTTClient {
  constructor(deviceView) {
    super("UIController");
    // TODO Bridge over DeviceUI into its own PluginController / MQTTClient
    this.deviceView = deviceView;
    this.device_ui_plugin = new DeviceUIPlugin(this.deviceView);
    this.device_ui_client = new MQTTClient("device-ui");
    this.device_ui_plugin.listen(this.device_ui_client);
    this.render();
  }

  listen() {
    this.onStateMsg("device-model", "device", this.onDeviceUpdated.bind(this));
    this.onStateMsg("electrodes-model", "electrodes", this.onElectrodeStatesSet.bind(this));
    this.onStateMsg("routes-model", "routes", this.onRoutesUpdated.bind(this));
  }

  render() {
    this.deviceView.update();
    requestAnimationFrame(this.render.bind(this));
  }

  get name() {return "ui-controller"}
  get device() {return this.device_ui_plugin.device}
  set device(data) {
    const prevDevice = this.device;
    const prevElectrodeStates = this.electrodeStates;
    const prevRoutes = this.routesAsDataFrame;
    const device = new Device(data);
    this.device_ui_plugin.setDevice(device);
    window.device = device;
    // If no previous device, then load stored electrode and route states
    if (prevElectrodeStates) {
      this.electrodeStates = prevElectrodeStates;
    }
    if (prevRoutes) this.routesAsDataFrame = prevRoutes;
  }

  onDeviceUpdated(payload) {
    const device = JSON.parse(payload);
    // XXX: Validate device exists in backend (not here)
    delete device.__head__;
    if (_.isEmpty(device)){
      console.warn("<UIPlugin>:: device object is empty", JSON.parse(payload));
      return;
    }
    this.device = device;
  }
  onElectrodeStatesSet(payload) {
    const data = JSON.parse(payload);
    this.device_ui_plugin.applyElectrodeStates(data);
  }
  onRoutesUpdated(payload) {
    const data = JSON.parse(payload);
    this.device_ui_plugin.setRoutes(data);
  }
}

class ThreeRenderer {
  static Widget(panel, dock, focusTracker) {
    const widget = new Widgets.ThreeRendererWidget();
    widget.title.label = "Device view";
    widget.title.closable = true;
    panel.addWidget(widget,  {mode: "tab-before", ref: dock});
    panel.activateWidget(widget);
    eventHandler.trigger("plugin-loaded", {name: "three", widget: widget});
    return widget;
  }
  static position() {
    /* topLeft, topRight, bottomLeft, or bottomRight */
    return "topLeft";
  }
}

class DatGui {
  static Widget(panel, dock, focusTracker) {
    const widget = new Widgets.DatGuiWidget({autoPlace: false});
    widget.title.label = "Options";
    widget.title.closable = true;
    panel.addWidget(widget,  {mode: "tab-before", ref: dock});
    panel.activateWidget(widget);

    eventHandler.trigger("plugin-loaded", {name: "dat", widget: widget});
    return widget;
  }
  static position() {
    /* topLeft, topRight, bottomLeft, or bottomRight */
    return "bottomRight";
  }
}

class ElectrodeSettings {
  static Widget(panel, dock, focusTracker) {
    const widget = new PhosphorWidgets.Widget();
    widget.addClass("content");
    widget.title.label = "Electrode Settings";
    widget.title.closable = true;
    panel.addWidget(widget,  {mode: "tab-before", ref: dock});
    panel.activateWidget(widget);
    eventHandler.trigger("plugin-loaded", {name: "electrode", widget: widget});
    return widget;
  }
  static position() {
    /* topLeft, topRight, bottomLeft, or bottomRight */
    return "topRight";
  }
}

class PlotWidget {
  static Widget(panel, dock, focusTracker){
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

    const widget = new PlotlyWidget({data: data, layout: layout, config: config});
    widget.title.label = "Plot";
    widget.title.closable = true;
    panel.addWidget(widget,  {mode: "tab-before", ref: dock});
    panel.activateWidget(widget);
    return widget;
  }
  static position() {
    return "bottomLeft";
  }
}

window.microdropPlugins.set("ThreeRenderer", ThreeRenderer);
window.microdropPlugins.set("DatGui", DatGui);
window.microdropPlugins.set("ElectrodeSettings", ElectrodeSettings);
window.microdropPlugins.set("PlotWidget", PlotWidget);
