document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    let totalMemoryMB = 0;

    // Initialize charts
    const ctxCpu = document.getElementById('cpuChart').getContext('2d');
    const ctxMemory = document.getElementById('memoryChart').getContext('2d');

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point: {
                radius: 0  // Remove points completely
            },
            line: {
                tension: 0  // Remove curve tension for better performance
            }
        },
        plugins: {
            legend: {
                display: true
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second',
                    displayFormats: {
                        second: 'HH:mm:ss'
                    }
                },
                ticks: {
                    maxRotation: 0
                }
            }
        },
        animation: {
            duration: 0  // Disable animations completely
        }
    };

    const cpuChart = new Chart(ctxCpu, {
        type: 'line',
        data: {
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
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: value => `${value}%`
                    }
                }
            }
        }
    });

    const memoryChart = new Chart(ctxMemory, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Memory Usage (GB)',
                data: [],
                borderColor: 'rgba(153, 102, 255, 1)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                ...commonOptions.scales,
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return (value/1024).toFixed(1) + ' GB';
                        }
                    }
                }
            }
        }
    });

    let lastUpdate = 0;
    const throttleInterval = 2000; // 2 seconds minimum between updates

    async function fetchSystemInfo() {
        const now = Date.now();
        if (now - lastUpdate < throttleInterval) {
            return; // Skip update if too soon
        }
        lastUpdate = now;

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
            }

            // Batch DOM updates
            requestAnimationFrame(() => {
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
            });

            // Update charts
            const timestamp = new Date();
            updateChart(cpuChart, timestamp, parseFloat(data.cpu));
            updateChart(memoryChart, timestamp, data.memoryInMB);

            // Update disk information less frequently
            if (now % (throttleInterval * 2) < throttleInterval) {
                updateDiskInfo(data.disks);
            }

        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    }

    function updateDiskInfo(disks) {
        const diskInfoContainer = document.getElementById('disk-info');
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

    function updateChart(chart, timestamp, value) {
        const maxDataPoints = 30; // Reduce to 30 data points

        chart.data.datasets[0].data.push({
            x: timestamp,
            y: value
        });

        // Remove old data points
        if (chart.data.datasets[0].data.length > maxDataPoints) {
            chart.data.datasets[0].data.shift();
        }

        // Use requestAnimationFrame for chart updates
        requestAnimationFrame(() => {
            chart.update('none');
        });
    }

    // Start fetching data with increased interval
    fetchSystemInfo();
    setInterval(fetchSystemInfo, 2000); // Change to 2 seconds interval

    // Clean up on page hide/unload
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clearInterval(fetchInterval);
        }
    });
});
