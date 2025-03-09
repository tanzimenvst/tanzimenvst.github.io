'use strict';

// Function to toggle class
const elementToggleFunc = function (elem) { 
  elem.classList.toggle("active"); 
};

// Sidebar toggle functionality
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

if (sidebar && sidebarBtn) {
  sidebarBtn.addEventListener("click", function () { 
    elementToggleFunc(sidebar); 
  });
}

// Custom select functionality
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]"); // Fixed typo
const filterBtn = document.querySelectorAll("[data-filter-btn]");

if (select && selectValue) {
  select.addEventListener("click", function () { 
    elementToggleFunc(this); 
  });

  // Add event listener to all select items
  selectItems.forEach(item => {
    item.addEventListener("click", function () {
      let selectedValue = this.innerText.toLowerCase();
      selectValue.innerText = this.innerText;
      elementToggleFunc(select);
      filterFunc(selectedValue);
    });
  });
}

// Filtering logic
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  filterItems.forEach(item => {
    if (selectedValue === "all" || selectedValue === item.dataset.category) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

// Filter button event handling
let lastClickedBtn = filterBtn[0];

filterBtn.forEach(btn => {
  btn.addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
});


// testimonials variables
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlays = document.querySelectorAll("[data-overlay]");

// Function to toggle modal
const toggleModal = function (modalId) {
  // Hide all overlays and modals first
  overlays.forEach(overlay => overlay.classList.remove("active"));
  
  // Show the selected modal and overlay
  const selectedOverlay = document.querySelector(`#${modalId}`);
  selectedOverlay.classList.add("active");
  modalContainer.classList.add("active");
};

// Add click event listener to all timeline items
const timelineItems = document.querySelectorAll(".timeline-item");
timelineItems.forEach(item => {
  item.addEventListener("click", function () {
    const modalId = this.getAttribute("data-modal-item");
    toggleModal(modalId);
  });
});

// Close the modal when clicking the close button or overlay
modalCloseBtn.addEventListener("click", function () {
  modalContainer.classList.remove("active");
  overlays.forEach(overlay => overlay.classList.remove("active"));
});
overlays.forEach(overlay => {
  overlay.addEventListener("click", function () {
    modalContainer.classList.remove("active");
    this.classList.remove("active");
  });
});


// Contact
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

if (form && formInputs.length > 0 && formBtn) {
  formInputs.forEach(input => {
    input.addEventListener("input", function () {
      formBtn.disabled = !form.checkValidity();
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form behavior

    const formData = new FormData(form);

    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        alert("✅ Your message has been sent successfully!");
        form.reset(); // Clear form fields
        formBtn.disabled = true; // Disable button again
      } else {
        alert("❌ Oops! Something went wrong. Please try again.");
      }
    })
    .catch(() => {
      alert("❌ Failed to send message. Check your internet connection.");
    });
  });
}


// Page Navigation Handling
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll(".navbar-link");

  // Highlight the active navigation link
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach(link => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Add smooth transition for navigation links
  navLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default navigation
      const targetPage = this.getAttribute("href");

      // Add fade-out animation to the body
      document.body.classList.add("fade-out");

      // Wait for the fade-out animation to complete, then navigate
      setTimeout(() => {
        window.location.href = targetPage;
      }, 500); // Match the duration of the fade-out animation
    });
  });
});

