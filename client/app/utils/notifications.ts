// Notification sound utility
export const playNotificationSound = (type: 'message' | 'order' = 'message') => {
    try {
        const audio = new Audio(type === 'order' ? '/sounds/order.mp3' : '/sounds/message.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Sound play failed:', err));
    } catch (error) {
        console.log('Sound not available:', error);
    }
};

export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        return await Notification.requestPermission();
    }
    return Notification.permission;
};

export const showBrowserNotification = (title: string, body: string, icon?: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: icon || '/logoo.png',
            badge: '/logoo.png',
            tag: 'shop-chat',
            requireInteraction: false,
        });
    }
};
