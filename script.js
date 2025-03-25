if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/service-worker.js")
    .then((registration) => {
      console.log("Service Worker registrado con éxito:", registration);
    })
    .catch((error) => {
      console.error("Error al registrar el Service Worker:", error);
    });
}


const btnGastos = document.getElementById("btn-gastos");
const btnNotas = document.getElementById("btn-notas");
const btnRecordatorios = document.getElementById("btn-recordatorios");

const sectionGastos = document.getElementById("section-gastos");
const sectionNotas = document.getElementById("section-notas");
const sectionRecordatorios = document.getElementById("section-recordatorios");

const btnNuevoGasto = document.getElementById("nuevo-gasto-btn");
const btnNuevaNota = document.getElementById("nueva-nota-btn");
const btnNuevoRecordatorio = document.getElementById("nuevo-recordatorio-btn");

function mostrarSeccion(seccion) {
  sectionGastos.style.display = "none";
  sectionNotas.style.display = "none";
  sectionRecordatorios.style.display = "none";

  btnNuevoGasto.style.display = "none";
  btnNuevaNota.style.display = "none";
  btnNuevoRecordatorio.style.display = "none";

  seccion.style.display = "block";

  if (seccion === sectionGastos) {
    btnNuevoGasto.style.display = "block";
  } else if (seccion === sectionNotas) {
    btnNuevaNota.style.display = "block";
  } else if (seccion === sectionRecordatorios) {
    btnNuevoRecordatorio.style.display = "block";
  }
}

btnGastos.addEventListener("click", () => {
  const tablaGastos = document.querySelector(".gastos-scrollable table");
  tablaGastos.innerHTML = "";

  mostrarSeccion(sectionGastos);

  recuperarElementosEnDb2_0("gastos-tienda", 0).then(([datos, error]) =>{    
    if(!error){
      for (let elementoIndividual of datos){
        agregarGastoEnTabla(elementoIndividual.nombreGasto, elementoIndividual.montoGasto, elementoIndividual.fechaYHora, elementoIndividual.id);
      }
    }
  })
});

btnNotas.addEventListener("click", () => {
  const contenedorRecordatorios = document.getElementById("categories-scrollable");
  contenedorRecordatorios.innerHTML = " "; 

  mostrarSeccion(sectionNotas)

  recuperarElementosEnDb2_0("categorias-tienda", 0).then(([datos, error]) => {
    if(!error){
      for(let objetoCategorias of datos){
        agregarCategoriaEnTabla(objetoCategorias.nombreCategoria, objetoCategorias.id);
      }
    }
  })
});

btnRecordatorios.addEventListener("click", () => {
  const contenedorRecordatorios = document.getElementById("recordatorios-scrollable");
  contenedorRecordatorios.innerHTML = " ";

  mostrarSeccion(sectionRecordatorios)

  recuperarElementosEnDb2_0("recordatorios-tienda", 0).then(([datos, error]) =>{    
    if(!error){
      for (let objetoRecordatorio of datos){
        agregarRecordatorioEnTabla(objetoRecordatorio.tituloRecordatorio, objetoRecordatorio.descripcionRecordatorio, objetoRecordatorio.id);
      }
    }
  })
});

// Agregar un nuevo contenedor de categoría
const addCategoryBtn = document.getElementById("add-category-btn");
const categoriesScrollable = document.getElementById("categories-scrollable");

// Obtener elementos del modal
const categoryModal = document.getElementById("category-modal");
const categoryInput = document.getElementById("category-name");
const addCategoryConfirm = document.getElementById("add-category-confirm");
const closeModal = document.getElementById("close-modal");

// Mostrar el modal cuando se presione "Agregar Categoría"
addCategoryBtn.addEventListener("click", () => {
  categoryInput.value = ""; // Limpiar el input antes de abrir el modal
  categoryModal.style.display = "flex";
});

// Cerrar el modal al presionar "Cancelar"
closeModal.addEventListener("click", () => {
  categoryModal.style.display = "none";
});

