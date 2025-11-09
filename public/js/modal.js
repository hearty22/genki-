function showModal(message) {
    // Crear el contenedor del modal
    const modal = document.createElement('div');
    modal.className = 'modal';

    // Crear el contenido del modal
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Crear el botón de cierre
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        modal.style.display = 'none';
        modal.remove();
    }

    // Crear el mensaje del modal
    const modalMessage = document.createElement('p');
    modalMessage.className = 'modal-message';
    modalMessage.textContent = message;

    // Ensamblar el modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalMessage);
    modal.appendChild(modalContent);

    // Añadir el modal al body
    document.body.appendChild(modal);

    // Mostrar el modal
    modal.style.display = 'block';

    // Cerrar el modal si se hace clic fuera de él
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            modal.remove();
        }
    }
}