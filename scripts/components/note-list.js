class NoteList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._notes = undefined;
    this._error = null;
  }

  set notes(value) {
    this._notes = value;
    this._error = null;
    this.render();
  }

  get notes() {
    return this._notes;
  }

  set error(errorMessage) {
    this._error = errorMessage;
    this._notes = null;
    this.render();
  }

  connectedCallback() {
    this.render();
    this.shadowRoot.addEventListener('note-action', this.handleNoteAction.bind(this));
  }

  handleNoteAction(event) {
    event.stopPropagation();
    const { noteId, action } = event.detail;
    this.dispatchEvent(
      new CustomEvent('note-modified', {
        bubbles: true,
        composed: true,
        detail: { noteId, action },
      })
    );
  }

  render() {
    this.shadowRoot.innerHTML = '';

    if (this._error) {
      this.shadowRoot.innerHTML = `
        <style>
          .error-container {
            text-align: center;
            padding: 2rem;
            color: #EF4444;
          }
          .error-icon {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .retry-button {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #3B82F6;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
        <div class="error-container">
          <div class="error-icon">⚠️</div>
          <h3>Gagal memuat catatan</h3>
          <p>${this._error}</p>
          <button class="retry-button">Coba Lagi</button>
        </div>
      `;

      this.shadowRoot.querySelector('.retry-button').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('retry-fetch', { bubbles: true }));
      });
      return;
    }

    if (this._notes === undefined) {
      this.shadowRoot.innerHTML = `
        <style>
          .loading-placeholder {
            height: 200px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        </style>
        <div class="loading-placeholder">
          <loading-indicator></loading-indicator>
        </div>
      `;
      return;
    }

    if (!this._notes || this._notes.length === 0) {
      this.shadowRoot.innerHTML = `
        <style>
          .empty-state {
            text-align: center;
            padding: 2rem;
            color: #6B7280;
          }
        </style>
        <div class="empty-state">
          <p>Tidak ada catatan</p>
        </div>
      `;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
          perspective: 1000px;
        }
        note-item {
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }
      </style>
      <div class="notes-grid">
        ${this._notes
          .map(
            (note) => `
          <note-item
            title="${this.escapeHtml(note.title)}"
            body="${this.escapeHtml(note.body)}"
            note-id="${note.id}"
            archived="${note.archived}"
            created-at="${note.createdAt}"
          ></note-item>
        `
          )
          .join('')}
      </div>
    `;

    setTimeout(() => {
      const items = this.shadowRoot.querySelectorAll('note-item');
      if (window.gsap) {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: 'power2.out',
        });
      } else {
        items.forEach((item) => {
          item.style.opacity = 1;
          item.style.transform = 'translateY(0)';
        });
      }
    }, 100);
  }

  escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

customElements.define('note-list', NoteList);
