const express = require('express');
const os = require('os');
const si = require('systeminformation');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Copy Chart.js files to public directory on server start
const files = [
    {
        src: path.join(__dirname, 'node_modules/chart.js/dist/chart.min.js'),
        dest: 'chart.min.js'
    },
    {
        src: path.join(__dirname, 'node_modules/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js'),
        dest: 'chartjs-adapter-date-fns.bundle.min.js'
    }
];

const libDir = path.join(__dirname, 'public/scripts/lib');
if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
}

files.forEach(file => {
    fs.copyFileSync(file.src, path.join(libDir, file.dest));
});

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Add cache variables
let cachedSystemInfo = null;
let lastCacheTime = 0;
const cacheTimeout = 1000; // 1 second cache

app.get('/api/system-info', async (req, res) => {
    const now = Date.now();
    
    if (cachedSystemInfo && (now - lastCacheTime < cacheTimeout)) {
        return res.json(cachedSystemInfo);
    }

    try {
        const [osinfo, cpuLoad, memory, fsSize] = await Promise.all([
            si.osInfo(),
            si.currentLoad(),
            si.mem(),
            si.fsSize()
        ]);

        const cpuUsage = cpuLoad.currentLoad.toFixed(2);
        const memoryUsage = ((memory.active / memory.total) * 100).toFixed(2);
        
        const formatMemory = (bytes) => {
            const gb = bytes / (1024 * 1024 * 1024);
            return gb.toFixed(2) + ' GB';
        };

        cachedSystemInfo = {
            hostname: os.hostname(),
            osinfo: osinfo ? `${osinfo.distro} ${osinfo.release}` : 'OS Info not available',
            cpu: cpuUsage,
            memory: memoryUsage,
            memoryDetails: `${formatMemory(memory.active)} / ${formatMemory(memory.total)}`,
            memoryInMB: memory.active / (1024 * 1024),
            totalMemoryMB: memory.total / (1024 * 1024),
            uptime: formatUptime(Math.floor(os.uptime())),
            disks: fsSize.map(disk => ({
                fs: disk.fs,
                size: formatBytes(disk.size),
                used: formatBytes(disk.used),
                available: formatBytes(disk.available),
                usePercent: disk.use.toFixed(1)
            }))
        };

        lastCacheTime = now;
        res.json(cachedSystemInfo);
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

function formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['B', 'MB', 'GB', 'TB'];
    
    // Calculate the size in GB first
    const sizeInGB = bytes / (Math.pow(k, 3));
    
    // If size is less than 1024 GB, show in GB
    if (sizeInGB < 1024) {
        return sizeInGB.toFixed(2) + ' GB';
    }
    
    // If truly bigger than 1024 GB, show in TB
    return (sizeInGB / 1024).toFixed(2) + ' TB';
}

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
