using Toybox.Position;
using Toybox.Communications;
using Toybox.WatchUi;
using Toybox.System;

class TrailRideService {
    var view;
    var lat = null;
    var lon = null;

    function initialize(v) {
        view = v;
    }

    function requestLocation() {
        try {
            Position.enableLocationEvents(Position.LOCATION_ONE_SHOT, method(:onPosition));
        } catch (e) {
            view.onServiceError("GPS unavailable");
        }
    }

    function onPosition(info) {
        if (info == null || info.position == null) {
            view.onServiceError("No GPS fix");
            return;
        }

        var d = info.position.toDegrees();
        lat = d[0];
        lon = d[1];
        view.onLocationReady(lat, lon);
        requestTrails();
        requestWeather();
    }

    function requestTrails() {
        var query = "[out:json][timeout:15];(" +
            "way(around:30000," + lat + "," + lon + ")[\"name\"][\"highway\"~\"path|cycleway|track\"][\"bicycle\"!~\"no\"];" +
            "relation(around:30000," + lat + "," + lon + ")[\"name\"][\"route\"=\"bicycle\"];" +
            ");out center 20;";

        var params = { "data" => query };
        var options = {
            :method => Communications.HTTP_REQUEST_METHOD_GET,
            :headers => { "Accept" => "application/json" },
            :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON
        };

        Communications.makeWebRequest(
            "https://overpass-api.de/api/interpreter",
            params,
            options,
            method(:onTrailsResponse)
        );
    }

    function onTrailsResponse(code, data) {
        if (code != 200 || data == null) {
            view.onServiceError("Trail search needs phone data");
            return;
        }

        var names = [];
        var elements = data["elements"];
        if (elements != null) {
            for (var i = 0; i < elements.size(); i += 1) {
                var e = elements[i];
                if (e == null) { continue; }
                var tags = e["tags"];
                if (tags == null) { continue; }
                var name = tags["name"];
                if (name == null) { continue; }

                var duplicate = false;
                for (var j = 0; j < names.size(); j += 1) {
                    if (names[j] == name) {
                        duplicate = true;
                        break;
                    }
                }
                if (!duplicate) {
                    names.add(name);
                }
                if (names.size() >= 6) { break; }
            }
        }
        view.onTrailsReady(names);
    }

    function requestWeather() {
        var params = {
            "latitude" => lat,
            "longitude" => lon,
            "current" => "temperature_2m,precipitation,wind_speed_10m",
            "temperature_unit" => "fahrenheit",
            "wind_speed_unit" => "mph",
            "precipitation_unit" => "inch"
        };
        var options = {
            :method => Communications.HTTP_REQUEST_METHOD_GET,
            :headers => { "Accept" => "application/json" },
            :responseType => Communications.HTTP_RESPONSE_CONTENT_TYPE_JSON
        };

        Communications.makeWebRequest(
            "https://api.open-meteo.com/v1/forecast",
            params,
            options,
            method(:onWeatherResponse)
        );
    }

    function onWeatherResponse(code, data) {
        if (code != 200 || data == null) {
            return;
        }

        var current = data["current"];
        if (current == null) { return; }

        var temp = current["temperature_2m"];
        var rain = current["precipitation"];
        var windMph = current["wind_speed_10m"];
        if (temp == null || rain == null || windMph == null) { return; }

        var score = 10;
        if (temp < 35 || temp > 95) { score -= 3; }
        else if (temp < 45 || temp > 88) { score -= 2; }
        else if (temp < 52 || temp > 82) { score -= 1; }

        if (windMph > 25) { score -= 3; }
        else if (windMph > 18) { score -= 2; }
        else if (windMph > 12) { score -= 1; }

        if (rain > 0.15) { score -= 4; }
        else if (rain > 0.03) { score -= 2; }
        else if (rain > 0) { score -= 1; }

        if (score < 1) { score = 1; }
        view.onWeatherReady(temp, windMph, rain, score);
    }
}
