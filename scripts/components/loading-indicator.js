class LoadingIndicator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        
        :host([active]) {
          opacity: 1;
          pointer-events: all;
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        .message {
          color: white;
          font-size: 1.2rem;
          text-align: center;
          max-width: 80%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      
      <div class="spinner"></div>
      <div class="message"></div>
    `;
  }

  show(message = 'Memuat...') {
    this.setAttribute('active', '');
    this.shadowRoot.querySelector('.message').textContent = message;
  }

  hide() {
    this.removeAttribute('active');
  }
}

customElements.define('loading-indicator', LoadingIndicator);
