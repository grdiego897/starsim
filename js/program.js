document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('.program-table tbody');

    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Check if the clicked element is inside a delete button
            const deleteBtn = e.target.closest('.btn-delete');

            if (deleteBtn) {
                // Find the row to delete
                const row = deleteBtn.closest('tr');

                if (row) {
                    // Optional: Confirm with absolute certainty or just do it. 
                    // Given the "agentic" nature, a confirmation is good UX but maybe user just wants it to work.
                    // I'll add a simple confirm for safety.
                    if (confirm('¿Estás seguro de que quieres eliminar esta misión?')) {
                        row.remove();
                    }
                }
            }
        });
    }
});
