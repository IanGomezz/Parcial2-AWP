let currentPublicacion = null; // Variable para guardar la publicación actual

// Función para mostrar el modal con datos dinámicos
function mostrarModal(publicacion) {
  currentPublicacion = publicacion;

  // Rellenar el modal con los datos de la publicación
  document.getElementById("modal-title").textContent = publicacion.titulo;
  document.getElementById("modal-description").textContent = publicacion.descripcion;
  document.getElementById("modal-date").textContent = `Fecha de creación: ${publicacion.fechacreacion}`;

  // Seleccionar el estado actual en el select
  const select = document.getElementById("modal-select");
  select.value = publicacion.estado;

  // Mostrar el modal
  document.getElementById("modal").style.display = "block";
}

// Función para cerrar el modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Evento para cerrar el modal al hacer clic en "Cancelar"
document.getElementById("modal-cancel").addEventListener("click", cerrarModal);

// Evento para guardar cambios al hacer clic en "Guardar"
document.getElementById("modal-save").addEventListener("click", async () => {
  if (!currentPublicacion) return;

  const selectValue = document.getElementById("modal-select").value;

  // Crear el objeto con los datos actualizados
  const updatedData = {
    estado: selectValue,
  };

  // Si el estado es "completada", agregar la fecha de conclusión
  if (selectValue === "completada") {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    updatedData.fechaconclusion = formattedDate;
  }

  try {
    // Hacer el método PUT a la API
    await fetch(
      `https://66f5eb49436827ced975725c.mockapi.io/enpoint/publicaciones/${currentPublicacion.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    // Actualizar el estado visualmente sin recargar la página
    currentPublicacion.estado = updatedData.estado;
    if (updatedData.fechaconclusion) {
      currentPublicacion.fechaconclusion = updatedData.fechaconclusion;
    }

    cerrarModal(); // Cerrar el modal
    GETPublicaciones(); // Refrescar las publicaciones
  } catch (error) {
    console.error("Error al actualizar la publicación:", error);
  }
});

// Función principal para obtener y mostrar las publicaciones
async function GETPublicaciones() {
  const container = document.getElementById("publicaciones-container");

  try {
    const response = await fetch(
      "https://66f5eb49436827ced975725c.mockapi.io/enpoint/publicaciones"
    );

    if (!response.ok) {
      throw new Error("Error al obtener publicaciones");
    }

    const publicaciones = await response.json();

    // Ordenar las publicaciones: primero las que no están completadas
    publicaciones.sort((a, b) => {
      if (a.estado === "completada" && b.estado !== "completada") {
        return 1; // Mover "completada" hacia el final
      }
      if (a.estado !== "completada" && b.estado === "completada") {
        return -1; // Mantener "no completada" al principio
      }
      return 0; // Mantener el orden relativo si ambos tienen el mismo estado
    });

    container.innerHTML = ""; // Limpia el contenedor antes de agregar contenido nuevo

    publicaciones.forEach((publicacion) => {
      // Crear el contenedor de la publicación
      const publicacionDiv = document.createElement("div");
      publicacionDiv.classList.add("publicacion");

      // Crear la sección de información (Título y fecha)
      const infoDiv = document.createElement("div");
      infoDiv.classList.add("info");

      // Crear el título
      const titulo = document.createElement("h3");
      titulo.textContent = publicacion.titulo;

      // Crear la fecha (creación o conclusión según el estado)
      const fecha = document.createElement("p");
      if (publicacion.estado === "completada") {
        fecha.textContent = `Fecha de conclusión: ${publicacion.fechaconclusion || "No disponible"}`;
      } else {
        fecha.textContent = `Fecha de creación: ${publicacion.fechacreacion}`;
      }
      fecha.classList.add("fecha-creacion");

      // Agregar evento para mostrar el modal al hacer clic en cualquier parte de la card
      publicacionDiv.addEventListener("click", (e) => {
        if (!e.target.classList.contains("estado-img")) {
          mostrarModal(publicacion);
        }
      });

      // Crear el botón
      const boton = document.createElement("button");
      boton.classList.add("estado-boton");

      const imagen = document.createElement("img");
      if (publicacion.estado === "completada") {
        imagen.src = "imagenes/complete.png"; // Icono para tareas completadas
        imagen.alt = "Completada";

        // Hacer que el div sea gris y no clickeable
        publicacionDiv.style.backgroundColor = "#d3d3d3"; // Color gris
        publicacionDiv.style.pointerEvents = "none"; // Deshabilita los clics en el div
        publicacionDiv.style.opacity = "0.6"; // Reducir opacidad para indicar que está deshabilitado
      } else {
        imagen.src = "imagenes/boton-play.png"; // Icono para otras tareas
        imagen.alt = "En progreso";
        boton.classList.add("btn-play");
        boton.addEventListener("click", () => reproducirDescripcion(publicacion.descripcion));
      }

      imagen.classList.add("estado-img");
      boton.appendChild(imagen);

      // Agregar información y botón a la card
      infoDiv.appendChild(titulo);
      infoDiv.appendChild(fecha);
      publicacionDiv.appendChild(infoDiv);
      publicacionDiv.appendChild(boton);

      // Agregar la publicación al contenedor principal
      container.appendChild(publicacionDiv);
    });
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);

    // Mostrar un mensaje de error en el contenedor
    container.innerHTML = "<p>Error al cargar las publicaciones.</p>";
  }
}


// Mostrar/Ocultar el menú desplegable
document.getElementById("btn-hamburguesa").addEventListener("click", () => {
  const menu = document.getElementById("menu-desplegable");
  menu.style.display = menu.style.display === "none" || menu.style.display === "" ? "block" : "none";
});

// Abrir modal al hacer clic en "Crear Publicación"
document.getElementById("crear-publicacion").addEventListener("click", () => {
  document.getElementById("menu-desplegable").style.display = "none"; // Cierra el menú
  document.getElementById("modal-crear").style.display = "flex"; // Abre el modal
});

// Cerrar modal al hacer clic en cancelar o en el botón de cerrar
document.getElementById("cancelar-tarea").addEventListener("click", () => {
  document.getElementById("modal-crear").style.display = "none";
});

// Guardar publicación al hacer clic en "Guardar"
document.getElementById("guardar-tarea").addEventListener("click", async () => {
  const titulo = document.getElementById("titulo-tarea").value.trim();
  const detalle = document.getElementById("detalle-tarea").value.trim();
  const estado = document.getElementById("estado-tarea").value;

  // Validar que el título y el detalle no estén vacíos
  if (!titulo || !detalle) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  // Formatear la fecha de creación
  const now = new Date();
  const fechaCreacion = `${now.getFullYear()}/${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now
    .getDate()
    .toString()
    .padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

  // Datos para enviar a la API
  const nuevaPublicacion = {
    titulo,
    descripcion: detalle,
    estado,
    fechacreacion: fechaCreacion,
  };

  try {
    // Método POST a la API
    const response = await fetch(
      "https://66f5eb49436827ced975725c.mockapi.io/enpoint/publicaciones",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevaPublicacion),
      }
    );

    if (!response.ok) {
      throw new Error("Error al guardar la publicación");
    }

    alert("Publicación creada exitosamente.");
    document.getElementById("modal-crear").style.display = "none"; // Cierra el modal
    document.getElementById("titulo-tarea").value = ""; // Limpia los campos
    document.getElementById("detalle-tarea").value = "";
    document.getElementById("estado-tarea").value = "por hacer";

    GETPublicaciones(); // Refresca la lista de publicaciones
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un problema al crear la publicación.");
  }
});

// Variables globales para configuración de SpeechSynthesis
let currentVoice = null; // Voz actual
let currentRate = 1; // Velocidad de reproducción predeterminada
let vocesDisponibles = []; // Lista de voces disponibles

// Función para cargar voces disponibles
function cargarVoces() {
  vocesDisponibles = window.speechSynthesis.getVoices();

  if (!vocesDisponibles || vocesDisponibles.length === 0) {
    console.warn("No se encontraron voces aún. Intentando recargar...");
    setTimeout(cargarVoces, 500); // Intentar nuevamente en 500ms
    return;
  }

  const selectIdioma = document.getElementById("select-idioma");

  // Limpiar opciones previas en el select
  selectIdioma.innerHTML = "";

  // Lista de idiomas seleccionados para mostrar
  const idiomasSoportados = ["es-ES", "es-MX", "en-US", "pt-BR", "fr-FR", "de-DE"];

  // Recuperar la configuración guardada en localStorage
  const savedVoiceLang = localStorage.getItem("selectedVoice");

  // Agregar solo las voces de los idiomas soportados
  vocesDisponibles.forEach((voz) => {
    if (idiomasSoportados.includes(voz.lang)) {
      const option = document.createElement("option");
      option.value = voz.lang; // Usar el código de idioma
      option.textContent = `${voz.name} - ${voz.lang}`;
      selectIdioma.appendChild(option);

      // Si hay una configuración guardada, seleccionarla
      if (voz.lang === savedVoiceLang) {
        option.selected = true;
        currentVoice = voz;
      }
    }
  });

  // Si no hay una voz seleccionada por defecto, selecciona la primera disponible
  if (!currentVoice && vocesDisponibles.length > 0) {
    currentVoice = vocesDisponibles[0];
    selectIdioma.value = currentVoice.lang;
  }

  console.log("Voces cargadas:", vocesDisponibles);
}

// Cambiar la voz seleccionada
document.getElementById("select-idioma").addEventListener("change", (event) => {
  const selectedLang = event.target.value;

  // Encontrar la voz correspondiente al idioma seleccionado
  const vozSeleccionada = vocesDisponibles.find((voz) => voz.lang === selectedLang);
  if (vozSeleccionada) {
    currentVoice = vozSeleccionada; // Actualizar la voz actual
    localStorage.setItem("selectedVoice", selectedLang); // Guardar en localStorage
    console.log(`Voz seleccionada: ${vozSeleccionada.name} (${vozSeleccionada.lang})`);
  } else {
    console.warn(`No se encontró una voz para el idioma ${selectedLang}`);
  }
});

// Cambiar la velocidad de reproducción
document.getElementById("rate-velocidad").addEventListener("input", (event) => {
  currentRate = parseFloat(event.target.value); // Actualizar la velocidad
  console.log(`Velocidad actualizada: ${currentRate}`);
});

// Mostrar el modal de configuración
document.getElementById("configuracion").addEventListener("click", () => {
  document.getElementById("modal-configuracion").style.display = "flex";
  cargarVoces(); // Asegura que las voces estén cargadas
});

// Cerrar el modal de configuración
document.getElementById("close-configuracion-modal").addEventListener("click", () => {
  document.getElementById("modal-configuracion").style.display = "none";
});

// Función para reproducir texto con configuración actual
function reproducirDescripcion(descripcion) {
  const utterance = new SpeechSynthesisUtterance(descripcion);

  // Configurar la voz y la velocidad
  utterance.voice = currentVoice;
  utterance.rate = currentRate;
  utterance.lang = currentVoice ? currentVoice.lang : "es-ES"; // Asegurar el idioma

  // Reproducir el texto
  console.log(`Reproduciendo con voz: ${currentVoice.name}, idioma: ${currentVoice.lang}`);
  window.speechSynthesis.speak(utterance);
}

// Cargar las voces al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  if (typeof speechSynthesis !== "undefined") {
    // Asegurarse de que las voces están cargadas
    speechSynthesis.onvoiceschanged = cargarVoces;

    // Intentar cargar voces directamente si el evento no se activa
    if (speechSynthesis.getVoices().length > 0) {
      cargarVoces();
    }
  }

  // Inicializar las publicaciones
  GETPublicaciones();
});
