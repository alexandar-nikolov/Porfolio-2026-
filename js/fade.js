document.addEventListener("DOMContentLoaded", function() {
    const sr = ScrollReveal({
      distance: '30px',
      duration: 2500,
      reset: true,
      cleanup: true
    });
  
    sr.reveal('.about-title, .about-title .span', { delay: 100, origin: 'top' });
    sr.reveal(' .roww', { delay: 100, origin: 'left' }); 
    sr.reveal('.pstyle', { delay: 100, origin: 'left' });
    sr.reveal('.toggle-btn', { delay: 100, origin: 'right' });
    sr.reveal('.documentation', { delay: 50, origin: 'right' });
  });
  
  function goBackTwoPages(event) {
    event.preventDefault(); 
    window.history.back();
  }
  document.querySelector('.top a').addEventListener('click', function(event) {
    event.preventDefault();
    document.querySelector('#new').scrollIntoView({ 
        behavior: 'smooth' 
    });
  });