function agregarCategoriaEnTabla(categoryName, idElemento){
  const newCategory = document.createElement("div");
      newCategory.className = "notes-container";
      newCategory.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h1 style="display: none;" class="id_categoria">${idElemento}</h1>
          <p class="category-name">${categoryName}</p>
          <div style="display: flex; align-items: center;">
            <span class="item-count">0</span>  
            <button class="small-action-btn">🔽</button>
            <button class="update-category">✏️</button>
          <button class="delete-category">🗑️</button>
          </div>
        </div>
        <div class="category-table hidden">
          <table>
            <tbody></tbody>
          </table>
        </div>`;

      categoriesScrollable.appendChild(newCategory);
      setupToggleTable(newCategory, categoryName);
      updateCategoryCount(newCategory);

      // Cerrar el modal después de agregar la categoría
      categoryModal.style.display = "none";
      
      newCategory.querySelector(".delete-category").addEventListener("click", () => eliminarCategoria(newCategory, idElemento));
      newCategory.querySelector(".update-category").addEventListener("click", () => actualizarCategoria(newCategory));
}

// Agregar la nueva categoría al presionar "Agregar"
addCategoryConfirm.addEventListener("click", () => {
  const categoryName = categoryInput.value.trim();

  if (!categoryName) {
    alert("Por favor, ingresa un nombre para la categoría.");
    return;
  }

  agregarElementoEnDb2_0({nombreCategoria: categoryName}, "categorias-tienda").then(([id_elemento, error]) => {
    if(!error){
      agregarCategoriaEnTabla(categoryName, id_elemento);
    }
    else alert(dato);
  })
});

//codigo que se usa para mostrar los productos en la categoria que estamos actualmente
function setupToggleTable(category, categoriaObjetivo) {
  const toggleButton = category.querySelector(".small-action-btn");
  const table = category.querySelector(".category-table");

  toggleButton.addEventListener("click", event => {
    event.stopPropagation(); // Evita activar eventos en el contenedor padre

    if (table.classList.contains("hidden")) {
      table.style.maxHeight = table.scrollHeight + "px";
      toggleButton.textContent = "🔼";

      //accede al contenedor de la categoria
      let tbody = table.childNodes[1].childNodes[1]

      //limpia el contenedor antes de mostrar los nuevo datos 
      tbody.innerHTML = " ";

      //obten varios productos
      recuperarElementosEnDb2_0("productos-tienda", 0).then(([datos, error]) => {
        if(!error){
          //encuntra solo los datos con la categoria en la que estamos actualmente
          datos.filter((objetoProducto) => objetoProducto.categoria == categoriaObjetivo)
          .forEach(element => {
            const newRow = document.createElement("tr");
            newRow.innerHTML = `
              <td>${element.nombreProducto}</td>
              <td>${element.cantidadElemento}</td>
              <td>${element.tipoElemento}</td>
              <td style="display: none;">${element.id}</td>
              <td>
                <button class="eliminar-elemento-nota">🗑️</button>
              </td>
            `;

            // Agregar evento para eliminar la fila
            newRow.querySelector(".eliminar-elemento-nota").addEventListener("click", () => {
              eliminarElementoNota(newRow, element.id);
            });

            tbody.appendChild(newRow);
          });
        }
      })
    } else {
      table.style.maxHeight = "0";
      toggleButton.textContent = "🔽";
    }

    table.classList.toggle("hidden");
  });
}

function updateCategoryCount(category) {
  const itemCount = category.querySelector(".item-count");
  const table = category.querySelector("table tbody");

  const updateCount = () => {
    itemCount.textContent = table.querySelectorAll("tr").length;
  };

  // Monitorear la adición y eliminación de elementos
  category.addEventListener("click", event => {
    if (event.target.classList.contains("delete-btn")) {
      event.target.closest("tr").remove();
      updateCount();
    }
  });

  updateCount();
}

// Mostrar/ocultar tabla al hacer clic en una categoría
function toggleCategoryTable(event) {
  // Evitar que el evento se propague al contenedor
  event.stopPropagation();

  const table = this.querySelector(".category-table");
  if (table.style.display === "none" || table.style.display === "") {
    table.style.display = "block";
  } else {
    table.style.display = "none";
  }
}

// Añadir eventos a los botones de las filas de cada tabla
function addRowButtonListeners(category) {
  const updateButtons = category.querySelectorAll(".update-btn");
  const deleteButtons = category.querySelectorAll(".delete-btn");

  updateButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation(); // Prevenir que el evento afecte a la categoría
      console.log("Actualizar fila");
    });
  });

  deleteButtons.forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation(); // Prevenir que el evento afecte a la categoría
      console.log("Eliminar fila");
    });
  });
}

// Inicializar eventos para las categorías existentes
const categories = document.querySelectorAll(".notes-container");
categories.forEach(category => {
  category.addEventListener("click", toggleCategoryTable);
  addRowButtonListeners(category);
});

const gastoModal = document.getElementById("gasto-modal");
const gastoModalTexto = document.getElementById("gasto-modal-texto");
const cerrarGastoModal = document.getElementById("cerrar-gasto-modal");
const eliminarGastoBtn = document.getElementById("eliminar-gasto-btn");
const actualizarGastoBtn = document.getElementById("actualizar-gasto-btn");

let filaSeleccionada = null; // Guardar referencia a la fila seleccionada

// Detectar clic en una fila de la tabla de gastos
document.querySelectorAll(".gastos-scrollable table tr").forEach(row => {
  row.addEventListener("click", function () {
    mostrarGastoModal(row);
  });
});

// Función para mostrar el modal con la información del gasto
function mostrarGastoModal(row) {
  filaSeleccionada = row; // Guardar referencia a la fila
  const celdas = row.getElementsByTagName("td");

  if (celdas.length > 0) {
    gastoModalTexto.innerHTML = `
      <strong>Descripción:</strong> ${celdas[0].innerText} <br>
      <strong>Fecha:</strong> ${celdas[1].innerText} <br>
      <strong>Monto:</strong> ${celdas[2].innerText}
    `;

    actualizarGastoBtn.addEventListener("click", actualizarGastoEnTabla(celdas))
    gastoModal.style.display = "flex"; // Se muestra el modal
  }
}

// Cerrar el modal al hacer clic en el botón de cerrar
cerrarGastoModal.addEventListener("click", () => {
  gastoModal.style.display = "none";
});

// Cerrar el modal si se hace clic fuera del contenido
window.addEventListener("click", event => {
  if (event.target === gastoModal) {
    gastoModal.style.display = "none";
  }
});

// Función para eliminar la fila seleccionada
eliminarGastoBtn.addEventListener("click", () => {
  if (filaSeleccionada) {
    let id_secreto_fila = filaSeleccionada.getElementsByTagName("td")[3].innerText

    id_secreto_fila = +id_secreto_fila //convierte el id en un numero
    eliminarElementoEnDb2_0("gastos-tienda", id_secreto_fila).then(([dato, error]) =>{
      if(!error){        
        filaSeleccionada.remove(); // Eliminar la fila de la tabla
        gastoModal.style.display = "none"; // Cerrar el modal después de eliminar
        filaSeleccionada = null; // Limpiar referencia
      }
      else{
        alert("Ocurrio un erro al eliminar el elemento")
        console.log(error)
      }
    })
  }
});

// Función para actualizar (puedes implementar la edición más adelante)
function actualizarGastoEnTabla(infoDeGasto){
  const cerrarModalBtns = document.querySelectorAll('#cerrar-modal-actualizar-gastos, #cancelar-modal-actualizar-gastos');
  const fondoModal = document.getElementById('fondo-modal-actualizar-gastos');
  const botonHoraActual = document.getElementById('boton-hora-actual-modal');
  const inputHora = document.getElementById('hora-gasto-modal');

  //coloca el nombre del gasto en el input del modal de actualizacion
  document.getElementById("nombre-gasto-modal").value = infoDeGasto[0].innerText;

  const partesFechaYHora = infoDeGasto[1].innerText.split(' ');

  //coloca la fecha del gasto en el input del modal de actualizacion
  let formatoYYY_MM_DD = partesFechaYHora[0].trim().replaceAll("/", "-");
  const [dia, mes, año] = formatoYYY_MM_DD.split("-");
  document.getElementById("fecha-gasto-modal").value = `${año}-${mes}-${dia}`;

  inputHora.value = partesFechaYHora[1]

  //coloca el monto del gastos en el input del modal de actualizacion
  document.getElementById("monto-gasto-modal").value = infoDeGasto[2].innerText.substring(1);
  
  //guarda el id del producto en el modal pero sin mostrarlo, para despues usarlo para actualizar el gasto
  document.getElementById("contenedor-id-secreto-gasto").innerText = infoDeGasto[3].innerText;

  //verifica si se preciono el boton de actualizar gasto y si es asi, muestra el modal con la informacion
  actualizarGastoBtn.addEventListener('click', () => {
        //cierra el modal donde se muestra la info del gasto
        gastoModal.style.display = "none";

        //muestra el modal
        fondoModal.style.display = 'flex';
    });

  cerrarModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      fondoModal.style.display = 'none';
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target === fondoModal) {
      fondoModal.style.display = 'none';
    }
  });

  botonHoraActual.addEventListener('click', () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    inputHora.value = `${hours}:${minutes}:${seconds}`;
  });
};

function agregarGastoEnTabla(nombreGasto, montoGasto, fechaYHora, idElemento){
  // Seleccionamos la tabla de gastos
  const tablaGastos = document.querySelector(".gastos-scrollable table");

  // Crear nueva fila con los datos ingresados
  const nuevaFila = document.createElement("tr");
  nuevaFila.innerHTML = `
    <td>${nombreGasto}</td>
    <td>${fechaYHora}</td>
    <td>Q${parseFloat(montoGasto).toFixed(2)}</td>
    <td style="display: none;">${idElemento}</td>
  `;

  // Agregar evento para mostrar detalles en el modal al hacer clic
  nuevaFila.addEventListener("click", function () {
    mostrarGastoModal(nuevaFila);
  });

  // Agregar la fila a la tabla
  tablaGastos.appendChild(nuevaFila);

}

document.getElementById("guardar-modal-actualizar-gastos").addEventListener("click", () => {
  let nombreGasto = document.getElementById("nombre-gasto-modal").value.trim();
  let fechaGasto = document.getElementById("fecha-gasto-modal").value.trim();

  let [año, mes, dia] = fechaGasto.split("-");

  let horaGasto = document.getElementById("hora-gasto-modal").value.trim();
  let montoGasto = document.getElementById("monto-gasto-modal").value.trim();
  let idSecretoGasto = document.getElementById("contenedor-id-secreto-gasto").innerText;
  idSecretoGasto = +idSecretoGasto;

  actualizarElementoEnDb2_0("gastos-tienda", {nombreGasto: nombreGasto, fechaYHora: `${dia}/${mes}/${año} ${horaGasto}`, montoGasto: montoGasto}, idSecretoGasto).then(([dato, error]) => {
    if(!error){
      document.getElementById('fondo-modal-actualizar-gastos').style.display = 'none'; //ciera el modal 
      alert("Se actualizo correctamente");
    }
  })
});

gastoModal.style.display = "none";

const modalNuevoGastoContainer = document.getElementById("modal-nuevo-gasto-container");
const btnAbrirModalNuevoGasto = document.getElementById("nuevo-gasto-btn");
const btnCerrarModalNuevoGasto = document.getElementById("cerrar-modal-nuevo-gasto");
const btnCancelarNuevoGasto = document.getElementById("cancelar-nuevo-gasto-btn");
const btnAceptarNuevoGasto = document.getElementById("aceptar-nuevo-gasto-btn");

// Inputs del modal
const inputNombreNuevoGasto = document.getElementById("input-nombre-nuevo-gasto");
const inputMontoNuevoGasto = document.getElementById("input-monto-nuevo-gasto");

// Mostrar modal cuando se haga clic en "Nuevo Gasto"
btnAbrirModalNuevoGasto.addEventListener("click", () => {
  modalNuevoGastoContainer.style.display = "flex";
});

// Cerrar modal con el botón de cerrar o cancelar
btnCerrarModalNuevoGasto.addEventListener("click", cerrarModalNuevoGasto);
btnCancelarNuevoGasto.addEventListener("click", cerrarModalNuevoGasto);

function cerrarModalNuevoGasto() {
  modalNuevoGastoContainer.style.display = "none";
  inputNombreNuevoGasto.value = ""; // Limpiar campos
  inputMontoNuevoGasto.value = "";
}

// Cerrar modal si se hace clic fuera del contenido
window.addEventListener("click", (event) => {
  if (event.target === modalNuevoGastoContainer) {
    cerrarModalNuevoGasto();
  }
});
// Función para agregar un nuevo gasto a la tabla
btnAceptarNuevoGasto.addEventListener("click", () => {
  const nombreGasto = inputNombreNuevoGasto.value.trim();
  const montoGasto = inputMontoNuevoGasto.value.trim();
  const fechaActual = new Date();
  const año = fechaActual.getFullYear();
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const horas = String(fechaActual.getHours()).padStart(2, '0');
  const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
  const segundos = String(fechaActual.getSeconds()).padStart(2, '0');

  const fechaYHora = `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;

  if (nombreGasto === "" || montoGasto === "" || isNaN(montoGasto) || montoGasto <= 0) {
    alert("Por favor, ingrese un nombre válido y un monto mayor a 0.");
    return;
  }

  agregarElementoEnDb2_0({nombreGasto: nombreGasto, fechaYHora: fechaYHora, montoGasto: montoGasto}, "gastos-tienda").then(([id_elemento, error]) => {
    if(!error) {
      agregarGastoEnTabla(nombreGasto, montoGasto, fechaYHora, id_elemento);
    }
    else alert(error);
  });

  // Cerrar el modal
  cerrarModalNuevoGasto();
});

