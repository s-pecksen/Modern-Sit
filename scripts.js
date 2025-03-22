document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Close menu when clicking on a nav link
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });

    // Update FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent any default behavior
            
            // Toggle active class on the question
            this.classList.toggle('active');
            
            // Toggle the visibility of the answer
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });

        // Add touch event listener for mobile devices
        question.addEventListener('touchend', function(e) {
            e.preventDefault(); // Prevent default touch behavior
            
            // Toggle active class on the question
            this.classList.toggle('active');
            
            // Toggle the visibility of the answer
            const answer = this.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });

    // Set up read more functionality for testimonials
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testimonialContent = this.previousElementSibling;
            const fullText = testimonialContent.querySelector('.testimonial-full');
            
            if (fullText.style.display === 'inline' || fullText.style.display === 'block') {
                fullText.style.display = 'none';
                this.textContent = 'Read more';
            } else {
                fullText.style.display = 'inline';
                this.textContent = 'Read less';
            }
        });
    });
});
