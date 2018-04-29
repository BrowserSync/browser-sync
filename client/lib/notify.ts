import { BehaviorSubject } from "rxjs/BehaviorSubject";

const styles = {
    display: "none",
    padding: "15px",
    fontFamily: "sans-serif",
    position: "fixed",
    fontSize: "0.9em",
    zIndex: 9999,
    right: 0,
    top: 0,
    borderBottomLeftRadius: "5px",
    backgroundColor: "#1B2032",
    margin: 0,
    color: "white",
    textAlign: "center",
    pointerEvents: "none"
};

/**
 * @param {IBrowserSyncOptions} options
 * @returns {BehaviorSubject<any>}
 */
export function initNotify(options) {
    let cssStyles = styles;
    let elem;

    if (options.notify.styles) {
        if (
            Object.prototype.toString.call(options.notify.styles) ===
            "[object Array]"
        ) {
            // handle original array behavior, replace all styles with a joined copy
            cssStyles = options.notify.styles.join(";");
        } else {
            for (var key in options.notify.styles) {
                if (options.notify.styles.hasOwnProperty(key)) {
                    cssStyles[key] = options.notify.styles[key];
                }
            }
        }
    }

    elem = document.createElement("DIV");
    elem.id = "__bs_notify__";

    if (typeof cssStyles === "string") {
        elem.style.cssText = cssStyles;
    } else {
        for (var rule in cssStyles) {
            elem.style[rule] = cssStyles[rule];
        }
    }

    return new BehaviorSubject(elem);
}
