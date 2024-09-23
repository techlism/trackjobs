class RateLimiter {
    windowSize: number;
    maxRequests: number;
    idToWindows: Map<string, Array<number>>;

    constructor(config: { windowSize: number; maxRequests: number }) {
        this.windowSize = config.windowSize;
        this.maxRequests = config.maxRequests;
        this.idToWindows = new Map<string, Array<number>>();
    }

    limit(id: string) {
        const now = Date.now();

        // get queue or initialize it
        let queue = this.idToWindows.get(id);
        if (!queue) {
            queue = [];
            this.idToWindows.set(id, queue);
        }

        // clear old windows
        while (queue.length > 0 && now - queue[0] > this.windowSize) {
            queue.shift();
        }

        if (queue.length >= this.maxRequests) return true;

        // add current window to queue
        queue.push(now);

        return false;
    }
}

export { RateLimiter };