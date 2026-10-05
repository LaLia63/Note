document.addEventListener("DOMContentLoaded", function () {
  const notesContainer = document.getElementById("notes-container");
  const addNoteBtn = document.getElementById("add-note-btn");
  const noteModal = document.getElementById("note-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const saveNoteBtn = document.getElementById("save-note");
  const cancelModalBtn = document.getElementById("cancel-modal");
  const modalTitle = document.getElementById("modal-title");
  const noteTitleInput = document.getElementById("note-title");
  const noteContentInput = document.getElementById("note-content");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search");
  const backgroundColorInput = document.getElementById("background_color");
  const backgroundColorName = document.getElementById("background_color_name");
  const textColorInput = document.getElementById("text_color");
  const textColorName = document.getElementById("text_color_name");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let currentNoteId = null;
  let isEditing = false;

  init();

  function init() {
    renderNotes();
    updateEmptyState();
    updateBackgroundColorName();
    updateTextColorName();
  }

  function renderNotes(filteredNotes = null) {
    notesContainer.innerHTML = "";
    const notesToRender = filteredNotes || notes;
    notesToRender.forEach((note) => {
      const noteElement = createNoteElement(note);
      notesContainer.appendChild(noteElement);
    });
  }

  function createNoteElement(note) {
    const noteElement = document.createElement("div");
    noteElement.className = "note";
    noteElement.style.backgroundColor = note.backgroundColor || "#fff385";
    noteElement.style.color = note.textColor || "#000000";
    const formattedDate = new Date(
      note.updatedAt || note.id,
    ).toLocaleDateString();

    noteElement.innerHTML = `
      <div class="note-header">
        <div
          class="note-title"
          title="${note.title}"
        >
          ${note.title}
        </div>

        <div class="note-date">
          ${formattedDate}
        </div>

      </div>

      <div class="note-content">
        ${note.content}
      </div>

      <div class="note-footer">

        <div class="note-date">
          Last updated: ${formattedDate}
        </div>

        <div class="note-actions">

          <i
            class="fas fa-edit edit-note"
            data-id="${note.id}"
            title="Edit note"
          ></i>

          <i
            class="fas fa-trash-alt delete-note"
            data-id="${note.id}"
            title="Delete note"
          ></i>

        </div>

      </div>
    `;

    return noteElement;
  }

  function updateBackgroundColorName() {
    backgroundColorName.textContent = backgroundColorInput.value;
  }

  function updateTextColorName() {
    textColorName.textContent = textColorInput.value;
  }

  backgroundColorInput.addEventListener("input", updateBackgroundColorName);
  textColorInput.addEventListener("input", updateTextColorName);

  function updateEmptyState() {
    emptyState.style.display = notes.length === 0 ? "block" : "none";
  }

  function openModal(noteId = null) {
    isEditing = noteId !== null;
    currentNoteId = noteId;
    if (isEditing) {
      const noteToEdit = notes.find((note) => note.id === noteId);
      if (!noteToEdit) return;
      modalTitle.textContent = "Edit Note";
      noteTitleInput.value = noteToEdit.title;
      noteContentInput.value = noteToEdit.content;
      backgroundColorInput.value = noteToEdit.backgroundColor || "#fff385";
      textColorInput.value = noteToEdit.textColor || "#000000";
      updateBackgroundColorName();
      updateTextColorName();
    } else {
      modalTitle.textContent = "Add New Note";
      noteTitleInput.value = "";
      noteContentInput.value = "";
      backgroundColorInput.value = "#fff385";
      textColorInput.value = "#000000";
      updateBackgroundColorName();
      updateTextColorName();
    }
    noteModal.style.display = "flex";
  }

  function closeModal() {
    noteModal.style.display = "none";
    resetModal();
  }

  function resetModal() {
    noteTitleInput.value = "";
    noteContentInput.value = "";
    backgroundColorInput.value = "#fff385";
    textColorInput.value = "#000000";
    updateBackgroundColorName();
    updateTextColorName();
    currentNoteId = null;
    isEditing = false;
  }

  function deleteNote(noteId) {
    const swalWithButtons = Swal.mixin({
      customClass: {
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
      buttonsStyling: false,
    });
    swalWithButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
      })
      .then((result) => {
        if (result.isConfirmed) {
          notes = notes.filter((note) => note.id !== noteId);
          localStorage.setItem("notes", JSON.stringify(notes));
          renderNotes();
          updateEmptyState();
          swalWithButtons.fire({
            title: "Deleted!",
            text: "Your note has been deleted.",
            icon: "success",
          });
        }
      });
  }

  function searchNotes() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
      renderNotes();
      updateEmptyState();
      emptyState.querySelector("p").textContent =
        "No notes yet. Add your first note!";
      return;
    }
    const filteredNotes = notes.filter((note) => {
      return (
        note.title.toLowerCase().includes(searchTerm) ||
        note.content.toLowerCase().includes(searchTerm)
      );
    });
    renderNotes(filteredNotes);
    if (filteredNotes.length === 0) {
      emptyState.style.display = "block";
      emptyState.querySelector("p").textContent = "No notes found.";
    } else {
      emptyState.style.display = "none";
    }
  }

  function clearSearch() {
    searchInput.value = "";
    renderNotes();
    updateEmptyState();
    emptyState.querySelector("p").textContent =
      "No notes yet. Add your first note!";
  }

  function saveNote() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    if (!title || !content) {
      Swal.fire({
        title: "Please fill all fields",
        text: "Title and content are required.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }
    const selectedBackgroundColor = backgroundColorInput.value;
    const selectedTextColor = textColorInput.value;
    const editing = isEditing;
    if (editing) {
      notes = notes.map((note) => {
        if (note.id === currentNoteId) {
          return {
            ...note,
            title,
            content,
            backgroundColor: selectedBackgroundColor,
            textColor: selectedTextColor,
            updatedAt: Date.now(),
          };
        }
        return note;
      });
    } else {
      const newNote = {
        id: Date.now(),
        title,
        content,
        backgroundColor: selectedBackgroundColor,
        textColor: selectedTextColor,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      notes.push(newNote);
    }
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
    updateEmptyState();
    closeModal();
    Swal.fire({
      title: editing ? "Note Updated!" : "Note Created!",
      text: editing
        ? "Your note has been updated successfully."
        : "Your note has been created successfully.",
      icon: "success",
      confirmButtonText: "OK",
    });
  }
  notesContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-note")) {
      const noteId = Number(e.target.getAttribute("data-id"));
      deleteNote(noteId);
    } else if (e.target.classList.contains("edit-note")) {
      const noteId = Number(e.target.getAttribute("data-id"));
      openModal(noteId);
    }
  });
  addNoteBtn.addEventListener("click", () => openModal());
  saveNoteBtn.addEventListener("click", saveNote);
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  searchInput.addEventListener("input", searchNotes);
  clearSearchBtn.addEventListener("click", clearSearch);
  window.addEventListener("click", function (e) {
    if (e.target === noteModal) {
      closeModal();
    }
  });
});
