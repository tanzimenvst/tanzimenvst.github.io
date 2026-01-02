let isPopupOpen = false;

// Projects Popup function to track popup state
function initProjectPopup() {
  const popup = document.getElementById('projectPopup');
  const navbar = document.querySelector('.navbar');
  const sidebarList = document.getElementById('sidebarProjectList');
  const closeBtn = document.getElementById('closePopup');
  const contentArea = document.getElementById('projectContentPlaceholder');
  const projectCards = document.querySelectorAll('#projects .card');

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
    // textContent is more reliable for hidden/styled elements than innerText
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
      // if (fileName === 'code-line-counter.html' || fileName === 'csv-to-dem.html' || fileName === 'map-content-extractor.html') {
      contentArea.innerHTML = `
          <iframe src="./projects/${fileName}"
                  id="projectFrame"
                  style="width: 100%;" 
                  title="${title}"
                  onload="this.style.height = this.contentWindow.document.body.scrollHeight + 'px';">
          </iframe>`;
      // return;
      // }

      // Fetches HTML from the /projects/ folder
      // const response = await fetch(`./projects/${fileName}`);
      // if (!response.ok) throw new Error('File not found');
      
      // const html = await response.text();
      // contentArea.innerHTML = html;

      // if (fileName === 'route-tracker.html' || fileName === 'land-zoning-gis.html') {
      //   // Extract scripts from the fetched HTML
      //   const scripts = contentArea.querySelectorAll('script');
      //   scripts.forEach(oldScript => {
      //       const newScript = document.createElement('script');
      //       newScript.text = oldScript.text;
      //       document.head.appendChild(newScript).parentNode.removeChild(newScript);
      //   });

      //   // Give the browser 100ms to render the #map div before initializing Leaflet
      //   setTimeout(() => {
      //       if (typeof window.initRouteTrackerMap === 'function') {
      //           window.initRouteTrackerMap();
      //       }
      //   }, 100);
      // }

      // if (fileName === 'currency-app.html') {
      //   // Initialize the carousel manually to ensure auto-play starts immediately
      //   const myCarousel = document.querySelector('#projectCarousel');
      //   const carousel = new bootstrap.Carousel(myCarousel, {
      //     interval: 5000,
      //     ride: 'carousel',
      //     pause: 'hover' // Optional: pauses when user hovers
      //   });
      // }

      
      // Reset scroll position of the content area
      document.querySelector('.project-display-area').scrollTop = 0;
    } catch (err) {
      contentArea.innerHTML = `
        <div class="alert alert-info mt-4 shadow-sm d-flex align-items-stretch p-0 overflow-hidden">
          <div class="bg-info d-flex align-items-center justify-content-center px-4 text-white">
            <i class="bi bi-info-circle fs-2"></i>
          </div>
          
          <div class="p-3">
            <h4 class="alert-heading mb-1">Project Details</h4>
            <p class="mb-0">The content for <b>${title}</b> is currently being updated.</p>
          </div>
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

  // Open Popup when clicking a Card
  projectCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      updateModalSizing(); // Recalculate size before showing
      popup.classList.add('active');
      document.body.classList.add('modal-open'); // Prevents background scroll
      isPopupOpen = true; // Set the flag
      
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
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    if (popup.classList.contains('active')) {
      updateModalSizing();
    }
  });
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

  // We use requestAnimationFrame to ensure the browser has painted the grid first
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
    if (isAnimating || isPopupOpen) return;
    
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
    if (isAnimating || isPopupOpen) return;
    
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
      }
      
      goToSection(index);
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
      }, 400); // Matches your CSS transition time
    });
  });

  initProjectPopup();


  // --- START MAP LOGIC ---
  const myLocation = [23.77293261002442, 90.42777728926725]; 
  let map, userMarker, polyline, distanceControl; // Define distanceControl in parent scope

  // 1. Define the Distance Control Class
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
});