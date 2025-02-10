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
    
    // Return cached data if available and fresh
    if (cachedSystemInfo && (now - lastCacheTime < cacheTimeout)) {
        return res.json(cachedSystemInfo);
    }

    try {
        const hostname = os.hostname();
        const osinfo = await si.osInfo();
        const uptime = os.uptime();

        const cpuLoad = await si.currentLoad();
        const memory = await si.mem();

        const cpuUsage = cpuLoad.currentLoad.toFixed(2);
        const memoryUsage = ((memory.active / memory.total) * 100).toFixed(2);
        
        // Format memory values
        const formatMemory = (bytes) => {
            const mb = bytes / (1024 * 1024);
            return mb >= 1024 
                ? (mb / 1024).toFixed(2) + ' GB'
                : mb.toFixed(2) + ' MB';
        };

        const activeMemory = formatMemory(memory.active);
        const totalMemory = formatMemory(memory.total);

        // Add disk information
        const fsSize = await si.fsSize();
        const diskInfo = fsSize.map(disk => ({
            fs: disk.fs,
            size: formatBytes(disk.size),
            used: formatBytes(disk.used),
            available: formatBytes(disk.available),
            usePercent: disk.use.toFixed(1)
        }));

        // Cache the response
        cachedSystemInfo = {
            hostname,
            osinfo: osinfo ? `${osinfo.distro} ${osinfo.release}` : 'OS Info not available',
            cpu: cpuUsage,
            memory: memoryUsage,
            memoryDetails: `${totalMemory} / ${activeMemory}`,
            memoryInMB: memory.active / (1024 * 1024),
            totalMemoryMB: memory.total / (1024 * 1024),
            uptime: formatUptime(Math.floor(uptime)),
            disks: diskInfo
        };
        lastCacheTime = now;
        
        res.json(cachedSystemInfo);
    } catch (error) {
        console.error('Error fetching system info:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
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
