import { createLogger, format, transports } from 'winston'
import tty from 'tty'
import { SPLAT } from 'triple-beam'
import { highlight } from 'cli-highlight'
import { url as inspectorUrl } from 'inspector'

const { combine, json, timestamp, printf, splat, colorize, label } = format
Error.stackTraceLimit = Infinity

function formatForTTY (labels) {
  if (process.env.LOG_OUTPUT?.toLowerCase() !== 'json' && (tty.isatty(process.stdout.fd) || process.env.NODE_ENV?.toLowerCase() === 'development' || inspectorUrl())) {
    return combine(timestamp(), label({ label: labels }), colorize({ level: 'level' }), myFormat)
  } else {
    return combine(timestamp(), label({ label: labels }), splat(), json())
  }
}

const myFormat = printf(info => {
  let extraInfo = info[SPLAT]
  let highlightedInfo
  if (info[SPLAT]?.[0]?.trace?.readableStack) {
    extraInfo = info[SPLAT][0].trace.readableStack
    highlightedInfo = extraInfo
  } else {
    try {
      highlightedInfo = highlight(JSON.stringify(extraInfo), { language: 'javascript', ignoreIllegals: true })
    } catch (e) {
      highlightedInfo = extraInfo
    }
  }
  const additionalInfo = info[SPLAT] ? `- ${highlightedInfo}` : ''
  const labels = info.label ? `[${info.label}] ` : ''
  return `${info.timestamp} ${labels}${info.level}: ${info.message} ${additionalInfo}`
})

process.on('unhandledRejection', (err) => {
  console.log(err)
  exportLogger.error('Unhandled promise rejection', { trace: err })
})

function logger () {
  const ts = []
  ts.push(new transports.Console({
    timestamp: true,
    showLevel: true,
    format: formatForTTY(),
    level: process.env.LOG_LEVEL || 'info',
    stderrLevels: ['error']
  }))
  return createLogger({
    exitOnError: true,
    transports: ts
  })
}

const exportLogger = logger()

class Traces extends Error {
  constructor () {
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = this.constructor.name
    this.readableStack = this.stack
  }
}

// Add trace to warn/error invocations
Object.keys(exportLogger.constructor.prototype).forEach(func => {
  if (['warn', 'error'].includes(func)) {
    const original = exportLogger.constructor.prototype[func]
    if (typeof original === 'function') {
      exportLogger.constructor.prototype[func] = (name, data) => {
        if (!data) data = {}
        if (!data.trace) {
          data.trace = new Traces()
        }
        original(name, data)
      }
    }
  }
})

export default exportLogger
