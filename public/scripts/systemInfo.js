import utils from './utils.js';

class SystemMonitor {
    constructor(charts) {
        this.charts = charts;
        this.updateInterval = 2000;
        this.lastUpdate = 0;
    }

    async fetchData() {
        try {
            const response = await fetch('/api/system-info');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching system info:', error);
            return null;
        }
    }

    updateUI(data) {
        if (!data) return;

        const elements = {
            'hostname': data.hostname,
            'osinfo': data.osinfo,
            'cpu': data.cpu + '%',
            'memory': data.memory + '%',
            'memory-details': data.memoryDetails,
            'uptime': data.uptime
        };

        for (const [id, value] of Object.entries(elements)) {
            utils.updateDOMElement(id, value);
        }

        const timestamp = new Date();
        this.charts.update('cpu', timestamp, parseFloat(data.cpu));
        this.charts.update('memory', timestamp, data.memoryInMB);

        // Update disk info
        if (data.disks) {
            this.updateDiskInfo(data.disks);
        }
    }

    updateDiskInfo(disks) {
        const diskInfoContainer = document.getElementById('disk-info');
        if (!diskInfoContainer) return;

        requestAnimationFrame(() => {
            diskInfoContainer.innerHTML = disks.map(disk => `
                <div class="disk-item">
                    <div class="info-label">${disk.fs}</div>
                    <div class="disk-progress">
                        <div class="disk-progress-bar" style="width: ${disk.usePercent}%"></div>
                    </div>
                    <div class="disk-details">
                        <span>${disk.used} used</span>
                        <span>${disk.available} free</span>
                    </div>
                    <div class="disk-details">
                        <span>Total: ${disk.size}</span>
                        <span>${disk.usePercent}%</span>
                    </div>
                </div>
            `).join('');
        });
    }

    start() {
        this.fetchAndUpdate();
        this.interval = setInterval(() => this.fetchAndUpdate(), this.updateInterval);
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                clearInterval(this.interval);
            } else {
                this.start();
            }
        });
    }

    async fetchAndUpdate() {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        this.lastUpdate = now;
        const data = await this.fetchData();
        this.updateUI(data);
    }
}

export default SystemMonitor;
