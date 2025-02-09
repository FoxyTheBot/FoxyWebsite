function showNotification(type, message) {
    console.log('showNotification');
    const notificationWrapper = document.getElementById('notification');

    if (type === 'error') {
        notificationWrapper.classList.add('error');
    } else {
        notificationWrapper.classList.remove('error');
    }
    
    notificationWrapper.textContent = message;
    notificationWrapper.classList.add('show');

    setTimeout(() => {
        notificationWrapper.classList.remove('show');
        notificationWrapper.textContent = '';
        if (notificationWrapper.classList.contains('error')) {
            notificationWrapper.classList.remove('error');
        }
    }, 3000);
}

export { showNotification };