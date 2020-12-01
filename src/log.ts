const debugLevel = 0
const RedMark = '🔴 '
const emptyFn = () => { }
export const log = debugLevel > 0 ? console.log.bind(console, RedMark) : emptyFn
export const warn = debugLevel > 1 ? console.warn.bind(console, RedMark) : emptyFn
export const error = debugLevel > 2 ? console.error.bind(console, RedMark) : emptyFn