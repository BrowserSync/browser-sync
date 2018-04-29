const emojis = {
    trace: '🔍',
    debug: '🐛',
    info: '✨',
    warn: '⚠️',
    error: '🚨',
    fatal: '💀'
};

const levels = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60
};

const defaultColors = {
    foreground: '#d3c0c8',
    background: '#2d2d2d',
    black: '#2d2d2d',
    red: '#f2777a',
    green: '#99cc99',
    yellow: '#ffcc66',
    blue: '#6699cc',
    magenta: '#cc99cc',
    cyan: '#66cccc',
    white: '#d3d0c8',
    brightBlack: '#747369'
};

export class Nanologger {
    public _name: string;
    public _colors: { [index: string]: string };
    public logLevel: string;
    public _logLevel: string;

    constructor(public name: string, public opts) {
        this._name = name || '';
        this._colors = {
            ...defaultColors,
            ...(opts.colors || {})
        }
        try {
            this.logLevel = window.localStorage.getItem('logLevel') || 'info'
        } catch (e) {
            this.logLevel = 'info'
        }

        this._logLevel = levels[this.logLevel]
    }

    public trace() {
        var args = ['trace']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    public debug() {
        var args = ['debug']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    public info() {
        var args = ['info']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    public warn() {
        var args = ['warn']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    public error() {
        var args = ['error']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    public fatal() {
        var args = ['fatal']
        for (var i = 0, len = arguments.length; i < len; i++) args.push(arguments[i])
        this._print.apply(this, args)
    }

    private _print(level) {
        if (levels[level] < this._logLevel) return

        // var time = getTimeStamp()
        var emoji = emojis[level]
        var name = this._name || 'unknown'

        var msgColor = (level === 'error' || level.fatal)
            ? this._colors.red
            : level === 'warn'
                ? this._colors.yellow
                : this._colors.green

        var objs = []
        var args = [null]
        var msg = emoji + ' %c%s';

        // args.push(color(this._colors.brightBlack), time)
        args.push(color(this._colors.magenta), name)

        for (var i = 1, len = arguments.length; i < len; i++) {
            var arg = arguments[i]
            if (typeof arg === 'string') {
                if (i === 1) {
                    // first string argument is in color
                    msg += ' %c%s'
                    args.push(color(msgColor))
                    args.push(arg)
                } else if (/ms$/.test(arg)) {
                    // arguments finishing with 'ms', grey out
                    msg += ' %c%s'
                    args.push(color(this._colors.brightBlack))
                    args.push(arg)
                } else {
                    // normal colors
                    msg += ' %c%s'
                    args.push(color(this._colors.white))
                    args.push(arg)
                }
            } else if (typeof arg === 'number') {
                msg += ' %c%d'
                args.push(color(this._colors.magenta))
                args.push(arg)
            } else {
                objs.push(arg)
            }
        }

        args[0] = msg
        objs.forEach(function (obj) {
            args.push(obj)
        })

        // In IE/Edge console functions don't inherit from Function.prototype
        // so this is necessary to get all the args applied.
        Function.prototype.apply.apply(console.log, [console, args])
    }
}

function color(color) {
    return 'color: ' + color + ';'
}

function getTimeStamp() {
    var date = new Date()
    var hours = pad(date.getHours().toString())
    var minutes = pad(date.getMinutes().toString())
    var seconds = pad(date.getSeconds().toString())
    return hours + ':' + minutes + ':' + seconds
}

function pad(str) {
    return str.length !== 2 ? 0 + str : str
}
