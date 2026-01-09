// Mobile View
function isMobile() {
  return window.innerWidth <= 767;
}

function isModelFull() {
  return window.innerWidth <= 939;
}

// Scroll view
function scrollview() {
  return (
    (window.innerWidth >= 768 && window.innerWidth <= 1499) ||
    (window.innerWidth >= 1500 && window.innerHeight <= 849)
  );
}


// For mobile normal scroll
function updateMobileScrollState() {
  const html = document.documentElement;
  const body = document.body;
  const mainContent = document.querySelector('main');

  html.classList.remove('mobile-scroll-locked');
  body.classList.remove('mobile-scroll-locked');
  if (mainContent) mainContent.classList.remove('main-blur');

  if (isMobile() && isPopupOpen) {
    html.classList.add('mobile-scroll-locked');
    body.classList.add('mobile-scroll-locked');
    if (mainContent) mainContent.classList.add('main-blur');
  }
  if (scrollview() && isPopupOpen) {
    html.classList.add('mobile-scroll-locked');
    body.classList.add('mobile-scroll-locked');
    if (mainContent) mainContent.classList.add('main-blur');
  }
}


let isPopupOpen = false;

// Projects Popup function to track popup state
function initProjectPopup() {
  const popup = document.getElementById('projectPopup');
  const navbar = document.querySelector('.navbar');
  const sidebarList = document.getElementById('sidebarProjectList');
  const closeBtn = document.getElementById('closePopup');
  const contentArea = document.getElementById('projectContentPlaceholder');
  const projectCards = document.querySelectorAll('#projects .card');

  // --- SERVER SLEEP WARNING LOGIC ---
  
  // --- DYNAMIC ALERT CONFIGURATION ---
  
  // Map specific project titles to their custom messages
  const projectAlerts = {
    "Thesis Hub": {
      main: `
        <div class="text-center py-2">
          <div style="font-size: 3.5rem;" class="mb-2">
            😴
          </div>
          <p class="small text-muted mb-0">This app may have gone to sleep as it’s hosted on a free server</p>
        </div>`,
      sub: `Please <strong>wait 1 to 1.5 minutes</strong> while the application starts up after you click proceed`
    },
    "Currency App": {
      main: `
        <div class="text-center py-2">
          <div style="font-size: 3.5rem;" class="mb-2">
            😴
          </div>
          <p class="small text-muted mb-0">This app may have gone to sleep as it’s hosted on a free server</p>
        </div>`,
      sub: `On the next page, click <strong>"Yes, get this app back up!"</strong>. It takes approx. 1 min to wake the server up`
    }
  };

  // Setup Modal Elements
  const warningModalEl = document.getElementById('serverWakeupModal');
  const warningModal = new bootstrap.Modal(warningModalEl);
  const confirmVisitBtn = document.getElementById('confirmVisitBtn');
  
  // Elements to update text
  const modalMainText = document.getElementById('modalMainText');
  const modalSubText = document.getElementById('modalSubText');
  
  let pendingUrl = '';

  // Handle Proceed Button Click
  confirmVisitBtn.addEventListener('click', () => {
    if (pendingUrl) {
      window.open(pendingUrl, '_blank');
      warningModal.hide();
      pendingUrl = ''; 
    }
  });

  // Sets modal top and height based on the current navbar height
  function updateModalSizing() {
    if (!navbar || !popup) return;
    
    const navHeight = navbar.offsetHeight; 
    const windowHeight = window.innerHeight;
    const margin = 20;
    
    // Set top to Navbar + Margin
    popup.style.top = `${navHeight + margin}px`;
    
    // Height = Total Viewport - Navbar - (Margin * 2 for top and bottom)
    popup.style.height = `${windowHeight - navHeight - (margin * 2)}px`;
  }

  // Map existing HTML cards to an array for the sidebar
  const projects = Array.from(projectCards).map((card, index) => {
    const titleElement = card.querySelector('.card-title');
    const title = titleElement ? titleElement.textContent.trim() : `Project ${index + 1}`;
    
    return {
      id: index,
      title: title,
      fileName: title.toLowerCase().replace(/\s+/g, '-') + '.html'
    };
  });
  
  // RENDER SIDEBAR
  sidebarList.innerHTML = projects.map(p => `
    <li class="sidebar-item" data-id="${p.id}" data-file="${p.fileName}">
    ${p.title}
    </li>
  `).join('');

  // CONTENT LOADER
  async function loadProjectFile(fileName, title) {
    contentArea.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2">Loading ${title}...</p>
      </div>`;
    
    try {
      const iframeHtml = `
          <iframe src="./projects/${fileName}"
                  id="projectFrame"
                  style="width: 100%; opacity: 0; transition: opacity 0.3s ease;" 
                  title="${title}">
          </iframe>`;
      
      contentArea.innerHTML = iframeHtml;

      const iframe = document.getElementById('projectFrame');
      
      if (iframe) {
        iframe.onload = function() {
          // 1. Adjust Height
          this.style.height = this.contentWindow.document.body.scrollHeight + 'px';
          this.style.opacity = '1';

          // 2. Check if this project has a specific alert configured
          if (projectAlerts.hasOwnProperty(title)) {
            try {
              const doc = this.contentWindow.document;
              
              // Find the "Live" button inside the iframe
              const liveBtn = doc.querySelector('.live-btn') || 
                              Array.from(doc.querySelectorAll('a')).find(el => el.textContent.toLowerCase().includes('live'));

              if (liveBtn) {
                liveBtn.removeAttribute('onclick'); // Clear old inline events
                
                liveBtn.addEventListener('click', (e) => {
                  e.preventDefault(); // Stop tab from opening
                  
                  // A. Load the custom text for THIS specific project
                  const alertData = projectAlerts[title];
                  modalMainText.innerHTML = alertData.main;
                  modalSubText.innerHTML = alertData.sub;
                  
                  // B. Save URL and Show Modal
                  pendingUrl = liveBtn.href;
                  warningModal.show();
                });
              }
            } catch (err) {
              console.warn("Cross-origin restriction: Cannot access iframe content locally.");
            }
          }
        };
      }
      
      document.querySelector('.project-display-area').scrollTop = 0;
    } catch (err) {
      contentArea.innerHTML = `
        <div class="alert alert-info mt-4 shadow-sm">
           <p class="mb-0">The content for <b>${title}</b> is currently being updated.</p>
        </div>`;
    }
  }

  // SIDEBAR NAVIGATION LOGIC
  function setActiveSidebarItem(id) {
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(el => el.classList.remove('active'));
    
    const activeItem = sidebarList.querySelector(`[data-id="${id}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      
      const sidebarContainer = document.querySelector('.project-sidebar');
      const itemOffset = activeItem.offsetTop;
      const containerHeight = sidebarContainer.offsetHeight;
      const itemHeight = activeItem.offsetHeight;

      // Center the item in the sidebar if it's out of view
      sidebarContainer.scrollTo({
        top: itemOffset - (containerHeight / 2) + (itemHeight / 2),
        behavior: 'smooth'
      });
    }
  }

  // New close button
  function handleClose() {
    popup.classList.remove('active');
    document.body.classList.remove('modal-open');
    isPopupOpen = false;
    updateMobileScrollState();
    
    // Remove the mobile button if it exists
    const mobileBtn = document.querySelector('.mobile-close-btn');
    if (mobileBtn) mobileBtn.remove();

    if (isMobile()) {
      const projectsSection = document.getElementById('projects');
      window.scrollTo({ top: projectsSection.offsetTop - 50, behavior: 'auto' });
    }
  }

  // Open Popup when clicking a Card
  projectCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      updateModalSizing(); // Recalculate size before showing
      popup.classList.add('active');
      document.body.classList.add('modal-open'); // Prevents background scroll
      isPopupOpen = true; // Set the flag
      updateMobileScrollState();
      // Create mobile button dynamically
      if (isModelFull()) {
        const mobileClose = document.createElement('button');
        mobileClose.className = 'mobile-close-btn';
        mobileClose.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        
        // Append it directly to the popup so it's not inside the hidden sidebar
        popup.appendChild(mobileClose);
        
        mobileClose.addEventListener('click', handleClose);
      }
      
      setActiveSidebarItem(index);
      loadProjectFile(projects[index].fileName, projects[index].title);
    });
  });

  // Switch Projects via Sidebar
  sidebarList.addEventListener('click', (e) => {
    const item = e.target.closest('.sidebar-item');
    if (!item) return;
    
    const id = item.dataset.id;
    setActiveSidebarItem(id);
    loadProjectFile(item.dataset.file, item.innerText);
  });

  // Close Popup
  closeBtn.addEventListener('click', () => {
    popup.classList.remove('active');
    document.body.classList.remove('modal-open');
    isPopupOpen = false; // Reset the flag
    updateMobileScrollState();
    if (isMobile() || scrollview()) {
      const projectsSection = document.getElementById('projects');
      const navHeight = 50;
      window.scrollTo({
        top: projectsSection.offsetTop - navHeight,
        behavior: 'auto'
      });
    }
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (popup.classList.contains('active')) {
      updateModalSizing();
    }
  });
  window.addEventListener('resize', updateMobileScrollState);
}



