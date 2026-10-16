/**
 * glass-showcase.js
 * Ultra-responsive, zero-lag horizontal glass showcase & editorial index section controller.
 * Adaptive 60/120fps physics, hardware acceleration, and seamless cursor transformation.
 */

(function () {
  'use strict';

  let isInitialized = false;
  let rafId = null;
  let isLocked = true;

  // DOM Elements
  let trackContainerEl = null;
  let trackEl = null;
  let cursorLabelEl = null;
  let mainCursorEl = null;
  let toggleBtnEl = null;
  let indexSectionEl = null;
  let indexTableListEl = null;
  let indexCounterDisplayEl = null;
  let previewImageEl = null;
  let previewImageLinkEl = null;
  let previewTitleEl = null;
  let previewCatBadgeEl = null;
  let previewNumBadgeEl = null;
  let previewProjectBtnEl = null;

  // Custom vector arrow SVG (consistent across desktop & mobile, prevents iOS emoji fallback)
  const ARROW_SVG_DIAG = '<svg class="custom-arrow-icon" viewBox="0 0 10 10" width="10" height="10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="1.5" y1="8.5" x2="8.5" y2="1.5"></line><polyline points="3.5 1.5 8.5 1.5 8.5 6.5"></polyline></svg>';

  // Horizontal translation variables
  let currentX = 0;
  let targetX = 0;
  let maxTranslateX = 0;
  let isMobile = false;

  // Drag variables
  let isDragging = false;
  let dragStartX = 0;
  let dragStartTargetX = 0;
  let dragDistance = 0;

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  const startUpdateLoop = () => {
    if (!rafId && !isMobile) {
      rafId = requestAnimationFrame(updateLoop);
    }
  };

  const stopUpdateLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  /**
   * Measure dimensions and calculate max horizontal scroll
   */
  const measure = () => {
    if (!trackContainerEl || !trackEl) return;
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;

    if (isMobile) {
      stopUpdateLoop();
      trackEl.style.transform = 'none';
      updateMobileMetrics();
      updateMobileCenterItem();
      return;
    }

    if (wasMobile && !isMobile) {
      if (activeMobileItem) {
        activeMobileItem.classList.remove('is-active-center');
        activeMobileItem = null;
      }
      startUpdateLoop();
    }

    const containerWidth = trackContainerEl.clientWidth;
    const trackWidth = trackEl.scrollWidth;
    maxTranslateX = Math.max(0, trackWidth - containerWidth + 80);

    targetX = clamp(targetX, -maxTranslateX, 0);
    currentX = clamp(currentX, -maxTranslateX, 0);
    syncGlassScrollProgress(false);
  };

  /**
   * Calculate current progress (0 to 1) through the horizontal glasses track
   */
  const getProgress = () => {
    if (isMobile) {
      if (!trackContainerEl) return 0;
      const maxScroll = trackContainerEl.scrollWidth - trackContainerEl.clientWidth;
      return maxScroll > 0 ? clamp(trackContainerEl.scrollLeft / maxScroll, 0, 1) : 0;
    } else {
      if (!maxTranslateX || maxTranslateX <= 0) return 0;
      return clamp(-currentX / maxTranslateX, 0, 1);
    }
  };

  /**
   * Sync glasses showcase horizontal progress to the vertical right-edge progress bar
   */
  const syncGlassScrollProgress = (showBadge = true) => {
    if (isLocked || window.scrollY <= 10) {
      const progress = getProgress();
      if (typeof window.setCustomScrollProgress === 'function') {
        window.setCustomScrollProgress(progress, showBadge);
      }
    }
  };

  window.getGlassShowcaseProgress = getProgress;

  /**
   * Ultra-responsive RAF translation loop (Desktop only):
   * Uses an adaptive spring factor: snaps fast (0.65) on rapid flicks,
   * glides smoothly (0.35) when settling to eliminate all perceived input lag.
   */
  const updateLoop = () => {
    if (isMobile) {
      stopUpdateLoop();
      return;
    }
    if (trackEl) {
      const diff = targetX - currentX;
      if (Math.abs(diff) > 0.05) {
        const factor = Math.min(0.65, 0.35 + Math.abs(diff) * 0.0008);
        currentX += diff * factor;
        trackEl.style.transform = `translate3d(${Math.round(currentX * 10) / 10}px, 0, 0)`;
        syncGlassScrollProgress(true);
        rafId = requestAnimationFrame(updateLoop);
      } else {
        if (currentX !== targetX) {
          currentX = targetX;
          trackEl.style.transform = `translate3d(${Math.round(currentX)}px, 0, 0)`;
          syncGlassScrollProgress(true);
        }
        rafId = null;
      }
    } else {
      rafId = null;
    }
  };

  let endOverscrollDelta = 0;
  let endOverscrollTimer = null;
  let isUnlocking = false;

  /**
   * Smoothly scroll down to the editorial grid / index section
   */
  const scrollToGridSection = () => {
    const target = indexSectionEl || document.getElementById('editorialIndexSection');
    if (!target) return;

    const performScroll = () => {
      // Recalculate dimensions in Lenis after removing .homepage-locked
      if (window.lenis && typeof window.lenis.resize === 'function') {
        window.lenis.resize();
      }

      if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(target, {
          offset: -48,
          duration: 1.2,
          immediate: false,
          force: true,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
        });
      } else {
        const topPos = target.getBoundingClientRect().top + window.pageYOffset - 48;
        window.scrollTo({
          top: topPos,
          behavior: 'smooth'
        });
      }
    };

    // Use requestAnimationFrame so CSS overflow:hidden removal has reflowed
    requestAnimationFrame(() => {
      performScroll();
      // Second attempt after reflow settles
      setTimeout(performScroll, 50);
    });
  };

  /**
   * Local passive wheel listener for the glasses track once unlocked
   */
  const onTrackLocalWheel = (e) => {
    if (isMobile) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
      targetX -= (e.deltaX || e.deltaY) * 1.1;
      targetX = clamp(targetX, -maxTranslateX, 0);
      startUpdateLoop();
    }
  };

  /**
   * Universal Unlock Function:
   * Unlocks page flow, resumes Lenis, dispatches resize, and seamlessly glides to the grid.
   */
  const unlock = (options = {}) => {
    const shouldScroll = options.scrollToGrid !== false;

    if (isLocked) {
      isLocked = false;
      isUnlocking = true;

      stopUpdateLoop();

      // Remove lock classes
      document.documentElement.classList.remove('homepage-locked');
      document.body.classList.remove('homepage-locked');

      if (toggleBtnEl) {
        toggleBtnEl.setAttribute('aria-expanded', 'true');
      }

      // Detach window wheel listener so page/grid scrolling is completely uninhibited
      window.removeEventListener('wheel', onWheel);

      // Attach lightweight passive listener only to the showcase track container
      if (trackContainerEl) {
        trackContainerEl.addEventListener('wheel', onTrackLocalWheel, { passive: true });
      }

      // Calculate footer margin immediately so the entire page height is uninhibited
      if (typeof window.updateFooterMargin === 'function') {
        window.updateFooterMargin();
      }

      // Resume Lenis smooth scroll
      if (window.lenis && typeof window.lenis.start === 'function') {
        window.lenis.start();
        if (typeof window.lenis.resize === 'function') {
          window.lenis.resize();
        }
      }

      // Trigger resize so index.js updates layout & footer margin
      window.dispatchEvent(new Event('resize'));

      setTimeout(() => {
        if (typeof window.updateFooterMargin === 'function') {
          window.updateFooterMargin();
        }
        updateNavbarScroll();
        isUnlocking = false;
      }, 150);
      setTimeout(updateNavbarScroll, 600);
      setTimeout(updateNavbarScroll, 1200);
    }

    if (shouldScroll) {
      scrollToGridSection();
    }
  };

  /**
   * Wheel / Trackpad listener:
   * When page is locked: wheel glides the glasses horizontally with immediate response.
   * If user scrolls all the way to the end of the glasses track, it automatically
   * and seamlessly unlocks the vertical scroll into the editorial grid!
   * Otherwise, it strictly preserves the horizontal lock across all projects.
   */
  const onWheel = (e) => {
    if (isMobile || !isLocked) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;

    // Check if track is truly at the end (last bottle)
    const isAtEnd = (targetX <= -maxTranslateX + 2) && (currentX <= -maxTranslateX + 25);

    if (isAtEnd && delta > 0) {
      // User is at the very end and continues scrolling forward / down
      e.preventDefault();
      endOverscrollDelta += delta;
      clearTimeout(endOverscrollTimer);
      endOverscrollTimer = setTimeout(() => { endOverscrollDelta = 0; }, 300);

      if (endOverscrollDelta >= 20) {
        unlock({ scrollToGrid: true });
        return;
      }
    }

    e.preventDefault();
    targetX -= delta * 1.1;
    targetX = clamp(targetX, -maxTranslateX, 0);
    startUpdateLoop();
  };

  /**
   * Pointer drag support (direct 1:1 tracking when dragging with mouse)
   */
  const setupDrag = () => {
    if (!trackContainerEl) return;

    trackContainerEl.addEventListener('pointerdown', (e) => {
      if (isMobile || e.button !== 0) return;
      isDragging = true;
      dragDistance = 0;
      dragStartX = e.clientX;
      dragStartTargetX = targetX;
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      dragDistance = Math.abs(dx);
      targetX = clamp(dragStartTargetX + dx * 1.15, -maxTranslateX, 0);
      currentX = targetX; // 1:1 instant tracking when dragging!
      trackEl.style.transform = `translate3d(${Math.round(currentX)}px, 0, 0)`;
      syncGlassScrollProgress(true);
    });

    window.addEventListener('pointerup', () => {
      setTimeout(() => {
        isDragging = false;
        dragDistance = 0;
      }, 50);
    });

    window.addEventListener('pointercancel', () => {
      isDragging = false;
      dragDistance = 0;
    });

    trackContainerEl.addEventListener('click', (e) => {
      if (dragDistance > 8) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
  };

  /**
   * Floating cursor label:
   * When hovering strictly inside the bottle / glass shapes, the custom cursor BECOMES the label!
   * The circle cursor hides and the label centers directly under the mouse pointer.
   */
  const setupCursorLabel = () => {
    cursorLabelEl = document.getElementById('glassCursorLabel');
    mainCursorEl = document.getElementById('cursor');
    if (!cursorLabelEl) return;

    const items = document.querySelectorAll('.glass-item');
    let activeItem = null;

    const positionLabel = (clientX, clientY) => {
      cursorLabelEl.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
    };

    const activateItem = (item, clientX, clientY) => {
      if (isMobile || !item) return;
      if (activeItem && activeItem !== item) {
        activeItem.classList.remove('is-hovered');
      }
      activeItem = item;
      item.classList.add('is-hovered');
      const title = item.dataset.title || '';
      cursorLabelEl.textContent = title.toUpperCase();
      cursorLabelEl.classList.add('visible');

      // Circle cursor hides: the cursor BECOMES the label!
      if (mainCursorEl) {
        mainCursorEl.style.opacity = '0';
      }
      positionLabel(clientX, clientY);
    };

    const deactivateItem = () => {
      if (activeItem) {
        activeItem.classList.remove('is-hovered');
        activeItem = null;
      }
      cursorLabelEl.classList.remove('visible');
      if (mainCursorEl) {
        mainCursorEl.style.opacity = '1';
      }
    };

    items.forEach((item) => {
      // Shape-only hit testing: attach to precise vector path layers only
      const shapeLayers = item.querySelectorAll('.glass-hit-layer, .glass-color-layer');
      shapeLayers.forEach((shape) => {
        shape.addEventListener('pointerenter', (e) => {
          activateItem(item, e.clientX, e.clientY);
        });

        shape.addEventListener('pointermove', (e) => {
          if (activeItem !== item) {
            activateItem(item, e.clientX, e.clientY);
          } else {
            positionLabel(e.clientX, e.clientY);
          }
        });

        shape.addEventListener('pointerleave', (e) => {
          // If cursor moved to a sister layer within the same glass item, do not deactivate
          if (e.relatedTarget && item.contains(e.relatedTarget)) {
            return;
          }
          if (activeItem === item) {
            deactivateItem();
          }
        });
      });
    });

    // Global pointermove safety: ensures instantaneous deactivation when leaving shape into empty air
    window.addEventListener('pointermove', (e) => {
      if (isMobile || e.pointerType === 'touch') return;
      if (!activeItem) return;
      const target = e.target;
      if (!target || !target.closest || !target.closest('.glass-item')) {
        deactivateItem();
      } else {
        positionLabel(e.clientX, e.clientY);
      }
    }, { passive: true });

    window.addEventListener('scroll', () => {
      deactivateItem();
    }, { passive: true });
  };

  /**
   * Touch Tracking for Mobile Swipe:
   * Prevents false clicks/navigation while swiping horizontally on mobile
   */
  let touchStartX = 0;
  let touchStartY = 0;
  let isTouchScrolling = false;

  const setupTouchTracking = () => {
    if (!trackContainerEl) return;

    trackContainerEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isTouchScrolling = false;
      }
    }, { passive: true });

    trackContainerEl.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > 8 || dy > 8) {
          isTouchScrolling = true;
        }

        if (isLocked) {
          const maxScroll = trackContainerEl.scrollWidth - trackContainerEl.clientWidth;
          const isAtEnd = maxScroll > 0 && trackContainerEl.scrollLeft >= maxScroll - 20;
          const diffX = touchStartX - e.touches[0].clientX; // swipe left (advancing)
          const diffY = touchStartY - e.touches[0].clientY; // swipe up (scrolling down)
          if (isAtEnd && (diffX > 25 || diffY > 25)) {
            unlock({ scrollToGrid: true });
          }
        }
      }
    }, { passive: true });

    trackContainerEl.addEventListener('touchend', () => {
      setTimeout(() => {
        isTouchScrolling = false;
      }, 150);
    }, { passive: true });

    trackContainerEl.addEventListener('touchcancel', () => {
      isTouchScrolling = false;
    }, { passive: true });
  };

  /**
   * Setup click & keyboard navigation for glass items (role="link"):
   * Prevents browser bottom-left URL link preview bubble completely!
   */
  const setupGlassNavigation = () => {
    const items = document.querySelectorAll('.glass-item');
    items.forEach((item) => {
      const navigate = () => {
        if (isMobile && isTouchScrolling) return;
        if (!isMobile && dragDistance > 8) return;
        if (isMobile && item !== activeMobileItem) {
          item.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          return;
        }
        const href = item.dataset.href;
        if (!href) return;
        if (href.startsWith('http')) {
          window.open(href, '_blank', 'noopener,noreferrer');
        } else {
          window.location.href = href;
        }
      };

      // Click on shape vector layers
      const shapeLayers = item.querySelectorAll('.glass-hit-layer, .glass-color-layer');
      shapeLayers.forEach((shape) => {
        shape.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate();
        });
      });

      // On mobile, tapping anywhere on the item scrolls to or opens it
      item.addEventListener('click', (e) => {
        if (!isMobile) return;
        e.preventDefault();
        navigate();
      });

      // Keyboard navigation
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate();
        }
      });
    });
  };

  /**
   * Mobile Centered Item Detection & Dynamic Title & Color Activation:
   * Optimized for zero layout thrashing: uses mathematical calculation
   * based on scrollLeft rather than calling getBoundingClientRect() on 32 items.
   */
  let activeMobileItem = null;
  let mobileScrollTicking = false;
  let cachedItemStep = 224;
  let cachedGlassItems = [];

  const updateMobileMetrics = () => {
    if (!trackContainerEl) return;
    cachedGlassItems = Array.from(trackContainerEl.querySelectorAll('.glass-item'));
    if (cachedGlassItems.length >= 2) {
      const step = cachedGlassItems[1].offsetLeft - cachedGlassItems[0].offsetLeft;
      if (step > 40) cachedItemStep = step;
    }
  };

  const updateMobileCenterItem = () => {
    if (!trackContainerEl) return;
    if (!cachedGlassItems.length) {
      updateMobileMetrics();
      if (!cachedGlassItems.length) return;
    }

    const scrollLeft = trackContainerEl.scrollLeft;
    const rawIndex = Math.round(scrollLeft / cachedItemStep);
    const index = Math.max(0, Math.min(cachedGlassItems.length - 1, rawIndex));
    const closestItem = cachedGlassItems[index];

    if (closestItem) {
      if (closestItem !== activeMobileItem) {
        if (activeMobileItem) {
          activeMobileItem.classList.remove('is-active-center');
        }
        activeMobileItem = closestItem;
        activeMobileItem.classList.add('is-active-center');

        const title = activeMobileItem.dataset.title || '';
        const href = activeMobileItem.dataset.href || '';
        const labelEl = document.getElementById('mobileProjectLabel');
        if (labelEl) {
          labelEl.innerHTML = `<span class="mobile-project-name">${title.toUpperCase()}</span> ${ARROW_SVG_DIAG}`;
          labelEl.dataset.href = href;
        }
      } else if (!closestItem.classList.contains('is-active-center')) {
        closestItem.classList.add('is-active-center');
      }
    }
  };

  const onMobileScroll = () => {
    if (!isMobile) return;
    if (!mobileScrollTicking) {
      requestAnimationFrame(() => {
        updateMobileCenterItem();
        syncGlassScrollProgress(false);
        mobileScrollTicking = false;
      });
      mobileScrollTicking = true;
    }

    const hintEl = document.getElementById('mobileScrollHint');
    if (hintEl && trackContainerEl) {
      if (trackContainerEl.scrollLeft > 60) {
        hintEl.classList.add('is-scrolled');
      } else {
        hintEl.classList.remove('is-scrolled');
      }
    }

    if (isLocked && trackContainerEl) {
      const maxScroll = trackContainerEl.scrollWidth - trackContainerEl.clientWidth;
      if (maxScroll > 0 && trackContainerEl.scrollLeft >= maxScroll - 5) {
        setTimeout(() => {
          if (isLocked && trackContainerEl && trackContainerEl.scrollLeft >= maxScroll - 5) {
            unlock({ scrollToGrid: true });
          }
        }, 400);
      }
    }
  };

  const setupMobileInteraction = () => {
    if (!trackContainerEl) return;
    trackContainerEl.addEventListener('scroll', onMobileScroll, { passive: true });
    setupTouchTracking();

    const labelEl = document.getElementById('mobileProjectLabel');
    if (labelEl) {
      labelEl.addEventListener('click', (e) => {
        e.preventDefault();
        const href = labelEl.dataset.href || (activeMobileItem ? activeMobileItem.dataset.href : '');
        if (href) {
          if (href.startsWith('http')) {
            window.open(href, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = href;
          }
        }
      });
    }

    if (isMobile) {
      updateMobileCenterItem();
    }
  };

  /**
   * Setup "MORE PROJECTS" Toggle Button:
   * Unlocks the page flow, resumes Lenis, and smoothly scrolls to the grid section below
   */
  const setupUnlockToggle = () => {
    toggleBtnEl = document.getElementById('toggleIndexBtn');
    indexSectionEl = document.getElementById('editorialIndexSection');

    if (!toggleBtnEl) return;

    toggleBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      unlock({ scrollToGrid: true });
    });
  };

  /**
   * Render Tabular List inside the Editorial Index
   */
  const renderIndexTable = (category) => {
    if (!indexTableListEl) return;
    const projects = (typeof allProjectsData !== 'undefined') ? allProjectsData : [];

    const filtered = projects.filter(p => {
      if (category === 'all') return true;
      return (p.category || '').toLowerCase() === category.toLowerCase();
    });

    if (indexCounterDisplayEl) {
      indexCounterDisplayEl.textContent = filtered.length;
    }

    indexTableListEl.innerHTML = '';
    filtered.forEach((p, idx) => {
      const row = document.createElement('a');
      row.href = p.link || '#';
      row.className = 'index-row cursor-target' + (idx === 0 ? ' active-row' : '');
      if (p.link && p.link.startsWith('http')) {
        row.target = '_blank';
        row.rel = 'noopener';
      }
      row.dataset.index = idx;
      row.dataset.category = p.category;
      row.dataset.image = p.image || '';
      row.dataset.title = p.title || '';
      row.dataset.num = p.indexNum || `No.${String(idx + 1).padStart(3, '0')}`;

      row.innerHTML = `
        <span class="index-cell-num">${row.dataset.num}</span>
        <span class="index-cell-title">${p.title}</span>
        <span class="index-cell-cat">${p.category}</span>
        <span class="index-cell-arrow">${ARROW_SVG_DIAG}</span>
      `;

      row.addEventListener('mouseenter', () => {
        if (isMobile || window.innerWidth <= 1080) return;
        updatePreview(p, row.dataset.num);
        document.querySelectorAll('.index-row.active-row').forEach(r => r.classList.remove('active-row'));
        row.classList.add('active-row');
      });

      indexTableListEl.appendChild(row);
    });

    if (!isMobile && window.innerWidth > 1080 && filtered.length > 0) {
      updatePreview(filtered[0], filtered[0].indexNum || 'No.001');
    }
  };

  let previewUpdatePending = false;
  let nextPreviewData = null;

  /**
   * Update Right Preview Card in Index (Desktop only, throttled via RAF)
   */
  const updatePreview = (p, num) => {
    if (isMobile || window.innerWidth <= 1080 || !previewImageEl || !p) return;

    nextPreviewData = { p, num };
    if (!previewUpdatePending) {
      previewUpdatePending = true;
      requestAnimationFrame(() => {
        previewUpdatePending = false;
        if (!nextPreviewData) return;
        const { p: curP, num: curNum } = nextPreviewData;

        if (curP.image && curP.image !== 'undefined' && curP.image !== '') {
          if (previewImageEl.src !== curP.image) {
            previewImageEl.src = curP.image;
            previewImageEl.alt = curP.title || 'Project Preview';
          }
        }
        if (previewTitleEl) previewTitleEl.textContent = (curP.title || '').toUpperCase();
        if (previewCatBadgeEl) previewCatBadgeEl.textContent = (curP.category || '').toUpperCase();
        if (previewNumBadgeEl) previewNumBadgeEl.textContent = curNum || curP.indexNum || 'No.001';
        if (previewProjectBtnEl) {
          const link = curP.link || '#';
          previewProjectBtnEl.href = link;
          const isExternal = link.startsWith('http://') || link.startsWith('https://');
          if (isExternal) {
            previewProjectBtnEl.target = '_blank';
            previewProjectBtnEl.rel = 'noopener';
          } else {
            previewProjectBtnEl.removeAttribute('target');
            previewProjectBtnEl.removeAttribute('rel');
          }
        }
        if (previewImageLinkEl) {
          const link = curP.link || '#';
          previewImageLinkEl.href = link;
          const isExternal = link.startsWith('http://') || link.startsWith('https://');
          if (isExternal) {
            previewImageLinkEl.target = '_blank';
            previewImageLinkEl.rel = 'noopener';
          } else {
            previewImageLinkEl.removeAttribute('target');
            previewImageLinkEl.removeAttribute('rel');
          }
        }
      });
    }
  };

  /**
   * Seamless Navbar Scroll State on Homepage:
   * Starts transparent with no bottom border while in the hero.
   * As the page scrolls down and the hero bottom line hits the navbar,
   * the navbar seamlessly acquires its black border and solid white background,
   * as if stealing the fixed line from the page.
   * Also toggles .hero-offscreen when scrolled well past hero to pause SVG compositing.
   */
  const updateNavbarScroll = () => {
    const nav = document.getElementById('navTop');
    const showcaseSection = document.getElementById('glass-showcase');
    const threshold = window.innerHeight - 48;
    const isPastHero = window.scrollY >= threshold - 1;

    if (nav) {
      if (isPastHero) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }

    if (showcaseSection) {
      if (window.scrollY > window.innerHeight + 30) {
        showcaseSection.classList.add('hero-offscreen');
      } else {
        showcaseSection.classList.remove('hero-offscreen');
      }
    }
  };

  /**
   * Category Filter Handlers
   */
  const setupFilters = () => {
    const filterButtons = document.querySelectorAll('.index-filter-pill');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const activeCategory = btn.dataset.category || 'all';
        renderIndexTable(activeCategory);
      });
    });

    // Attach hover & focus to pre-rendered index rows (Desktop only)
    const existingRows = document.querySelectorAll('.index-row');
    existingRows.forEach(row => {
      const activate = () => {
        if (isMobile || window.innerWidth <= 1080) return;
        const p = {
          title: row.dataset.title || '',
          category: row.dataset.category || '',
          image: row.dataset.image || '',
          link: row.getAttribute('href') || ''
        };
        updatePreview(p, row.dataset.num);
        document.querySelectorAll('.index-row.active-row').forEach(r => r.classList.remove('active-row'));
        row.classList.add('active-row');
      };

      row.addEventListener('mouseenter', activate);
      row.addEventListener('focus', activate);
    });
  };

  /**
   * Init
   */
  const init = () => {
    if (isInitialized) return;

    // Initially lock the page to 100vh
    isLocked = true;
    document.documentElement.classList.add('homepage-locked');
    document.body.classList.add('homepage-locked');

    // Pause Lenis while locked so it does not intercept or fight horizontal wheel events
    if (window.lenis && typeof window.lenis.stop === 'function') {
      window.lenis.stop();
    }

    trackContainerEl = document.getElementById('glassTrackContainer');
    trackEl = document.getElementById('glassTrack');
    cursorLabelEl = document.getElementById('glassCursorLabel');
    mainCursorEl = document.getElementById('cursor');
    toggleBtnEl = document.getElementById('toggleIndexBtn');
    indexSectionEl = document.getElementById('editorialIndexSection');
    indexTableListEl = document.getElementById('indexTableList');
    indexCounterDisplayEl = document.getElementById('indexCounterDisplay');
    previewImageEl = document.getElementById('indexPreviewImage');
    previewTitleEl = document.getElementById('previewProjectTitle');
    previewCatBadgeEl = document.getElementById('previewCatBadge');
    previewNumBadgeEl = document.getElementById('previewNumBadge');
    previewProjectBtnEl = document.getElementById('previewProjectBtn');
    previewImageLinkEl = document.getElementById('previewImageLink');

    // Remove preview column from DOM on mobile/tablet to ensure 0 image decode & layout cost
    if (isMobile || window.innerWidth <= 1080) {
      const rightCol = document.querySelector('.index-col-right');
      if (rightCol) rightCol.remove();
    }

    if (!trackContainerEl || !trackEl) return;

    measure();
    if (!isMobile) {
      startUpdateLoop();
    }

    window.addEventListener('wheel', onWheel, { passive: false });
    setupDrag();
    setupCursorLabel();
    setupGlassNavigation();
    setupUnlockToggle();
    setupFilters();
    setupMobileInteraction();
    syncGlassScrollProgress(false);

    // Sync initial preview card with first project on desktop only
    if (!isMobile && window.innerWidth > 1080 && typeof allProjectsData !== 'undefined' && allProjectsData.length > 0) {
      updatePreview(allProjectsData[0], allProjectsData[0].indexNum || 'No.001');
    }

    window.addEventListener('resize', () => {
      measure();
      updateNavbarScroll();
    }, { passive: true });

    updateNavbarScroll();
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    if (window.lenis && typeof window.lenis.on === 'function') {
      window.lenis.on('scroll', updateNavbarScroll);
    }

    window.addEventListener('load', () => {
      measure();
      updateNavbarScroll();
    });

    // If arriving directly with a hash anchor like #contact-footer, unlock immediately
    if (window.location.hash && window.location.hash !== '#' && window.location.hash !== '#main') {
      setTimeout(() => {
        unlock({ scrollToGrid: false });
      }, 50);
    }

    isInitialized = true;
  };

  /**
   * Cleanup
   */
  const destroy = () => {
    window.removeEventListener('wheel', onWheel);
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    document.documentElement.classList.remove('homepage-locked');
    document.body.classList.remove('homepage-locked');
    isInitialized = false;
  };

  window.GlassShowcase = { init, destroy, measure, unlock, isLocked: () => isLocked };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
