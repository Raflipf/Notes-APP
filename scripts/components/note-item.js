class NoteItem extends HTMLElement {
  static get observedAttributes() {
    return ["title", "body", "created-at", "archived", "note-id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListeners();
  }

  addEventListeners() {
    this.shadowRoot.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;

      const noteId = this.getAttribute("note-id");
      const isArchived = this.getAttribute("archived") === "true";
      const action = button.classList.contains("archive-btn")
        ? isArchived
          ? "unarchive"
          : "archive"
        : "delete";

      this.dispatchEvent(
        new CustomEvent("note-action", {
          bubbles: true,
          composed: true,
          detail: { noteId, action },
        })
      );
    });
  }

  render() {
    const title = this.getAttribute("title") || "No Title";
    const body = this.getAttribute("body") || "";
    const createdAt = this.getAttribute("created-at") || "";
    const archived = this.getAttribute("archived") === "true";
    const noteId = this.getAttribute("note-id") || "";

    this.shadowRoot.innerHTML = `
        <style>
          .note-card {
            background: white;
            border-radius: 10px;
            box-shadow: var(--box-shadow);
            padding: 1.5rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: var(--transition);
            border-left: 4px solid ${
              archived ? "var(--warning-color)" : "var(--primary-color)"
            };
          }
          
          .note-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          }
          
          .note-title {
            font-size: 1.2rem;
            margin-bottom: 0.75rem;
            color: var(--dark-color);
            font-weight: 600;
            word-break: break-word;
          }
          
          .note-body {
            flex-grow: 1;
            margin-bottom: 1.5rem;
            color: var(--gray-dark);
            word-break: break-word;
            white-space: pre-line;
          }
          
          .note-date {
            font-size: 0.8rem;
            color: var(--gray-medium);
            margin-bottom: 1rem;
          }
          
          .note-actions {
            display: flex;
            justify-content: space-between;
            margin-top: auto;
          }
          
          button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: inherit;
            font-weight: 500;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .archive-btn {
            background-color: ${
              archived ? "var(--success-color)" : "var(--warning-color)"
            };
            color: white;
          }
          
          .archive-btn:hover {
            background-color: ${archived ? "#27ae60" : "#e67e22"};
          }
          
          .delete-btn {
            background-color: var(--danger-color);
            color: white;
          }
          
          .delete-btn:hover {
            background-color: #c0392b;
          }
        </style>
        
        <div class="note-card">
          <h3 class="note-title">${title}</h3>
          <p class="note-body">${body}</p>
          <p class="note-date">
            <i class="far fa-calendar-alt"></i> ${new Date(
              createdAt
            ).toLocaleDateString()}
            <i class="far fa-clock" style="margin-left: 0.5rem;"></i> ${new Date(
              createdAt
            ).toLocaleTimeString()}
          </p>
          <div class="note-actions">
            <button class="archive-btn">
              <i class="fas ${archived ? "fa-upload" : "fa-archive"}"></i>
              ${archived ? "Unarchive" : "Archive"}
            </button>
            <button class="delete-btn">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      `;
  }
}

customElements.define("note-item", NoteItem);
