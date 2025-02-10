class UIController {
    constructor() {
        this.darkMode = localStorage.getItem('dark-mode') === 'true';
        if (this.darkMode) {
            document.body.classList.add('dark-mode');
        }
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Dark mode toggle
        const darkModeBtn = document.querySelector('.toggle-btn');
        if (darkModeBtn) {
            darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        }

        // System info toggle
        const sysInfoHeader = document.querySelector('.section-header');
        if (sysInfoHeader) {
            sysInfoHeader.addEventListener('click', () => this.toggleSystemInfo());
        }

        // Storage toggle
        const storageHeader = document.querySelector('.storage-header');
        if (storageHeader) {
            storageHeader.addEventListener('click', () => this.toggleStorage());
        }

        // Initialize sections as expanded
        document.querySelector('.info-container')?.classList.add('expanded');
        document.querySelector('.disk-grid')?.classList.add('expanded');
        document.querySelectorAll('.collapse-icon').forEach(icon => {
            icon.classList.add('expanded');
        });
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
    }

    toggleSystemInfo() {
        const sysInfo = document.querySelector('.info-container');
        const collapseIcon = document.querySelector('.section-header .collapse-icon');
        sysInfo?.classList.toggle('expanded');
        collapseIcon?.classList.toggle('expanded');
    }

    toggleStorage() {
        const diskInfo = document.getElementById('disk-info');
        const collapseIcon = document.querySelector('.storage-header .collapse-icon');
        diskInfo?.classList.toggle('expanded');
        collapseIcon?.classList.toggle('expanded');
    }
}

export default UIController;
