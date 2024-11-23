const actionsWrapper = document.querySelector('.actions-wrapper');

function showActionsWrapper() {
    if (!actionsWrapper.classList.contains('show')) {
        actionsWrapper.classList.add('show');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.config-module-form');

    if (form && actionsWrapper) {
        form.addEventListener('input', showActionsWrapper);
        form.addEventListener('change', showActionsWrapper);

    } else {
        console.error('Formulário ou wrapper de ações não encontrado.');
    }
});

export { showActionsWrapper };