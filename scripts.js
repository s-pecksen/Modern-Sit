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

    // Reusable function to initialize "Read More" for a single testimonial element
    const initializeReadMoreForTestimonial = (testimonialEl) => {
        const btn = testimonialEl.querySelector('.read-more-btn');
        const contentContainer = testimonialEl.querySelector('.testimonial-content');

        if (!btn || !contentContainer) {
            // console.warn("Read more button or content container not found in testimonial:", testimonialEl);
            return;
        }

        const previewP = contentContainer.querySelector('.testimonial-preview');
        const fullP = contentContainer.querySelector('.testimonial-full');

        if (previewP && fullP) {
            if (fullP.textContent.trim().length > 0) {
                // Initial state: Show preview, hide full text
                previewP.style.display = 'block';
                fullP.style.display = 'none';
                btn.textContent = 'Read more'; // Ensure button text is reset
                btn.style.display = 'inline-block';

                // Remove any old listener before adding a new one (important for re-initialization)
                // A simple way for this specific case is to replace the button with its clone to remove listeners.
                // However, since we are calling this on newly created clones or on initial setup, 
                // we might not need to worry about old listeners IF this function is called correctly.
                // For safety, let's ensure a fresh listener or handle re-binding carefully.
                // A more robust way if elements are not replaced: btn.replaceWith(btn.cloneNode(true)); then re-select btn.
                // For this case, we'll rely on it being called on fresh clones or once initially.
                // If issues persist, explicit listener removal/re-cloning the button itself might be needed.

                // Check if a listener already exists to avoid duplicates if not careful
                if (!btn.hasReadMoreListener) { // Add a custom property to track
                    btn.addEventListener('click', () => {
                        const isExpanded = fullP.style.display === 'block';
                        if (isExpanded) {
                            fullP.style.display = 'none';
                            previewP.style.display = 'block';
                            btn.textContent = 'Read more';
                        } else {
                            previewP.style.display = 'none';
                            fullP.style.display = 'block';
                            btn.textContent = 'Read less';
                        }
                    });
                    btn.hasReadMoreListener = true; // Mark that listener is attached
                }
            } else {
                if (previewP) previewP.style.display = 'block';
                fullP.style.display = 'none'; // Ensure full is hidden if empty
                btn.style.display = 'none';
            }
        } else {
            // console.error("Could not find testimonial preview/full text elements for button:", btn);
            btn.style.display = 'none';
        }
    };

    // Testimonial "Read More" functionality (Initial Setup)
    const allTestimonials = document.querySelectorAll('.testimonial');
    allTestimonials.forEach(testimonial => {
        initializeReadMoreForTestimonial(testimonial);
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
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)'); // Media query for mobile check

    if (!testimonialsWrapper || !testimonialsContainer) {
        console.error("Testimonial wrapper or container not found.");
        return;
    }

    let originalTestimonials = Array.from(testimonialsContainer.children);

    if (originalTestimonials.length > 0) {

        let itemsToShow = 3;
        let testimonialWidth = 350; // Default, will be calculated
        let gap = 30; // Default, will be calculated
        let totalOriginalItems = originalTestimonials.length;
        let isScrolling = false;
        let clones = [];
        let scrollEndTimer = null; // Timer for programmatic scroll end
        let manualScrollDebounceTimer = null; // Timer for manual scroll event

        // Function to update wrapper class based on scrollability and device type
        const updateScrollability = () => {
            const isMobile = mobileMediaQuery.matches;

            // Always clear previous states first
            testimonialsWrapper.classList.remove('has-scroll-prev', 'has-scroll-next');

            if (isMobile) {
                // console.log("Scrollability update (Mobile): Arrows hidden by default.");
                // On mobile, arrows are typically hidden by CSS or not used.
                return;
            }

            // Desktop arrow logic:
            const scrollLeft = testimonialsContainer.scrollLeft;
            const scrollWidth = testimonialsContainer.scrollWidth;
            const clientWidth = testimonialsContainer.clientWidth;

            // Show PREV arrow if not at the very beginning
            if (scrollLeft > 1) { // Use 1px as a small buffer for precision
                testimonialsWrapper.classList.add('has-scroll-prev');
                // console.log("Scrollability update (Desktop): Showing PREV arrow.");
            } else {
                // console.log("Scrollability update (Desktop): Hiding PREV arrow.");
            }

            // Show NEXT arrow if there's content to scroll towards on the right
            // This considers the actual scrollable width vs the visible width.
            // For infinite scroll, totalOriginalItems > itemsToShow is also a good check
            // as cloning ensures there's usually something "next".
            if (scrollLeft < (scrollWidth - clientWidth - 1) && totalOriginalItems > itemsToShow) {
                testimonialsWrapper.classList.add('has-scroll-next');
                // console.log("Scrollability update (Desktop): Showing NEXT arrow.");
            } else {
                // console.log("Scrollability update (Desktop): Hiding NEXT arrow (at end or not enough items).");
            }
        };

        const setupCarousel = () => {
            console.log("Setting up carousel...");
            isScrolling = false;
            clearTimeout(scrollEndTimer);
            clearTimeout(manualScrollDebounceTimer); 
            clones.forEach(clone => clone.remove());
            clones = [];
            originalTestimonials = Array.from(testimonialsContainer.querySelectorAll('.testimonial:not(.clone)'));
            totalOriginalItems = originalTestimonials.length;
            console.log(`Found ${totalOriginalItems} original testimonials.`);

            // Re-initialize read more for original testimonials in case they were somehow affected
            // or if setupCarousel is ever called in a way that might require this.
            originalTestimonials.forEach(testimonial => {
                initializeReadMoreForTestimonial(testimonial);
            });

            if (totalOriginalItems === 0) {
                 console.log("No original testimonials found to setup.");
                 updateScrollability(); 
                 return;
            }

            const containerStyle = window.getComputedStyle(testimonialsContainer);
            gap = parseFloat(containerStyle.gap) || 30;

            requestAnimationFrame(() => {
                if (originalTestimonials.length > 0 && originalTestimonials[0]) {
                    testimonialWidth = originalTestimonials[0].offsetWidth;
                    // console.log(`Calculated testimonialWidth: ${testimonialWidth}px, gap: ${gap}px`);
                } else {
                    testimonialWidth = 350; // Fallback
                    // console.log(`Using fallback testimonialWidth: ${testimonialWidth}px, gap: ${gap}px`);
                }

                const wrapperWidth = testimonialsWrapper.clientWidth;
                itemsToShow = Math.max(1, Math.floor((wrapperWidth + gap) / (testimonialWidth + gap)));
                // console.log(`Wrapper width: ${wrapperWidth}px, Items to show: ${itemsToShow}`);

                const isMobile = mobileMediaQuery.matches;

                if (!isMobile && totalOriginalItems > itemsToShow) {
                    // console.log(`Cloning first ${itemsToShow} items for infinite loop (Desktop).`);
                    for (let i = 0; i < itemsToShow && i < totalOriginalItems; i++) {
                        const clone = originalTestimonials[i].cloneNode(true);
                        clone.classList.add('clone');
                        clone.setAttribute('aria-hidden', 'true');
                        // CRITICAL: Remove the 'hasReadMoreListener' flag from the clone before re-initializing
                        // so that the initializeReadMoreForTestimonial function adds a new listener.
                        const clonedBtn = clone.querySelector('.read-more-btn');
                        if (clonedBtn) {
                            delete clonedBtn.hasReadMoreListener; 
                        }
                        testimonialsContainer.appendChild(clone);
                        clones.push(clone);
                        initializeReadMoreForTestimonial(clone); // Initialize for the new clone
                    }
                } else if (isMobile) {
                    // console.log("Not cloning items (Mobile).");
                } else {
                    // console.log("Not cloning items - all items fit or not enough items (Desktop).");
                }

                testimonialsContainer.scrollLeft = 0;
                updateScrollability(); 
                // console.log("Carousel setup complete.");
            });
        };

        const handleScrollEnd = (isProgrammaticScroll = true) => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile && isProgrammaticScroll) { // Only act if it's a programmatic scroll on mobile we need to stop
                isScrolling = false;
                // console.log("Programmatic scroll end ignored (Mobile). isScrolling reset.");
                updateScrollability(); // Still update arrows
                return;
            }
            
            // Desktop-only infinite scroll reset logic (when scrolling forward)
            if (!isMobile) {
                const scrollAmountOneItem = testimonialWidth + gap;
                const loopResetTargetScrollLeft = totalOriginalItems * scrollAmountOneItem;
                // console.log(`Scroll check: scrollLeft=${testimonialsContainer.scrollLeft}, targetThreshold=${loopResetTargetScrollLeft}`);

                if (testimonialsContainer.scrollLeft >= loopResetTargetScrollLeft - (testimonialWidth / 2) ) { // Adjusted threshold
                    // console.log("Loop forward threshold reached. Resetting scroll to beginning.");
                    testimonialsContainer.scrollTo({ left: 0, behavior: 'auto' });
                }
            }
            
            if (isProgrammaticScroll) { // Only reset isScrolling if it was a programmatic scroll ending
                isScrolling = false;
            }
            updateScrollability(); // Update arrows after scroll, regardless of type
            // console.log(`handleScrollEnd: isScrolling=${isScrolling}. Arrows updated.`);
        };

        const scrollPrev = () => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile || isScrolling) {
                // console.log(`Scroll PREV attempt blocked: isMobile=${isMobile}, isScrolling=${isScrolling}`);
                return;
            }

            if (testimonialsContainer.scrollLeft === 0 && totalOriginalItems > itemsToShow) {
                // If at the beginning and infinite scroll is active, jump to the "end" (before clones)
                // This makes the loop bi-directional.
                // console.log("Scroll PREV: At beginning with infinite scroll. Jumping to end.");
                isScrolling = true;
                const scrollAmountOneItem = testimonialWidth + gap;
                const effectiveEndScrollLeft = (totalOriginalItems * scrollAmountOneItem) - scrollAmountOneItem;
                testimonialsContainer.scrollTo({left: effectiveEndScrollLeft, behavior: 'auto'});
                // Then smoothly scroll to the item that is now "previous"
                // This needs to happen in a requestAnimationFrame to ensure the auto scroll has taken effect
                requestAnimationFrame(() => {
                    testimonialsContainer.scrollBy({ left: -scrollAmountOneItem, behavior: 'smooth' });
                    scrollEndTimer = setTimeout(() => handleScrollEnd(true), 500);
                });
                return;
            } else if (testimonialsContainer.scrollLeft === 0) {
                // console.log("Scroll PREV: Already at the beginning, no infinite jump.");
                updateScrollability(); // Ensure arrow state is correct
                return;
            }


            isScrolling = true;
            // console.log("Scroll PREV conditions met. Starting scroll PREV...");

            const scrollAmount = testimonialWidth + gap;
            clearTimeout(scrollEndTimer);

            testimonialsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            scrollEndTimer = setTimeout(() => handleScrollEnd(true), 500);
        };

        const scrollNext = () => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile) {
                // console.log("Scroll NEXT attempt blocked: Mobile device.");
                return;
            }

            const canScroll = totalOriginalItems > itemsToShow;
            if (isScrolling || !canScroll) {
                // console.log(`Scroll NEXT attempt blocked: isScrolling=${isScrolling}, canScroll=${canScroll}`);
                if (!isScrolling) updateScrollability(); // Update arrows if scroll was blocked due to !canScroll
                return;
            }
            // console.log("Scroll NEXT conditions met. Starting scroll NEXT...");
            isScrolling = true;

            const scrollAmount = testimonialWidth + gap;
            clearTimeout(scrollEndTimer);
            testimonialsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            scrollEndTimer = setTimeout(() => handleScrollEnd(true), 500);
        };

        // Click Trigger on the WRAPPER for arrows
        testimonialsWrapper.addEventListener('click', (event) => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile) return;

            // Check if the click is directly on the wrapper (where pseudo-elements are attached)
            if (event.target !== testimonialsWrapper) {
                // console.log("Clicked on a child, not the wrapper itself. Ignoring for arrow click.");
                return;
            }

            const wrapperRect = testimonialsWrapper.getBoundingClientRect();
            const clickX = event.clientX; // Click position relative to viewport

            // Define sensitive areas for arrows (e.g., 50px from edge, adjust as needed)
            // These values should roughly correspond to the size/padding of your CSS pseudo-elements.
            const arrowSensitiveAreaWidth = 60; // px 

            // Check for LEFT arrow click (::before)
            // Click must be within the left part of the wrapper
            if (clickX >= wrapperRect.left && clickX <= wrapperRect.left + arrowSensitiveAreaWidth) {
                if (testimonialsWrapper.classList.contains('has-scroll-prev')) {
                    // console.log("Click detected in PREV arrow region.");
                    scrollPrev();
                }
            // Check for RIGHT arrow click (::after)
            // Click must be within the right part of the wrapper
            } else if (clickX <= wrapperRect.right && clickX >= wrapperRect.right - arrowSensitiveAreaWidth) {
                if (testimonialsWrapper.classList.contains('has-scroll-next')) {
                    // console.log("Click detected in NEXT arrow region.");
                    scrollNext();
                }
            }
        });
        
        // Manual scroll detection (e.g., mouse wheel, trackpad)
        testimonialsContainer.addEventListener('scroll', () => {
            clearTimeout(manualScrollDebounceTimer);
            manualScrollDebounceTimer = setTimeout(() => {
                if (isScrolling) {
                    // If a programmatic scroll is happening, it will call handleScrollEnd (which calls updateScrollability).
                    // console.log("Manual scroll event during programmatic scroll, deferring update.");
                    return;
                }
                // console.log("Manual scroll finished. Updating arrows.");
                updateScrollability(); // Update arrow states after manual scroll
                
                // For desktop, if manual scroll happens to hit the infinite loop point (less likely but possible)
                const isMobile = mobileMediaQuery.matches;
                if (!isMobile) {
                    handleScrollEnd(false); // Check if loop reset is needed, pass false for non-programmatic
                }

            }, 150); // Adjust debounce time as needed (e.g., 150-250ms)
        });

        // Resize Handling
        let resizeTimer;
        window.addEventListener('resize', () => {
            console.log("Window resize detected.");
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log("Executing resize handler.");
                // Re-run setup which now includes mobile/desktop check
                setupCarousel();
            }, 250);
        });

        // Listen for changes in the media query (e.g., orientation change)
        mobileMediaQuery.addEventListener('change', () => {
            console.log("Media query changed (e.g., orientation). Re-running setup.");
            setupCarousel();
        });

        // Initial Setup
        // Use setTimeout to ensure layout is likely stable, especially for offsetWidth calculations
        setTimeout(setupCarousel, 150); // Slightly increased delay

    } else {
        console.log("No testimonials found in the container.");
        // Ensure class is removed if no items initially
        if (testimonialsWrapper) { // Check if wrapper exists before modifying
            testimonialsWrapper.classList.remove('has-scroll-prev', 'has-scroll-next');
        }
    }

    // Form submission handling
    const form = document.getElementById('consultationForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: form.querySelector('input[name="name"]').value,
                email: form.querySelector('input[name="email"]').value,
                phone: form.querySelector('input[name="phone"]').value,
                dates: form.querySelector('input[name="dates"]').value,
                referral: form.querySelector('input[name="referral"]').value,
                message: form.querySelector('textarea[name="message"]').value
            };

            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                // Send email to you
                await emailjs.send(
                    'service_axisrmu',
                    'template_9ocqgyf', // your notification template
                    formData,
                    'ac87uG33mp4sHHHAy'
                );

                // Send auto-reply to prospect
                await emailjs.send(
                    'service_axisrmu',
                    'template_v78oqjh', // your new auto-reply template ID
                    formData,
                    'ac87uG33mp4sHHHAy'
                );

                alert('Thank you for your inquiry! We will get back to you soon.');
                form.reset();
            } catch (error) {
                alert('Sorry, there was an error sending your message. Please try again later.');
                console.error('Error:', error);
            } finally {
                // Reset button state
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }

}); // End DOMContentLoaded
