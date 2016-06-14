var colors = require('colors/safe')
var jsdiff = require('diff');
var Readable = require('stream').Readable;
var inherits = require('util').inherits;

function DiffColorStream (expected, actual, opts) {
    Readable.call(this);
    var diff = jsdiff.diffJson(expected, actual);
    var enter = ''
    opts = opts || {}

    colors.setTheme({
        actual: opts.expected || 'red',
        expected: opts.actual || 'green',
        equal: opts.correct || 'white'
    });
    this.push(colors.expected('+ expected'));
    this.push(' ');
    this.push(colors.actual('- actual\n\n'));

    diff.forEach(function (part) {
        var value = part.value
        var theme = 'equal'
        var ch = enter
        if (part.added) {
            ch += '-'
            theme = 'actual'
        } else if (part.removed) {
            ch += '+'
            theme = 'expected'
        }
        if (ch) {
            if (value[0] === ' ') {
                value = ch + value.slice(1)
            } else {
                enter = value.slice(-1) !== '\n' && diff.length === 2 ? '\n' : ''
                value = ch + '\n' + value
            }
        }
        this.push(colors[theme](value));
    }, this);
    this.push('\n\n')
    this.push(null)
}

inherits(DiffColorStream, Readable);

var one = {a: {b: 5}};
var other = {a: {b: 3}};

new DiffColorStream(one, other).pipe(process.stderr)
