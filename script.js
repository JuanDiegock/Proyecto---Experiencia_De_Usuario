
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll("[data-view]");
const pageTitle = document.getElementById("page-title");

const titles = {
  home: "Mi portal académico",
  grades: "Mis notas",
  record: "Récord académico",
  comparison: "Antes y después"
};

// NAVEGACIÓN ENTRE PANTALLAS
function showView(name) {
  views.forEach(view => {
    const active = view.id === `view-${name}`;
    view.classList.toggle("active", active);
    view.hidden = !active;
  });

  document.querySelectorAll(".nav-button").forEach(button => {
    const active = button.dataset.view === name;
    button.classList.toggle("active", active);

    if (active) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  pageTitle.textContent = titles[name] || titles.home;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navButtons.forEach(button => {
  button.addEventListener("click", event => {
    event.preventDefault();
    showView(button.dataset.view);
  });
});

// MENSAJE TEMPORAL
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// DETALLE DEL CURSO
const dialog = document.getElementById("detail-dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogMessage = document.getElementById("dialog-message");

function openDetails(course) {
  dialogTitle.textContent = course;

  if (course === "Base de Datos") {
    dialogMessage.textContent =
      "La evaluación todavía no tiene una nota publicada. Puedes volver a consultar más adelante.";
  } else {
    dialogMessage.textContent =
      "Información académica de demostración. Este prototipo no consulta el sistema real de INFOSIL.";
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    showToast(dialogMessage.textContent);
  }
}

document.querySelectorAll(".detail-button").forEach(button => {
  button.addEventListener("click", () => {
    openDetails(button.dataset.course);
  });
});

document.getElementById("close-dialog").addEventListener("click", () => {
  dialog.close();
});

document.getElementById("dialog-done").addEventListener("click", () => {
  dialog.close();
});

// CERRAR EL DIÁLOGO AL HACER CLIC FUERA
dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    dialog.close();
  }
});

// ESTADOS DE LA PANTALLA DE NOTAS
const gradeSearch = document.getElementById("grade-search");
const gradeState = document.getElementById("grade-state");
const gradeList = document.getElementById("grade-list");
const gradesMessage = document.getElementById("grades-message");

function renderGrades() {
  const state = gradeState.value;
  const query = gradeSearch.value.trim().toLocaleLowerCase("es");
  const cards = [...gradeList.querySelectorAll(".course-card")];

  gradesMessage.hidden = state === "success";
  gradeList.hidden = state !== "success";

  gradesMessage.className = "message";

  if (state === "loading") {
    gradesMessage.classList.add("loading");
    gradesMessage.textContent = "Cargando tus notas…";
  }

  if (state === "empty") {
    gradesMessage.classList.add("empty");
    gradesMessage.textContent =
      "No hay evaluaciones disponibles para este ciclo todavía.";
  }

  if (state === "error") {
    gradesMessage.classList.add("error");
    gradesMessage.replaceChildren();

    const text = document.createElement("p");
    text.textContent =
      "No pudimos cargar tus notas. Inténtalo nuevamente.";

    const retry = document.createElement("button");
    retry.className = "detail-button";
    retry.textContent = "Reintentar";

    retry.addEventListener("click", () => {
      gradeState.value = "success";
      renderGrades();
      showToast("Vista de demostración cargada.");
    });

    gradesMessage.append(text, retry);
  }

  let visibleCount = 0;

  cards.forEach(card => {
    const matches = card.textContent
      .toLocaleLowerCase("es")
      .includes(query);

    card.hidden = state !== "success" || !matches;

    if (!card.hidden) visibleCount++;
  });

  if (state === "success" && visibleCount === 0) {
    gradesMessage.hidden = false;
    gradesMessage.className = "message empty";
    gradesMessage.textContent =
      "No encontramos cursos con ese texto. Prueba otra búsqueda.";
  }
}

gradeSearch.addEventListener("input", renderGrades);
gradeState.addEventListener("change", renderGrades);

// BÚSQUEDA Y FILTRO DEL RÉCORD ACADÉMICO
const recordSearch = document.getElementById("record-search");
const cycleFilter = document.getElementById("cycle-filter");
const recordState = document.getElementById("record-state");
const recordTable = document.getElementById("record-table");
const recordMessage = document.getElementById("record-message");
const noResults = document.getElementById("record-no-results");

function renderRecord() {
  const state = recordState.value;
  const query = recordSearch.value.trim().toLocaleLowerCase("es");
  const cycle = cycleFilter.value;

  const rows = [
    ...document.querySelectorAll("#record-list tr")
  ];

  recordTable.hidden = state !== "success";
  recordMessage.hidden = state === "success";
  noResults.hidden = true;

  recordMessage.className = "message";

  if (state === "loading") {
    recordMessage.classList.add("loading");
    recordMessage.textContent =
      "Consultando tu récord académico…";
  }

  if (state === "empty") {
    recordMessage.classList.add("empty");
    recordMessage.textContent =
      "No hay cursos registrados para mostrar.";
  }

  if (state === "error") {
    recordMessage.classList.add("error");
    recordMessage.replaceChildren();

    const text = document.createElement("p");
    text.textContent =
      "No pudimos cargar tu récord. Inténtalo nuevamente.";

    const retry = document.createElement("button");
    retry.className = "detail-button";
    retry.textContent = "Reintentar";

    retry.addEventListener("click", () => {
      recordState.value = "success";
      renderRecord();
      showToast("Récord de demostración cargado.");
    });

    recordMessage.append(text, retry);
  }

  let visibleCount = 0;

  rows.forEach(row => {
    const matchesText = row.textContent
      .toLocaleLowerCase("es")
      .includes(query);

    const matchesCycle =
      cycle === "all" || row.dataset.cycle === cycle;

    row.hidden =
      state !== "success" ||
      !matchesText ||
      !matchesCycle;

    if (!row.hidden) visibleCount++;
  });

  if (state === "success" && visibleCount === 0) {
    noResults.hidden = false;
    noResults.className = "message empty";
  }
}

recordSearch.addEventListener("input", renderRecord);
cycleFilter.addEventListener("change", renderRecord);
recordState.addEventListener("change", renderRecord);

// CARGAR LA VISTA INICIAL
renderGrades();
renderRecord();
