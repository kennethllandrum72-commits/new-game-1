using Toybox.Application;
using Toybox.WatchUi;

class TrailRideApp extends Application.AppBase {
    function initialize() {
        AppBase.initialize();
    }

    function onStart(state) {
    }

    function onStop(state) {
    }

    function getInitialView() {
        var view = new TrailRideView();
        return [ view, new TrailRideInputDelegate(view) ];
    }
}

function getApp() as TrailRideApp {
    return Application.getApp() as TrailRideApp;
}
