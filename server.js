const express = require('express');
const os = require('os');
const si = require('systeminformation');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Copy Chart.js to public directory on server start
const chartJsSource = path.join(__dirname, 'node_modules/chart.js/dist/chart.min.js');
const chartJsDestDir = path.join(__dirname, 'public/scripts/lib');
const chartJsDest = path.join(chartJsDestDir, 'chart.min.js');

if (!fs.existsSync(chartJsDestDir)) {
    fs.mkdirSync(chartJsDestDir, { recursive: true });
}
fs.copyFileSync(chartJsSource, chartJsDest);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/system-info', async (req, res) => {
    try {
        const hostname = os.hostname();
        const osinfo = await si.osInfo();
        const kernel = osinfo.kernel;
        const uptime = os.uptime();

        const cpuLoad = await si.currentLoad();
        const memory = await si.mem();

        const cpuUsage = cpuLoad.currentLoad.toFixed(2);
        const memoryUsage = ((memory.active / memory.total) * 100).toFixed(2);

        res.json({
            hostname,
            osinfo: `${osinfo.distro} ${osinfo.release}`,
            kernel,
            cpu: cpuUsage,
            memory: memoryUsage,
            uptime: formatUptime(uptime)
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
        console.error('Error details:', error.message, error.stack);
        res.status(500).send('Internal Server Error');
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

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