const modalNuevoElementoNota = document.getElementById("modal-nuevo-elemento-nota");

const btnCancelarElementoNota = document.getElementById("btn-cancelar-elemento-nota");

// Mostrar modal al presionar "Nueva Nota"
btnNuevaNota.addEventListener("click", () => {
  modalNuevoElementoNota.style.display = "flex";
  actualizarListaCategoriasNota(); // Llenar el select con categorías existentes
});

// Ocultar modal al presionar "Cancelar"
btnCancelarElementoNota.addEventListener("click", () => {
  modalNuevoElementoNota.style.display = "none";
});

// Cerrar modal al hacer clic fuera del contenido
window.addEventListener("click", (event) => {
  if (event.target === modalNuevoElementoNota) {
    modalNuevoElementoNota.style.display = "none";
  }
});

// Función para llenar el select con las categorías existentes
function actualizarListaCategoriasNota() {
  const selectCategoriaNota = document.getElementById("select-categoria-nota");
  selectCategoriaNota.innerHTML = ""; // Limpiar opciones previas

  const categoriasNota = document.querySelectorAll(".notes-container p"); // Obtener nombres de categorías

  if (categoriasNota.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No hay categorías disponibles";
    selectCategoriaNota.appendChild(option);
  } else {
    categoriasNota.forEach(categoria => {
      const option = document.createElement("option");
      option.value = categoria.textContent;
      option.textContent = categoria.textContent;
      selectCategoriaNota.appendChild(option);
    });
  }
}

