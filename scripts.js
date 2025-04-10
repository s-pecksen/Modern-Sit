document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');
    const nav = document.querySelector('nav'); // Select the nav element

    if (menuToggle && navUl && nav) {
        menuToggle.addEventListener('click', () => {
            navUl.classList.toggle('active');
            // Optional: Add class to nav itself if needed for positioning or other styles
            // nav.classList.toggle('active'); 
        });

        // Close menu when a link is clicked (optional)
        navUl.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navUl.classList.contains('active')) {
                    navUl.classList.remove('active');
                    // Optional: Remove class from nav if added
                    // nav.classList.remove('active'); 
                }
            });
        });
    }

    // Testimonial "Read More" functionality
    const readMoreBtns = document.querySelectorAll('.read-more-btn');
    readMoreBtns.forEach(btn => {
        const testimonialText = btn.previousElementSibling;
        const previewSpan = testimonialText.querySelector('.testimonial-preview');
        const fullSpan = testimonialText.querySelector('.testimonial-full');

        if (previewSpan && fullSpan && fullSpan.textContent.trim().length > 0) {
            btn.style.display = 'inline-block'; // Show button only if there's full text
            btn.addEventListener('click', () => {
                const isExpanded = fullSpan.style.display === 'inline';
                fullSpan.style.display = isExpanded ? 'none' : 'inline';
                previewSpan.style.display = isExpanded ? 'inline' : 'inline'; // Keep preview visible
                btn.textContent = isExpanded ? 'Read more' : 'Read less';
            });
        } else {
            btn.style.display = 'none'; // Hide button if no full text
        }
    });

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = question.classList.contains('active');

                // Close all other answers
                faqItems.forEach(otherItem => {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherItem !== item && otherQuestion.classList.contains('active')) {
                        otherQuestion.classList.remove('active');
                        otherAnswer.style.maxHeight = null;
                    }
                });

                // Toggle current item
                if (isActive) {
                    question.classList.remove('active');
                    answer.style.maxHeight = null;
                } else {
                    question.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });

    // --- Testimonial Infinite Carousel Logic ---
    const testimonialsWrapper = document.querySelector('.testimonials-wrapper');
    const testimonialsContainer = document.querySelector('.testimonials-container');
    let originalTestimonials = Array.from(testimonialsContainer.children); // Get original items

    if (testimonialsWrapper && testimonialsContainer && originalTestimonials.length > 0) {
        
        let itemsToShow = 3; // Default items visible
        let testimonialWidth = 350; // Must match CSS flex-basis
        let gap = 30; // Must match CSS gap
        let totalItems = originalTestimonials.length;
        let isScrolling = false; // Flag to prevent spam clicks during animation
        let clones = []; // To keep track of cloned items

        const setupCarousel = () => {
            originalTestimonials = Array.from(testimonialsContainer.querySelectorAll('.testimonial:not(.clone)')); // Re-select originals
            totalItems = originalTestimonials.length;
            
            // Clear existing clones if resizing/re-setting up
            clones.forEach(clone => clone.remove());
            clones = [];

            // --- Calculate Dimensions ---
            const containerStyle = window.getComputedStyle(testimonialsContainer);
            gap = parseFloat(containerStyle.gap) || 30;
            
            // Get testimonial width reliably
            if (originalTestimonials.length > 0) {
                 testimonialWidth = originalTestimonials[0].offsetWidth; 
                 // Note: If offsetWidth is slightly off due to subpixels, might need rounding or using getBoundingClientRect().width
            } else {
                return; // No items
            }
            
            // Determine items to show based on wrapper width
            const wrapperWidth = testimonialsWrapper.clientWidth; // Use clientWidth for inner width excluding padding
            // Rough calculation - adjust thresholds as needed
            if (wrapperWidth < (testimonialWidth * 1.5 + gap)) { 
                itemsToShow = 1;
            } else if (wrapperWidth < (testimonialWidth * 2.5 + gap * 2)) { 
                itemsToShow = 2;
            } else {
                itemsToShow = 3;
            }

             // --- Duplication ---
             if (totalItems > itemsToShow) { // Only clone if necessary
                // Clone the first 'itemsToShow' elements to append for the loop
                for (let i = 0; i < itemsToShow; i++) {
                    const clone = originalTestimonials[i].cloneNode(true);
                    clone.classList.add('clone'); // Mark as clone
                    testimonialsContainer.appendChild(clone);
                    clones.push(clone);
                }
             }
             
             // Initial scroll position (optional, start at beginning)
             testimonialsContainer.scrollLeft = 0; 
        };


        const scrollNext = () => {
            if (isScrolling) return;
            isScrolling = true;

            const scrollAmount = testimonialWidth + gap;
            testimonialsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });

            // Use a timer slightly longer than CSS transition/scroll duration
            // to check for loop reset and re-enable scrolling.
             // Using 'scrollend' is better if supported by target browsers.
            
            const currentScroll = testimonialsContainer.scrollLeft;
            const targetScroll = currentScroll + scrollAmount;

            // Check if we need to loop after this scroll animation finishes
            // This checks if the *target* scroll position is at or past the start of the cloned section
             const loopThreshold = totalItems * (testimonialWidth + gap);

            setTimeout(() => {
                 if (testimonialsContainer.scrollLeft >= loopThreshold - (testimonialWidth/2) ) { // Check if we've scrolled into the clones
                    // Instantly jump back to the beginning without animation
                    testimonialsContainer.scrollLeft = 0; 
                 }
                isScrolling = false;
            }, 500); // Adjust timeout based on smooth scroll duration (can be tricky)
            
            // Alternative: Use 'scrollend' event if available
            // testimonialsContainer.addEventListener('scrollend', () => {
            //     const loopThreshold = totalItems * (testimonialWidth + gap);
            //     if (testimonialsContainer.scrollLeft >= loopThreshold - 10) { // Tolerance needed
            //         testimonialsContainer.scrollLeft = 0;
            //     }
            //     isScrolling = false;
            // }, { once: true }); // Ensure listener runs only once per scroll action
        };

        // --- Click Trigger ---
        testimonialsWrapper.addEventListener('click', (event) => {
            // Calculate the right-hand trigger area (e.g., the last visible 50px)
            const wrapperRect = testimonialsWrapper.getBoundingClientRect();
            const clickX = event.clientX;
            // Define the area where clicking triggers 'next'
             // Let's trigger if click is in the rightmost portion where the next card peeks
             const triggerAreaStart = wrapperRect.left + (itemsToShow * testimonialWidth) + ((itemsToShow -1) * gap); 
             
            // A simpler trigger: click anywhere on the right half of the wrapper?
            // const triggerAreaStart = wrapperRect.left + wrapperRect.width / 2;

            if (clickX > triggerAreaStart && clickX <= wrapperRect.right) {
                 if (totalItems > itemsToShow) { // Only scroll if there are items to scroll to
                    scrollNext();
                 }
            }
        });
        
        // --- Resize Handling ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupCarousel(); // Re-calculate dimensions and re-clone if necessary
            }, 250);
        });

        // --- Initial Setup ---
        setupCarousel();

    } else {
        console.log("Testimonial carousel elements not found or no testimonials.");
    }

}); // End DOMContentLoaded
