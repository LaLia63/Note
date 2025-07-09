document.addEventListener('DOMContentLoaded', function () {
    const notesContainer = document.getElementById('notes-container');
    const addNoteBtn = document.getElementById('add-note-btn');
    const noteModal = document.getElementById('note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const modalTitle = document.getElementById('modal-title');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let currentNoteId = null;
    let isEditing = false;

    init();

    function init() {
        renderNotes();
        updateEmptyState();
    }

    function renderNotes(filteredNotes = null) {
        notesContainer.innerHTML = '';
        const notesToRender = filteredNotes || notes;

        notesToRender.forEach(note => {
            const noteElement = createNoteElement(note);
            notesContainer.appendChild(noteElement);
        });
    }

    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.style.backgroundColor = note.color || '#fffacd';

        const formattedDate = new Date(note.updatedAt || note.id).toLocaleDateString();

        noteElement.innerHTML = `
            <div class="note-header">
                <div class="note-title" title="${note.title}">${note.title}</div>
                <div class="note-date">${formattedDate}</div>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <div class="note-date">Last updated: ${formattedDate}</div>
                <div class="note-actions">
                    <i class="fas fa-edit edit-note" data-id="${note.id}"></i>
                    <i class="fas fa-trash-alt delete-note" data-id="${note.id}"></i>
                </div>
            </div>
        `;
        return noteElement;
    }

    function updateEmptyState() {
        emptyState.style.display = notes.length === 0 ? 'block' : 'none';
    }

    function openModal(noteId = null) {
        isEditing = noteId !== null;
        currentNoteId = noteId;

        if (isEditing) {
            const noteToEdit = notes.find(note => note.id === noteId);
            modalTitle.textContent = 'Edit Note';
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;

            const colorRadio = document.querySelector(`input[name="note-color"][value="${noteToEdit.color || '#fffacd'}"]`);
            if (colorRadio) colorRadio.checked = true;
        } else {
            modalTitle.textContent = 'Add New Note';
            noteTitleInput.value = '';
            noteContentInput.value = '';
            document.getElementById('color-default').checked = true;
        }

        noteModal.style.display = 'flex';
    }

    function closeModal() {
        noteModal.style.display = 'none';
        resetModal();
    }

    function resetModal() {
        noteTitleInput.value = '';
        noteContentInput.value = '';
        currentNoteId = null;
        isEditing = false;
    }

    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        const selectedColor = document.querySelector('input[name="note-color"]:checked').value;

        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        if (isEditing) {
            notes = notes.map(note => {
                if (note.id === currentNoteId) {
                    return {
                        ...note,
                        title,
                        content,
                        color: selectedColor,
                        updatedAt: Date.now()
                    };
                }
                return note;
            });
        } else {
            const newNote = {
                id: Date.now(),
                title,
                content,
                color: selectedColor,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            notes.push(newNote);
        }

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        updateEmptyState();
        closeModal();
    }

    function deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(note => note.id !== noteId);
            localStorage.setItem('notes', JSON.stringify(notes));
            renderNotes();
            updateEmptyState();
        }
    }

    function searchNotes() {
        const searchTerm = searchInput.value.toLowerCase();

        if (!searchTerm) {
            renderNotes();
            return;
        }

        const filteredNotes = notes.filter(note => {
            return (
                note.title.toLowerCase().includes(searchTerm) ||
                note.content.toLowerCase().includes(searchTerm)
            );
        });

        renderNotes(filteredNotes);
    }

    function clearSearch() {
        searchInput.value = '';
        renderNotes();
    }

    notesContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('delete-note')) {
            const noteId = Number(e.target.getAttribute('data-id'));
            deleteNote(noteId);
        } else if (e.target.classList.contains('edit-note')) {
            const noteId = Number(e.target.getAttribute('data-id'));
            openModal(noteId);
        }
    });

    addNoteBtn.addEventListener('click', () => openModal());
    saveNoteBtn.addEventListener('click', saveNote);
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    searchInput.addEventListener('input', searchNotes);
    clearSearchBtn.addEventListener('click', clearSearch);

    window.addEventListener('click', function (e) {
        if (e.target === noteModal) {
            closeModal();
        }
    });
});
