/**
 *
 * Helper to abstract scroll events
 * http://yuilibrary.com/yui/docs/event/simulate.html
 * @param distance
 * @param cb
 */
var simulateScroll = function (distance, delay, cb) {

    /**
     *
     * Since iOS only sends scroll event when the touch has stopped, we need to simulate it here.
     *
     */
    if ("ontouchstart" in window) {


        YUI().use('node-event-simulate', function(Y) {

            var node = Y.one(window);
            node.simulateGesture("move", {
                path: {
                    xdist: 0,
                    ydist: distance
                } ,
                duration: 100
            });

            // For wrapping tests
            cb()

        });

    } else {

        window.scrollTo(0, distance);

        cb();
    }
}