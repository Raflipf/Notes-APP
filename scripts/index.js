import '../styles/main.css';
import '../styles/components.css';

import './components/app-bar';
import './components/note-form';
import './components/note-item';
import './components/note-list';
import './components/loading-indicator';

import {
  getActiveNotes,
  getArchivedNotes,
  addNote,
  archiveNote,
  unarchiveNote,
  deleteNote,
} from './data';

class NotesApp {
  constructor() {
    this.activeList = document.getElementById('active-list');
    this.archivedList = document.getElementById('archived-list');
    this.tabButtons = document.querySelectorAll('.tab-button');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.noteForm = document.querySelector('note-form');
    this.loadingIndicator = document.querySelector('loading-indicator');
    this.isFirstLoad = true; 
  }

  async init() {
    document.addEventListener('DOMContentLoaded', async () => {
      await this.setupApp();
    });
  }

  async setupApp() {
    this.setupEventListeners();

    if (this.isFirstLoad) {
      this.dispatchLoadingEvent(true, 'Memuat aplikasi...');
      this.isFirstLoad = false;
    }

    await this.updateNotesLists();
  }

  async updateNotesLists() {
    try {
      this.activeList.notes = undefined;
      this.archivedList.notes = undefined;

      const [activeNotes, archivedNotes] = await Promise.all([
        this.fetchWithRetry(getActiveNotes, 'Gagal memuat catatan aktif'),
        this.fetchWithRetry(getArchivedNotes, 'Gagal memuat catatan terarsip'),
      ]);

      this.activeList.notes = activeNotes;
      this.archivedList.notes = archivedNotes;
    } catch (error) {
      console.error('Update notes error:', error);
      this.activeList.error = error.message;
      this.archivedList.error = error.message;
    } finally {
      this.dispatchLoadingEvent(false);
      this.updateEmptyState(this.activeList, 'active-notes');
      this.updateEmptyState(this.archivedList, 'archived-notes');
    }
  }

  dispatchLoadingEvent(isLoading, message = '') {
    document.dispatchEvent(
      new CustomEvent('api-loading', {
        detail: {
          isLoading,
          message,
        },
      })
    );
  }

  async fetchWithRetry(fetchFn, errorMessage, retries = 3) {
    try {
      return await fetchFn();
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.fetchWithRetry(fetchFn, errorMessage, retries - 1);
      }
      throw new Error(errorMessage);
    }
  }

  setupEventListeners() {
    document.addEventListener('api-loading', (e) => {
      if (e.detail.isLoading) {
        this.loadingIndicator.show(e.detail.message);
      } else {
        this.loadingIndicator.hide();
      }
    });

    this.noteForm.addEventListener('note-added', async (e) => {
      try {
        const { title, body } = e.detail;
        this.dispatchLoadingEvent(true, 'Menambahkan catatan...');

        const tempNote = this.createTempNote(title, body);
        this.activeList.notes = [...(this.activeList.notes || []), tempNote];

        await addNote({ title, body });
        await this.updateNotesLists();
        this.switchToTab('active-notes');
      } catch (error) {
        console.error('Add note error:', error);
        await this.updateNotesLists();
        this.noteForm.setAttribute('error', 'Gagal menambahkan catatan');
      } finally {
        this.dispatchLoadingEvent(false);
      }
    });

    document.addEventListener('note-modified', async (e) => {
      try {
        const { noteId, action } = e.detail;
        const actionMessages = {
          archive: 'Mengarsipkan catatan...',
          unarchive: 'Mengaktifkan catatan...',
          delete: 'Menghapus catatan...',
        };

        this.dispatchLoadingEvent(true, actionMessages[action]);
        this.handleNoteActionOptimistically(noteId, action);

        // Langsung hapus tanpa confirm
        if (action === 'archive') await archiveNote(noteId);
        else if (action === 'unarchive') await unarchiveNote(noteId);
        else if (action === 'delete') await deleteNote(noteId);

        await this.updateNotesLists();
      } catch (error) {
        console.error('Note modification error:', error);
        await this.updateNotesLists();
      } finally {
        this.dispatchLoadingEvent(false);
      }
    });

    this.tabButtons.forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = button.getAttribute('data-tab');
        this.switchToTab(tabId);
      });
    });
    document.addEventListener('switch-tab', (e) => {
      this.switchToTab(e.detail.tab);
    });

    document.addEventListener('retry-fetch', async () => {
      await this.updateNotesLists();
    });
  }

  createTempNote(title, body) {
    return {
      id: `temp-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      archived: false,
    };
  }

  handleNoteActionOptimistically(noteId, action) {
    const currentNotes = [...(this.activeList.notes || [])];
    const currentArchived = [...(this.archivedList.notes || [])];

    if (action === 'delete') {
      this.activeList.notes = currentNotes.filter((note) => note.id !== noteId);
      this.archivedList.notes = currentArchived.filter((note) => note.id !== noteId);
    } else if (action === 'archive') {
      const noteToArchive = currentNotes.find((note) => note.id === noteId);
      if (noteToArchive) {
        this.activeList.notes = currentNotes.filter((note) => note.id !== noteId);
        this.archivedList.notes = [...currentArchived, { ...noteToArchive, archived: true }];
      }
    } else if (action === 'unarchive') {
      const noteToUnarchive = currentArchived.find((note) => note.id === noteId);
      if (noteToUnarchive) {
        this.archivedList.notes = currentArchived.filter((note) => note.id !== noteId);
        this.activeList.notes = [...currentNotes, { ...noteToUnarchive, archived: false }];
      }
    }
  }

  switchToTab(tabId) {
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    this.tabContents.forEach((content) => {
      content.classList.toggle('active', content.id === tabId);
    });
  }

  updateEmptyState(listElement, tabId) {
    const tabContent = document.getElementById(tabId);
    if (!tabContent) return;

    const emptyState = tabContent.querySelector('.empty-state');
    const isLoading = listElement.notes === undefined;
    const isError = listElement.error;

    if (isLoading || isError) {
      if (emptyState) emptyState.remove();
      return;
    }

    if ((!listElement.notes || listElement.notes.length === 0) && !emptyState) {
      const emptyStateDiv = document.createElement('div');
      emptyStateDiv.className = 'empty-state';
      emptyStateDiv.innerHTML = `
        <i class="fas fa-clipboard"></i>
        <h3>Tidak ada catatan</h3>
        <p>${
          tabId === 'active-notes'
            ? 'Buat catatan pertamamu!'
            : 'Arsipkan catatan untuk melihatnya di sini.'
        }</p>
      `;
      tabContent.appendChild(emptyStateDiv);
    } else if (emptyState && listElement.notes?.length > 0) {
      emptyState.remove();
    }
  }
}

new NotesApp().init();
