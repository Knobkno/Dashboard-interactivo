// =========================================================
// 1. SELECTORES (Obtener elementos del DOM)
// =========================================================
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');

// =========================================================
// 2. FUNCIÓN PARA CREAR LA TARJETA (Task Card)
// =========================================================

/**
 * Crea la estructura HTML de una nueva tarea.
 * Usamos un template string (backticks ``) para insertar variables.
 * @param {string} title - El título de la nueva tarea.
 * @returns {string} El HTML completo de la Task Card.
 */
function createTaskCardHTML(title) {
    // Usaremos el estado 'PENDIENTE' y una descripción genérica por defecto
    const statusClass = 'status-pending';
    const statusText = 'PENDIENTE';
    const description = 'Tarea añadida por el usuario.';

    // Este es el template de la tarjeta que diseñaste en HTML/CSS
    return `
        <div class="task-card" data-id="${Date.now()}"> 
            <div class="card-header">
                <h3 class="task-title">${title}</h3>
                <span class="task-status ${statusClass}">${statusText}</span>
            </div>
            <p class="task-description">${description}</p>
            <div class="card-actions">
                <span class="material-icons icon-edit">edit</span>
                <span class="material-icons icon-delete">delete</span>
            </div>
        </div>
    `;
}

// =========================================================
// 3. FUNCIÓN PRINCIPAL DE AÑADIR TAREA
// =========================================================

function addTask() {
    const taskTitle = prompt('Introduce el título de la nueva tarea:');

    if (!taskTitle || taskTitle.trim() === '') {
        return; 
    }
    
    const newCardHTML = createTaskCardHTML(taskTitle.trim());

    // CAMBIO CLAVE: Usar 'beforeend' en lugar de 'afterbegin'.
    // 'beforeend' añade el nuevo elemento JUSTO antes del cierre del contenedor,
    // es decir, AL FINAL de la lista. Esto debería corregir el flujo.
    tasksContainer.insertAdjacentHTML('beforeend', newCardHTML);
}

// =========================================================
// 4. EVENT LISTENERS (Conectar la UI con la Lógica)
// =========================================================

// Conectar el botón de "Añadir Tarea" a la función addTask
addTaskBtn.addEventListener('click', addTask);

// =========================================================
// 5. LÓGICA DE INTERACCIÓN DE TARJETAS (Delegación de Eventos)
// =========================================================

// Escuchamos clics en el contenedor principal de tareas
tasksContainer.addEventListener('click', function(e) {
    // 1. ELIMINAR TAREA
    if (e.target.classList.contains('icon-delete')) {
        // Encontramos el <div class="task-card"> padre
        const taskCard = e.target.closest('.task-card');
        if (taskCard) {
            // Confirmación opcional:
            if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                taskCard.remove(); // Elimina el elemento del DOM
            }
        }
    }
    
    // 2. EDICIÓN DE TAREA Y CAMBIO DE ESTADO
    if (e.target.classList.contains('icon-edit')) {
        const taskCard = e.target.closest('.task-card');
        const titleElement = taskCard.querySelector('.task-title');
        const descElement = taskCard.querySelector('.task-description');
        const statusSpan = taskCard.querySelector('.task-status');

        // LÓGICA DE EDICIÓN (UX: Pedir al usuario qué quiere hacer)
        const action = prompt("¿Qué quieres editar? (título, descripción, o estado)", "").toLowerCase();

        if (action === 'título' || action === 'titulo') {
            const newTitle = prompt('Introduce el nuevo Título:', titleElement.textContent.trim());
            if (newTitle && newTitle.trim() !== '') {
                titleElement.textContent = newTitle.trim();
            }
        } else if (action === 'descripción' || action === 'descripcion') {
            const newDesc = prompt('Introduce la nueva Descripción:', descElement.textContent.trim());
            if (newDesc && newDesc.trim() !== '') {
                descElement.textContent = newDesc.trim();
            }
        } else if (action === 'estado') {
            // Lógica de cambio de estado (la que ya teníamos, pero limpia)
            if (statusSpan.classList.contains('status-pending')) {
                statusSpan.className = 'task-status status-in-progress';
                statusSpan.textContent = 'EN PROGRESO';
            } else if (statusSpan.classList.contains('status-in-progress')) {
                statusSpan.className = 'task-status status-completed';
                statusSpan.textContent = 'COMPLETADO';
            } else if (statusSpan.classList.contains('status-completed')) {
                statusSpan.className = 'task-status status-pending';
                statusSpan.textContent = 'PENDIENTE';
            }
        } else {
            alert('Acción no reconocida. Usa: título, descripción, o estado.');
        }
    }
});
// =========================================================
// 6. LÓGICA DE BÚSQUEDA (Filtro)
// =========================================================
const searchInput = document.getElementById('searchInput');

// Escuchar cada vez que el usuario escribe algo (evento 'input')
searchInput.addEventListener('input', function() {
    // Convertir la búsqueda a minúsculas
    const searchTerm = searchInput.value.toLowerCase();
    
    // Obtener todas las tarjetas de tarea
    const allTasks = tasksContainer.querySelectorAll('.task-card');

    allTasks.forEach(card => {
        // Obtener el texto del título y la descripción
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const description = card.querySelector('.task-description').textContent.toLowerCase();
        
        // Comprobar si el término de búsqueda está en el título O en la descripción
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            // Mostrar la tarjeta si coincide
            card.style.display = 'block'; 
        } else {
            // Ocultar la tarjeta si no coincide
            card.style.display = 'none';
        }
    });
});