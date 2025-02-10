const utils = {
    formatMemory: (bytes) => {
        const mb = bytes / (1024 * 1024);
        return mb >= 1024 
            ? (mb / 1024).toFixed(2) + ' GB'
            : mb.toFixed(2) + ' MB';
    },

    formatBytes: (bytes) => {
        if (bytes === 0) return '0 GB';
        const k = 1024;
        const sizeInGB = bytes / (Math.pow(k, 3));
        return sizeInGB < 1024 
            ? sizeInGB.toFixed(2) + ' GB'
            : (sizeInGB / 1024).toFixed(2) + ' TB';
    },

    formatUptime: (seconds) => {
        const days = Math.floor(seconds / (24 * 3600));
        seconds %= 24 * 3600;
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    },

    updateDOMElement: (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    },

    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

export default utils;
