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
