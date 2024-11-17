document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.config-module-form');
    const actionsWrapper = document.querySelector('.actions-wrapper');

    if (form && actionsWrapper) {
        const showActionsWrapper = () => {
            if (!actionsWrapper.classList.contains('show')) {
                actionsWrapper.classList.add('show');
            }
        };


        form.addEventListener('input', showActionsWrapper);
        form.addEventListener('change', showActionsWrapper);

    } else {
        console.error('Formulário ou wrapper de ações não encontrado.');
    }
});
