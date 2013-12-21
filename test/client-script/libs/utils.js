function fireEvent(obj,evt){

    var evObj;
    var fireOnThis = obj;
    if( document.createEvent ) {
        evObj = document.createEvent("MouseEvents");
        evObj.initEvent( evt, true, false );
        fireOnThis.dispatchEvent( evObj );

    } else if( document.createEventObject ) {
        evObj = document.createEventObject();
        fireOnThis.fireEvent( "on" + evt, evObj );
    }
}

var appendsHost = true;
(function () {
    var elem = document.createElement("link");

    elem.href= "/style.css";

    if (!/^http:\/\//.test(elem.href)) {
        appendsHost = false;
    }

})();

function wrapUrl(url) {
    if (!appendsHost) {
        return url;
    }
    return "http://" + window.location.host + "/" + url;
}