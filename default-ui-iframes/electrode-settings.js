class ElectrodeSettingsPlugin extends UIPlugin {
    constructor(elem, focusTracker){
        super(elem, focusTracker, "ElectrodeSettings");
        this.listen();
    }
    listen() {
        this.onSignalMsg("dmf-device-ui", "electrode-info", 
            this.onElectrodeInfoReceived.bind(this));
    }
    onElectrodeInfoReceived(payload) {
        this.element.innerHTML = JSON.parse(payload).template;
    }
};

window.widgets.electrode = new PhosphorWidgets.Widget();
window.electrodeSettings = new ElectrodeSettingsPlugin(document.body);
