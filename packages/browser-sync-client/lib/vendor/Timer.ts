/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
export class Timer {
    public running = false;
    public id: any;
    public _handler: any;

    constructor(public func) {
        this.id = null;
        this._handler = () => {
            this.running = false;
            this.id = null;
            return this.func();
        };
    }

    public start(timeout) {
        if (this.running) {
            clearTimeout(this.id);
        }
        this.id = setTimeout(this._handler, timeout);
        return (this.running = true);
    }

    public stop() {
        if (this.running) {
            clearTimeout(this.id);
            this.running = false;
            return (this.id = null);
        }
    }

    public static start(timeout, func) {
        setTimeout(func, timeout);
    }
}
