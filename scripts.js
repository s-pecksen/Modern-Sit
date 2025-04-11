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
        // Find the new paragraph elements within the same content container
        const contentContainer = btn.closest('.testimonial-content');
        if (!contentContainer) return; // Skip if structure is wrong

        const previewP = contentContainer.querySelector('.testimonial-preview');
        const fullP = contentContainer.querySelector('.testimonial-full');

        // Use the old span check ONLY for testimonials not yet restructured
        // TODO: Remove this block once all testimonials are restructured
        const oldTestimonialText = btn.previousElementSibling;
        const oldPreviewSpan = oldTestimonialText?.classList.contains('testimonial-text') ? oldTestimonialText.querySelector('.testimonial-preview') : null;
        const oldFullSpan = oldTestimonialText?.classList.contains('testimonial-text') ? oldTestimonialText.querySelector('.testimonial-full') : null;

        if (previewP && fullP) {
            // --- Logic for new structure ---
            if (fullP.textContent.trim().length > 0) {
                // Initial state: Show preview, hide full
                previewP.style.display = 'block';
                fullP.style.display = 'none';
                btn.style.display = 'inline-block'; // Show button

                btn.addEventListener('click', () => {
                    const isExpanded = fullP.style.display === 'block';

                    if (isExpanded) {
                        // Collapse: Show preview, hide full
                        fullP.style.display = 'none';
                        previewP.style.display = 'block';
                        btn.textContent = 'Read more';
                    } else {
                        // Expand: Hide preview, show full
                        previewP.style.display = 'none';
                        fullP.style.display = 'block';
                        btn.textContent = 'Read less';
                    }
                });
            } else {
                // Hide button if no full text
                if (previewP) previewP.style.display = 'block';
                btn.style.display = 'none';
            }
        } else if (oldPreviewSpan && oldFullSpan) {
             // --- Fallback logic for old structure (spans within p.testimonial-text) ---
             console.warn("Using fallback JS for testimonial:", btn.closest('.testimonial'));
             if (oldFullSpan.textContent.trim().length > 0) {
                 oldPreviewSpan.style.display = 'block'; // Default to block
                 oldFullSpan.style.display = 'none';
                 btn.style.display = 'inline-block';

                 btn.addEventListener('click', () => {
                     const isExpanded = oldFullSpan.style.display !== 'none';
                     if (isExpanded) {
                         oldFullSpan.style.display = 'none';
                         oldPreviewSpan.style.display = 'block';
                         btn.textContent = 'Read more';
                     } else {
                         oldPreviewSpan.style.display = 'none';
                         oldFullSpan.style.display = 'block'; // Use block for full text
                         btn.textContent = 'Read less';
                     }
                 });
             } else {
                 if (oldPreviewSpan) oldPreviewSpan.style.display = 'block';
                 btn.style.display = 'none';
             }
        } else {
             // Hide button if elements are missing entirely
             console.error("Could not find testimonial text elements for button:", btn);
            btn.style.display = 'none';
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
    const mobileMediaQuery = window.matchMedia('(max-width: 768px)'); // Media query for mobile check

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

        // Function to update wrapper class based on scrollability and device type
        const updateScrollability = () => {
            const isMobile = mobileMediaQuery.matches;
            const canScrollDesktop = totalOriginalItems > itemsToShow;

            if (isMobile) {
                testimonialsWrapper.classList.remove('has-scroll-next');
                console.log("Scrollability update (Mobile): Hiding arrow.");
            } else {
                if (canScrollDesktop) {
                    testimonialsWrapper.classList.add('has-scroll-next');
                    console.log("Scrollability update (Desktop): Showing arrow.");
                } else {
                    testimonialsWrapper.classList.remove('has-scroll-next');
                    console.log("Scrollability update (Desktop): Hiding arrow (not enough items).");
                }
            }
        };

        const setupCarousel = () => {
            console.log("Setting up carousel...");
            isScrolling = false;
            clearTimeout(scrollEndTimer);
            clones.forEach(clone => clone.remove()); // Remove previous clones
            clones = []; // Reset clones array
            // Ensure we only select non-cloned items for recalculation
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

                const isMobile = mobileMediaQuery.matches;
                console.log(`Is mobile? ${isMobile}`);

                // Cloning logic only for desktop when needed
                if (!isMobile && totalOriginalItems > itemsToShow) {
                    console.log(`Cloning first ${itemsToShow} items for infinite loop (Desktop).`);
                    for (let i = 0; i < itemsToShow; i++) {
                        if (i < totalOriginalItems) {
                            const clone = originalTestimonials[i].cloneNode(true);
                            clone.classList.add('clone');
                            clone.setAttribute('aria-hidden', 'true');
                            testimonialsContainer.appendChild(clone);
                            clones.push(clone);
                        }
                    }
                } else if (isMobile) {
                    console.log("Not cloning items (Mobile).");
                } else {
                    console.log("Not cloning items - all items fit or not enough items (Desktop).");
                }

                testimonialsContainer.scrollLeft = 0; // Reset scroll position
                updateScrollability(); // Add/remove class based on calculation and device
                console.log("Carousel setup complete.");
            });
        };

        const handleScrollEnd = () => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile) {
                isScrolling = false; // Still reset flag in case it was somehow set
                console.log("Scroll end ignored (Mobile). isScrolling reset.");
                return; // Don't perform infinite loop reset on mobile
            }

            // Desktop-only infinite scroll reset logic
            const scrollAmountOneItem = testimonialWidth + gap;
            const loopResetTargetScrollLeft = totalOriginalItems * scrollAmountOneItem;
            console.log(`Scroll check: scrollLeft=${testimonialsContainer.scrollLeft}, targetThreshold=${loopResetTargetScrollLeft}`);

            if (testimonialsContainer.scrollLeft >= loopResetTargetScrollLeft - 10) { // Use a small buffer
                console.log("Loop forward threshold reached. Resetting scroll to beginning.");
                // Use 'auto' for instant jump, 'smooth' causes issues here
                testimonialsContainer.scrollTo({ left: 0, behavior: 'auto' });
            }
            isScrolling = false;
            // No need to call updateScrollability here unless items change dynamically
            console.log("isScrolling reset to false.");
        };


        const scrollNext = () => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile) {
                console.log("Scroll attempt blocked: Mobile device.");
                return; // Ignore scroll attempts on mobile
            }

            // Check scrollability based on calculation for desktop
            const canScroll = totalOriginalItems > itemsToShow;
            if (isScrolling || !canScroll) {
                console.log(`Scroll attempt blocked: isScrolling=${isScrolling}, canScroll=${canScroll}`);
                return;
            }
            console.log("Scroll conditions met. Starting scroll...");
            isScrolling = true;

            const scrollAmount = testimonialWidth + gap;
            clearTimeout(scrollEndTimer); // Clear any previous timer
            testimonialsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            // Set timeout ONLY for desktop to handle infinite loop reset
            scrollEndTimer = setTimeout(handleScrollEnd, 500); // Adjust timeout duration if needed
        };

        // Click Trigger on the WRAPPER (for desktop arrow)
        testimonialsWrapper.addEventListener('click', (event) => {
            const isMobile = mobileMediaQuery.matches;
            if (isMobile) {
                console.log("Click ignored on wrapper: Mobile device.");
                return; // Ignore clicks on mobile
            }

            // Prevent clicks on buttons/links inside testimonials from triggering scroll
            if (event.target.closest('.testimonial a, .testimonial button')) {
                console.log("Clicked on a link/button inside testimonial, ignoring scroll trigger.");
                return;
            }

            // Check if the click is within the area of the ::after pseudo-element (arrow)
            const wrapperRect = testimonialsWrapper.getBoundingClientRect();
            // Use computed style to get arrow width dynamically if possible, fallback needed
            const arrowComputedStyle = window.getComputedStyle(testimonialsWrapper, '::after');
            const arrowWidth = parseFloat(arrowComputedStyle.width) || 35; // Fallback to 35px
            const paddingRight = parseFloat(window.getComputedStyle(testimonialsWrapper).paddingRight);

            // Calculate the rough horizontal start position of the arrow
            // Arrow lives within padding, so check if click is to the right of content area start
            const arrowStartsAt = wrapperRect.right - paddingRight; // Rough start

            // Check if click is horizontally within the padding/arrow area on the right
            if (event.clientX >= arrowStartsAt && event.clientX <= wrapperRect.right) {
                 console.log("Click detected in arrow region.");
                 scrollNext();
            }
        });

        // Manual scroll detection for infinite loop reset
        // This listener's core logic should only run on mobile now
        let manualScrollTimer;
        testimonialsContainer.addEventListener('scroll', () => {
            const isMobile = mobileMediaQuery.matches;
            // Only run debounce for manual scrolls on mobile
            // Ignore if on desktop OR if a programmatic scroll is happening
            if (!isMobile || isScrolling) {
                // Optional: console log for debugging if needed
                // console.log(`Manual scroll listener ignored: isMobile=${isMobile}, isScrolling=${isScrolling}`);
                return;
            }
            // Debounce manual scroll check (Mobile Only)
            clearTimeout(manualScrollTimer);
            // console.log("Manual scroll detected (Mobile). Setting timer for handleScrollEnd."); // Optional log
            manualScrollTimer = setTimeout(handleScrollEnd, 150); // Short delay after manual scroll stops
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
        // Use setTimeout to ensure layout is likely stable
        setTimeout(setupCarousel, 100);

    } else {
        console.log("No testimonials found in the container.");
        // Ensure class is removed if no items initially
        if (testimonialsWrapper) { // Check if wrapper exists before modifying
            testimonialsWrapper.classList.remove('has-scroll-next');
        }
    }

}); // End DOMContentLoaded
