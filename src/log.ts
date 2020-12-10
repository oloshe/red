type OFF = 0
type DEBUG = 1
type WARN = 2
type INFO = 3
type debugLevelType = OFF | DEBUG | WARN | INFO
let debugLevel: debugLevelType = 3
const RedMark = '🔴 '
const _logFactory = function (f: keyof Console, level: number) {
  return function (...args: any) {
    debugLevel >= level && (console[f] as Function).call(console, RedMark, ...args);
  }
}
export const log = _logFactory('log', 3);
export const warn = _logFactory('warn', 2);
export const error = _logFactory('error', 1);
export const setDebugLevel = function(level: debugLevelType) {
  debugLevel = level
}