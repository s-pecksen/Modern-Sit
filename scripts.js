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

    let originalTestimonials = Array.from(testimonialsContainer.children); 

    if (originalTestimonials.length > 0) {
        
        let itemsToShow = 3; 
        let testimonialWidth = 350; 
        let gap = 30; 
        let totalOriginalItems = originalTestimonials.length;
        let isScrolling = false; 
        let clones = []; 
        let scrollEndTimer = null; 

        // NEW: Function to update wrapper class based on scrollability
        const updateScrollability = () => {
            const canScroll = totalOriginalItems > itemsToShow;
            if (canScroll) {
                testimonialsWrapper.classList.add('has-scroll-next');
            } else {
                testimonialsWrapper.classList.remove('has-scroll-next');
            }
             console.log(`Scrollability update: Can scroll = ${canScroll}`);
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
                 updateScrollability(); // Ensure class is removed if no items
                 return;
             }

            const containerStyle = window.getComputedStyle(testimonialsContainer);
            gap = parseFloat(containerStyle.gap) || 30;
            // Ensure width is calculated *after* potential CSS changes affecting it
             requestAnimationFrame(() => { // Use requestAnimationFrame to wait for layout
                 if (originalTestimonials.length > 0) {
                    testimonialWidth = originalTestimonials[0].offsetWidth; 
                     console.log(`Calculated testimonialWidth: ${testimonialWidth}px, gap: ${gap}px`);
                 } else {
                     testimonialWidth = 350; // Fallback
                 }

                 const wrapperWidth = testimonialsWrapper.clientWidth; 
                 itemsToShow = Math.max(1, Math.floor((wrapperWidth + gap) / (testimonialWidth + gap)));
                 console.log(`Wrapper width: ${wrapperWidth}px, Items to show: ${itemsToShow}`);

                 // Duplication (Keep this part as is)
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
                 updateScrollability(); // Add/remove class based on calculation
                 console.log("Carousel setup complete.");
             });
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
             updateScrollability(); // Check if class needs update after scroll
             console.log("isScrolling reset to false.");
        };


        const scrollNext = () => {
            // Check scrollability based on wrapper class or calculation
            const canScroll = totalOriginalItems > itemsToShow; 
            if (isScrolling || !canScroll) { 
                console.log(`Scroll attempt blocked: isScrolling=${isScrolling}, canScroll=${canScroll}`);
                return; 
            }
            console.log("Scroll conditions met. Starting scroll..."); 
            isScrolling = true; 

            const scrollAmount = testimonialWidth + gap;
             clearTimeout(scrollEndTimer); 
            testimonialsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
             scrollEndTimer = setTimeout(handleScrollEnd, 500); 
        };
        
        // --- NEW Click Trigger on the WRAPPER ---
        testimonialsWrapper.addEventListener('click', (event) => {
             // Prevent clicks on buttons/links inside testimonials from triggering scroll
             if (event.target.closest('.testimonial a, .testimonial button')) {
                 console.log("Clicked on a link/button inside testimonial, ignoring scroll trigger.");
                 return;
             }

             // Check if the click is within the area of the ::after pseudo-element
             const wrapperRect = testimonialsWrapper.getBoundingClientRect();
             const arrowWidth = 35; // The width set in CSS for ::after
             const paddingRight = parseFloat(window.getComputedStyle(testimonialsWrapper).paddingRight); // Get actual padding
             
             // Calculate the rough horizontal start position of the arrow
             const arrowStartsAt = wrapperRect.right - paddingRight; // Arrow lives within padding

             // Check if click is horizontally within the padding/arrow area
             if (event.clientX >= arrowStartsAt && event.clientX <= wrapperRect.right) {
                  console.log("Click detected in arrow region.");
                  scrollNext();
             }
        });

        // --- Resize Handling ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            console.log("Window resize detected.");
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log("Executing resize handler.");
                setupCarousel(); // Recalculates dimensions, itemsToShow, and updates scrollability
            }, 250);
        });

        // --- Initial Setup ---
         setTimeout(setupCarousel, 100); 

    } else {
        console.log("No testimonials found in the container.");
         // Ensure class is removed if no items initially
         testimonialsWrapper.classList.remove('has-scroll-next');
    }

}); // End DOMContentLoaded
