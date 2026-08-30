using Toybox.Graphics;
using Toybox.WatchUi;

class TrailRideView extends WatchUi.View {
    var page = 0;
    var status = "Tap to find trails";
    var latitude = null;
    var longitude = null;
    var trails = [];
    var temperature = null;
    var wind = null;
    var precipitation = null;
    var rideScore = null;
    var service;

    function initialize() {
        View.initialize();
        service = new TrailRideService(self);
    }

    function onShow() {
        WatchUi.requestUpdate();
    }

    function onUpdate(dc) {
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);

        var cx = dc.getWidth() / 2;
        dc.drawText(cx, 34, Graphics.FONT_MEDIUM, "TRAILRIDE", Graphics.TEXT_JUSTIFY_CENTER);

        if (page == 0) {
            drawHome(dc, cx);
        } else if (page == 1) {
            drawTrails(dc, cx);
        } else {
            drawWeather(dc, cx);
        }
    }

    function drawHome(dc, cx) {
        dc.drawText(cx, 100, Graphics.FONT_SMALL, "VENU 3 LIVE", Graphics.TEXT_JUSTIFY_CENTER);

        if (latitude == null) {
            dc.drawText(cx, 168, Graphics.FONT_LARGE, "GPS", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 240, Graphics.FONT_SMALL, status, Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 305, Graphics.FONT_XTINY, "Tap to use your current location", Graphics.TEXT_JUSTIFY_CENTER);
        } else {
            dc.drawText(cx, 150, Graphics.FONT_MEDIUM, "LOCATION READY", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 215, Graphics.FONT_SMALL, trails.size() + " nearby trails", Graphics.TEXT_JUSTIFY_CENTER);
            if (rideScore != null) {
                dc.drawText(cx, 270, Graphics.FONT_LARGE, rideScore.format("%d") + " / 10", Graphics.TEXT_JUSTIFY_CENTER);
                dc.drawText(cx, 330, Graphics.FONT_XTINY, "Current Ride Score", Graphics.TEXT_JUSTIFY_CENTER);
            } else {
                dc.drawText(cx, 285, Graphics.FONT_SMALL, status, Graphics.TEXT_JUSTIFY_CENTER);
            }
        }
    }

    function drawTrails(dc, cx) {
        dc.drawText(cx, 88, Graphics.FONT_SMALL, "NEARBY TRAILS", Graphics.TEXT_JUSTIFY_CENTER);
        if (trails.size() == 0) {
            dc.drawText(cx, 175, Graphics.FONT_SMALL, status, Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 260, Graphics.FONT_XTINY, "Tap to refresh GPS", Graphics.TEXT_JUSTIFY_CENTER);
            return;
        }

        var y = 135;
        var maxRows = trails.size();
        if (maxRows > 5) { maxRows = 5; }
        for (var i = 0; i < maxRows; i += 1) {
            dc.drawText(cx, y, Graphics.FONT_SMALL, (i + 1) + ". " + trails[i], Graphics.TEXT_JUSTIFY_CENTER);
            y += 48;
        }
        dc.drawText(cx, 390, Graphics.FONT_XTINY, "Tap for weather • hold BACK to exit", Graphics.TEXT_JUSTIFY_CENTER);
    }

    function drawWeather(dc, cx) {
        dc.drawText(cx, 90, Graphics.FONT_SMALL, "RIDE CONDITIONS", Graphics.TEXT_JUSTIFY_CENTER);
        if (temperature == null) {
            dc.drawText(cx, 185, Graphics.FONT_SMALL, status, Graphics.TEXT_JUSTIFY_CENTER);
            return;
        }

        dc.drawText(cx, 145, Graphics.FONT_LARGE, temperature.format("%.0f") + "°F", Graphics.TEXT_JUSTIFY_CENTER);
        dc.drawText(cx, 215, Graphics.FONT_SMALL, "Wind " + wind.format("%.0f") + " mph", Graphics.TEXT_JUSTIFY_CENTER);
        dc.drawText(cx, 260, Graphics.FONT_SMALL, "Rain " + precipitation.format("%.2f") + " in", Graphics.TEXT_JUSTIFY_CENTER);
        if (rideScore != null) {
            dc.drawText(cx, 318, Graphics.FONT_LARGE, rideScore.format("%d") + " / 10", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 375, Graphics.FONT_XTINY, "Live Ride Score", Graphics.TEXT_JUSTIFY_CENTER);
        }
    }

    function refresh() {
        status = "Getting GPS fix...";
        trails = [];
        temperature = null;
        rideScore = null;
        WatchUi.requestUpdate();
        service.requestLocation();
    }

    function onLocationReady(lat, lon) {
        latitude = lat;
        longitude = lon;
        status = "Finding nearby trails...";
        WatchUi.requestUpdate();
    }

    function onTrailsReady(items) {
        trails = items;
        status = trails.size() > 0 ? "Trails loaded" : "No named trails found nearby";
        WatchUi.requestUpdate();
    }

    function onWeatherReady(temp, windMph, rainIn, score) {
        temperature = temp;
        wind = windMph;
        precipitation = rainIn;
        rideScore = score;
        status = "Live conditions loaded";
        WatchUi.requestUpdate();
    }

    function onServiceError(message) {
        status = message;
        WatchUi.requestUpdate();
    }

    function nextPage() {
        if (latitude == null) {
            refresh();
            return;
        }
        page = (page + 1) % 3;
        WatchUi.requestUpdate();
    }
}

class TrailRideInputDelegate extends WatchUi.BehaviorDelegate {
    var view;

    function initialize(v) {
        BehaviorDelegate.initialize();
        view = v;
    }

    function onSelect() {
        view.nextPage();
        return true;
    }

    function onTap(clickEvent) {
        view.nextPage();
        return true;
    }

    function onMenu() {
        view.refresh();
        return true;
    }
}
