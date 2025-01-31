document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    let totalMemoryMB = 0;

    // Initialize charts
    const ctxCpu = document.getElementById('cpuChart').getContext('2d');
    const ctxMemory = document.getElementById('memoryChart').getContext('2d');

    const chartOptions = {
        elements: {
            point: {
                radius: 0
            },
            line: {
                tension: 0.4
            }
        },
        scales: {
            x: {
                display: false
            }
        },
        animation: false
    };

    const cpuChart = new Chart(ctxCpu, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'CPU Usage (%)',
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    const memoryChart = new Chart(ctxMemory, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Memory Usage',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            ...chartOptions,
            scales: {
                ...chartOptions.scales,
                y: {
                    beginAtZero: true,
                    max: totalMemoryMB,
                    ticks: {
                        callback: function(value) {
                            return value >= 1024 
                                ? (value/1024).toFixed(1) + ' GB'
                                : value.toFixed(1) + ' MB';
                        }
                    }
                }
            }
        }
    });

    async function fetchSystemInfo() {
        try {
            const response = await fetch('/api/system-info');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Update total memory and chart scale on first load
            if (totalMemoryMB === 0) {
                totalMemoryMB = data.totalMemoryMB;
                memoryChart.options.scales.y.max = totalMemoryMB;
                memoryChart.update('none');
            }

            // Update DOM elements
            const elements = {
                'hostname': data.hostname,
                'osinfo': data.osinfo,
                'cpu': data.cpu + '%',
                'memory': data.memory + '%',
                'memory-details': data.memoryDetails,
                'uptime': data.uptime
            };

            for (const [id, value] of Object.entries(elements)) {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            }

            // Update charts
            const now = new Date();
            updateChart(cpuChart, now, data.cpu);
            updateChart(memoryChart, now, data.memoryInMB);
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    }

    function updateChart(chart, label, value) {
        if (chart.data.labels.length > 120) { // Increase to 120 data points
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.data.labels.push(label);
        chart.data.datasets[0].data.push(value);
        chart.update('none'); // Disable animations on update
    }

    // Start fetching data
    fetchSystemInfo();
    setInterval(fetchSystemInfo, 1000);
});
