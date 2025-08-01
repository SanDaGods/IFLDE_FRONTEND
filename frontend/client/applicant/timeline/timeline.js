const API_BASE_URL = "https://iflde-backend-production.up.railway.app";

document.addEventListener("DOMContentLoaded", function () {
    // Authentication and dropdown code remains the same
    const logoutButton = document.querySelector("#logout");

    if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
            event.preventDefault();
            sessionStorage.clear();
            localStorage.removeItem("userSession");
            window.location.href = "../Login/login.html";
        });
    }

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle");

    dropdownToggles.forEach((toggle) => {
        toggle.addEventListener("click", function (event) {
            event.preventDefault();
            const parentDropdown = toggle.parentElement;
            parentDropdown.classList.toggle("active");

            document.querySelectorAll(".dropdown").forEach((dropdown) => {
                if (dropdown !== parentDropdown) {
                    dropdown.classList.remove("active");
                }
            });
        });
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".dropdown")) {
            document.querySelectorAll(".dropdown").forEach((dropdown) => {
                dropdown.classList.remove("active");
            });
        }
    });

async function fetchApplicantStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/applicant/auth-status`, {
      credentials: 'include' // Required for cookies
    });
    
    if (!response.ok) {
      console.error(`HTTP error! Status: ${response.status}`);
      return; // Exit early if the request fails
    }
    
    const data = await response.json();
    console.log("Auth Status Response:", data); // Log full response
    
    if (data.authenticated) {
      console.log("✅ User is authenticated. Status:", data.user.status);
      updateTimeline(data.user.status);
    } else {
      console.log("❌ User is NOT authenticated. Reason:", data.message || "No token/invalid token");
      // No redirect, just log the issue
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    // No redirect, just log the error
  }
}

    function updateTimeline(status) {
        const steps = document.querySelectorAll('#progress-bar li');
        
        // Reset all steps
        steps.forEach(step => {
            step.className = 'step-todo';
        });

        // Special handling for rejected/failed states
        const timelineTitle = document.querySelector('.timeline');
        const resultLink = document.getElementById('result-link');

        switch(status) {
            case 'Pending Review':
                steps[0].className = 'step-active';
                break;
                
            case 'Approved':
                steps[0].className = 'step-done';
                steps[1].className = 'step-active';
                break;
                
            case 'Under Assessment':
                steps[0].className = 'step-done';
                steps[1].className = 'step-done';
                steps[2].className = 'step-active';
                break;
                
            case 'Evaluated - Passed':
                steps.forEach(step => step.className = 'step-done');
                resultLink.href = 'result.html';
                resultLink.style.pointerEvents = 'auto';
                resultLink.style.color = '';
                break;
                
            case 'Evaluated - Failed':
                steps.forEach(step => step.className = 'step-done');
                steps[4].className = 'step-failed'; // Add special class for failed state
                timelineTitle.textContent = 'Application Timeline (Not Passed)';
                resultLink.href = 'result.html';
                resultLink.style.pointerEvents = 'auto';
                resultLink.style.color = '';
                break;
                
            case 'Rejected':
                steps[0].className = 'step-done';
                steps[1].className = 'step-rejected'; // Special styling for rejection
                steps[1].querySelector('.sub-text').textContent = 'Your application was rejected';
                // Hide remaining steps
                for (let i = 2; i < steps.length; i++) {
                    steps[i].style.display = 'none';
                }
                timelineTitle.textContent = 'Application Timeline (Rejected)';
                break;
                
            default:
                steps[0].className = 'step-active';
        }
    }

    // Initialize the timeline
    fetchApplicantStatus();
});

