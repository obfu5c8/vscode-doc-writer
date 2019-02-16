import { window, Disposable } from 'vscode';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

export interface Log extends Disposable{
    setLevel: (level: LogLevel) => void
    debug: (...args: any[]) => void
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
}


export default function createLog(name: string = 'Wiki Explorer', initialLogLevel: LogLevel = LogLevel.DEBUG): Log
{

    const output = window.createOutputChannel(name);

    let logLevel = initialLogLevel;

    const log: Log = {
        setLevel(level: LogLevel) {
            logLevel = level;
        },

        debug(...args: any[]) {
            output.appendLine(args.join(' '));
        },

        info(...args: any[]) {
            output.appendLine(args.join(' '));
        },

        warn(...args: any[]) {
            output.appendLine(args.join(' '));
        },

        error(...args: any[]) {
            output.appendLine(args.join(' '));
        },

        dispose() {

        }

    }

    return log;
}