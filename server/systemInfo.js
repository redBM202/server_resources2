const os = require('os');
const si = require('systeminformation');
const utils = require('./utils');

class SystemInfoCollector {
    constructor() {
        this.cache = null;
        this.lastCacheTime = 0;
        this.cacheTimeout = 1000;
    }

    async collect() {
        const now = Date.now();
        if (this.cache && (now - this.lastCacheTime < this.cacheTimeout)) {
            return this.cache;
        }

        try {
            const [osinfo, cpuLoad, memory, fsSize] = await Promise.all([
                si.osInfo(),
                si.currentLoad(),
                si.mem(),
                si.fsSize()
            ]);

            this.cache = {
                hostname: os.hostname(),
                osinfo: `${osinfo.distro} ${osinfo.release}`,
                cpu: cpuLoad.currentLoad.toFixed(2),
                memory: ((memory.active / memory.total) * 100).toFixed(2),
                memoryDetails: `${utils.formatMemory(memory.total)} / ${utils.formatMemory(memory.active)}`,
                memoryInMB: memory.active / (1024 * 1024),
                totalMemoryMB: memory.total / (1024 * 1024),
                uptime: utils.formatUptime(Math.floor(os.uptime())),
                disks: this.formatDisksInfo(fsSize)
            };

            this.lastCacheTime = now;
            return this.cache;
        } catch (error) {
            console.error('Error collecting system info:', error);
            throw error;
        }
    }

    formatDisksInfo(fsSize) {
        return fsSize.map(disk => ({
            fs: disk.fs,
            size: utils.formatBytes(disk.size),
            used: utils.formatBytes(disk.used),
            available: utils.formatBytes(disk.available),
            usePercent: disk.use.toFixed(1)
        }));
    }
}

module.exports = SystemInfoCollector;
