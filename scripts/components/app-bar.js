class AppBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
        <style>
          header {
            background-color: var(--primary-color);
            color: white;
            padding: 1rem 0;
            box-shadow: var(--box-shadow);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          
          .app-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
          }
          
          .logo {
            font-size: 1.5rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .logo i {
            font-size: 1.8rem;
          }
          
          nav ul {
            display: flex;
            list-style: none;
            gap: 1.5rem;
          }
          
          nav a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            transition: var(--transition);
          }
          
          nav a:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          nav a.active {
            background-color: rgba(255, 255, 255, 0.2);
          }
          
          @media (max-width: 768px) {
            .app-bar {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            
            nav ul {
              gap: 0.5rem;
            }
          }
        </style>
        
        <header>
          <div class="app-bar">
            <div class="logo">
              <i class="fas fa-book-open"></i>
              <span>Notes App</span>
            </div>
            <nav>
              <ul>
                <li><a href="#" data-view="active-notes" class="active">
                  <i class="fas fa-clipboard-list"></i>
                  <span>Active Notes</span>
                </a></li>
                <li><a href="#" data-view="archived-notes">
                  <i class="fas fa-archive"></i>
                  <span>Archived Notes</span>
                </a></li>
              </ul>
            </nav>
          </div>
        </header>
      `;

    this.shadowRoot.querySelectorAll('nav a').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');

        this.shadowRoot.querySelectorAll('nav a').forEach((a) => a.classList.remove('active'));
        link.classList.add('active');

        document.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: view } }));
      });
    });
  }
}

customElements.define('app-bar', AppBar);
