import utils from './utils.js';

class SystemCharts {
    constructor() {
        this.charts = {};
        this.maxPoints = 30;
        this.totalMemoryGB = 0;
    }

    initialize() {
        const commonConfig = {
            type: 'line',
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { display: false }
                },
                elements: {
                    point: { radius: 0 },
                    line: { tension: 0.3 }
                }
            }
        };

        // Initialize empty data arrays
        this.timeLabels = Array(this.maxPoints).fill('').map((_, i) => new Date(Date.now() - (this.maxPoints - 1 - i) * 1000));
        this.cpuData = Array(this.maxPoints).fill(0);
        this.memoryData = Array(this.maxPoints).fill(0);

        this.initCPUChart(commonConfig);
        this.initMemoryChart(commonConfig);
    }

    initCPUChart(commonConfig) {
        const ctx = document.getElementById('cpuChart');
        if (!ctx) return;

        this.charts.cpu = new Chart(ctx, {
            ...commonConfig,
            data: {
                labels: [...this.timeLabels],
                datasets: [{
                    data: [...this.cpuData],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...commonConfig.options,
                scales: {
                    x: { display: false },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: { callback: value => value + '%' }
                    }
                }
            }
        });
    }

    initMemoryChart(commonConfig) {
        const ctx = document.getElementById('memoryChart');
        if (!ctx) return;

        this.charts.memory = new Chart(ctx, {
            ...commonConfig,
            data: {
                labels: [...this.timeLabels],
                datasets: [{
                    data: [...this.memoryData],
                    borderColor: 'rgb(153, 102, 255)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...commonConfig.options,
                scales: {
                    x: { display: false },
                    y: {
                        min: 0,
                        max: this.totalMemoryGB || 16000,
                        grid: { color: 'rgba(0, 0, 0, 0.1)' },
                        ticks: {
                            callback: value => (value/1024).toFixed(1) + ' GB'
                        }
                    }
                }
            }
        });
    }

    setTotalMemory(totalMemoryMB) {
        this.totalMemoryGB = totalMemoryMB;
        if (this.charts.memory) {
            this.charts.memory.options.scales.y.max = totalMemoryMB;
            this.charts.memory.update('none');
        }
    }

    update(chartId, timestamp, value) {
        const chart = this.charts[chartId];
        if (!chart) return;

        try {
            // Update data arrays
            if (chartId === 'cpu') {
                this.cpuData.push(value);
                this.cpuData.shift();
            } else if (chartId === 'memory') {
                this.memoryData.push(value);
                this.memoryData.shift();
            }

            // Update time labels
            this.timeLabels.push(new Date());
            this.timeLabels.shift();

            // Update chart data
            chart.data.labels = [...this.timeLabels];
            chart.data.datasets[0].data = chartId === 'cpu' ? [...this.cpuData] : [...this.memoryData];

            requestAnimationFrame(() => chart.update('none'));
        } catch (error) {
            console.error(`Error updating ${chartId} chart:`, error);
        }
    }
}

export default SystemCharts;
