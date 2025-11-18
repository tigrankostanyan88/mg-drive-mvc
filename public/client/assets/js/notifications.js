class NotificationManager {
    constructor(containerSelector = null) {
        this.container = containerSelector
            ? document.querySelector(containerSelector)
            : null;
        this.init();
    }

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.zIndex = '9999'; // Highest z-index to ensure notifications are always on top
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hide(notification);
        });

        // Auto-hide
        const timeoutId = setTimeout(() => this.hide(notification), duration);

        // Remove from DOM
        notification.addEventListener('transitionend', () => {
            if (!notification.classList.contains('show') && notification.parentElement) {
                notification.parentElement.removeChild(notification);
                clearTimeout(timeoutId);
            }
        });

        this.container.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => notification.classList.add('show'));
    }

    hide(notification) {
        notification.classList.remove('show');
    }
}

// Singleton pattern for app-wide use
const notifications = new NotificationManager();

function showNotification(message, type = 'info', duration = 3000) {
    notifications.show(message, type, duration);
}

