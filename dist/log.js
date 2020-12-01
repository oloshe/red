var debugLevel = 0;
var RedMark = '🔴 ';
var emptyFn = function () { };
export var log = debugLevel > 0 ? console.log.bind(console, RedMark) : emptyFn;
export var warn = debugLevel > 1 ? console.warn.bind(console, RedMark) : emptyFn;
export var error = debugLevel > 2 ? console.error.bind(console, RedMark) : emptyFn;
