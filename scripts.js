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
    
    if (!testimonialsWrapper || !testimonialsContainer) {
        console.error("Testimonial wrapper or container not found.");
        return; 
    }

    // NEW: Select the arrow button
    const nextButton = testimonialsWrapper.querySelector('.testimonial-scroll-arrow.right');

    let originalTestimonials = Array.from(testimonialsContainer.children); 

    if (originalTestimonials.length > 0) {
        
        let itemsToShow = 3; 
        let testimonialWidth = 350; 
        let gap = 30; 
        let totalOriginalItems = originalTestimonials.length;
        let isScrolling = false; 
        let clones = []; 
        let scrollEndTimer = null; 

        // NEW: Function to enable/disable button
        const updateButtonState = () => {
            if (nextButton) {
                // Disable button if all items are visible or fewer
                nextButton.disabled = totalOriginalItems <= itemsToShow; 
                 console.log(`Button state update: disabled=${nextButton.disabled}`);
            }
        };

        const setupCarousel = () => {
            console.log("Setting up carousel...");
            isScrolling = false;
            clearTimeout(scrollEndTimer); 
            clones.forEach(clone => clone.remove());
            clones = [];
             originalTestimonials = Array.from(testimonialsContainer.querySelectorAll('.testimonial:not(.clone)'));
             totalOriginalItems = originalTestimonials.length;
             console.log(`Found ${totalOriginalItems} original testimonials.`);

            if (totalOriginalItems === 0) {
                console.log("No original testimonials found to setup.");
                 updateButtonState(); // Ensure button is disabled if no items
                return;
            }

            const containerStyle = window.getComputedStyle(testimonialsContainer);
            gap = parseFloat(containerStyle.gap) || 30;
            testimonialWidth = originalTestimonials[0].offsetWidth; 
            console.log(`Calculated testimonialWidth: ${testimonialWidth}px, gap: ${gap}px`);
            const wrapperWidth = testimonialsWrapper.clientWidth; 
            itemsToShow = Math.max(1, Math.floor((wrapperWidth + gap) / (testimonialWidth + gap)));
             console.log(`Wrapper width: ${wrapperWidth}px, Items to show: ${itemsToShow}`);

             if (totalOriginalItems > itemsToShow) { 
                console.log(`Cloning first ${itemsToShow} items for infinite loop.`);
                for (let i = 0; i < itemsToShow; i++) {
                    if (i < totalOriginalItems) { 
                        const clone = originalTestimonials[i].cloneNode(true);
                        clone.classList.add('clone');
                        clone.setAttribute('aria-hidden', 'true'); 
                        testimonialsContainer.appendChild(clone);
                        clones.push(clone);
                    }
                }
            } else {
                 console.log("Not cloning items - all items fit or not enough items.");
             }
             
             testimonialsContainer.scrollLeft = 0; 
             updateButtonState(); // Update button state after setup
             console.log("Carousel setup complete.");
        };

        const handleScrollEnd = () => {
             const scrollAmountOneItem = testimonialWidth + gap;
             const loopResetTargetScrollLeft = totalOriginalItems * scrollAmountOneItem; 
             console.log(`Scroll check: scrollLeft=${testimonialsContainer.scrollLeft}, targetThreshold=${loopResetTargetScrollLeft}`);

             if (testimonialsContainer.scrollLeft >= loopResetTargetScrollLeft - 10) { 
                console.log("Loop forward threshold reached. Resetting scroll to beginning.");
                 testimonialsContainer.scrollTo({ left: 0, behavior: 'auto' }); 
             } 
             isScrolling = false; 
             console.log("isScrolling reset to false.");
             // Update button state after scroll finishes in case it affects visibility
             updateButtonState(); 
        };


        const scrollNext = () => {
            updateButtonState(); // Ensure state is current

            // *** ADD DETAILED LOGGING FOR THE BLOCK CONDITION ***
            if (isScrolling || (nextButton && nextButton.disabled)) { 
                console.log(
                    `Scroll attempt blocked: isScrolling=${isScrolling}, buttonExists=${!!nextButton}, buttonDisabled=${nextButton ? nextButton.disabled : 'N/A'}`
                );
                return; // Stop if scrolling or button is disabled
            }
            // If we get past the block, log that scrolling is starting
            console.log("Scroll conditions met. Starting scroll..."); 
            
            isScrolling = true; // Set scrolling flag

            const scrollAmount = testimonialWidth + gap;
             clearTimeout(scrollEndTimer); 
            testimonialsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
             scrollEndTimer = setTimeout(handleScrollEnd, 500); 
        };
        
        // --- NEW Click Trigger for the Arrow Button ---
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                console.log("Next button clicked.");
                scrollNext();
            });
        } else {
             console.error("Scroll next button '.testimonial-scroll-arrow.right' not found!");
        }


        // --- Resize Handling ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            console.log("Window resize detected.");
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log("Executing resize handler.");
                setupCarousel(); // This will also call updateButtonState
            }, 250);
        });

        // --- Initial Setup ---
         setTimeout(setupCarousel, 100); 

    } else {
        console.log("No testimonials found in the container.");
         // Ensure button is disabled if container is initially empty
         if(nextButton) nextButton.disabled = true;
    }

}); // End DOMContentLoaded
