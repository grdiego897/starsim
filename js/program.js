document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.program-table tbody');

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Verificar si el elemento clicado está dentro de un botón eliminar
            const deleteBtn = e.target.closest('.btn-delete');

            if (deleteBtn) {
                // Encontrar la fila a eliminar
                const row = deleteBtn.closest('tr');

                if (row) {
                    // Confirmación simple por seguridad
                    if (confirm('¿Estás seguro de que quieres eliminar esta misión?')) {
                        row.remove();
                    }
                }
            }
        });
    }
});
