/* -------------------------------------------------------------
   WAVY STUDIO - Interactive & Creative Scripts
   Implements magnetic buttons, liquid wave transitions,
   interactive custom cursor, and dynamic portfolio showcases.
   ------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Dynamic loading of YouTube IFrame API
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Global Registry for YT.Player instances
    window.ytPlayers = window.ytPlayers || new Map();

    // Helper to get or create official YT.Player instance safely
    function getOrCreatePlayer(iframe, onReadyCallback) {
        if (!iframe) return null;
        if (window.ytPlayers.has(iframe)) {
            const player = window.ytPlayers.get(iframe);
            if (player && typeof player.playVideo === 'function' && onReadyCallback) {
                onReadyCallback(player);
            }
            return player;
        }
        if (typeof YT === 'undefined' || !YT.Player) return null;

        const player = new YT.Player(iframe, {
            events: {
                'onReady': (e) => {
                    if (onReadyCallback) onReadyCallback(e.target);
                }
            }
        });
        window.ytPlayers.set(iframe, player);
        return player;
    }

    window.isUserMuted = true;

    function updateMuteButtonsUI() {
        const s2Btn = document.getElementById('s2-mute-btn');
        const s3Btn = document.getElementById('s3-mute-btn');
        const s4Btn = document.getElementById('s4-mute-btn');
        [s2Btn, s3Btn, s4Btn].forEach(btn => {
            if (!btn) return;
            const unmutedIcon = btn.querySelector('.icon-unmuted');
            const mutedIcon = btn.querySelector('.icon-muted');
            if (window.isUserMuted) {
                if (unmutedIcon) unmutedIcon.style.display = 'none';
                if (mutedIcon) mutedIcon.style.display = 'block';
            } else {
                if (unmutedIcon) unmutedIcon.style.display = 'block';
                if (mutedIcon) mutedIcon.style.display = 'none';
            }
        });
    }




    let hasUserInteracted = false;
    window.addEventListener('click', () => { hasUserInteracted = true; }, { once: true });
    window.addEventListener('keydown', () => { hasUserInteracted = true; }, { once: true });

    function controlYT(iframe, func, args = []) {
        if (!iframe) return;
        setTimeout(() => {
            try {
                const player = getOrCreatePlayer(iframe);
                if (player && typeof player[func] === 'function') {
                    if (args.length > 0) {
                        player[func](...args);
                    } else {
                        player[func]();
                    }
                }
            } catch (e) {
                console.error(`Error executing ${func} on YT Player:`, e);
            }
        }, 50);
    }

function setS2PlayUi(isPlaying) {
  const s2PlayBtn = document.getElementById('s2-play-btn');
  if (!s2PlayBtn) return;

  const playIcon = s2PlayBtn.querySelector('.icon-play');
  const pauseIcon = s2PlayBtn.querySelector('.icon-pause');

  if (playIcon) playIcon.style.display = isPlaying ? 'none' : 'block';
  if (pauseIcon) pauseIcon.style.display = isPlaying ? 'block' : 'none';
}

function forcePlayAllSection2Videos() {
  if (typeof floatData === 'undefined') return;
  if (isCoverFlow) return;
  if (!window.isMgSectionVisible) return;

  window.isS2Playing = true;
  setS2PlayUi(true);

  floatData.forEach((item) => {
    if (!item || !item.active) return;

    const thumb = item.el ? item.el.querySelector('.carousel-thumb-img') : null;
    if (thumb) thumb.style.display = 'none';

    getOrCreatePlayer(item.active, (player) => {
      try {
        player.playVideo();
        player.mute();
      } catch (err) {}
    });

    controlYT(item.active, 'playVideo');
    controlYT(item.active, 'mute');
  });
}

    // Global listener to detect YouTube player status (Muted, Volume, Buffering)
    window.addEventListener('message', (e) => {
        if (e.origin !== 'https://www.youtube-nocookie.com') return;
        try {
            const data = JSON.parse(e.data);
            if (data.event === 'infoDelivery' && data.info && typeof floatData !== 'undefined') {
                // Find which iframe sent the status update
                const matchedItem = floatData.find(item => item.active.contentWindow === e.source);
                if (matchedItem) {
                    matchedItem.actualMuted = data.info.muted;
                    matchedItem.actualState = data.info.playerState; // 1: playing, 3: buffering
                }
            }
        } catch(err) {}
    });
    // -------------------------------------------------------------
    // 1. Custom Interactive Cursor (Smooth Magnetic Lerp)
    // -------------------------------------------------------------
    const cursor = document.querySelector('.custom-cursor');
    const follower = document.querySelector('.custom-cursor-follower');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let followerX = mouseX;
    let followerY = mouseY;
    let cursorHideTimeout;
    
    const lerp = (a, b, n) => (1 - n) * a + n * b;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // 1. Show cursors instantly when mouse moves
        cursor.classList.remove('cursor-hidden');
        follower.classList.remove('cursor-hidden');

        // 2. Clear previous timeout
        if (cursorHideTimeout) {
            clearTimeout(cursorHideTimeout);
        }

        // 3. Prevent the cursor from hiding if hovering over the contact section
        const isHoveringContact = e.target.closest('#contact-section');

        // 4. Set a new timeout to hide cursors after 100ms of inactivity (only if outside contact section)
        if (!isHoveringContact) {
            cursorHideTimeout = setTimeout(() => {
                cursor.classList.add('cursor-hidden');
                follower.classList.add('cursor-hidden');
            }, 100);
        }
    });

    function animateCursor() {
        // Main cursor is now instant (no lag)
        cursorX = mouseX; 
        cursorY = mouseY;
        // Follower retains a smooth but fast trail
        followerX = lerp(followerX, mouseX, 0.35); 
        followerY = lerp(followerY, mouseY, 0.35);

        // Use left and top instead of transform to prevent overriding CSS animations
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        follower.style.left = `${followerX}px`;
        follower.style.top = `${followerY}px`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state management for elements
    function addCursorListeners() {
        const interactiveElements = document.querySelectorAll('.nav-item, .work-card, .submit-btn, .filter-btn');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovered-btn');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovered-btn');
            });
        });

        const closeBtn = document.getElementById('close-page-btn');
        if (closeBtn) {
            closeBtn.addEventListener('mouseenter', () => {
                document.body.classList.add('hovered-close');
            });
            closeBtn.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovered-close');
            });
        }
    }
    addCursorListeners();

    // -------------------------------------------------------------
    // 2. Magnetic Buttons Effect
    // -------------------------------------------------------------
    function initMagneticButtons() {
        const magneticButtons = document.querySelectorAll('.magnetic-btn');

        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Get mouse position relative to button center
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move button 35% towards the cursor, text 20%
                btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
                
                const text = btn.querySelector('.nav-text');
                if (text) {
                    text.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
                }

                const brackets = btn.querySelectorAll('.bracket');
                brackets.forEach((br, i) => {
                    const dir = i === 0 ? -1 : 1;
                    br.style.transform = `translateX(${dir * 4 + x * 0.1}px) scale(1.15)`;
                });
            });

            btn.addEventListener('mouseleave', () => {
                // Smoothly reset transformations
                btn.style.transform = '';
                const text = btn.querySelector('.nav-text');
                if (text) {
                    text.style.transform = 'translate(0px, 0px)';
                }
                const brackets = btn.querySelectorAll('.bracket');
                brackets.forEach(br => {
                    br.style.transform = '';
                });
            });
        });
    }
    window.initMagneticButtons = initMagneticButtons;
    initMagneticButtons();

    // -------------------------------------------------------------
    // 3. Liquid Wave Transition & SPA Router
    // -------------------------------------------------------------
    const heroSection = document.getElementById('hero');
    const pageContainer = document.getElementById('page-container');
    const closePageBtn = document.getElementById('close-page-btn');
    const contentPanel = document.getElementById('content-panel');

    let isTransitioning = false;


    // Custom smooth scroll engine
    const scroller = document.querySelector('.main-scroller');
    const sections = Array.from(document.querySelectorAll('.section'));
    let isScrolling = false;
    let currentSectionIndex = 0;

    // Ease-in-out function for smooth organic movement
    const easeInOut = t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    function customScrollTo(targetY, duration = 1200) {
        if (isScrolling) return;
        isScrolling = true;
        const startY = window.scrollY;
        const distance = targetY - startY;
        let startTime = null;

        function step(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            window.scrollTo(0, startY + distance * easeInOut(progress));

            if (timeElapsed < duration) {
                requestAnimationFrame(step);
            } else {
                isScrolling = false;
            }
        }
        requestAnimationFrame(step);
    }

    // 1. Handle Top Nav Clicks (with Global Video Kill-switch)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            // [FIX] Instantly mute and pause ALL global videos before navigating away
            if (typeof floatData !== 'undefined') {
                floatData.forEach(vid => {
                    controlYT(vid.active, 'pauseVideo');
                    controlYT(vid.active, 'mute');
                });
            }
            if (typeof itemsData3D !== 'undefined') {
                itemsData3D.forEach(vid => {
                    controlYT(vid.iframe, 'pauseVideo');
                    controlYT(vid.iframe, 'mute');
                });
            }
            if (typeof itemsData4D !== 'undefined') {
                itemsData4D.forEach(vid => {
                    controlYT(vid.iframe, 'pauseVideo');
                    controlYT(vid.iframe, 'mute');
                });
            }
            const alphaBg = document.getElementById('alpha-bg-video');
            if (alphaBg) {
                alphaBg.pause();
            }

            if (targetId) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    currentSectionIndex = sections.indexOf(targetSection);
                    customScrollTo(currentSectionIndex * window.innerHeight, 1200);
                }
            }
        });
    });

    // 2. Handle Mouse Wheel / Trackpad Swipes
    scroller.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isScrolling || document.body.classList.contains('is-loading')) return;

        if (e.deltaY > 40 && currentSectionIndex < sections.length - 1) {
            currentSectionIndex++;
            customScrollTo(currentSectionIndex * window.innerHeight, 1200);
        } else if (e.deltaY < -40 && currentSectionIndex > 0) {
            currentSectionIndex--;
            customScrollTo(currentSectionIndex * window.innerHeight, 1200);
        }
    }, { passive: false });

    // -------------------------------------------------------------
    // 4. Portfolio Content Data & Rendering
    // -------------------------------------------------------------
    const portfolioData = {
        '2d-motion': {
            title: '2D Motion Graphics',
            desc: 'High-end branding, liquid graphics, character animations, and vector motion that flows like water.',
            draftImg: 'assets/motion_graphics_draft.png'
        },
        '3d-graphics': {
            title: '3D Graphics & Environments',
            desc: 'Futuristic spaces, high-contrast renders, interactive WebGL simulations, and next-generation art direction.',
            draftImg: 'assets/3d_graphics_draft.png'
        },
        'live-2d': {
            title: 'Interactive Live 2D',
            desc: 'Giving life to illustrations. Interactive vector characters with immersive cursor eye-tracking and responsive physical animation.',
            draftImg: 'assets/live2d_draft.png'
        }
    };

    function renderCategoryContent(category) {
        const data = portfolioData[category];
        const panelTitle = contentPanel.querySelector('.panel-title');
        const panelTag = contentPanel.querySelector('.category-tag');
        const panelBody = contentPanel.querySelector('.panel-body');

        // Set Header details
        panelTag.textContent = category.replace('-', ' ');
        panelTitle.textContent = data.title;

        // Reset scroll position
        contentPanel.scrollTop = 0;

        let htmlContent = '';

        if (category === '2d-motion' || category === '3d-graphics' || category === 'live-2d') {
            htmlContent = `
                <p class="category-desc" style="color: var(--text-muted); font-size: 15px; max-width: 600px; line-height: 1.8; margin-bottom: 30px; font-weight: 300;">${data.desc}</p>
                <div class="draft-frame-container" style="position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #090a0f; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6); margin-bottom: 20px; aspect-ratio: 16/9; display: flex; justify-content: center; align-items: center;">
                    <img src="${data.draftImg}" alt="${data.title} Draft Frame" style="width: 100%; height: 100%; object-fit: contain; transform: scale(1.01); transition: transform 0.8s ease;" class="draft-frame-img">
                    <div style="position: absolute; top: 20px; left: 20px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 30px; color: var(--accent-cyan); font-size: 10px; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">
                        Draft Concept Preview
                    </div>
                </div>
            `;
        } else if (category === 'contact') {
            htmlContent = `
                <p class="category-desc" style="color: var(--text-muted); font-size: 15px; max-width: 600px; line-height: 1.8; margin-bottom: 40px; font-weight: 300;">Let's make something amazing together.</p>
                <div class="contact-container">
                    <div class="contact-info">
                        <h3>Let's make something amazing.</h3>
                        <p>We are always eager to collaborate on next-generation graphics, design architectures, and premium branding campaigns.</p>
                        <div class="contact-details">
                            <div class="detail-item">
                                <span class="detail-label">Email Address</span>
                                <span class="detail-val">hello@wavystudio.io</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Studio Address</span>
                                <span class="detail-val">A102 Creative Block, Gangnam, Seoul</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Social Coordinates</span>
                                <span class="detail-val">@wavystudio.io</span>
                            </div>
                        </div>
                    </div>
                    <form class="contact-form" id="contact-us-form" onsubmit="event.preventDefault(); handleContactSubmit();">
                        <div class="input-group">
                            <input type="text" class="input-field" required>
                            <label class="input-label">Full Name</label>
                        </div>
                        <div class="input-group">
                            <input type="email" class="input-field" required>
                            <label class="input-label">Email Address</label>
                        </div>
                        <div class="input-group">
                            <textarea class="input-field" rows="4" style="resize: none;" required></textarea>
                            <label class="input-label">Message Details</label>
                        </div>
                        <button type="submit" class="submit-btn magnetic-btn">Send Transmission</button>
                    </form>
                </div>
            `;
        }

        panelBody.innerHTML = htmlContent;
    }

    // -------------------------------------------------------------
    // 5. Special Feature: 3D Interactive Mesh Canvas
    // -------------------------------------------------------------
    function init3DMeshCanvas() {
        const canvas = document.getElementById('mesh-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            if (canvas && canvas.offsetWidth) {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
            }
        });

        // Particle configuration for digital landscape
        const columns = 25;
        const rows = 15;
        const particles = [];
        const gapX = width / (columns - 1);
        const gapY = height / (rows - 1);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < columns; c++) {
                particles.push({
                    baseX: c * gapX,
                    baseY: r * gapY,
                    x: c * gapX,
                    y: r * gapY,
                    vx: 0,
                    vy: 0
                });
            }
        }

        let mouseActiveX = width / 2;
        let mouseActiveY = height / 2;
        let isHovered = false;

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseActiveX = e.clientX - rect.left;
            mouseActiveY = e.clientY - rect.top;
            isHovered = true;
        });

        canvas.addEventListener('mouseleave', () => {
            isHovered = false;
        });

        function animateMesh() {
            if (!canvas) return;
            ctx.clearRect(0, 0, width, height);

            // Update & Render mesh nodes
            particles.forEach(p => {
                let dx = mouseActiveX - p.x;
                let dy = mouseActiveY - p.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                let force = 0;

                if (isHovered && dist < 180) {
                    // Warp force calculations
                    force = (180 - dist) / 180;
                    let angle = Math.atan2(dy, dx);
                    // Attract/Repel slightly based on distance
                    p.vx -= Math.cos(angle) * force * 4;
                    p.vy -= Math.sin(angle) * force * 4;
                }

                // Spring force back to base position
                p.vx += (p.baseX - p.x) * 0.08;
                p.vy += (p.baseY - p.y) * 0.08;

                // Friction
                p.vx *= 0.85;
                p.vy *= 0.85;

                p.x += p.vx;
                p.y += p.vy;
            });

            // Draw beautiful connection lines
            ctx.strokeStyle = 'rgba(94, 243, 226, 0.07)';
            ctx.lineWidth = 1;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < columns; c++) {
                    const idx = r * columns + c;
                    
                    // Draw line to right neighbor
                    if (c < columns - 1) {
                        ctx.beginPath();
                        ctx.moveTo(particles[idx].x, particles[idx].y);
                        ctx.lineTo(particles[idx + 1].x, particles[idx + 1].y);
                        ctx.stroke();
                    }

                    // Draw line to bottom neighbor
                    if (r < rows - 1) {
                        ctx.beginPath();
                        ctx.moveTo(particles[idx].x, particles[idx].y);
                        ctx.lineTo(particles[idx + columns].x, particles[idx + columns].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw nodes
            particles.forEach(p => {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animateMesh);
        }
        animateMesh();
    }

    // -------------------------------------------------------------
    // 6. Special Feature: Live 2D Eye Tracking Simulation
    // -------------------------------------------------------------
    let trackingActive = false;
    function initLive2DTracking() {
        const leftPupil = document.getElementById('left-pupil');
        const rightPupil = document.getElementById('right-pupil');
        const mouth = document.getElementById('character-mouth');
        const portrait = document.getElementById('live2d-portrait');

        if (!leftPupil || !rightPupil) return;
        trackingActive = true;

        const leftEyeCenterX = 75;
        const leftEyeCenterY = 95;
        const rightEyeCenterX = 125;
        const rightEyeCenterY = 95;
        
        window.addEventListener('mousemove', (e) => {
            if (!trackingActive) return;

            const rect = portrait.getBoundingClientRect();
            // Vector relative coords
            const boundsX = rect.left + rect.width / 2;
            const boundsY = rect.top + rect.height / 2;

            const dx = e.clientX - boundsX;
            const dy = e.clientY - boundsY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Eye tracking limit radius
            const limit = 4;
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * Math.min(dist * 0.05, limit);
            const moveY = Math.sin(angle) * Math.min(dist * 0.05, limit);

            leftPupil.setAttribute('cx', leftEyeCenterX + moveX);
            leftPupil.setAttribute('cy', leftEyeCenterY + moveY);

            rightPupil.setAttribute('cx', rightEyeCenterX + moveX);
            rightPupil.setAttribute('cy', rightEyeCenterY + moveY);

            // Responsive cute physical mouth curl on mouse proximity
            if (dist < 150) {
                mouth.setAttribute('d', 'M 92 124 Q 100 132 108 124');
            } else {
                mouth.setAttribute('d', 'M 90 125 Q 100 128 110 125');
            }
        });
    }


    // -------------------------------------------------------------
    // 7. Contact Submission Success Feedback
    // -------------------------------------------------------------
    window.handleContactSubmit = function() {
        const form = document.getElementById('contact-us-form');
        const container = form.parentElement;

        container.style.opacity = '0';
        container.style.transform = 'translateY(15px)';
        
        setTimeout(() => {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 0;">
                    <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(94, 243, 226, 0.1); border: 2px solid var(--accent-cyan); display: flex; align-items: center; justify-content: center; margin-bottom: 24px; animation: scaleUpCheck 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <span class="detail-label">Transmission Successful</span>
                    <h3 style="font-family: var(--font-serif); font-size: 36px; font-weight: 400; margin: 10px 0 15px 0;">We hear you, loud and clear.</h3>
                    <p style="color: var(--text-muted); font-size: 14px; max-width: 450px; line-height: 1.7; margin-bottom: 30px;">Thank you for reaching out to WAVY Studio. A representative from our visual mechanics division will make contact with your digital coordinates shortly.</p>
                </div>
            `;
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 400);
    };



    // Toggle nav blend mode based on Hero section visibility
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const topNav = document.querySelector('.top-nav');
            const bottomNav = document.querySelector('.bottom-nav');
            if (entry.isIntersecting) {
                topNav.style.mixBlendMode = 'normal';
                bottomNav.style.mixBlendMode = 'normal';
            } else {
                topNav.style.mixBlendMode = 'difference';
                bottomNav.style.mixBlendMode = 'difference';
            }
        });
    }, { threshold: 0.2 });
    
    const heroSec = document.getElementById('hero');
    if (heroSec) navObserver.observe(heroSec);

    // 8. Double-Buffer Zero-Delay Physics Engine
    const scrollerContainer = document.querySelector('.main-scroller');
    const targetSection = document.getElementById('motion-graphics');
    const parallaxItems = document.querySelectorAll('.js-parallax');
    const floatingItems = document.querySelectorAll('.mg-floating-item');

    let isCoverFlow = true;

    const tooltip = document.querySelector('.cursor-tooltip');
    
    window.addEventListener('mousemove', (e) => {
        // Check if mouse is hovering over the toggle button
        const isHoveringToggle = e.target.closest ? e.target.closest('#view-toggle-btn') : null;

        // Disable tooltip if in Physics mode, section is hidden, or hovering the toggle button
        const sec3 = document.getElementById('interaction-3d');
        const sec3Rect = sec3 ? sec3.getBoundingClientRect() : {left: 9999, right: -9999};
        const isSec3Visible = (sec3Rect.left < window.innerWidth) && (sec3Rect.right > 0);

        const sec4 = document.getElementById('live2d-section');
        const sec4Rect = sec4 ? sec4.getBoundingClientRect() : {left: 9999, right: -9999};
        const isSec4Visible = (sec4Rect.left < window.innerWidth) && (sec4Rect.right > 0);
        
        // Ensure tooltip isn't killed if Section 4 is visible
        if (isHoveringToggle || (!isSec3Visible && !isSec4Visible && (!isCoverFlow || !window.isMgSectionVisible))) {
            return;
        }
        
        const isHoveringVideo = (e.target && typeof e.target.closest === 'function') ? e.target.closest('#motion-graphics .mg-video-rect, #interaction-3d .mg-video-rect, #live2d-section .mg-video-rect') : null;
        
        if (isHoveringVideo) {
            document.body.classList.add('hovered-btn');
            if (tooltip) {
                tooltip.style.left = `${e.clientX + 20}px`;
                tooltip.style.top = `${e.clientY + 20}px`;
                tooltip.classList.add('visible');
            }
        } else {
            if (tooltip) {
                tooltip.classList.remove('visible');
            }
            if (e.target.closest && !e.target.closest('.nav-item, .work-card, .submit-btn, .filter-btn')) {
                document.body.classList.remove('hovered-btn');
            }
        }
    });

    // Restore click-to-open YouTube link functionality
    window.addEventListener('click', (e) => {
        const clickedVideo = (e.target && typeof e.target.closest === 'function') ? e.target.closest('#motion-graphics .mg-video-rect, #interaction-3d .mg-video-rect, #live2d-section .mg-video-rect') : null;
        if (clickedVideo) {
            const activeIframe = clickedVideo.querySelector('iframe');
            if (activeIframe && activeIframe.src) {
                // Extract the YouTube video ID securely from the embed URL
                const videoIdMatch = activeIframe.src.match(/\/embed\/([a-zA-Z0-9_-]+)/);
                if (videoIdMatch && videoIdMatch[1]) {
                    window.open(`https://www.youtube.com/watch?v=${videoIdMatch[1]}`, '_blank');
                }
            }
        }
    });



    const viewToggleBtn = document.getElementById('view-toggle-btn');
    const carouselCounter = document.getElementById('carousel-counter');
    const totalVidCountEl = document.getElementById('total-vid-count');
    if (viewToggleBtn) {
        viewToggleBtn.addEventListener('click', () => {
            isCoverFlow = !isCoverFlow;
            window.lastCoverIndex = -1;
            
            // Dynamically change text based on active view mode
            if (isCoverFlow) {
                viewToggleBtn.textContent = 'More FUN.!';
            } else {
                viewToggleBtn.textContent = 'back';
            }

            if (carouselCounter) {
                if (isCoverFlow) {
                    carouselCounter.classList.remove('hidden');
                } else {
                    carouselCounter.classList.add('hidden');
                }
            }

            floatData.forEach(item => {
                if (isCoverFlow) {
                    item.el.classList.add('cover-flow-active');
                } else {
                    if (item.volumeInterval) clearInterval(item.volumeInterval);
                    controlYT(item.active, 'mute');
                    item.currentVolume = 0;

                    item.el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                    item.el.classList.remove('cover-flow-active');
                    item.el.style.opacity = '1';
                    
                    const rect = item.el.getBoundingClientRect();
                    item.baseX = rect.left;
                    item.baseY = rect.top;
                    
                    setTimeout(() => {
                        if (!isCoverFlow) item.el.style.transition = '';
                    }, 800);
                }
            });

            // Restart and reveal Alpha Video + Force Play all iframes
            if (!isCoverFlow) {
                window.isS2Playing = true;
                setS2PlayUi(true);

                const bgVid = document.getElementById('alpha-bg-video');
                if (bgVid) {
                  bgVid.play().catch(() => {});
                  bgVid.style.opacity = 0.5;
                }

                forcePlayAllSection2Videos();
                setTimeout(forcePlayAllSection2Videos, 200);
                setTimeout(forcePlayAllSection2Videos, 700);
            }
        });
    }

    const alphaVideoPool = [
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-whichesnight.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-%ED%98%B8%EC%A0%91%EB%B0%98%EC%A0%90.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-vaizravana.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-lovelygirl.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-nightaya.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-kogasa.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/ORI-tryeverything.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/travelingdays.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-tightlyflan.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-lastwind.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/%EB%94%B8%EA%B8%B0-%EB%84%88%EB%A7%8C%EC%95%84%EB%8B%88%EB%A9%B4%EB%8F%BC.webm",
        "https://pub-e35da0e76d7041cd886660ef52aa63fc.r2.dev/wavit-nostalgic.webm"
    ];

    const videoPool = [
        { id: "Koc9PIFQkjA", start: 28 },
        { id: "WiU-ITTfPEg", start: 0 },
        { id: "Lxnl2D95EDU", start: 34 },
        { id: "D_j5DKR2M3w", start: 0 },
        { id: "Ax4QGQF7Tjs", start: 0 },
        { id: "vTjvYr8cuy8", start: 0 },
        { id: "FPu5vUQmfW8", start: 85 },
        { id: "CkRY79b0IsI", start: 0 },
        { id: "dDBlbs1FhTw", start: 0 },
        { id: "eEKzjTCCmPg", start: 12 },
        { id: "q8KgjqM-Bfs", start: 0 },
        { id: "MTxIMAfL1nw", start: 0 }
    ];
    let videoIndex = 3; // First 3 are rendered in HTML

    // Helper: Minimalist Smash Shape Burst Animation
    function createShapeBurst(x, y) {
        // Apply Screen Shake to the section itself to prevent fixed-position stacking context bugs
        const mgSection = document.getElementById('motion-graphics');
        if(mgSection) {
            mgSection.classList.add('impact-shake');
            setTimeout(() => mgSection.classList.remove('impact-shake'), 400);
        }

        const burst = document.createElement('div');
        burst.className = 'mg-shape-burst';
        burst.style.left = `${x}px`;
        burst.style.top = `${y}px`;

        // Shockwave 1: Dashed Circle
        const ring1 = document.createElement('div');
        ring1.className = 'mg-burst-circle shockwave-1';
        ring1.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="#9A9A9A" stroke-width="0.5" stroke-dasharray="4 8"><circle cx="50" cy="50" r="48"/></svg>`;

        // Shockwave 2: Thin Solid Circle
        const ring2 = document.createElement('div');
        ring2.className = 'mg-burst-circle shockwave-2';
        ring2.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="#9A9A9A" stroke-width="0.5"><circle cx="50" cy="50" r="48"/></svg>`;

        // Core Star
        const star = document.createElement('div');
        star.className = 'mg-burst-star';
        star.innerHTML = `<svg viewBox="0 0 50 50" fill="none" stroke="#9A9A9A" stroke-width="0.5"><path d="M25 0 L28 22 L50 25 L28 28 L25 50 L22 28 L0 25 L22 22 Z"/></svg>`;

        // Sparks: Clean radiating lines shooting out
        const sparks = document.createElement('div');
        sparks.className = 'mg-burst-sparks';
        sparks.innerHTML = `<svg viewBox="0 0 100 100" fill="none" stroke="#9A9A9A" stroke-width="0.5">
            <line x1="50" y1="15" x2="50" y2="35"/>
            <line x1="50" y1="65" x2="50" y2="85"/>
            <line x1="15" y1="50" x2="35" y2="50"/>
            <line x1="65" y1="50" x2="85" y2="50"/>
            <line x1="25" y1="25" x2="39" y2="39"/>
            <line x1="61" y1="61" x2="75" y2="75"/>
            <line x1="25" y1="75" x2="39" y2="61"/>
            <line x1="61" y1="39" x2="75" y2="25"/>
        </svg>`;

        burst.appendChild(ring1);
        burst.appendChild(ring2);
        burst.appendChild(star);
        burst.appendChild(sparks);
        document.body.appendChild(burst);

        setTimeout(() => burst.remove(), 800);
    }

    // Helper: Create Fade-out Video Trail Shape (Absolute to Section)
    function createVideoTrail(item) {
        const rect = item.el.getBoundingClientRect();
        const secRect = targetSection.getBoundingClientRect();
        
        const trail = document.createElement('div');
        trail.className = 'mg-video-trail';
        trail.style.width = `${rect.width}px`;
        trail.style.height = `${rect.height}px`;
        // Calculate absolute position within the section container
        trail.style.left = `${rect.left - secRect.left}px`;
        trail.style.top = `${rect.top - secRect.top}px`;
        
        targetSection.appendChild(trail);
        setTimeout(() => trail.remove(), 2000);
    }

    // Best-Candidate Algorithm for random scattering (Avoids mouse)
    function randomizeTransform(item, allItems) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        // Dynamic scale and padding: larger size & smaller padding on mobile (portrait)
        const isPortrait = h > w;
        // Responsive scaling adjusted for a better fit across all screen sizes
        const minScale = isPortrait ? 0.38 : 0.18; // 38% width on mobile, 18% width on desktop
        const varScale = isPortrait ? 0.17 : 0.12; // Variance modifier
        const padX = isPortrait ? w * 0.05 : w * 0.12; 
        const padY = isPortrait ? h * 0.08 : h * 0.15; 
        
        const newWidth = Math.random() * (w * varScale) + (w * minScale); 
        
        let bestX = 0, bestY = 0, maxScore = -1;
        
        for(let i = 0; i < 30; i++) {
            let tx = Math.random() * (w - newWidth - padX * 2) + padX;
            let ty = Math.random() * (h * 0.7 - padY * 2) + padY;
            
            let cx = tx + newWidth / 2;
            let cy = ty + (newWidth * 9/16) / 2;
            let distToMouse = Math.hypot(cx - mouseX, cy - mouseY);
            if (distToMouse < 450) continue; 
            
            let minDistance = 9999;
            allItems.forEach(other => {
                if (other === item || other.baseX === -9999) return;
                let dist = Math.hypot(tx - other.baseX, ty - other.baseY);
                if (dist < minDistance) minDistance = dist;
            });
            
            if (minDistance > maxScore) {
                maxScore = minDistance;
                bestX = tx;
                bestY = ty;
            }
        }

        if (maxScore === -1) {
            bestX = Math.random() * (w - newWidth - padX * 2) + padX;
            bestY = Math.random() * (h * 0.7 - padY * 2) + padY;
        }

        item.el.style.width = `${newWidth}px`;
        item.el.style.left = `${bestX}px`;
        item.el.style.top = `${bestY}px`;
        item.baseX = bestX;
        item.baseY = bestY;
    }

    // Initialize Double-Buffer Iframes for True Zero-Delay
    const floatData = Array.from(floatingItems).map(el => {
        const rectContainer = el.querySelector('.mg-video-rect');
        const activeIframe = el.querySelector('iframe');
        
        // Setup active iframe for absolute stacking
        activeIframe.style.position = 'absolute';
        activeIframe.style.top = '0';
        activeIframe.style.left = '0';
        activeIframe.style.opacity = '1';
        activeIframe.style.transition = 'opacity 0.6s';

        // Create background buffer iframe
        const bufferIframe = document.createElement('iframe');
        const nextVid = videoPool[videoIndex];
        videoIndex = (videoIndex + 1) % videoPool.length;
        
        const startParamBuffer = nextVid.start > 0 ? `&start=${nextVid.start}` : '';
        bufferIframe.src = "";
        bufferIframe.setAttribute('allow', 'autoplay; fullscreen; compute-pressure');
        bufferIframe.style.cssText = "width:100%; height:100%; border:none; pointer-events:none; transform:scale(1.01); position:absolute; top:0; left:0; opacity:0; transition:opacity 0.6s;";
        
        rectContainer.appendChild(bufferIframe);

        const item = {
            el,
            active: activeIframe,
            buffer: bufferIframe,
            state: 'idle',
            repelX: 0, repelY: 0,
            flyX: 0, flyY: 0,
            baseX: -9999, baseY: -9999,
            spawnTime: Date.now(),
            lastTrailTime: Date.now()
        };
        return item;
    });
    
    floatData.forEach(item => {
        randomizeTransform(item, floatData);
        if (isCoverFlow) {
            item.el.classList.add('cover-flow-active');
        }
    });

    // Create SVG overlay for dynamic connection lines between videos
    const connectionSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    connectionSvg.style.cssText = "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 3; overflow: visible;";
    
    const lines = [
        document.createElementNS("http://www.w3.org/2000/svg", "line"),
        document.createElementNS("http://www.w3.org/2000/svg", "line"),
        document.createElementNS("http://www.w3.org/2000/svg", "line")
    ];
    
    lines.forEach(line => {
        line.setAttribute("stroke", "#9A9A9A");
        line.setAttribute("stroke-width", "0.5");
        // Smooth transition for breaking and re-connecting animation
        line.style.transition = "opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        line.style.opacity = "1";
        connectionSvg.appendChild(line);
    });
    
    document.querySelector('.mg-video-containers.floating-layout').appendChild(connectionSvg);

    function updateCoverFlowVideos(activeIndex) {
        if (typeof updateMuteButtonsUI === 'function') {
            updateMuteButtonsUI();
        }
        const totalVideos = videoPool.length;
        const oldCenterItem = floatData.find(item => item.pos === 0);
        
        window.lastCoverIndex = activeIndex;

        // Update Alpha Background video dynamically with Fade In/Out
        const alphaBgVid = document.getElementById('alpha-bg-video');
        if (alphaBgVid) {
            if (alphaBgVid.fadeTimeout) clearTimeout(alphaBgVid.fadeTimeout);
            const targetAlphaSrc = alphaVideoPool[activeIndex] || "";

            // Step 1: Fade out video by triggering CSS transition
            alphaBgVid.style.opacity = '0';

            // Step 2: Wait for 500ms (fade-out animation duration) before swapping sources
            alphaBgVid.fadeTimeout = setTimeout(() => {
                if (targetAlphaSrc) {
                    if (alphaBgVid.src !== targetAlphaSrc) {
                        alphaBgVid.src = targetAlphaSrc;
                        alphaBgVid.play().catch(() => {});
                    }
                    // Step 3: Fade back into the target 50% opacity
                    alphaBgVid.style.opacity = '0.5';
                } else {
                    alphaBgVid.src = "";
                    alphaBgVid.load();
                }
            }, 500);
        }

        const leftVidIdx = activeIndex - 1;
        const centerVidIdx = activeIndex;
        const rightVidIdx = activeIndex + 1;

        const leftContainerIdx = ((leftVidIdx % 3) + 3) % 3;
        const centerContainerIdx = ((centerVidIdx % 3) + 3) % 3;
        const rightContainerIdx = ((rightVidIdx % 3) + 3) % 3;

        floatData[leftContainerIdx].pos = -1;
        floatData[leftContainerIdx].vidIdx = leftVidIdx;

        floatData[centerContainerIdx].pos = 0;
        floatData[centerContainerIdx].vidIdx = centerVidIdx;

        floatData[rightContainerIdx].pos = 1;
        floatData[rightContainerIdx].vidIdx = rightVidIdx;

        // Find the new center item
        const newCenterItem = floatData[centerContainerIdx];

        // 0. AGGRESSIVE RESET & INSTANT STATE CHANGES
        floatData.forEach(item => {
            if (item.volumeInterval) clearInterval(item.volumeInterval);
            if (item.fadeTimeout) clearTimeout(item.fadeTimeout);
            
            // Instantly mute and pause any video that is no longer the center
            if (item !== newCenterItem) {
                controlYT(item.active, 'mute');
                controlYT(item.active, 'pauseVideo');
            }
        });

        // SWAP URLS FIRST & FLAG NEW LOADS
        floatData.forEach(item => {
            if (item.vidIdx >= 0 && item.vidIdx < totalVideos) {
                const vidData = videoPool[item.vidIdx];
                const startParamNew = vidData.start > 0 ? `&start=${vidData.start}` : '';
                const newSrc = `https://www.youtube-nocookie.com/embed/${vidData.id}?${startParamNew}&autoplay=1&mute=1&loop=1&playlist=${vidData.id}&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.protocol === 'file:' ? 'https://localhost' : window.location.origin}`;
                
                item.justSwapped = false;
                if (item.currentVidId !== vidData.id) {
                    item.currentVidId = vidData.id;
                    item.el.style.transition = 'none';
                    
                    item.active.style.opacity = '0.01';
                    
                    const activePlayer = getOrCreatePlayer(item.active);
                    if (activePlayer && typeof activePlayer.loadVideoById === 'function') {
                        activePlayer.loadVideoById({ videoId: vidData.id, startSeconds: vidData.start || 0 });
                        activePlayer.mute();
                    }
                    
                    item.justSwapped = true;
                    void item.el.offsetWidth;
                    item.el.style.transition = '';
                    
                    setTimeout(() => {
                        item.active.style.opacity = '1';
                    }, 1500);
                }
            }
        });

        // 3. DELAYED PLAY & UNMUTE CENTER
        if (newCenterItem) {
            if (window.s2PlayTimeout) clearTimeout(window.s2PlayTimeout);
            window.s2PlayTimeout = setTimeout(() => {
                if (hasUserInteracted && !window.isUserMuted) {
                    controlYT(newCenterItem.active, 'unMute');
                } else {
                    controlYT(newCenterItem.active, 'mute');
                }
                
                // Respect default pause state
                const shouldPlay = typeof window.isS2Playing !== 'undefined' ? window.isS2Playing : false;
                if (shouldPlay) {
                    controlYT(newCenterItem.active, 'playVideo');
                } else {
                    controlYT(newCenterItem.active, 'pauseVideo');
                }
            }, 600);
        }

        // Section 02 Cover Flow Thumbnail Modification
        floatData.forEach(item => {
            const videoRect = item.el.querySelector('.mg-video-rect');
            if (videoRect) {
                let thumbImg = videoRect.querySelector('.carousel-thumb-img');
                if (!thumbImg) {
                    thumbImg = document.createElement('img');
                    thumbImg.className = 'carousel-thumb-img';
                    thumbImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 4; display: none;";
                    videoRect.appendChild(thumbImg);
                }
            }

            const thumbImg = item.el.querySelector('.carousel-thumb-img');
            const vidData = videoPool[item.vidIdx];

            if (isCoverFlow) {
                const isPlaying = typeof window.isS2Playing !== 'undefined' ? window.isS2Playing : false;
                if (item.pos === 0 && isPlaying) {
                    // Center Video: Hide thumbnail, play video iframe
                    if (thumbImg) thumbImg.style.display = 'none';
                    controlYT(item.active, 'playVideo');
                } else {
                    // Side Videos or non-playing center: Show YouTube static thumbnail, pause iframe
                    if (thumbImg && vidData) {
                        thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                        thumbImg.style.display = 'block';
                    }
                    controlYT(item.active, 'pauseVideo');
                    controlYT(item.active, 'mute');
                }
            } else {
                // MORE FUN.! (Physics Mode): Completely hide all thumbnails so all iframes show/play normally
                if (thumbImg) thumbImg.style.display = 'none';
            }
        });

        // Also update counter display index logic
        if (typeof window.currentDisplayIdx === 'undefined') {
            window.currentDisplayIdx = activeIndex;
        }

        if (window.currentDisplayIdx !== activeIndex) {
            const isUp = activeIndex > window.currentDisplayIdx;
            const currentVal = String(window.currentDisplayIdx + 1).padStart(2, '0');
            const targetVal = String(activeIndex + 1).padStart(2, '0');

            const box = document.querySelector('.counter-num-box');
            if (box) {
                box.innerHTML = '';
                const oldNum = document.createElement('span');
                oldNum.textContent = currentVal;
                oldNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease; transform:translateY(0); opacity:1;";

                const nextNum = document.createElement('span');
                nextNum.textContent = targetVal;
                nextNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;";

                if (isUp) {
                    nextNum.style.transform = 'translateY(-100%)';
                    nextNum.style.opacity = '0';
                } else {
                    nextNum.style.transform = 'translateY(100%)';
                    nextNum.style.opacity = '0';
                }

                box.appendChild(oldNum);
                box.appendChild(nextNum);
                void box.offsetWidth;

                if (isUp) { oldNum.style.transform = 'translateY(100%)'; } 
                else { oldNum.style.transform = 'translateY(-100%)'; }
                oldNum.style.opacity = '0';
                nextNum.style.transform = 'translateY(0)';
                nextNum.style.opacity = '1';
            }
            window.currentDisplayIdx = activeIndex;
        }

        const totalVidCountEl = document.getElementById('total-vid-count');
        if (totalVidCountEl) {
            totalVidCountEl.textContent = totalVideos;
        }
    }

    // Initialize Cover Flow positions & videos
    updateCoverFlowVideos(0);

    function renderEngine() {
        if (!scrollerContainer || !targetSection) return;
        
        const currentScroll = window.scrollY;
        const sectionOffset = sections.indexOf(targetSection) * window.innerHeight;
        const relativeDelta = currentScroll - sectionOffset;

        const isMgSectionVisible = Math.abs(relativeDelta) < (window.innerHeight * 0.85);
        if (window.isMgSectionVisible !== isMgSectionVisible) {
            window.isMgSectionVisible = isMgSectionVisible;
            if (!isMgSectionVisible) {
                // Instantly mute and pause all playing videos when leaving the section
                floatData.forEach(item => {
                    if (item.volumeInterval) clearInterval(item.volumeInterval);
                    if (item.fadeTimeout) clearTimeout(item.fadeTimeout);
                    controlYT(item.active, 'mute');
                    controlYT(item.active, 'pauseVideo');
                    item.currentVolume = 0;
                });
            }
        }

        // 1. Regular SVG decos
        parallaxItems.forEach(item => {
            if (!item.classList.contains('mg-floating-item')) {
                const speed = parseFloat(item.getAttribute('data-speed')) || 0.1;
                item.style.transform = `translate3d(0, ${relativeDelta * speed}px, 0)`;
            }
        });

        if (!isCoverFlow) {
            // 1.5 Inter-video Collision & Separation (Proportional Overlap)
            for (let i = 0; i < floatData.length; i++) {
                for (let j = i + 1; j < floatData.length; j++) {
                    const itemA = floatData[i];
                    const itemB = floatData[j];

                    if (itemA.state === 'idle' && itemB.state === 'idle') {
                        const rectA = itemA.el.getBoundingClientRect();
                        const rectB = itemB.el.getBoundingClientRect();

                        // Calculate absolute overlap width and height
                        const overlapX = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
                        const overlapY = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));

                        if (overlapX > 0 && overlapY > 0) {
                            const cxA = rectA.left + rectA.width / 2;
                            const cyA = rectA.top + rectA.height / 2;
                            const cxB = rectB.left + rectB.width / 2;
                            const cyB = rectB.top + rectB.height / 2;

                            let dx = cxA - cxB;
                            let dy = cyA - cyB;
                            if (dx === 0 && dy === 0) { dx = 1; dy = 1; }
                            const dist = Math.hypot(dx, dy);

                            // Calculate dynamic force based on how much they overlap (More overlap = Faster separation)
                            const overlapRatio = Math.min(overlapX / Math.min(rectA.width, rectB.width), overlapY / Math.min(rectA.height, rectB.height));
                            const forceMultiplier = Math.max(0.1, overlapRatio * 4.0); // Scales from 0.1 to 4.0 speed

                            const pushX = (dx / dist) * forceMultiplier;
                            const pushY = (dy / dist) * forceMultiplier;

                            itemA.baseX += pushX;
                            itemA.baseY += pushY;
                            itemB.baseX -= pushX;
                            itemB.baseY -= pushY;

                            itemA.el.style.left = `${itemA.baseX}px`;
                            itemA.el.style.top = `${itemA.baseY}px`;
                            itemB.el.style.left = `${itemB.baseX}px`;
                            itemB.el.style.top = `${itemB.baseY}px`;
                        }
                    }
                }
            }

            // 2. Interactive Floating Videos (Repulsion & Edge-Suck)
            floatData.forEach(item => {
                let speedRate = parseFloat(item.el.getAttribute('data-speed')) || 0.1;
                const direction = speedRate >= 0 ? 1 : -1;
                speedRate = direction * (item.el.clientWidth * 0.0006);
                const parallaxY = relativeDelta * speedRate;

                // Trigger video trail shape every 0.2 seconds (200ms)
                if (Date.now() - item.lastTrailTime > 200) {
                    createVideoTrail(item);
                    item.lastTrailTime = Date.now();
                }

                if (item.state === 'idle') {
                    const rect = item.el.getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    
                    const isMouseActive = !(mouseX === 0 && mouseY === 0);
                    const dx = isMouseActive ? mouseX - cx : 9999;
                    const dy = isMouseActive ? mouseY - cy : 9999;
                    const distToCenter = Math.hypot(dx, dy);

                    // Continuous Strong Repulsion (Magnetic Bubble reduced to 300px)
                    if (distToCenter < 300) {
                        const force = Math.pow((300 - distToCenter) / 300, 2); // Exponential push
                        const angle = Math.atan2(dy, dx);
                        item.repelX -= Math.cos(angle) * force * 30; // Push power
                        item.repelY -= Math.sin(angle) * force * 30;
                    }

                    item.repelX *= 0.85; // Friction
                    item.repelY *= 0.85;

                    // Update base position with mouse push force
                    item.baseX += item.repelX;
                    item.baseY += item.repelY;
                    
                    item.el.style.left = `${item.baseX}px`;
                    item.el.style.top = `${item.baseY}px`;
                    item.el.style.transform = `translate3d(0, ${parallaxY}px, 0)`;

                    // Edge Detection (Trigger Suck-out)
                    const screenW = window.innerWidth;
                    const screenH = window.innerHeight;
                    const edgeMargin = 30; // Active trigger zone margin
                    let hitEdge = null;

                    // Use stable mathematical coordinates instead of getBoundingClientRect()
                    // to prevent CSS screen-shakes from falsely triggering other innocent videos.
                    const logicalLeft = item.baseX;
                    const logicalRight = item.baseX + item.el.offsetWidth;
                    const logicalTop = item.baseY;
                    const logicalBottom = item.baseY + item.el.offsetHeight;

                    if (logicalLeft <= edgeMargin) hitEdge = 'left';
                    else if (logicalRight >= screenW - edgeMargin) hitEdge = 'right';
                    else if (logicalTop <= edgeMargin) hitEdge = 'top';
                    else if (logicalBottom >= screenH - edgeMargin) hitEdge = 'bottom';

                    const isMature = (Date.now() - item.spawnTime) > 800; // Reduced immunity time to 800ms

                    const isSectionActive = Math.abs(relativeDelta) < (window.innerHeight * 0.5);
                    if (hitEdge && isMature && isSectionActive) {
                        item.state = 'flying';
                        
                        // Calculate burst position near the screen edge instead of the center
                        let burstX = cx, burstY = cy;
                        if (hitEdge === 'left') { burstX = 30; }
                        else if (hitEdge === 'right') { burstX = screenW - 30; }
                        else if (hitEdge === 'top') { burstY = 30; }
                        else if (hitEdge === 'bottom') { burstY = screenH - 30; }

                        // Trigger 2D shape motion at the disappearing edge
                        createShapeBurst(burstX, burstY);
                        
                        let exitX = 0, exitY = 0;
                        let spawnX = 0, spawnY = 0;

                        // Setup exit animation vectors and opposite side spawn
                        if (hitEdge === 'left') { exitX = -screenW; spawnX = screenW + 300; spawnY = cy; }
                        else if (hitEdge === 'right') { exitX = screenW; spawnX = -300; spawnY = cy; }
                        else if (hitEdge === 'top') { exitY = -screenH; spawnX = cx; spawnY = screenH + 300; }
                        else if (hitEdge === 'bottom') { exitY = screenH; spawnX = cx; spawnY = -300; }

                        // Fly away (Sucked out)
                        item.el.style.transition = 'transform 0.6s cubic-bezier(0.5, 0, 0.2, 1), opacity 0.6s';
                        item.el.style.opacity = '0';
                        item.el.style.transform = `translate3d(${exitX}px, ${parallaxY + exitY}px, 0) scale(0.3) rotate(${(Math.random() - 0.5) * 45}deg)`;

                        setTimeout(() => {
                            // Double-buffer swap
                            item.active.style.opacity = '0';
                            item.buffer.style.opacity = '1';
                            const temp = item.active; item.active = item.buffer; item.buffer = temp;

                            if (!isCoverFlow) {
                              setTimeout(() => {
                                if (!item || !item.active) return;
                                
                                // Ensure visibility
                                item.active.style.opacity = 1;
                                
                                // Force Mute and Play
                                controlYT(item.active, 'mute');
                                controlYT(item.active, 'playVideo');
                                
                                getOrCreatePlayer(item.active, (player) => {
                                  try {
                                    player.mute();
                                    player.playVideo();
                                  } catch (err) {}
                                });
                              }, 150);
                            }

                            setTimeout(() => {
                              if (!isCoverFlow) {
                                forcePlayAllSection2Videos();
                              }
                            }, 120);

                            // Load next video via Official API instance
                            const nextVid = videoPool[videoIndex];
                            videoIndex = (videoIndex + 1) % videoPool.length;
                            
                            const startParam = nextVid.start > 0 ? `&start=${nextVid.start}` : '';
                            const originStr = window.location.protocol === 'file:' ? 'https://localhost' : window.location.origin;
                            const fallbackSrc = `https://www.youtube-nocookie.com/embed/${nextVid.id}?autoplay=1&mute=1&loop=1&playlist=${nextVid.id}&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${originStr}${startParam}`;

                            const bufferPlayer = getOrCreatePlayer(item.buffer);

                            if (bufferPlayer && typeof bufferPlayer.loadVideoById === 'function') {
                              bufferPlayer.loadVideoById({ videoId: nextVid.id, startSeconds: nextVid.start || 0 });
                              bufferPlayer.mute();
                              try { bufferPlayer.playVideo(); } catch(e) {}
                            } else {
                              // Fallback: Force update the src if the YouTube API is not ready yet
                              item.buffer.src = fallbackSrc;
                            }

                            // Teleport to opposite side
                            item.baseX = spawnX;
                            item.baseY = spawnY;
                            item.el.style.left = `${item.baseX}px`;
                            item.el.style.top = `${item.baseY}px`;
                            item.repelX = 0; item.repelY = 0;
                            item.el.style.transition = 'none';
                            item.el.style.transform = `translate3d(0, ${parallaxY}px, 0) scale(0.1)`;

                            // Calculate new safe position inside the screen
                            randomizeTransform(item, floatData);

                             setTimeout(() => {
                                // Fly in from opposite side to new random position
                                item.el.style.transition = 'left 1s cubic-bezier(0.2, 0.8, 0.2, 1), top 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s';
                                item.el.style.opacity = '1';
                                
                                item.el.style.left = `${item.baseX}px`;
                                item.el.style.top = `${item.baseY}px`;
                                item.el.style.transform = `translate3d(0px, ${parallaxY}px, 0) scale(1) rotate(0deg)`;

                                // [FIX] Force autoplay and ALWAYS mute for new items in Physics Mode
                                if (!isCoverFlow) {
                                  controlYT(item.active, 'mute');
                                  controlYT(item.active, 'playVideo');
                                  getOrCreatePlayer(item.active, (player) => {
                                    try {
                                      player.mute();
                                      player.playVideo();
                                    } catch (err) {}
                                  });
                                }

                                setTimeout(() => {
                                    item.el.style.transition = 'none';
                                    if (!isCoverFlow) {
                                      forcePlayAllSection2Videos();
                                    }
                                    item.state = 'idle';
                                    item.spawnTime = Date.now();
                                }, 1000);
                            }, 50);
                        }, 600);
                    }
                }
            });
        } else {
            // Dynamic Carousel Cover Flow Logic
            const totalVideos = videoPool.length; // 12
            // Proportional sizing reduced by 15%: 34% of screen width on desktop (max 1020px), 72% on mobile
            const width = window.innerWidth > 768 ? Math.min(window.innerWidth * 0.34, 1020) : window.innerWidth * 0.72;

            // Apply physical sliding transforms based on assigned roles
            floatData.forEach((item) => {
                item.el.style.width = `${width}px`;
                item.el.style.top = `50%`;

                if (item.pos === -1) { // Left Item
                    item.el.style.left = `25%`;
                    item.el.style.transform = `translate(-50%, -50%) translateZ(-300px) rotateY(35deg)`;
                    item.el.style.zIndex = 5;
                    item.el.style.opacity = item.vidIdx < 0 ? '0' : '0.3';
                } else if (item.pos === 0) { // Center Item
                    item.el.style.left = `50%`;
                    item.el.style.transform = `translate(-50%, -50%) translateZ(0px) rotateY(0deg) scale(1.5)`;
                    item.el.style.zIndex = 10;
                    item.el.style.opacity = '1';
                } else if (item.pos === 1) { // Right Item
                    item.el.style.left = `75%`;
                    item.el.style.transform = `translate(-50%, -50%) translateZ(-300px) rotateY(-35deg)`;
                    item.el.style.zIndex = 5;
                    item.el.style.opacity = item.vidIdx >= totalVideos ? '0' : '0.3';
                }
            });
        }

        // 3. Update dynamic connection lines with smooth breaking/reconnecting animation
        if (floatData.length >= 3) {
            const getCenter = (item) => {
                let speedRate = parseFloat(item.el.getAttribute('data-speed')) || 0.1;
                const direction = speedRate >= 0 ? 1 : -1;
                speedRate = direction * (item.el.clientWidth * 0.0006);
                const pY = relativeDelta * speedRate;
                
                return {
                    x: item.baseX + item.el.offsetWidth / 2,
                    y: item.baseY + item.el.offsetHeight / 2 + pY
                };
            };
            
            const pts = [getCenter(floatData[0]), getCenter(floatData[1]), getCenter(floatData[2])];
            
            // Line 0 (Connects Video 0 and Video 1)
            lines[0].setAttribute("x1", pts[0].x); lines[0].setAttribute("y1", pts[0].y);
            lines[0].setAttribute("x2", pts[1].x); lines[0].setAttribute("y2", pts[1].y);
            lines[0].style.opacity = (floatData[0].state === 'idle' && floatData[1].state === 'idle') ? "1" : "0";
            
            // Line 1 (Connects Video 1 and Video 2)
            lines[1].setAttribute("x1", pts[1].x); lines[1].setAttribute("y1", pts[1].y);
            lines[1].setAttribute("x2", pts[2].x); lines[1].setAttribute("y2", pts[2].y);
            lines[1].style.opacity = (floatData[1].state === 'idle' && floatData[2].state === 'idle') ? "1" : "0";
            
            // Line 2 (Connects Video 2 and Video 0)
            lines[2].setAttribute("x1", pts[2].x); lines[2].setAttribute("y1", pts[2].y);
            lines[2].setAttribute("x2", pts[0].x); lines[2].setAttribute("y2", pts[0].y);
            lines[2].style.opacity = (floatData[2].state === 'idle' && floatData[0].state === 'idle') ? "1" : "0";
        }

        requestAnimationFrame(renderEngine);
    }
    
    renderEngine();

    // --- ALPHA VIDEO PLAYBACK LOGIC ---
    const bgVidSync = document.getElementById('alpha-bg-video');
    let physicsAlphaIndex = 0;

    if (bgVidSync) {
        // Handle Looping (CoverFlow) or Sequential Playback (Physics)
        bgVidSync.addEventListener('ended', () => {
            if (isCoverFlow) {
                // Manually loop the video in Cover Flow mode
                bgVidSync.play().catch(() => {});
            } else {
                // Random playback in Physics Mode
                bgVidSync.style.opacity = '0';
                
                setTimeout(() => {
                    // Pick a random video, ensuring it doesn't play the exact same one twice in a row
                    let nextIndex;
                    do {
                        nextIndex = Math.floor(Math.random() * alphaVideoPool.length);
                    } while (nextIndex === physicsAlphaIndex && alphaVideoPool.length > 1);
                    
                    physicsAlphaIndex = nextIndex;
                    const targetSrc = alphaVideoPool[physicsAlphaIndex];

                    if (targetSrc) {
                        bgVidSync.src = targetSrc;
                        bgVidSync.play().catch(() => {});
                    }

                    // Fade back in to 50% opacity
                    bgVidSync.style.opacity = '0.5';
                }, 500);
            }
        });
    }

    const heroVideoPool = [
        { id: "Koc9PIFQkjA", start: 48 },
        { id: "wb1Lllv2cYI", start: 88 },
        { id: "98k_kijNi6Q", start: 101 },
        { id: "iG6J5uXvwJ8", start: 61 },
        { id: "6mlTDTDvEgk", start: 89 },
        { id: "WiU-ITTfPEg", start: 22 },
        { id: "WVA__b3UvBo", start: 30 },
        { id: "Lxnl2D95EDU", start: 75 },
        { id: "E_gnB1Az9Vs", start: 24 },
        { id: "_07BIWr67_4", start: 37 },
        { id: "goIWgzD0Ta8", start: 45 },
        { id: "D_j5DKR2M3w", start: 0 },
        { id: "vTjvYr8cuy8", start: 19 },
        { id: "2U7r6-5-UlU", start: 68 },
        { id: "Ax4QGQF7Tjs", start: 16 },
        { id: "ze70fZiYGBA", start: 67 },
        { id: "CkRY79b0IsI", start: 20 },
        { id: "dDBlbs1FhTw", start: 0 },
        { id: "q8KgjqM-Bfs", start: 80 },
        { id: "eEKzjTCCmPg", start: 20 },
        { id: "FPu5vUQmfW8", start: 166 },
        { id: "u-0xFcJZcAk", start: 64 },
        { id: "k-3d-X15TKs", start: 61 },
        { id: "56aP7weYHBc", start: 28 },
        { id: "6AoVIXVLX9Q", start: 54 },
        { id: "ZRZ3ghZN3tU", start: 40 },
        { id: "MTxIMAfL1nw", start: 7 }
    ];

    // Setup Hero Video Double Buffering & Manual Controls (Interactive next cursor & skip)
    (function() {
        const iframe1 = document.getElementById('hero-yt-1');
        const iframe2 = document.getElementById('hero-yt-2');
        const heroSection = document.getElementById('hero');

        if (iframe1 && iframe2 && heroSection && typeof heroVideoPool !== 'undefined') {
            let activeIframe = 1;
            let currentVidIndex = 0;
            let autoPlayInterval;

            function getYTUrl(index) {
                const vid = heroVideoPool[index];
                const startParam = vid.start > 0 ? '&start=' + vid.start : '';
                // Inject window.location.origin to satisfy iframe API CORS policy
                return 'https://www.youtube-nocookie.com/embed/' + vid.id + '?autoplay=1&mute=1&controls=0&playsinline=1&modestbranding=1&enablejsapi=1&origin=' + (window.location.protocol === 'file:' ? 'https://localhost' : window.location.origin) + startParam;
            }

            // Initialize first two videos
            iframe1.src = getYTUrl(currentVidIndex);
            let nextVidIndex = (currentVidIndex + 1) % heroVideoPool.length;
            iframe2.src = getYTUrl(nextVidIndex);

            // Wait for the YouTube iframe to load before revealing the background
            iframe1.addEventListener('load', () => {
                // 1.5-second buffer to ensure the YouTube player has buffered and is physically playing
                setTimeout(() => {
                    const loader = document.getElementById('initial-loader-bg');
                    if (loader) {
                        loader.style.opacity = '0';
                        iframe1.style.opacity = '1'; // Ensure the iframe is fully visible!
                        // Reveal cursor and navigation buttons smoothly
                        document.body.classList.remove('is-loading');
                        setTimeout(() => loader.remove(), 1500); // Remove from DOM after transition completes
                    }
                }, 1500);
            }, { once: true });

            function transitionToNextVideo() {
                const heroRect = heroSection.getBoundingClientRect();
                if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) {
                    return; // Prevent background bandwidth consumption when not visible
                }

                currentVidIndex = (currentVidIndex + 1) % heroVideoPool.length;
                nextVidIndex = (currentVidIndex + 1) % heroVideoPool.length;

                const nextVidData = heroVideoPool[nextVidIndex];
                const currentVidData = heroVideoPool[currentVidIndex];
                if (activeIframe === 1) {
                    // Rewind iframe2 to the exact start time just before showing it
                    getOrCreatePlayer(iframe2, (player) => {
                        player.seekTo(currentVidData.start || 0, true);
                    });

                    iframe1.style.opacity = '0';
                    iframe2.style.opacity = '1';
                    activeIframe = 2;

                    // Preload the next video in the hidden iframe1
                    setTimeout(() => { 
                        getOrCreatePlayer(iframe1, (player) => {
                            player.loadVideoById({ videoId: nextVidData.id, startSeconds: nextVidData.start || 0 });
                            player.mute();
                        });
                    }, 1000);
                } else {
                    // Rewind iframe1 to the exact start time just before showing it
                    getOrCreatePlayer(iframe1, (player) => {
                        player.seekTo(currentVidData.start || 0, true);
                    });

                    iframe2.style.opacity = '0';
                    iframe1.style.opacity = '1';
                    activeIframe = 1;

                    // Preload the next video in the hidden iframe2
                    setTimeout(() => { 
                        getOrCreatePlayer(iframe2, (player) => {
                            player.loadVideoById({ videoId: nextVidData.id, startSeconds: nextVidData.start || 0 });
                            player.mute();
                        });
                    }, 1000);
                }
            }

            // Change interval to 6 seconds (6000ms)
            autoPlayInterval = setInterval(transitionToNextVideo, 6000);

            // Custom "Next" Cursor logic for Hero 'empty space'
            heroSection.addEventListener('mousemove', (e) => {
                // If not hovering over nav items or buttons
                if (e.target && typeof e.target.closest === 'function' && !e.target.closest('.nav-item, button, a')) {
                    cursor.classList.add('next-cursor-active');
                    cursor.innerHTML = '>'; // Add the icon content
                } else {
                    cursor.classList.remove('next-cursor-active');
                    cursor.innerHTML = '';
                }
            });

            heroSection.addEventListener('mouseleave', () => {
                cursor.classList.remove('next-cursor-active');
                cursor.innerHTML = '';
            });

            let lastClickTime = 0;
            let clickCount = 0;
            let clickResetTimer;

            // Handle click on hero 'empty space' to skip video & animate cursor
            heroSection.addEventListener('click', (e) => {
                if (e.target && typeof e.target.closest === 'function' && e.target.closest('.nav-item, button, a')) return;

                const now = Date.now();

                // Spam click detection logic
                clickCount++;
                clearTimeout(clickResetTimer);
                clickResetTimer = setTimeout(() => { clickCount = 0; }, 1000);

                if (clickCount >= 4) {
                    // Add 'calm-down' class to follower instead of cursor
                    follower.classList.add('calm-down');
                    setTimeout(() => { 
                        follower.classList.remove('calm-down'); 
                    }, 1500); // Matches the 1.5s lifecycle animation
                }

                // 1-Second Cooldown logic
                if (now - lastClickTime < 1000) {
                    return; // Ignore clicks if within 1 second
                }
                lastClickTime = now;

                // Stop the automatic rotation forever
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }

                // Transition video manually
                transitionToNextVideo();

                // Temporarily add 'clicked' class to both arrow and follower for synchronized animation
                cursor.classList.add('clicked');
                follower.classList.add('clicked');
                
                setTimeout(() => {
                    cursor.classList.remove('clicked');
                    follower.classList.remove('clicked');
                }, 800); // Matches the 0.8s animation duration
            });
        }
    })();

    // Horizontal Scroll Logic (Fixed variable naming conflict & added loading check)
    const horizontalTrack = document.getElementById('horizontal-track');
    const trackSections = document.querySelectorAll('#horizontal-track .section');

    if (horizontalTrack && trackSections.length > 0) {
        // Create scrollable space based on total section count
        document.body.style.height = `${trackSections.length * 100}vh`;

        window.addEventListener('scroll', () => {
            if (document.body.classList.contains('is-loading')) {
                window.scrollTo(0, 0);
                return;
            }
            const scrollY = window.scrollY;
            const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
            const maxScrollX = horizontalTrack.scrollWidth - window.innerWidth;
            const translateX = maxScrollY > 0 ? (scrollY / maxScrollY) * maxScrollX : 0;
            horizontalTrack.style.transform = `translateX(-${translateX}px)`;
        }, { passive: true });
    }

        // Touch Swipe Section Snapping for Touch Panels
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (!window.matchMedia("(pointer: coarse)").matches) return;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!window.matchMedia("(pointer: coarse)").matches) return;
            // Prevent default continuous drifting to enforce rigid section snapping
            e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            if (!window.matchMedia("(pointer: coarse)").matches) return;
            if (isScrolling || document.body.classList.contains('is-loading')) return;

            let touchEndY = e.changedTouches[0].clientY;
            let diffY = touchStartY - touchEndY;

            // Swipe Up (diffY > 50) -> Go to Next Section
            if (diffY > 50 && currentSectionIndex < sections.length - 1) {
                currentSectionIndex++;
                customScrollTo(currentSectionIndex * window.innerHeight, 800);
            } 
            // Swipe Down (diffY < -50) -> Go to Previous Section
            else if (diffY < -50 && currentSectionIndex > 0) {
                currentSectionIndex--;
                customScrollTo(currentSectionIndex * window.innerHeight, 800);
            }
        }, { passive: true });

    // Email Interaction & Copy Logic
    const emailText = document.getElementById('email-text');
    if (emailText) {
        emailText.addEventListener('click', () => {
            navigator.clipboard.writeText('wkjnaver@gmail.com');
            const follower = document.querySelector('.custom-cursor-follower');
            if (follower) {
                follower.classList.add('copied-success');
                setTimeout(() => {
                    follower.classList.remove('copied-success');
                }, 2000);
            }
        });
    }

    // Sequential Staggered Greeting Animation (Foolproof Visibility & Fixed Layout)
    const greetingWrapper = document.getElementById('greeting-wrapper');
    if (greetingWrapper) {
        const greetings = ["만나서 반갑습니다.", "はじめまして。", "Nice to meet you."];
        let greetingIndex = 0;

        function updateGreeting() {
            const oldText = greetings[greetingIndex];
            greetingIndex = (greetingIndex + 1) % greetings.length;
            const newText = greetings[greetingIndex];

            const oldContainer = document.createElement('div');
            oldContainer.style.cssText = "position:absolute; width:100%; left:0; top:0; display:flex; justify-content:center; align-items:center; height:100%;";
            
            const newContainer = document.createElement('div');
            newContainer.style.cssText = "position:absolute; width:100%; left:0; top:0; display:flex; justify-content:center; align-items:center; height:100%;";

            oldText.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = "display:inline-block; white-space:pre; transition:transform 0.8s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.5s ease-in; transform:translateY(0); opacity:1;";
                oldContainer.appendChild(span);

                // Added a 50ms base delay to prevent DOM batching from skipping the first character's transition
                setTimeout(() => {
                    span.style.transform = 'translateY(100%)';
                    span.style.opacity = '0';
                }, 50 + (i * 45)); 
            });

            newText.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char;
                span.style.cssText = "display:inline-block; white-space:pre; transition:transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.9s ease-out; transform:translateY(-100%); opacity:0;";
                newContainer.appendChild(span);

                // Added the same 50ms base delay here to keep the animations perfectly synced
                setTimeout(() => {
                    span.style.transform = 'translateY(0)';
                    span.style.opacity = '1';
                }, 50 + (i * 45) + 350); 
            });

            greetingWrapper.innerHTML = '';
            greetingWrapper.appendChild(oldContainer);
            greetingWrapper.appendChild(newContainer);
        }

        // Safe initial render
        greetingWrapper.innerHTML = `<div style="position:absolute; width:100%; left:0; top:0; display:flex; justify-content:center; align-items:center; height:100%;">${greetings[0].split('').map(c => `<span style="display:inline-block; white-space:pre; transform:translateY(0); opacity:1;">${c}</span>`).join('')}</div>`;

        setInterval(updateGreeting, 4000);
    }
    const section3 = document.getElementById('interaction-3d');
    const carouselItems3D = document.querySelectorAll('.js-carousel-3d-item');
    const counterBox3D = document.getElementById('counter-box-3d');
    let currentIdx3D = -1;
    
    const vidData3D = [
        { id: 'Lxnl2D95EDU', start: 199 },
        { id: '_07BIWr67_4', start: 5 },
        { id: 'WVA__b3UvBo', start: 0 }
    ];

    // --- Section 4: Live 2D 3D Carousel Logic System ---
    const section4 = document.getElementById('live2d-section'); // Match your exact Section 4 ID
    const carouselItems4D = document.querySelectorAll('.js-carousel-4d-item');
    const counterBox4D = document.getElementById('counter-box-4d');
    let currentIdx4D = -1;
    let prevIdx4D = 0;
    
    const vidData4D = [
        { id: 'goIWgzD0Ta8', start: 30 },
        { id: 'iG6J5uXvwJ8', start: 60 },
        { id: 'k-3d-X15TKs', start: 61 },
        { id: 'ZRZ3ghZN3tU', start: 43 },
        { id: '6AoVIXVLX9Q', start: 50 },
        { id: '2U7r6-5-UlU', start: 39 }
    ];

    const itemsData4D = Array.from(carouselItems4D).map((el, index) => {
        const iframe = el.querySelector('iframe');
        const vidData = vidData4D[index];
        
        // [FIX] Dynamically inject YouTube iframe src with API & CORS policies enabled
        if (iframe && vidData) {
            const startParam = vidData.start > 0 ? `&start=${vidData.start}` : '';
            iframe.src = `https://www.youtube-nocookie.com/embed/${vidData.id}?autoplay=0&mute=1&loop=1&playlist=${vidData.id}&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${window.location.protocol === 'file:' ? 'https://localhost' : window.location.origin}${startParam}`;
        }

        return {
            el,
            iframe,
            volumeInterval: null,
            fadeTimeout: null
        };
    });

    if (section3 && carouselItems3D.length === 3) {
        // Create tracking objects for both elements to safely manage volume states independently
        const itemsData3D = Array.from(carouselItems3D).map(el => ({
            el,
            iframe: el.querySelector('iframe'),
            volumeInterval: null,
            fadeTimeout: null
        }));

        // State to track historical index for smooth counter slide direction
        let prevIdx3D = 0;

        // Modular layout function that can be called by mousemove AND scroll entrance observers
        function update3DCarouselLayout(clientX, clientY) {
            if (typeof updateMuteButtonsUI === 'function') {
                updateMuteButtonsUI();
            }
            const rect = section3.getBoundingClientRect();
            // Check if section is currently active within the viewport
            const isVisible = (rect.left < window.innerWidth) && (rect.right > 0);
            if (!isVisible) return; 

            const screenWidth = window.innerWidth;
            const width = screenWidth > 768 ? Math.min(screenWidth * 0.34, 1020) : screenWidth * 0.72;
            
            let activeIdx = window.touchSec3Index || 0;

            if (currentIdx3D !== activeIdx) {
                // 1.5 Sliding Counter Animation (Mirrors Section 02 architectural mechanics)
                if (counterBox3D) {
                    const currentVal = String(prevIdx3D + 1).padStart(2, '0');
                    const targetVal = String(activeIdx + 1).padStart(2, '0');
                    const isUp = activeIdx > prevIdx3D;

                    if (currentIdx3D === -1) {
                        // Instant flat injection on absolute first load initialization
                        counterBox3D.innerHTML = `<span style="display:block; transform:translateY(0); opacity:1; line-height:18px;">${targetVal}</span>`;
                    } else if (prevIdx3D !== activeIdx) {
                        counterBox3D.innerHTML = '';
                        const oldNum = document.createElement('span');
                        oldNum.textContent = currentVal;
                        oldNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; transform:translateY(0); opacity:1; line-height:18px;";

                        const nextNum = document.createElement('span');
                        nextNum.textContent = targetVal;
                        nextNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; line-height:18px;";

                        if (isUp) {
                            nextNum.style.transform = 'translateY(-100%)';
                            nextNum.style.opacity = '0';
                        } else {
                            nextNum.style.transform = 'translateY(100%)';
                            nextNum.style.opacity = '0';
                        }

                        counterBox3D.appendChild(oldNum);
                        counterBox3D.appendChild(nextNum);
                        void counterBox3D.offsetWidth; // Force reflow layout layout calculation

                        if (isUp) { oldNum.style.transform = 'translateY(100%)'; } 
                        else { oldNum.style.transform = 'translateY(-100%)'; }
                        oldNum.style.opacity = '0';
                        nextNum.style.transform = 'translateY(0)';
                        nextNum.style.opacity = '1';
                    }
                    prevIdx3D = activeIdx;
                }

                currentIdx3D = activeIdx;
            }

            itemsData3D.forEach((item, index) => {
                const videoRect = item.el.querySelector('.mg-video-rect');
                if (videoRect) {
                    let thumbImg = videoRect.querySelector('.carousel-thumb-img');
                    if (!thumbImg) {
                        thumbImg = document.createElement('img');
                        thumbImg.className = 'carousel-thumb-img';
                        // Add image-rendering properties to mitigate 3D transform rasterization blur
                        thumbImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 4; display: none; image-rendering: high-quality; transform: translateZ(0);";
                        // Fallback to high-quality default if maxresdefault is missing (404)
                        thumbImg.onerror = function() {
                            if (this.src.includes('maxresdefault')) {
                                this.src = this.src.replace('maxresdefault', 'hqdefault');
                            }
                        };
                        videoRect.appendChild(thumbImg);
                    }
                }

                const thumbImg = item.el.querySelector('.carousel-thumb-img');
                const vidData = vidData3D[index];

                item.el.style.width = `${width}px`;
                item.el.style.top = `50%`;
                
            // [FIX] Trigger Fade-out before source update
            if (item.iframe.style.opacity !== '0') {
                item.iframe.style.transition = 'opacity 0.4s ease';
                item.iframe.style.opacity = '0';
            }

            if (index === currentIdx3D) {
                const isPlaying = typeof window.isS3Playing !== 'undefined' ? window.isS3Playing : false;
                if (isPlaying) {
                    if (thumbImg) thumbImg.style.display = 'none';

                    if (item.s3PlayTimeout) clearTimeout(item.s3PlayTimeout);
                    item.s3PlayTimeout = setTimeout(() => {
                        if (hasUserInteracted && !window.isUserMuted) {
                            controlYT(item.iframe, 'unMute');
                        } else {
                            controlYT(item.iframe, 'mute');
                        }
                        controlYT(item.iframe, 'playVideo');
                    }, 600);
                } else {
                    if (thumbImg && vidData) {
                        thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                        thumbImg.style.display = 'block';
                    }
                    controlYT(item.iframe, 'pauseVideo');
                }

                item.el.style.left = `50%`;
                item.el.style.transform = `translate(-50%, -50%) translateZ(0px) rotateY(0deg) scale(1.5)`;
                item.el.style.zIndex = 10;
                item.el.style.opacity = '1';
            } else {
                const isLeft = index < currentIdx3D;
                item.el.style.left = isLeft ? `25%` : `75%`;
                item.el.style.transform = `translate(-50%, -50%) translateZ(-300px) rotateY(${isLeft ? 35 : -35}deg)`;
                item.el.style.zIndex = 5;
                item.el.style.opacity = '0.3';
                
                if (thumbImg && vidData) {
                    thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                    thumbImg.style.display = 'block';
                }
                controlYT(item.iframe, 'pauseVideo');
                controlYT(item.iframe, 'mute');
            }

            // [FIX] Trigger Fade-in after source update
            setTimeout(() => {
                item.iframe.style.opacity = '1';
            }, 450);
            });
        }



        // Fail-safe interaction catcher for initial unmute trigger
        const unmuteOnFirstInteract = () => {
            if (currentIdx3D >= 0 && itemsData3D[currentIdx3D]) {
                const newItem = itemsData3D[currentIdx3D];
                if (newItem.volumeInterval) clearInterval(newItem.volumeInterval);
                if (!window.isUserMuted) {
                    controlYT(newItem.iframe, 'unMute');
                } else {
                    controlYT(newItem.iframe, 'mute');
                }
            }
        };
        window.addEventListener('click', unmuteOnFirstInteract, { once: true });
        window.addEventListener('keydown', unmuteOnFirstInteract, { once: true });

        // Visibility Observer for Pause/Mute when leaving section
        const observer3D = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    itemsData3D.forEach(item => {
                        if (item.volumeInterval) clearInterval(item.volumeInterval);
                        if (item.fadeTimeout) clearTimeout(item.fadeTimeout);
                        controlYT(item.iframe, 'mute');
                        controlYT(item.iframe, 'pauseVideo');
                    });
                } else {
                    // [FIX] Kill-switch: Force Section 2 to pause instantly when Section 3 becomes visible
                    if (typeof floatData !== 'undefined') {
                        floatData.forEach(item => {
                            controlYT(item.active, 'pauseVideo');
                        });
                    }

                    // FORCE CHRONO LAYOUT CORRECTION ON SCROLL ENTRANCE
                    // The layout manager (update3DCarouselLayout) will safely handle playback targeting.
                    update3DCarouselLayout(window.innerWidth / 2 - 10, window.innerHeight / 2);
                }
            });
        }, { threshold: 0.1 });
        observer3D.observe(section3);

        // Mute Button handlers
        function toggleUserMute(e) {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            window.isUserMuted = !window.isUserMuted;
            if (typeof updateMuteButtonsUI === 'function') {
                updateMuteButtonsUI();
            }

            // Section 2 active center video iframe
            const activeS2Item = floatData.find(item => item.pos === 0);
            if (activeS2Item) {
                if (window.isUserMuted) {
                    controlYT(activeS2Item.active, 'mute');
                } else {
                    controlYT(activeS2Item.active, 'unMute');
                }
                
                // [FIX] Prevent Section 2 from playing if it's currently hidden
                if (window.isMgSectionVisible) {
                    controlYT(activeS2Item.active, 'playVideo');
                } else {
                    controlYT(activeS2Item.active, 'pauseVideo');
                }
            }

            // Section 3 active center video iframe
            if (currentIdx3D >= 0 && itemsData3D[currentIdx3D]) {
                const activeS3Item = itemsData3D[currentIdx3D];
                if (window.isUserMuted) {
                    controlYT(activeS3Item.iframe, 'mute');
                } else {
                    controlYT(activeS3Item.iframe, 'unMute');
                }
                
                // [FIX] Prevent Section 3 from playing if it's currently hidden
                const sec3 = document.getElementById('interaction-3d');
                const rect = sec3 ? sec3.getBoundingClientRect() : {left: 9999, right: -9999};
                const isSec3Visible = (rect.left < window.innerWidth) && (rect.right > 0);
                
                if (isSec3Visible) {
                    controlYT(activeS3Item.iframe, 'playVideo');
                } else {
                    controlYT(activeS3Item.iframe, 'pauseVideo');
                }
            }

            // Section 4 active center video iframe
            if (currentIdx4D >= 0 && itemsData4D[currentIdx4D]) {
                const activeS4Item = itemsData4D[currentIdx4D];
                if (window.isUserMuted) {
                    controlYT(activeS4Item.iframe, 'mute');
                } else {
                    controlYT(activeS4Item.iframe, 'unMute');
                }
                if (section4 && section4.getBoundingClientRect().left < window.innerWidth) {
                    if (window.isS4Playing) controlYT(activeS4Item.iframe, 'playVideo');
                }
            }
        }

        const s2MuteBtn = document.getElementById('s2-mute-btn');
        const s3MuteBtn = document.getElementById('s3-mute-btn');
        const s4MuteBtn = document.getElementById('s4-mute-btn');
        if (s2MuteBtn) s2MuteBtn.addEventListener('click', toggleUserMute);
        if (s3MuteBtn) s3MuteBtn.addEventListener('click', toggleUserMute);
        if (s4MuteBtn) s4MuteBtn.addEventListener('click', toggleUserMute);

        // --- Section 2 Play/Pause Button System Logic ---
        window.isS2Playing = false;
        const s2PlayBtn = document.getElementById('s2-play-btn');
        if (s2PlayBtn) {
            // Force initial paused icon state
            const playIcon = s2PlayBtn.querySelector('.icon-play');
            const pauseIcon = s2PlayBtn.querySelector('.icon-pause');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';

            s2PlayBtn.addEventListener('click', (e) => {
                if (!isCoverFlow) {
                  window.isS2Playing = true;
                  setS2PlayUi(true);
                  forcePlayAllSection2Videos();
                  return;
                }
                e.stopPropagation();
                window.isS2Playing = !window.isS2Playing;
                const playIcon = s2PlayBtn.querySelector('.icon-play');
                const pauseIcon = s2PlayBtn.querySelector('.icon-pause');
                const activeS2Item = floatData.find(item => item.pos === 0);
                
                if (window.isS2Playing) {
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                    if (activeS2Item) {
                        const thumb = activeS2Item.el.querySelector('.carousel-thumb-img');
                        if (thumb) thumb.style.display = 'none';
                        controlYT(activeS2Item.active, 'playVideo');
                    }
                } else {
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                    if (activeS2Item) controlYT(activeS2Item.active, 'pauseVideo');
                }
            });
        }

        // --- Section 3 Play/Pause Button System Logic ---
        window.isS3Playing = false;
        const s3PlayBtn = document.getElementById('s3-play-btn');
        if (s3PlayBtn) {
            // Force initial paused icon state
            const playIcon = s3PlayBtn.querySelector('.icon-play');
            const pauseIcon = s3PlayBtn.querySelector('.icon-pause');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';

            s3PlayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.isS3Playing = !window.isS3Playing;
                const playIcon = s3PlayBtn.querySelector('.icon-play');
                const pauseIcon = s3PlayBtn.querySelector('.icon-pause');
                
                let activeIdx = window.touchSec3Index || 0;
                const activeS3Item = itemsData3D[activeIdx];
                
                if (window.isS3Playing) {
                    if (playIcon) playIcon.style.display = 'none';
                    if (pauseIcon) pauseIcon.style.display = 'block';
                    if (activeS3Item) {
                        const thumb = activeS3Item.el.querySelector('.carousel-thumb-img');
                        if (thumb) thumb.style.display = 'none';
                        controlYT(activeS3Item.iframe, 'playVideo');
                    }
                } else {
                    if (playIcon) playIcon.style.display = 'block';
                    if (pauseIcon) pauseIcon.style.display = 'none';
                    if (activeS3Item) controlYT(activeS3Item.iframe, 'pauseVideo');
                }
            });
        }

        // --- Apply Global Magnetic Snap Effect to All Media & Nav Buttons ---
        const applyMagneticEffect = () => {
            const interactiveBtns = document.querySelectorAll('.touch-nav-btn, .submit-btn');
            interactiveBtns.forEach(btn => {
                if (!btn.classList.contains('magnetic-btn')) {
                    btn.classList.add('magnetic-btn');
                }
            });
            if (typeof window.initMagneticButtons === 'function') {
                window.initMagneticButtons();
            }
        };
        
        // Apply immediately and safely push to event queue
        setTimeout(applyMagneticEffect, 500);

        // --- Dynamic State Synchronization on Page Navigation ---
        // Ensure play icons reset to standard pause status whenever active items swap
        const oldUpdateCoverFlowVideos = window.updateCoverFlowVideos;
        window.updateCoverFlowVideos = function(activeIndex) {
            if (typeof oldUpdateCoverFlowVideos === 'function') {
                oldUpdateCoverFlowVideos(activeIndex);
            }
        window.isS2Playing = false;
        if (s2PlayBtn) {
            const playIcon = s2PlayBtn.querySelector('.icon-play');
            const pauseIcon = s2PlayBtn.querySelector('.icon-pause');
            if (playIcon) playIcon.style.display = 'block';
            if (pauseIcon) pauseIcon.style.display = 'none';
        }
        };

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: window.innerWidth / 2 - 10 }));
    }

    // --- Section 4: Live 2D 3D Carousel Logic System Functions ---
    function update4DCarouselLayout() {
        if (!section4 || itemsData4D.length === 0) return;
        if (typeof updateMuteButtonsUI === 'function') {
            updateMuteButtonsUI();
        }
        const rect = section4.getBoundingClientRect();
        const isVisible = (rect.left < window.innerWidth) && (rect.right > 0);
        if (!isVisible) return; 

        const screenWidth = window.innerWidth;
        const width = screenWidth > 768 ? Math.min(screenWidth * 0.34, 1020) : screenWidth * 0.72;
        
        let activeIdx = window.touchSec4Index || 0;

        if (currentIdx4D !== activeIdx) {
            if (counterBox4D) {
                const currentVal = String(prevIdx4D + 1).padStart(2, '0');
                const targetVal = String(activeIdx + 1).padStart(2, '0');
                const isUp = activeIdx > prevIdx4D;

                if (currentIdx4D === -1) {
                    counterBox4D.innerHTML = `<span style="display:block; transform:translateY(0); opacity:1; line-height:18px;">${targetVal}</span>`;
                } else if (prevIdx4D !== activeIdx) {
                    counterBox4D.innerHTML = '';
                    const oldNum = document.createElement('span');
                    oldNum.textContent = currentVal;
                    oldNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; transform:translateY(0); opacity:1; line-height:18px;";

                    const nextNum = document.createElement('span');
                    nextNum.textContent = targetVal;
                    nextNum.style.cssText = "display:block; position:absolute; width:100%; left:0; top:0; transition:transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease; line-height:18px;";

                    if (isUp) {
                        nextNum.style.transform = 'translateY(-100%)';
                        nextNum.style.opacity = '0';
                    } else {
                        nextNum.style.transform = 'translateY(100%)';
                        nextNum.style.opacity = '0';
                    }

                    counterBox4D.appendChild(oldNum);
                    counterBox4D.appendChild(nextNum);
                    void counterBox4D.offsetWidth;

                    if (isUp) { oldNum.style.transform = 'translateY(100%)'; } 
                    else { oldNum.style.transform = 'translateY(-100%)'; }
                    oldNum.style.opacity = '0';
                    nextNum.style.transform = 'translateY(0)';
                    nextNum.style.opacity = '1';
                }
                prevIdx4D = activeIdx;
            }
            currentIdx4D = activeIdx;
        }

        itemsData4D.forEach((item, index) => {
            const videoRect = item.el.querySelector('.mg-video-rect');
            if (videoRect && !videoRect.querySelector('.carousel-thumb-img')) {
                const thumbImg = document.createElement('img');
                thumbImg.className = 'carousel-thumb-img';
                thumbImg.style.cssText = "width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; z-index: 4; display: none; image-rendering: high-quality; transform: translateZ(0);";
                thumbImg.onerror = function() {
                    if (this.src.includes('maxresdefault')) {
                        this.src = this.src.replace('maxresdefault', 'hqdefault');
                    }
                };
                videoRect.appendChild(thumbImg);
            }

            const thumbImg = item.el.querySelector('.carousel-thumb-img');
            const vidData = vidData4D[index];

            item.el.style.width = `${width}px`;
            item.el.style.top = `50%`;
            
            // [FIX] Trigger Fade-out before source update
            if (item.iframe.style.opacity !== '0') {
                item.iframe.style.transition = 'opacity 0.4s ease';
                item.iframe.style.opacity = '0';
            }

            if (index === currentIdx4D) {
                const isPlaying = typeof window.isS4Playing !== 'undefined' ? window.isS4Playing : false;
                if (isPlaying) {
                    if (thumbImg) thumbImg.style.display = 'none';

                    if (item.s4PlayTimeout) clearTimeout(item.s4PlayTimeout);
                    item.s4PlayTimeout = setTimeout(() => {
                        if (hasUserInteracted && !window.isUserMuted) {
                            controlYT(item.iframe, 'unMute');
                        } else {
                            controlYT(item.iframe, 'mute');
                        }
                        controlYT(item.iframe, 'playVideo');
                    }, 600);
                } else {
                    if (thumbImg && vidData) {
                        thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                        thumbImg.style.display = 'block';
                    }
                    controlYT(item.iframe, 'pauseVideo');
                }

                item.el.style.left = `50%`;
                item.el.style.transform = `translate(-50%, -50%) translateZ(0px) rotateY(0deg) scale(1.5)`;
                item.el.style.zIndex = 10;
                item.el.style.opacity = '1';
                item.el.style.pointerEvents = 'auto';
                
            } else if (index < currentIdx4D) {
                // Left Side Stack
                item.el.style.left = `25%`;
                item.el.style.transform = `translate(-50%, -50%) translateZ(-300px) rotateY(35deg)`;
                item.el.style.zIndex = 5;
                // Only show immediate left
                item.el.style.opacity = index === currentIdx4D - 1 ? '0.3' : '0';
                item.el.style.pointerEvents = 'none';
                
                if (thumbImg && vidData) {
                    thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                    thumbImg.style.display = 'block';
                }
                controlYT(item.iframe, 'pauseVideo');
                controlYT(item.iframe, 'mute');
                
            } else if (index > currentIdx4D) {
                // Right Side Stack
                item.el.style.left = `75%`;
                item.el.style.transform = `translate(-50%, -50%) translateZ(-300px) rotateY(-35deg)`;
                item.el.style.zIndex = 5;
                // Only show immediate right
                item.el.style.opacity = index === currentIdx4D + 1 ? '0.3' : '0';
                item.el.style.pointerEvents = 'none';
                
                if (thumbImg && vidData) {
                    thumbImg.src = `https://img.youtube.com/vi/${vidData.id}/hqdefault.jpg`;
                    thumbImg.style.display = 'block';
                }
                controlYT(item.iframe, 'pauseVideo');
                controlYT(item.iframe, 'mute');
            }

            // [FIX] Trigger Fade-in after source update
            setTimeout(() => {
                item.iframe.style.opacity = '1';
            }, 450);
        });
    }

    // --- Section 4 Play/Pause Button Logic ---
    window.isS4Playing = false;
    const s4PlayBtn = document.getElementById('s4-play-btn');
    if (s4PlayBtn) {
        const playIcon = s4PlayBtn.querySelector('.icon-play');
        const pauseIcon = s4PlayBtn.querySelector('.icon-pause');
        if (playIcon) playIcon.style.display = 'block';
        if (pauseIcon) pauseIcon.style.display = 'none';

        s4PlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.isS4Playing = !window.isS4Playing;
            const isS4Playing = window.isS4Playing;
            const activeS4Item = itemsData4D[window.touchSec4Index || 0];
            
            if (isS4Playing) {
                if (playIcon) playIcon.style.display = 'none';
                if (pauseIcon) pauseIcon.style.display = 'block';
                if (activeS4Item) {
                    const thumb = activeS4Item.el.querySelector('.carousel-thumb-img');
                    if (thumb) thumb.style.display = 'none';
                    controlYT(activeS4Item.iframe, 'playVideo');
                }
            } else {
                if (playIcon) playIcon.style.display = 'block';
                if (pauseIcon) pauseIcon.style.display = 'none';
                if (activeS4Item) controlYT(activeS4Item.iframe, 'pauseVideo');
            }
        });
    }

    // --- Section 4 Visibility IntersectionObserver ---
    const observer4D = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                itemsData4D.forEach(item => {
                    controlYT(item.iframe, 'mute');
                    controlYT(item.iframe, 'pauseVideo');
                });
            } else {
                // Kill-switch other active carousels
                if (typeof itemsData3D !== 'undefined') {
                    itemsData3D.forEach(item => controlYT(item.iframe, 'pauseVideo'));
                }
                if (typeof floatData !== 'undefined') {
                    floatData.forEach(item => controlYT(item.active, 'pauseVideo'));
                }
                update4DCarouselLayout();
            }
        });
    }, { threshold: 0.1 });
    if (section4) observer4D.observe(section4);

    // -------------------------------------------------------------
    // Section 05: Entire Works - YouTube Video Grid & Interactions
    // -------------------------------------------------------------
    const entireWorksGrid = document.getElementById('youtube-grid');
    const scrollContainer = document.getElementById('works-scroll-container');
    const upBtn = document.querySelector('.up-btn');
    const downBtn = document.querySelector('.down-btn');
    const backBtn = document.querySelector('.back-btn'); // 이전 버튼 추가

    if (entireWorksGrid) {
        const youtubeIds = [
            "Lxnl2D95EDU", "Koc9PIFQkjA", "iG6J5uXvwJ8", "q8KgjqM-Bfs", 
            "6mlTDTDvEgk", "WiU-ITTfPEg", "wb1Lllv2cYI", "_07BIWr67_4", 
            "FPu5vUQmfW8", "98k_kijNi6Q", "goIWgzD0Ta8", "vTjvYr8cuy8", 
            "D_j5DKR2M3w", "Ax4QGQF7Tjs", "2U7r6-5-UlU", "CkRY79b0IsI", 
            "eEKzjTCCmPg", "dDBlbs1FhTw", "k-3d-X15TKs", "6AoVIXVLX9Q", 
            "ZRZ3ghZN3tU", "MTxIMAfL1nw"
        ];

        let gridHtml = '';
        youtubeIds.forEach(id => {
            gridHtml += `
                <div class="video-card" data-video-id="${id}">
                    <img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail">
                    <div class="video-overlay" data-playing="false"></div>
                </div>
            `;
        });
        
        entireWorksGrid.innerHTML = gridHtml;

        // 1. 영상 오버레이 클릭 시 화면 확대 및 커서 토글
        const overlays = document.querySelectorAll('.video-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', function() {
                const card = this.closest('.video-card');
                let iframe = card.querySelector('iframe');

                if (!iframe) {
                    const videoId = card.getAttribute('data-video-id');
                    const img = card.querySelector('img');

                    iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=1&origin=${window.location.protocol === 'file:' ? 'https://localhost' : window.location.origin}`;
                    iframe.style.cssText = "pointer-events: none; width: 100%; height: 100%; border: none; position: absolute; top: 0; left: 0; z-index: 5;";
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; compute-pressure');

                    card.appendChild(iframe);
                    
                    // Trigger official initialization hook
                    setTimeout(() => {
                        getOrCreatePlayer(iframe, (readyPlayer) => {
                            readyPlayer.mute();
                            readyPlayer.playVideo();
                        });
                    }, 50);
                    if (img) img.style.display = 'none';
                }
                
                // 확대 모드 활성화 (Grid 해제, 해당 영상만 노출)
                entireWorksGrid.classList.add('single-view');
                card.classList.add('expanded');
                
                // 버튼 교체 (스크롤 숨기고, 뒤로가기 보이기)
                if (upBtn) upBtn.style.display = 'none';
                if (downBtn) downBtn.style.display = 'none';
                if (backBtn) backBtn.style.display = 'flex';
                
                // 시스템 기본 마우스 커서 활성화
                document.body.classList.add('video-expanded-mode');
                
                // 스크롤을 맨 위로 부드럽게 이동
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            });

            // 호버 이펙트 유지
            overlay.addEventListener('mouseenter', () => document.body.classList.add('hovered-btn'));
            overlay.addEventListener('mouseleave', () => document.body.classList.remove('hovered-btn'));
        });

        // 2. 뒤로가기(BACK) 버튼 클릭 시 원래 그리드 상태로 복구
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                const expandedCard = entireWorksGrid.querySelector('.video-card.expanded');
                
                if (expandedCard) {
                    const iframe = expandedCard.querySelector('iframe');
                    const img = expandedCard.querySelector('img');

                    if (iframe) iframe.remove(); // Destroy WebGL context
                    if (img) img.style.display = 'block'; // Restore thumbnail

                    expandedCard.classList.remove('expanded');
                }
                
                // Grid 모드 복구
                entireWorksGrid.classList.remove('single-view');
                
                // 시스템 커서 해제 (커스텀 커서로 복구)
                document.body.classList.remove('video-expanded-mode');
                document.body.classList.remove('hovered-btn'); // 잔여 호버 스타일 제거
                
                // 버튼 복구
                if (upBtn) upBtn.style.display = 'flex';
                if (downBtn) downBtn.style.display = 'flex';
                backBtn.style.display = 'none';
            });
        }

        // 3. Responsive Pagination Control Logic
        if (upBtn && downBtn && scrollContainer) {
            const upText = upBtn.querySelector('.nav-text');
            const downText = downBtn.querySelector('.nav-text');
            const pageIndicator = document.getElementById('page-indicator');
            
            if (upText) upText.textContent = 'PREV PAGE';
            if (downText) downText.textContent = 'NEXT PAGE';
            
            let currentPage = 0;
            let itemsPerPage = 6;
            
            // Dynamic item count based on screen width (Fixed 3x3 Grid for Desktop)
            const calculateItemsPerPage = () => {
                const width = window.innerWidth;
                if (width > 1200) return 9; // Desktop large (3x3 grid fully filled)
                if (width > 768) return 6;  // Tablet/Desktop
                if (width > 480) return 4;  // Mobile landscape
                return 2;                   // Mobile portrait
            };
            
            const updatePagination = () => {
                itemsPerPage = calculateItemsPerPage();
                const cards = entireWorksGrid.querySelectorAll('.video-card');
                const maxPage = Math.max(0, Math.ceil(cards.length / itemsPerPage) - 1);
                
                // Safe-catch if resize causes current page to exceed max page
                if (currentPage > maxPage) currentPage = maxPage;
                
                let visibleCount = 0;
                
                cards.forEach((card, index) => {
                    if (index >= currentPage * itemsPerPage && index < (currentPage + 1) * itemsPerPage) {
                        card.style.display = 'block';
                        
                        card.classList.remove('reveal-animate');
                        void card.offsetWidth; 
                        card.classList.add('reveal-animate');
                        card.style.animationDelay = `${visibleCount * 0.035}s`;
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                        card.classList.remove('reveal-animate');
                        card.style.animationDelay = '';
                    }
                });

                // Update text indicator
                if (pageIndicator) {
                    pageIndicator.textContent = `${currentPage + 1} / ${maxPage + 1}`;
                }
            };
            
            // Initial render
            updatePagination();
            
            // Handle window resize dynamically
            window.addEventListener('resize', () => {
                clearTimeout(window.paginationResizeTimer);
                window.paginationResizeTimer = setTimeout(updatePagination, 250);
            });
            
            upBtn.addEventListener('click', () => {
                if (currentPage > 0) {
                    currentPage--;
                    updatePagination();
                }
            });
            
            downBtn.addEventListener('click', () => {
                const cards = entireWorksGrid.querySelectorAll('.video-card');
                const maxPage = Math.ceil(cards.length / itemsPerPage) - 1;
                if (currentPage < maxPage) {
                    currentPage++;
                    updatePagination();
                }
            });
            
            if (typeof initMagneticButtons === 'function') {
                initMagneticButtons();
            }
        }
    }

    // -------------------------------------------------------------
    // Global Video Manager: Pause on Section Leave
    // -------------------------------------------------------------
    const globalVideoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 해당 섹션이 화면에서 거의 벗어났을 때 트리거
            if (!entry.isIntersecting) {
                const iframes = entry.target.querySelectorAll('iframe');
                iframes.forEach(iframe => {
                    controlYT(iframe, 'pauseVideo');
                    controlYT(iframe, 'mute');
                });
            }
        });
    }, { threshold: 0.1 }); // 섹션이 화면에서 90% 이상 벗어나면 감지

    // HTML 내의 모든 '.section' 요소에 글로벌 옵저버 적용
    document.querySelectorAll('.section').forEach(section => {
        globalVideoObserver.observe(section);
    });

    // --- Touch Navigation Button Handlers ---
    window.touchCoverIndex = 0;
    window.touchSec3Index = 0;
    window.touchSec4Index = 0;

    document.addEventListener('click', (e) => {
        const isNavBtn = (e.target && typeof e.target.closest === 'function') ? e.target.closest('.touch-nav-btn') : null;
        if (isNavBtn) {
            isNavBtn.classList.add('btn-click-effect');
            setTimeout(() => isNavBtn.classList.remove('btn-click-effect'), 200);
        }

        if (e.target.id === 's2-prev') {
            window.touchCoverIndex = Math.max(0, window.touchCoverIndex - 1);
            if (typeof updateCoverFlowVideos === 'function') {
                updateCoverFlowVideos(window.touchCoverIndex);
            }
        } else if (e.target.id === 's2-next') {
            const total = typeof videoPool !== 'undefined' ? videoPool.length : 12;
            window.touchCoverIndex = Math.min(total - 1, window.touchCoverIndex + 1);
            if (typeof updateCoverFlowVideos === 'function') {
                updateCoverFlowVideos(window.touchCoverIndex);
            }
        } else if (e.target.id === 's3-prev') {
            window.touchSec3Index = Math.max(0, (window.touchSec3Index || 0) - 1);
            if (typeof update3DCarouselLayout === 'function') {
                update3DCarouselLayout();
            }
        } else if (e.target.id === 's3-next') {
            window.touchSec3Index = Math.min(2, (window.touchSec3Index || 0) + 1);
            if (typeof update3DCarouselLayout === 'function') {
                update3DCarouselLayout();
            }
        } else if (e.target.id === 's4-prev') {
            window.touchSec4Index = Math.max(0, (window.touchSec4Index || 0) - 1);
            if (typeof update4DCarouselLayout === 'function') update4DCarouselLayout();
        } else if (e.target.id === 's4-next') {
            const maxIdx = typeof itemsData4D !== 'undefined' ? itemsData4D.length - 1 : 5;
            window.touchSec4Index = Math.min(maxIdx, (window.touchSec4Index || 0) + 1);
            if (typeof update4DCarouselLayout === 'function') update4DCarouselLayout();
        }
    });

    // --- Dynamic Mobile & Touch Panel Sniffer Notification System ---
    const detectTouchOrMobileDevice = () => {
        const isTouchCapable = window.matchMedia("(pointer: coarse)").matches || 
                               /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                               (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

        if (isTouchCapable) {
            const warningOverlay = document.createElement('div');
            warningOverlay.id = 'premium-device-warning';
            warningOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(7, 7, 10, 0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); z-index: 999999; display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);";
            
            warningOverlay.innerHTML = `
                <div style="background: #ffffff; color: #000000; padding: 40px 32px; border-radius: 16px; max-width: 88%; width: 460px; text-align: center; box-shadow: 0 30px 70px rgba(0,0,0,0.4); font-family: var(--font-sans); transform: translateY(20px); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);">
                    <div style="font-size: 28px; margin-bottom: 20px;">⚠️</div>
                    <p style="font-size: 13.5px; line-height: 1.8; word-break: keep-all; margin-bottom: 28px; font-weight: 400; color: #1a1a1a; letter-spacing: -0.01em;">
                        가로 화면의 PC 조작에 최적화된 웹페이지입니다. 모바일 또는 터치패널 사용 시 정상적인 조작이 어려울 수 있습니다. 최대한 빠르게 개선해나가도록 노력하겠습니다.
                    </p>
                    <button id="dismiss-warning-trigger" style="background: #000000; color: #ffffff; border: none; padding: 12px 36px; border-radius: 30px; font-family: var(--font-sans); font-size: 11px; font-weight: 500; letter-spacing: 0.1em; cursor: pointer; transition: all 0.3s; text-transform: uppercase; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        확인 (Confirm)
                    </button>
                </div>
            `;
            
            document.body.appendChild(warningOverlay);
            
            // Trigger smooth cinematic fade and slide up
            setTimeout(() => {
                warningOverlay.style.opacity = '1';
                const innerModal = warningOverlay.querySelector('div');
                if (innerModal) innerModal.style.transform = 'translateY(0)';
            }, 200);
            
            // Handle modal close event dismiss
            const dismissBtn = warningOverlay.querySelector('#dismiss-warning-trigger');
            if (dismissBtn) {
                dismissBtn.addEventListener('click', () => {
                    warningOverlay.style.opacity = '0';
                    const innerModal = warningOverlay.querySelector('div');
                    if (innerModal) innerModal.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        warningOverlay.remove();
                    }, 500);
                });
            }
        }
    };

    // Initialize detection immediately
    detectTouchOrMobileDevice();
});