// Function for 5 columns at 1500px with square cards
function optimizeProjectCards() {
  const projectsSection = document.getElementById('projects');
  const gridContainer = document.querySelector('.projects-grid-container');
  
  if (!projectsSection || !gridContainer) return;
  
  // Fixed layout for 1500px max-width
  const maxContainerWidth = 1500;
  const gap = 20;
  const padding = 120;
  
  // Calculate available width (max width minus padding)
  const availableWidth = maxContainerWidth - padding;
  
  // For 5 columns with gaps
  const cardWidth = (availableWidth - (gap * 4)) / 5;
  
  // Update grid template for 5 columns
  gridContainer.style.gridTemplateColumns = `repeat(5, ${cardWidth}px)`;
  gridContainer.style.gridAutoRows = `${cardWidth}px`; // Square rows
  
  // Update individual card widths
  const cards = document.querySelectorAll('#projects .col-sm-6.col-lg-4');
  cards.forEach(card => {
    card.style.width = `${cardWidth+4}px`;
    card.style.height = `${cardWidth+4}px`;
  });

  // Use requestAnimationFrame to ensure the browser has painted the grid first
  requestAnimationFrame(() => {
    const projectCards = document.querySelectorAll('#projects .card');
    
    projectCards.forEach(card => {
      const skillsContainer = card.querySelector('.card-skill');
      const cardText = card.querySelector('.card-text');
      
      if (skillsContainer && cardText) {
        // Reset classes to get natural height
        cardText.classList.remove('line-clamp-1', 'line-clamp-2');
        
        // Measure height now that the grid is rendered
        const skillHeight = skillsContainer.offsetHeight;
        
        if (skillHeight > 35) {
          cardText.classList.add('line-clamp-1');
        } else {
          cardText.classList.add('line-clamp-2');
        }
      }
    });
  });
}



