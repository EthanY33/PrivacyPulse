document.addEventListener('DOMContentLoaded', () => {
  const backLink = document.getElementById('backLink');
  if (backLink) {
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.close();
    });
  }
});
