async function fetchSystemInfo() {
    try {
        const response = await fetch('/api/system-info');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        document.getElementById('hostname').textContent = data.hostname;
        document.getElementById('osinfo').textContent = data.osinfo;
        document.getElementById('kernel').textContent = data.kernel;
        document.getElementById('cpu').textContent = data.cpu + '%';
        document.getElementById('memory').textContent = data.memory + '%';
        document.getElementById('uptime').textContent = data.uptime;

        updateCharts(data.cpu, data.memory);
    } catch (error) {
        console.error('Error fetching system info:', error);
        document.getElementById('hostname').textContent = 'Error fetching system info';
        document.getElementById('osinfo').textContent = error.message;
        document.getElementById('kernel').textContent = 'N/A';
        document.getElementById('cpu').textContent = 'N/A';
        document.getElementById('memory').textContent = 'N/A';
        document.getElementById('uptime').textContent = 'N/A';
        document.getElementById('error-message').value = `Error: ${error.message}`;
    }
}

function updateCharts(cpuUsage, memoryUsage) {
    const now = new Date();
    if (cpuChart.data.labels.length > 20) {
        cpuChart.data.labels.shift();
        cpuChart.data.datasets[0].data.shift();
    }
    if (memoryChart.data.labels.length > 20) {
        memoryChart.data.labels.shift();
        memoryChart.data.datasets[0].data.shift();
    }
    cpuChart.data.labels.push(now);
    cpuChart.data.datasets[0].data.push(cpuUsage);
    memoryChart.data.labels.push(now);
    memoryChart.data.datasets[0].data.push(memoryUsage);
    cpuChart.update();
    memoryChart.update();
}

// Ensure Chart.js is loaded
if (typeof Chart === 'undefined') {
    throw new Error('Chart.js is not loaded');
}

// Initialize charts
const ctxCpu = document.getElementById('cpuChart').getContext('2d');
const cpuChart = new Chart(ctxCpu, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'CPU Usage',
            data: [], // CPU usage data
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second'
                }
            },
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

const ctxMemory = document.getElementById('memoryChart').getContext('2d');
const memoryChart = new Chart(ctxMemory, {
    type: 'line',
    data: {
        labels: [], // Time labels
        datasets: [{
            label: 'Memory Usage',
            data: [], // Memory usage data
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1,
            fill: false
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second'
                }
            },
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Fetch system info on page load
fetchSystemInfo();
// Optionally, refresh system info every 10 seconds
setInterval(fetchSystemInfo, 10000);

// Note: In a real implementation, you would need backend integration
// to fetch actual system information and update the charts accordingly.
