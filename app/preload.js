// Preload script for Castor Desk (Unofficial Linux Client)

window.addEventListener('DOMContentLoaded', () => {
  // Inject subtle desktop scrollbar style that matches modern Linux desktops
  const style = document.createElement('style');
  style.id = 'castor-desk-custom-styles';
  style.textContent = `
    /* Custom sleek scrollbar for desktop app */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.35);
    }
  `;
  document.head.appendChild(style);
});

