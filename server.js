const express = require('express');
const os = require('os');
const si = require('systeminformation');

const app = express();
const port = 3000;

app.get('/api/system-info', async (req, res) => {
    try {
        const hostname = os.hostname();
        const osinfo = `${os.type()} ${os.release()}`;
        const kernel = os.version();
        const uptime = os.uptime();

        const cpuLoad = await si.currentLoad();
        const memory = await si.mem();

        const cpuUsage = cpuLoad.currentLoad.toFixed(2);
        const memoryUsage = ((memory.active / memory.total) * 100).toFixed(2);

        res.json({
            hostname,
            osinfo,
            kernel,
            cpu: cpuUsage,
            memory: memoryUsage,
            uptime: formatUptime(uptime)
        });
    } catch (error) {
        console.error('Error fetching system info:', error);
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