document.addEventListener('DOMContentLoaded', function() {
  // Get elements
  const sections = document.querySelectorAll('section');
  const navbarBrand = document.getElementById('navbarBrand');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Set initial state
  let currentSectionIndex = 0;
  let isAnimating = false;
  
  // Activate first section
  sections[0].classList.add('active');
  navLinks[0].classList.add('active');
  
  // Function to navigate to section
  function goToSection(index) {
    if (isMobile() || scrollview()) {
      const targetSection = sections[index];
      if (targetSection) {
        const navbarHeight = 50; 
        const targetPosition = targetSection.offsetTop - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update UI immediately
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[index].classList.add('active');
      }
      if (!isMobile()) {
        // Show/hide navbar brand based on section
        if (index === 0) {
          // About section - hide navbar brand
          navbarBrand.classList.remove('visible');
        } else {
          // Any other section - show navbar brand
          navbarBrand.classList.add('visible');
        }
      }
      return;
    }

    if (isAnimating || index === currentSectionIndex || isPopupOpen) return;
    
    isAnimating = true;
    
    // Deactivate current section
    sections[currentSectionIndex].classList.remove('active');
    
    // Update nav links
    navLinks.forEach(link => link.classList.remove('active'));
    navLinks[index].classList.add('active');
    
    // Show/hide navbar brand based on section
    if (index === 0) {
      // About section - hide navbar brand
      navbarBrand.classList.remove('visible');
    } else {
      // Any other section - show navbar brand
      navbarBrand.classList.add('visible');
    }
    
    // Activate new section
    setTimeout(() => {
      sections[index].classList.add('active');
      currentSectionIndex = index;
      isAnimating = false;
      
      // Adjust timeline line and widths after section change
      if (index === 1) {
        setTimeout(() => {
          adjustTimelineLine();
          equalizeTimelineWidths();
        }, 50);
      }
      
      // Trigger optimization when Projects section (index 2) becomes visible
      if (index === 2) {
        setTimeout(optimizeProjectCards, 100); 
      }
    }, 300);
  }
  
  // Mouse wheel navigation
  let wheelTimeout;
  document.addEventListener('wheel', function(e) {
    if (isMobile() || scrollview() || isAnimating || isPopupOpen) return;
    
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      if (e.deltaY > 0) {
        if (currentSectionIndex < sections.length - 1) {
          goToSection(currentSectionIndex + 1);
        }
      } else {
        if (currentSectionIndex > 0) {
          goToSection(currentSectionIndex - 1);
        }
      }
    }, 50);
  }, { passive: true });
  
  // Touch/swipe navigation for mobile
  let touchStartY = 0;
  document.addEventListener('touchstart', function(e) {
    if (isPopupOpen) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (isMobile() || scrollview() || isAnimating || isPopupOpen) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        if (currentSectionIndex < sections.length - 1) {
          goToSection(currentSectionIndex + 1);
        }
      } else {
        if (currentSectionIndex > 0) {
          goToSection(currentSectionIndex - 1);
        }
      }
    }
  }, { passive: true });
  
  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (isAnimating || isPopupOpen) return;
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      if (currentSectionIndex < sections.length - 1) {
        goToSection(currentSectionIndex + 1);
      }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      if (currentSectionIndex > 0) {
        goToSection(currentSectionIndex - 1);
      }
    } else if (e.key >= '1' && e.key <= '4') {
      e.preventDefault();
      const index = parseInt(e.key) - 1;
      if (index < sections.length) {
        goToSection(index);
      }
    }
  });

  // Navigation link clicks - these should close popup and navigate
  navLinks.forEach((link, index) => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close popup if it's open
      if (isPopupOpen) {
        const popup = document.getElementById('projectPopup');
        popup.classList.remove('active');
        document.body.classList.remove('modal-open');
        isPopupOpen = false;
        updateMobileScrollState();
      }
      
      goToSection(index);
    });
  });

  // Sync Navbar highlight with manual scrolling on mobile
  window.addEventListener('scroll', function() {
    if (!isMobile()) return;
    if (isPopupOpen) return;

    let fromTop = window.scrollY + 100;

    sections.forEach((section, index) => {
      if (
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
      ) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[index].classList.add('active');
      }
    });
  });
  
  window.addEventListener('scroll', function() {
    if (!scrollview()) return;
    if (isPopupOpen) return;

    let fromTop = window.scrollY + 100;

    sections.forEach((section, index) => {
      if (
        section.offsetTop <= fromTop &&
        section.offsetTop + section.offsetHeight > fromTop
      ) {
        navLinks.forEach(link => link.classList.remove('active'));
        navLinks[index].classList.add('active');

        // Update Navbar Brand Visibility
        if (index === 0) {
          navbarBrand.classList.remove('visible');
        } else {
          navbarBrand.classList.add('visible');
        }
      }
    });
  });
  

  // Initialize GSAP
  gsap.registerPlugin(ScrollTrigger);
  
  // Function to adjust timeline line height - PRECISE CALCULATION
  function adjustTimelineLine() {
    const timeline = document.querySelector('.experience-timeline');
    if (!timeline) return;
    
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length === 0) return;
    
    const timelineRect = timeline.getBoundingClientRect();
    const lastItem = timelineItems[timelineItems.length - 1];
    
    // Calculate the center of the last dot relative to timeline container
    const dotSize = 15;
    const dotTop = 11;
    const dotRadius = dotSize / 2;
    
    const lastItemRect = lastItem.getBoundingClientRect();
    // The line ends exactly at the center of the last dot
    const lastDotCenter = (lastItemRect.top - timelineRect.top) + dotTop + dotRadius;
    
    let dynamicStyles = document.getElementById('dynamic-timeline-styles');
    if (!dynamicStyles) {
      dynamicStyles = document.createElement('style');
      dynamicStyles.id = 'dynamic-timeline-styles';
      document.head.appendChild(dynamicStyles);
    }
    
    // top: 0 starts the line at the very top of the section
    dynamicStyles.textContent = `
      .experience-timeline::before {
        top: 0px !important;
        height: ${lastDotCenter}px !important;
      }
    `;
  }
  
  // Function to equalize timeline left widths
  function equalizeTimelineWidths() {
    const timelineLefts = document.querySelectorAll('.timeline-left');
    if (timelineLefts.length === 0) return;
    
    // Find the maximum width needed
    let maxWidth = 0;
    
    // First, reset widths to auto to measure natural width
    timelineLefts.forEach(left => {
      left.style.width = 'auto';
      left.style.minWidth = 'auto';
      left.style.flexBasis = 'auto';
    });
    
    // Force reflow and measure
    timelineLefts.forEach(left => {
      // Temporarily make visible for measurement
      const originalDisplay = left.style.display;
      left.style.display = 'block';
      
      const width = left.offsetWidth;
      if (width > maxWidth) {
        maxWidth = width;
      }
      
      left.style.display = originalDisplay;
    });
    
    // Add some padding for safety
    maxWidth += 10;
    
    // Apply the maximum width to all timeline-left elements
    timelineLefts.forEach(left => {
      left.style.width = `${maxWidth}px`;
      left.style.minWidth = `${maxWidth}px`;
      left.style.flexBasis = `${maxWidth}px`;
      left.style.flexShrink = '0';
    });
  }
  
  // Enhanced function to ensure timeline is visible before adjusting
  function ensureTimelineVisibleAndAdjust() {
    const experienceSection = document.getElementById('experience');
    const timeline = document.querySelector('.experience-timeline');
    
    if (!experienceSection || !timeline) return;
    
    // Force a reflow to ensure proper rendering
    timeline.style.display = 'none';
    timeline.offsetHeight;
    timeline.style.display = '';
    
    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      setTimeout(() => {
        adjustTimelineLine();
        equalizeTimelineWidths();
      }, 50);
    });
  }
  
  // Initialize timeline adjustment with better timing
  function initializeTimeline() {
    // Wait a bit longer for DOM and CSS to be fully ready
    setTimeout(() => {
      // First adjustment
      ensureTimelineVisibleAndAdjust();
      
      // Set up MutationObserver to detect when experience section becomes active
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const target = mutation.target;
            if (target.id === 'experience' && target.classList.contains('active')) {
              // Section just became active, adjust timeline
              setTimeout(() => {
                ensureTimelineVisibleAndAdjust();
              }, 100);
            }
          }
        });
      });
      
      // Observe the experience section for class changes
      const experienceSection = document.getElementById('experience');
      if (experienceSection) {
        observer.observe(experienceSection, {
          attributes: true,
          attributeFilter: ['class']
        });
      }
      
      // Re-adjust on window resize with proper debouncing
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (currentSectionIndex === 1) {
            ensureTimelineVisibleAndAdjust();
          }
        }, 200);
      });
      
      // Adjust when images load
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.addEventListener('load', () => {
          if (currentSectionIndex === 1) {
            setTimeout(ensureTimelineVisibleAndAdjust, 100);
          }
        });
      });
      
      // Adjust after fonts load
      document.fonts.ready.then(() => {
        if (currentSectionIndex === 1) {
          setTimeout(ensureTimelineVisibleAndAdjust, 100);
        }
      });
      
      // Final adjustment after everything settles
      setTimeout(ensureTimelineVisibleAndAdjust, 800);
    }, 200);
  }
  
  // Call initialization
  initializeTimeline();
  
  // Also adjust timeline when switching to experience section
  const originalGoToSection = goToSection;
  goToSection = function(index) {
    originalGoToSection(index);
    if (index === 1) { // Experience section
      // Wait for transition to complete, then adjust timeline
      setTimeout(() => {
        ensureTimelineVisibleAndAdjust();
      }, 350);
    }
  };
  
  // Make sure the function is available globally if needed
  window.adjustTimelineLine = adjustTimelineLine;
  window.ensureTimelineVisibleAndAdjust = ensureTimelineVisibleAndAdjust;
  window.equalizeTimelineWidths = equalizeTimelineWidths;


  // Function to position sections below navbar
  function positionSections() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    
    if (navbar) {
      const navHeight = navbar.offsetHeight;
      
      sections.forEach(section => {
        section.style.top = `${navHeight}px`;
        // Adjust height so section doesn't overflow the viewport
        section.style.height = `calc(100dvh - ${navHeight}px)`;
      });
    }
  }

  // Call inside DOMContentLoaded
  positionSections();

  // Re-calculate on window resize to keep it responsive
  window.addEventListener('resize', positionSections);
  window.addEventListener('resize', adjustTimelineLine);

  // Optimize project cards
  optimizeProjectCards();
  
  // Re-optimize on resize
  window.addEventListener('resize', optimizeProjectCards);


  // Function for Projects
  const projectCards = document.querySelectorAll('#projects .card');

  projectCards.forEach(card => {
    const cardBody = card.querySelector('.card-body');
    const cardText = card.querySelector('.card-text');
    
    card.addEventListener('mouseenter', () => {
      // Temporarily remove clamp to measure full content height
      cardText.style.display = 'block';
      cardText.style.webkitLineClamp = 'unset';
      
      // Calculate heights
      const fullTextHeight = cardText.scrollHeight;
      
      // Calculate what the body height should be:
      // (Total Body Height) = (Body Padding/Gaps) + (Title Height) + (Full Text Height) + (Skills Height)
      const titleHeight = card.querySelector('.card-title').offsetHeight;
      const skillsHeight = card.querySelector('.card-skill').offsetHeight;
      const paddingAndGaps = 40; // Adjust based on your padding/gap CSS
      
      const totalRequiredHeight = titleHeight + fullTextHeight + skillsHeight + paddingAndGaps + 0;
      const parentHeight = card.offsetHeight;
      
      // Set the height in pixels (capped at card height so it doesn't overflow the whole card)
      const finalHeight = Math.min(totalRequiredHeight, parentHeight);
      cardBody.style.height = `${finalHeight}px`;

      // Add this line to pass the height to CSS
      card.style.setProperty('--final-body-height', `${finalHeight}px`);
    });

    card.addEventListener('mouseleave', () => {
      // Reset to original 50% height defined in CSS
      cardBody.style.height = '50%';
      
      // Note: The CSS transition handles the smooth return
      setTimeout(() => {
          cardText.style.display = '';
          cardText.style.webkitLineClamp = '';
      }, 400); // Matches CSS transition time
    });
  });

  initProjectPopup();


  // --- START MAP LOGIC ---
  const myLocation = [23.77293261002442, 90.42777728926725]; 
  let map, userMarker, polyline, distanceControl;

  // Define the Distance Control Class
  const DistanceBox = L.Control.extend({
    onAdd: function() {
      this._div = L.DomUtil.create('div', 'distance-info-box');
      this._div.innerHTML = 'Calculating distance...';
      return this._div;
    },
    update: function(dist) {
      this._div.innerHTML = `📍 Distance: <b>${dist} km</b> Away`;
    }
  });

  function initMap() {
    // Check if container exists to prevent errors
    if(!document.getElementById('contactMap')) return;

    // Define Layers
    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Tanzim'
    });

    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tanzim'
    });

    // Initialize Map
    map = L.map('contactMap', {
      center: myLocation,
      zoom: 13,
      layers: [osm] // Default
    });

    // Add Layer Switcher
    const baseMaps = {
      "OSM": osm,
      "Satellite": satellite
    };
    
    // Add the control
    L.control.layers(baseMaps, null, { 
        position: 'topright',
        collapsed: true // Ensures it shows as an icon first
    }).addTo(map);

    // Add My Marker
    const myMarker = L.marker(myLocation).addTo(map);
    myMarker.on('mouseover', function() { 
      this.bindPopup("<b>I'm Here</b>").openPopup(); 
    });
    myMarker.on('mouseout', function() { this.closePopup(); });
  }

  // Initialize immediately
  initMap();

  // Handle Location Request
  const askBtn = document.getElementById('askLocationBtn');
  if (askBtn) {
    askBtn.addEventListener('click', function() {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition((position) => {
        const userLoc = [position.coords.latitude, position.coords.longitude];
        const userLatLng = L.latLng(userLoc);
        const myLatLng = L.latLng(myLocation);
        const distanceKm = (userLatLng.distanceTo(myLatLng) / 1000).toFixed(2);

        // UI cleanup
        const overlay = document.getElementById('locationOverlay');
        if (overlay) overlay.style.display = 'none';

        // Add User Marker
        if (userMarker) map.removeLayer(userMarker);
        userMarker = L.marker(userLoc).addTo(map);

        userMarker.on('mouseover', function() { 
          this.bindPopup(`<b>You're Here</b>`).openPopup(); 
        });
        userMarker.on('mouseout', function() { this.closePopup(); });

        // Prepare the Bounds
        const group = new L.featureGroup([userMarker, L.marker(myLocation)]);
        const bounds = group.getBounds().pad(0.3);

        // Smooth Fly to show both locations
        map.flyToBounds(bounds, {
          padding: [50, 50],
          duration: 2, // Seconds
          easeLinearity: 0.25
        });

        // Draw the line after the "fly" starts
        setTimeout(() => {
          if (polyline) map.removeLayer(polyline);
          
          polyline = L.polyline([userLoc, myLocation], {
            className: 'rainbow-line', // New class for animation
            weight: 5
          }).addTo(map);

          // Update Distance Box
          if (!distanceControl) {
            distanceControl = new DistanceBox({ position: 'bottomleft' });
            distanceControl.addTo(map);
          }
          distanceControl.update(distanceKm);
        }, 1000); // Start drawing halfway through the fly

      }, (error) => {
        alert("Unable to retrieve your location. Please allow access.");
      });
    });
  }

  function alignContactIcons() {
    const contactSection = document.querySelector("#contact");
    if (!contactSection) return;

    const card = contactSection.querySelector(".contact-info-card");
    const linkedinIcon = contactSection.querySelector(".fa-linkedin-in");
    const mailIcon = contactSection.querySelector('ion-icon[name="mail-outline"]');
    const contactsList = contactSection.querySelector(".contacts-list");

    if (!card || !linkedinIcon || !mailIcon || !contactsList) return;

    const cardRect = card.getBoundingClientRect();
    const linkedinRect = linkedinIcon.getBoundingClientRect();
    const mailRect = mailIcon.getBoundingClientRect();

    // Horizontal center positions
    const linkedinCenterX = linkedinRect.left + linkedinRect.width / 2;
    const mailCenterX = mailRect.left + mailRect.width / 2;

    // Distance from card left
    const targetDistance = linkedinCenterX - cardRect.left;
    const currentDistance = mailCenterX - cardRect.left;

    const delta = targetDistance - currentDistance;

    const basePadding =
      parseFloat(contactsList.dataset.basePadding) ||
      parseFloat(getComputedStyle(contactsList).paddingLeft) ||
      0;

    // Store original padding once
    if (!contactsList.dataset.basePadding) {
      contactsList.dataset.basePadding = basePadding;
    }

    contactsList.style.paddingLeft = `${basePadding + delta}px`;
  }

  /* Run after icons & layout load */
  window.addEventListener("load", alignContactIcons);

  /* Recalculate on resize */
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(alignContactIcons);
  });

});