//mantiene oculto el modal, hasta que se muestre
modalNuevoElementoNota.style.display = "none";

const btnAgregarElementoNota = document.getElementById("btn-agregar-elemento-nota");

btnAgregarElementoNota.addEventListener("click", () => {
  const nombreElemento = document.getElementById("input-nombre-elemento-nota").value.trim();
  const cantidadElemento = document.getElementById("input-cantidad-elemento-nota").value.trim();
  const tipoElemento = document.getElementById("select-tipo-elemento-nota").value;
  const categoriaSeleccionada = document.getElementById("select-categoria-nota").value;

  //primero verifica que la informacion sea correcta y no esten vacios
  if (!nombreElemento || !cantidadElemento || !categoriaSeleccionada) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  //luego guarda los datos en la db y verifica que todo salga bien
  agregarElementoEnDb2_0({nombreProducto: nombreElemento, cantidadElemento: cantidadElemento, tipoElemento: tipoElemento, categoria: categoriaSeleccionada}, "productos-tienda")
  .then(([id_elemento, error]) => {
    console.log("incio de then", id_elemento)
    //verifica si los datos se guardaron correctamente
    if(!error){
      //muestra los datos en la categoria correcta

      // Buscar la categoría correspondiente
      const categorias = document.querySelectorAll(".notes-container");
      let categoriaEncontrada = null;

      categorias.forEach((categoria) => {
        const nombreCategoria = categoria.querySelector("p").textContent;
        if (nombreCategoria === categoriaSeleccionada) {
          categoriaEncontrada = categoria;
        }
      });

      if (categoriaEncontrada) {
        // Buscar o crear la tabla dentro de la categoría
        let categoryTable = categoriaEncontrada.querySelector(".category-table table");

        if (!categoryTable) {
          const tableContainer = document.createElement("div");
          tableContainer.className = "category-table";
          tableContainer.innerHTML = `
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody></tbody>
            </table>
          `;
          categoriaEncontrada.appendChild(tableContainer);
          categoryTable = tableContainer.querySelector("table");
        }
        
        // Agregar la nueva fila
        const tbody = categoryTable.querySelector("tbody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${nombreElemento}</td>
          <td>${cantidadElemento}</td>
          <td>${tipoElemento}</td>
          <td style="display: none;">${id_elemento}</td>
          <td>
            <button class="eliminar-elemento-nota">🗑️</button>
          </td>
        `;

        // Agregar evento para eliminar la fila
        newRow.querySelector(".eliminar-elemento-nota").addEventListener("click", () => {
          console.log("dentro de evento de eliminar", id_elemento)
          eliminarElementoNota(newRow, id_elemento);
        });

        tbody.appendChild(newRow);

        // Cerrar modal y limpiar inputs
        document.getElementById("modal-nuevo-elemento-nota").style.display = "none";
        document.getElementById("input-nombre-elemento-nota").value = "";
        document.getElementById("input-cantidad-elemento-nota").value = "";
      } else {
        alert("Error: No se encontró la categoría seleccionada.");
      }
    }
    else alert(error);
  })
});

function eliminarElementoNota(fila, idElemento) {
  console.log(idElemento)
  if (confirm("¿Seguro que quieres eliminar este elemento?")) {
    eliminarElementoEnDb2_0("productos-tienda", idElemento)
    .then(([dato, error]) => {
      if(!error) fila.remove();
      else alert(error)
    })
  }
}

function eliminarCategoria(categoria, idElemento) {
  if (confirm("¿Seguro que quieres eliminar esta categoría y todos sus elementos?")) {

    eliminarElementoEnDb2_0("categorias-tienda", idElemento).then(([dato, error]) => {
      if(!error) categoria.remove();
      else alert(error);
    })
  }
}

function actualizarCategoria(categoria) {
  const nombreActual = categoria.querySelector(".category-name").textContent;
  const nuevoNombre = prompt("Ingrese el nuevo nombre de la categoría:", nombreActual);

  if (nuevoNombre && nuevoNombre.trim() !== "") {
    categoria.querySelector(".category-name").textContent = nuevoNombre.trim();
  } else {
    alert("El nombre no puede estar vacío.");
  }
}


let categoriaSeleccionada = null;

function actualizarCategoria(categoria) {
  categoriaSeleccionada = categoria; // Guardamos la categoría seleccionada
  const nombreActual = categoria.querySelector(".category-name").textContent;
  document.getElementById("inputNuevoNombreCategoria").value = nombreActual; // Mostramos el nombre actual en el input
  document.getElementById("modalActualizarCategoria").style.display = "flex"; // Mostramos el modal
}

// Evento para cerrar el modal sin guardar cambios
document.getElementById("btnCancelarActualizarCategoria").addEventListener("click", () => {
  document.getElementById("modalActualizarCategoria").style.display = "none";
});

// Evento para guardar cambios y actualizar el nombre
document.getElementById("btnGuardarActualizarCategoria").addEventListener("click", () => {
  const nuevoNombreCategoria = document.getElementById("inputNuevoNombreCategoria").value.trim(); //nuevo nombre que se introduce en el modal
  if (nuevoNombreCategoria) {
    let id_categoria_Actual = categoriaSeleccionada.querySelector(".id_categoria").innerText
    id_categoria_Actual = +id_categoria_Actual

    actualizarElementoEnDb2_0("categorias-tienda", {nombreCategoria: nuevoNombreCategoria}, id_categoria_Actual).then(([dato, error])  => {
      if(!error){
        categoriaSeleccionada.querySelector(".category-name").textContent = nuevoNombreCategoria;
        document.getElementById("modalActualizarCategoria").style.display = "none"; // Ocultamos el modal
      }   
    })
  } else {
    alert("El nombre no puede estar vacío.");
  }
});

document.getElementById("modalActualizarCategoria").style.display = "none";

// Obtener elementos del modal
const modalNuevoRecordatorio = document.getElementById("modalNuevoRecordatorio");

const btnCerrarRecordatorio = document.getElementById("cancelarRecordatorio");
const btnGuardarRecordatorio = document.getElementById("guardarRecordatorio");

const contenedorScroll = document.getElementById("recordatorios-scrollable")

function agregarRecordatorioEnTabla(titulo, descripcion, idElemento){
  // Crear un nuevo div para el recordatorio
  const nuevoRecordatorio = document.createElement("div");
  nuevoRecordatorio.className = "nota-recordatorio";

    // Agregar contenido del recordatorio
  nuevoRecordatorio.innerHTML = `
    <div class="titulo-recordatorio">${titulo}</div>
    <div class="contenido-recordatorio">${descripcion}</div>
    <div style="display: none;" class="id_recordatorio">${idElemento}</div>
    <div class="botones-recordatorio">
      <button class="btn-accion-recordatorio btn-actualizar-recordatorio">Actualizar</button>
      <button class="btn-accion-recordatorio btn-eliminar-recordatorio">Eliminar</button>
    </div>
  `;
  
  // Agregar evento al botón de eliminar
  nuevoRecordatorio.querySelector(".btn-eliminar-recordatorio").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres eliminar este recordatorio?")) {

      eliminarElementoEnDb2_0("recordatorios-tienda", idElemento).then(([dato, error]) => {
        if(!error) nuevoRecordatorio.remove(); // Elimina el recordatorio
        else alert(error);
      })
    }
  });

  // Agregar evento al botón de actualizar
  nuevoRecordatorio.querySelector(".btn-actualizar-recordatorio").addEventListener("click", () => {
    abrirModalActualizarNotaRecordatorio(nuevoRecordatorio);
  });
  
  // Agregar el recordatorio al contenedor
  contenedorScroll.appendChild(nuevoRecordatorio)
  
  // Ocultar modal después de guardar
  modalNuevoRecordatorio.style.display = "none";

  // Limpiar los campos
  document.getElementById("tituloRecordatorio").value = "";
  document.getElementById("descripcionRecordatorio").value = "";
}

// Abrir el modal cuando se presiona el botón "Nuevo Recordatorio"
btnNuevoRecordatorio.addEventListener("click", () => {
  modalNuevoRecordatorio.style.display = "block";
});

// Cerrar el modal cuando se presiona "Cancelar"
btnCerrarRecordatorio.addEventListener("click", () => {
  modalNuevoRecordatorio.style.display = "none";
});

// Guardar recordatorio (lógica a completar)
btnGuardarRecordatorio.addEventListener("click", () => {
  const titulo = document.getElementById("tituloRecordatorio").value;
  const descripcion = document.getElementById("descripcionRecordatorio").value;

  if (titulo.trim() === "" || descripcion.trim() === "") {
    alert("Por favor, completa todos los campos.");
    return;
  }
  
  agregarElementoEnDb2_0({tituloRecordatorio: titulo, descripcionRecordatorio: descripcion}, "recordatorios-tienda").then(([id_elemento, error]) =>{
    if(!error){
      agregarRecordatorioEnTabla(titulo, descripcion, id_elemento);
    }
    else alert(error);
  })
});

// Cerrar el modal si se hace clic fuera de él
window.addEventListener("click", (event) => {
  if (event.target === modalNuevoRecordatorio) {
    modalNuevoRecordatorio.style.display = "none";
  }
});

// Referencias al modal y sus elementos
const modalActualizarNotaRecordatorio = document.getElementById("modalActualizarNotaRecordatorio");
const inputActualizarTituloNotaRecordatorio = document.getElementById("inputActualizarTituloNotaRecordatorio");
const inputActualizarContenidoNotaRecordatorio = document.getElementById("inputActualizarContenidoNotaRecordatorio");
const guardarActualizarNotaRecordatorio = document.getElementById("guardarActualizarNotaRecordatorio");
const cancelarActualizarNotaRecordatorio = document.getElementById("cancelarActualizarNotaRecordatorio");

let notaRecordatorioActual; // Variable para almacenar el recordatorio que se va a actualizar

// Función para abrir el modal con los datos actuales del recordatorio
function abrirModalActualizarNotaRecordatorio(recordatorio) {
  notaRecordatorioActual = recordatorio;
  inputActualizarTituloNotaRecordatorio.value = recordatorio.querySelector(".titulo-recordatorio").textContent;
  inputActualizarContenidoNotaRecordatorio.value = recordatorio.querySelector(".contenido-recordatorio").textContent;
  modalActualizarNotaRecordatorio.style.display = "flex";
}

// Evento para guardar los cambios
guardarActualizarNotaRecordatorio.addEventListener("click", () => {
  if (notaRecordatorioActual) {
    let id_recordatorioActual = notaRecordatorioActual.querySelector(".id_recordatorio").innerText.trim();
    id_recordatorioActual = + id_recordatorioActual

    actualizarElementoEnDb2_0("recordatorios-tienda", {tituloRecordatorio: inputActualizarTituloNotaRecordatorio.value, descripcionRecordatorio: inputActualizarContenidoNotaRecordatorio.value}, id_recordatorioActual).then(([dato, error]) => {
      if(!error){
        notaRecordatorioActual.querySelector(".titulo-recordatorio").textContent = inputActualizarTituloNotaRecordatorio.value;
        notaRecordatorioActual.querySelector(".contenido-recordatorio").textContent = inputActualizarContenidoNotaRecordatorio.value;
        modalActualizarNotaRecordatorio.style.display = "none"; // Cerrar modal
        alert(dato);
      }
    })
  }
});

// Evento para cancelar la actualización
cancelarActualizarNotaRecordatorio.addEventListener("click", () => {
  modalActualizarNotaRecordatorio.style.display = "none"; // Cerrar modal sin guardar cambios
});

//mantiene oculto el modal, hasta que sea necesario
modalActualizarNotaRecordatorio.style.display = "none";
