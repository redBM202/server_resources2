import SystemCharts from './charts.js';
import SystemMonitor from './systemInfo.js';
import UIController from './uiController.js';

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded');
        return;
    }

    // Initialize UI Controller
    new UIController();

    const charts = new SystemCharts();
    charts.initialize();

    const monitor = new SystemMonitor(charts);
    monitor.start();
});
