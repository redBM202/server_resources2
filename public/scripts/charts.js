import utils from './utils.js';

class SystemCharts {
    constructor() {
        this.charts = {};
        this.maxDataPoints = 30;
        this.commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            elements: {
                point: { radius: 0 },
                line: { tension: 0 }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: { second: 'HH:mm:ss' }
                    },
                    ticks: { maxRotation: 0 }
                }
            }
        };
    }

    initialize() {
        this.initCPUChart();
        this.initMemoryChart();
    }

    initCPUChart() {
        const ctx = document.getElementById('cpuChart').getContext('2d');
        this.charts.cpu = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: [],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...this.commonOptions,
                scales: {
                    ...this.commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { callback: value => `${value}%` }
                    }
                }
            }
        });
    }

    initMemoryChart() {
        const ctx = document.getElementById('memoryChart').getContext('2d');
        this.charts.memory = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Memory Usage (GB)',
                    data: [],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...this.commonOptions,
                scales: {
                    ...this.commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return (value/1024).toFixed(1) + ' GB';
                            }
                        },
                        max: null // Allow auto-scaling
                    }
                }
            }
        });
    }

    update(chartId, timestamp, value) {
        const chart = this.charts[chartId];
        if (!chart) return;

        chart.data.datasets[0].data.push({ x: timestamp, y: value });
        if (chart.data.datasets[0].data.length > this.maxDataPoints) {
            chart.data.datasets[0].data.shift();
        }
        requestAnimationFrame(() => chart.update('none'));
    }
}

export default SystemCharts;
