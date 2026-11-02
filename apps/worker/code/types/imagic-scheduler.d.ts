// Declaration of the published imagic-scheduler@1.0.1 API (upstream currently ships JS).
declare module 'imagic-scheduler' {
    export interface SchedulerOptions {
        tickInterval?: number
        onError?: (name: string, error: Error) => void
        onTimeout?: (name: string) => void
    }
    export interface TaskOptions {
        interval: number
        timeout?: number
        runImmediately?: boolean
    }
    export interface TaskStatus {
        inProcess: boolean
        interval: number
        timeout: number
        nextExecuteTime: number
        runId: number
    }
    export class Scheduler {
        constructor(options?: SchedulerOptions)
        schedule(name: string, fn: () => Promise<void>, options: TaskOptions): this
        unschedule(name: string): this
        start(): this
        stop(): this
        isRunning(): boolean
        getStatus(): Record<string, TaskStatus>
    }
    export function createScheduler(options?: SchedulerOptions): Scheduler
    export default Scheduler
}
