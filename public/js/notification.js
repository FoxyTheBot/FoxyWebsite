function showNotification(type, message) {
    console.log('showNotification');
    const notificationWrapper = document.getElementById('notification');

    if (type === 'error') {
        notificationWrapper.classList.add('error');
    }
    
    notificationWrapper.textContent = message;
    notificationWrapper.classList.add('show');

    setTimeout(() => {
        notificationWrapper.classList.remove('show');
    }, 3000);
}

export { showNotification };