document.addEventListener('DOMContentLoaded', function () {
    const switchElement = document.getElementById('switch');
    const textInput = document.getElementById('messageTextArea');
    const channelsSelect = document.getElementById('channels');
    const rolesSelect = document.getElementById('roles');

    switchElement.addEventListener('change', function () {
        const isSwitchChecked = this.checked;
        textInput.disabled = !isSwitchChecked;
        channelsSelect.disabled = !isSwitchChecked;
        rolesSelect.disabled = !isSwitchChecked;
        console.log('Switch alterado:', isSwitchChecked);
    });

    let selectedChannels = [];
    let selectedRoles = [];

    function showNotification(message) {
        const notificationElement = document.getElementById('notification');
        const notificationTextElement = document.getElementById('notificationText');

        notificationTextElement.textContent = message;
        notificationElement.style.display = 'block';

        setTimeout(function () {
            notificationElement.style.display = 'none';
        }, 3000);
    }

    function showError(message) {
        const notificationErrorElement = document.getElementById('notificationError');
        const notificationErrorTextElement = document.getElementById('notificationErrorText');

        notificationErrorTextElement.textContent = message;
        notificationErrorElement.style.display = 'block';

        setTimeout(function () {
            notificationErrorElement.style.display = 'none';
        }, 3000);
    }
    function addChannelToArray() {
        const selectedChannel = channelsSelect.value;
        if (selectedChannel !== "" && !selectedChannels.includes(selectedChannel)) {
            selectedChannels.push(selectedChannel);
            showNotification(`Canal adicionado`);
        } else {
            showError(`Esse canal já foi adicionado ou não existe`);
        }
    }

    function addRoleToArray() {
        const selectedRole = rolesSelect.value;
        if (selectedRole !== "" && !selectedRoles.includes(selectedRole)) {
            selectedRoles.push(selectedRole);
            showNotification(`Cargo adicionado`);
        } else {
            showError(`Esse cargo já foi adicionado ou não existe`);
        }
    }

    function setupFormEvents() {
        const addChannelButton = document.getElementById("addChannelButton");
        if (addChannelButton) {
            addChannelButton.addEventListener("click", function (event) {
                event.preventDefault();
                addChannelToArray();
            });
        } else {
            console.error("Elemento 'addChannelButton' não encontrado.");
        }

        const addRoleButton = document.getElementById("addRoleButton");
        if (addRoleButton) {
            addRoleButton.addEventListener("click", function (event) {
                event.preventDefault();
                addRoleToArray();
            });
        } else {
            console.error("Elemento 'addRoleButton' não encontrado.");
        }

        const inviteBlockerForm = document.getElementById("inviteBlockerForm");
        if (inviteBlockerForm) {
            const guildId = document.getElementById("inviteBlockerForm").getAttribute("data-guild-id");
            inviteBlockerForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const isInviteBlockerEnabled = switchElement.checked;
                const formData = {
                    inviteblocker: isInviteBlockerEnabled,
                    selectedChannels: selectedChannels,
                    selectedRoles: selectedRoles,
                    blockmessage: textInput.value.trim(),
                };
                console.log(formData)
                fetch(`/inviteblocker/save/${guildId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Erro na requisição.");
                        }
                        console.log(response)
                        showNotification("Alterações salvas com sucesso")
                        return response.json();
                    });
            });
        } else {
            console.error("Formulário 'inviteBlockerForm' não encontrado.");
        }
    }

    setupFormEvents();
});
