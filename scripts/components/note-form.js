class NoteForm extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();

    this.form = this.shadowRoot.querySelector('form');
    this.titleInput = this.shadowRoot.querySelector('#title');
    this.bodyInput = this.shadowRoot.querySelector('#body');
    this.submitButton = this.shadowRoot.querySelector('button');
    this.titleError = this.shadowRoot.querySelector('#title-error');
    this.bodyError = this.shadowRoot.querySelector('#body-error');

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Real-time validation
    this.titleInput.addEventListener('input', () => {
      this.validateTitle();
      this.checkFormValidity();
    });

    this.bodyInput.addEventListener('input', () => {
      this.validateBody();
      this.checkFormValidity();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }

  validateTitle() {
    const value = this.titleInput.value.trim();
    const isValid = value.length >= 3;

    this.titleInput.classList.toggle('invalid', !isValid && value.length > 0);
    this.titleError.textContent =
      !isValid && value.length > 0 ? 'Minimum 3 characters required' : '';

    return isValid;
  }

  validateBody() {
    const value = this.bodyInput.value.trim();
    const isValid = value.length >= 10;

    this.bodyInput.classList.toggle('invalid', !isValid && value.length > 0);
    this.bodyError.textContent =
      !isValid && value.length > 0 ? 'Minimum 10 characters required' : '';

    return isValid;
  }

  checkFormValidity() {
    const isTitleValid = this.validateTitle();
    const isBodyValid = this.validateBody();
    this.submitButton.disabled = !(isTitleValid && isBodyValid);
  }

  handleSubmit() {
    if (!this.submitButton.disabled) {
      const newNote = {
        id: `note-${Date.now()}`,
        title: this.titleInput.value.trim(),
        body: this.bodyInput.value.trim(),
        createdAt: new Date().toISOString(),
        archived: false,
      };

      this.dispatchEvent(
        new CustomEvent('note-added', {
          detail: newNote,
          bubbles: true,
          composed: true,
        })
      );

      this.form.reset();
      this.checkFormValidity();
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            font-family: 'Inter', sans-serif;
            max-width: 600px;
            margin: 0 auto;
          }
          
          form {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          h2 {
            color: #3B82F6;
            text-align: center;
            margin-bottom: 24px;
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
          }
          
          input, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.2s;
          }
          
          input:focus, textarea:focus {
            outline: none;
            border-color: #3B82F6;
          }
          
          .invalid {
            border-color: #EF4444;
          }
          
          .error {
            color: #EF4444;
            font-size: 14px;
            margin-top: 4px;
            height: 18px;
          }
          
          textarea {
            min-height: 150px;
            resize: vertical;
          }
          
          button {
            width: 100%;
            padding: 12px;
            background: #3B82F6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 16px;
            transition: background 0.2s;
          }
          
          button:hover:not(:disabled) {
            background: #2563EB;
          }
          
          button:disabled {
            background: #E5E7EB;
            color: #9CA3AF;
            cursor: not-allowed;
          }
        </style>
        
        <form>
          <h2>Add New Note</h2>
          
          <div class="form-group">
            <label for="title">Judul</label>
            <input 
              id="title" 
              type="text" 
              placeholder="Masukan Judul" 
              required
              minlength="3"
            >
            <div id="title-error" class="error"></div>
          </div>
          
          <div class="form-group">
            <label for="body">Konten</label>
            <textarea 
              id="body" 
              placeholder="Ketikan Kontenmu Disi!" 
              required
              minlength="10"
            ></textarea>
            <div id="body-error" class="error"></div>
          </div>
          
          <button type="submit" disabled>Save Note</button>
        </form>
      `;
  }
}

customElements.define('note-form', NoteForm);
