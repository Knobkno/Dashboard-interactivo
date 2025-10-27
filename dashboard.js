// dashboard.js

// =========================================================
// 0. CONFIGURACIÓN E INICIALIZACIÓN
// =========================================================
const baseURL = 'https://alexkx-task-api.onrender.com'; // URL de la API

// =========================================================
// 1. SELECTORES (Obtener elementos del DOM)
// =========================================================
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksContainer = document.getElementById('tasksContainer');
const searchInput = document.getElementById('searchInput'); // Para la lógica de búsqueda

// =========================================================
// 2. FUNCIÓN PARA CREAR LA TARJETA (Task Card)
//    * AHORA RECIBE EL OBJETO COMPLETO DE MONGODB
// =========================================================

/**
 * Crea la estructura HTML de una nueva tarea a partir del objeto de MongoDB.
 * @param {object} task - El objeto de tarea completo de MongoDB.
 * @returns {string} El HTML completo de la Task Card.
 */
function createTaskCardHTML(task) {
    // MongoDB usa el campo 'completed' (boolean) y '_id' (string)
    const isCompleted = task.completed;
    const statusClass = isCompleted ? 'status-completed' : 'status-pending';
    const statusText = isCompleted ? 'COMPLETADO' : 'PENDIENTE';
    const description = task.description || 'Tarea gestionada en MongoDB Atlas.'; 

    return `
        <div class="task-card" data-id="${task._id}"> 
            <div class="card-header">
                <h3 class="task-title">${task.title}</h3>
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
// ---------------------------------------------------------------------
// 3. LÓGICA DE DATOS: CRUD ASÍNCRONO (Reemplaza la gestión local)
// ---------------------------------------------------------------------

/**
 * FETCH - GET: Obtiene la lista de tareas desde la API y las muestra.
 */
const fetchTasks = async () => {
    try {
        // GET por defecto. Trae un objeto { tasks: [...] }
        const response = await fetch(baseURL); 
        if (!response.ok) {
            throw new Error(`Error ${response.status}: Fallo al cargar tareas.`);
        }
        const data = await response.json();
        
        // Mostrar las tareas usando tu función de DOM (adaptada)
        displayTasks(data.tasks); 
        
    } catch (error) {
        console.error('Error al cargar tareas:', error);
        tasksContainer.innerHTML = `<p class="error-msg">❌ Error: No se pudo conectar con el servidor (API).</p>`;
    }
};

/**
 * FETCH - POST: Crea una nueva tarea en la API.
 */
const createTask = async (title) => {
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: title }),
        });

        if (response.ok) {
            // Si fue exitoso (201 Created), recargamos la lista para ver la nueva tarea
            await fetchTasks();
        } else {
            const errorData = await response.json();
            alert(`Error al guardar: ${errorData.msg}`);
        }
    } catch (error) {
        alert('Error de red al intentar crear tarea.');
    }
};

/**
 * FETCH - PUT: Actualiza el estado (completed) de una tarea.
 */
const updateTask = async (taskID, updates) => {
    try {
        const response = await fetch(`${baseURL}/${taskID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (response.ok) {
            await fetchTasks(); // Recarga la lista para ver el cambio
        } else {
            alert('No se pudo actualizar la tarea en el servidor.');
        }
    } catch (error) {
        console.error('Error de red al actualizar:', error);
    }
};

/**
 * FETCH - DELETE: Elimina una tarea por su ID de MongoDB.
 */
const deleteTask = async (taskID) => {
    try {
        const response = await fetch(`${baseURL}/${taskID}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            await fetchTasks(); // Recarga la lista
        } else {
            alert('No se pudo eliminar la tarea en el servidor.');
        }
    } catch (error) {
        console.error('Error de red al eliminar:', error);
    }
};

// ---------------------------------------------------------------------
// 4. LÓGICA DEL DOM Y MANEJO DE EVENTOS (Adaptados a async/await)
// ---------------------------------------------------------------------

// Función que dibuja las tareas en el DOM
function displayTasks(tasks) {
    tasksContainer.innerHTML = '';
    
    // Si no hay tareas, mostrar mensaje
    if (tasks.length === 0) {
        tasksContainer.innerHTML = `<p class="no-tasks">¡No tienes tareas aún! Añade una para empezar.</p>`;
        return;
    }
    
    // Dibujar cada tarjeta usando el HTML de la función 2
    tasks.forEach(task => {
        const newCardHTML = createTaskCardHTML(task);
        tasksContainer.insertAdjacentHTML('beforeend', newCardHTML);
    });
}

async function addTask() {
    const taskTitle = prompt('Introduce el título de la nueva tarea:');

    if (!taskTitle || taskTitle.trim() === '') {
        return; 
    }
    
    // ESTO ES EL CAMBIO CLAVE: Llama a la función POST del servidor
    await createTask(taskTitle.trim()); 
}


// Conectar el botón de "Añadir Tarea" a la función addTask (MANTENER)
addTaskBtn.addEventListener('click', addTask);

// Lógica de interacción de tarjetas (Delegación de Eventos) - AHORA ASÍNCRONA
tasksContainer.addEventListener('click', async function(e) {
    
    const taskCard = e.target.closest('.task-card');
    if (!taskCard) return; // Si no es dentro de una tarjeta, ignorar

    const taskID = taskCard.dataset.id; // El ID de MongoDB
    
    // 1. ELIMINAR TAREA (DELETE)
    if (e.target.classList.contains('icon-delete')) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
            await deleteTask(taskID); // Llama a la función DELETE
        }
        
    // 2. EDICIÓN DE TAREA Y CAMBIO DE ESTADO (PUT)
    } else if (e.target.classList.contains('icon-edit')) {
        
        const statusSpan = taskCard.querySelector('.task-status');
        // El estado actual NO se lee del DOM, se infiere del nombre de la clase
        const isCurrentlyCompleted = statusSpan.classList.contains('status-completed');
        
        const action = prompt("¿Qué quieres editar? (título, estado, o borrar)", "").toLowerCase();
        
        if (action === 'título' || action === 'titulo') {
            const newTitle = prompt('Introduce el nuevo Título:', taskCard.querySelector('.task-title').textContent.trim());
            if (newTitle && newTitle.trim() !== '') {
                // Llama a la función PUT para actualizar el título
                await updateTask(taskID, { title: newTitle.trim() });
            }
        } else if (action === 'estado') {
            // Cambiamos al estado contrario y llamamos a PUT
            const newCompletedStatus = !isCurrentlyCompleted;
            await updateTask(taskID, { completed: newCompletedStatus });
            
        } else if (action === 'borrar') {
             // Redirigir al borrado si el usuario lo pide
             if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                 await deleteTask(taskID);
             }
        } else {
            alert('Acción no reconocida. Usa: título, estado, o borrar.');
        }
    }
});


// ---------------------------------------------------------------------
// 5. LÓGICA DE BÚSQUEDA (Mantenida, ya que opera solo en el DOM)
// ---------------------------------------------------------------------

// Lógica de búsqueda (Filtro)
searchInput.addEventListener('input', function() {
    const searchTerm = searchInput.value.toLowerCase();
    const allTasks = tasksContainer.querySelectorAll('.task-card');

    allTasks.forEach(card => {
        const title = card.querySelector('.task-title').textContent.toLowerCase();
        const description = card.querySelector('.task-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = 'block'; 
        } else {
            card.style.display = 'none';
        }
    });
});


// ---------------------------------------------------------------------
// 6. INICIO DE LA APLICACIÓN
// ---------------------------------------------------------------------
// Al cargar la ventana, obtenemos las tareas de la API (GET)
window.addEventListener('load', fetchTasks);