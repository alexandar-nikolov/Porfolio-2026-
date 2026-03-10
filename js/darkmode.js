// Retrieve the current mode from local storage (if available)
const savedMode = localStorage.getItem("darkMode");

// Set initial mode based on saved value or default to dark mode
const isDarkMode = savedMode ? savedMode === "dark" : true;
document.documentElement.classList.toggle("dark-theme", isDarkMode);

// Update button text and icon based on saved mode
const btnText = document.getElementById("btnText");
const btnIcon = document.querySelector(".toggle-icon");
updateButtonTextAndIcon(isDarkMode);

function updateButtonTextAndIcon(isDarkMode) {
  if (isDarkMode) {
    btnIcon.classList.remove("fa-moon");
    btnIcon.classList.add("fa-sun");
    btnText.innerHTML = "Light";
  } else {
    btnIcon.classList.remove("fa-sun");
    btnIcon.classList.add("fa-moon");
    btnText.innerHTML = "Dark";
  }
}

const btn = document.getElementById("btn");

btn.onclick = function () {
  // Toggle dark mode
  document.documentElement.classList.toggle("dark-theme");
  const newMode = document.documentElement.classList.contains("dark-theme") ? "dark" : "light";

  // Save the mode to local storage
  localStorage.setItem("darkMode", newMode);

  // Update button text and icon
  updateButtonTextAndIcon(newMode === "dark");
};
