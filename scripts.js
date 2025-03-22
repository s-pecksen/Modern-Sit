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

    // Add click and touch event listeners to FAQ questions
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        // Function to toggle FAQ answer
        const toggleAnswer = () => {
            // Toggle active class on the question
            question.classList.toggle('active');
            
            // Toggle the visibility of the answer
            const answer = question.nextElementSibling;
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        };

        // Add click event listener
        question.addEventListener('click', toggleAnswer);
        
        // Add touch event listener for mobile devices
        question.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevent double-firing on mobile
            toggleAnswer();
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
