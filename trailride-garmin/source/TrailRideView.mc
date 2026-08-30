using Toybox.Graphics;
using Toybox.WatchUi;

class TrailRideView extends WatchUi.View {
    var page = 0;

    function initialize() {
        View.initialize();
    }

    function onUpdate(dc) {
        dc.setColor(Graphics.COLOR_BLACK, Graphics.COLOR_BLACK);
        dc.clear();
        dc.setColor(Graphics.COLOR_WHITE, Graphics.COLOR_TRANSPARENT);

        var cx = dc.getWidth() / 2;
        dc.drawText(cx, 42, Graphics.FONT_MEDIUM, "TRAILRIDE", Graphics.TEXT_JUSTIFY_CENTER);

        if (page == 0) {
            dc.drawText(cx, 118, Graphics.FONT_SMALL, "Venu 3", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 175, Graphics.FONT_LARGE, "READY", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 260, Graphics.FONT_SMALL, "Tap to view nearby trails", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 310, Graphics.FONT_XTINY, "Ride Score • Weather • Trails", Graphics.TEXT_JUSTIFY_CENTER);
        } else if (page == 1) {
            dc.drawText(cx, 105, Graphics.FONT_SMALL, "NEARBY TRAILS", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 165, Graphics.FONT_MEDIUM, "Standing Boy", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 220, Graphics.FONT_LARGE, "8 / 10", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 288, Graphics.FONT_SMALL, "Ride Score", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 340, Graphics.FONT_XTINY, "Tap for next trail", Graphics.TEXT_JUSTIFY_CENTER);
        } else {
            dc.drawText(cx, 105, Graphics.FONT_SMALL, "TRAIL DETAILS", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 165, Graphics.FONT_MEDIUM, "Flat Rock Park", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 220, Graphics.FONT_SMALL, "9.3 mi • MTB", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 270, Graphics.FONT_LARGE, "7 / 10", Graphics.TEXT_JUSTIFY_CENTER);
            dc.drawText(cx, 335, Graphics.FONT_XTINY, "Weather sync coming next", Graphics.TEXT_JUSTIFY_CENTER);
        }
    }

    function nextPage() {
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
}
