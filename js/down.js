$(document).ready(function() {
    $('.nav li').click(function() {
        var dropdown = $(this).find('.dropdown');
        var isDropdownVisible = dropdown.is(':visible');

        $('.dropdown').not(dropdown).slideUp(200); 

        if (isDropdownVisible) {
            dropdown.slideUp(200);
        } else {
            dropdown.slideDown(200);
        }

        // Toggle button visibility based on dropdown state
        if ($('.dropdown:visible').length > 0) {
            $('#btnAdd').hide();
        } else {
            $('#btnAdd').show();
        }

        // Save the state of the dropdown in local storage
        localStorage.setItem('activeDropdown', $(this).attr('id'));
        
        // Remove active class from all navigation items
        $('.nav li a').removeClass('active');
        // Add active class to the clicked navigation item
        $(this).children('a').addClass('active');
    });

    // Add a click event listener to the logo
    $('.logo a').click(function(event) {
        var isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
        if (isHomePage) {
            event.preventDefault(); // Prevent default action only if on the homepage
            $('.dropdown').slideUp(200); // Close all dropdowns
            $('#btnAdd').show(); // Show the button
            // Remove active class from all navigation items
            $('.nav li a').removeClass('active');
            // Add active class to the Home navigation item
            $('#homeNav').addClass('active');
            // Clear the saved state in local storage
            localStorage.removeItem('activeDropdown');
        } else {
            $('.dropdown').slideUp(200); // Close all dropdowns
            $('#btnAdd').show(); // Show the button
        }
    });

    // Add a click event listener to the Outcomes button
    $('.btn.contact-me').click(function() {
        $('#outcome').click(); // Trigger a click event on the corresponding navigation item
    });

    // Add a click event listener to the Projects button
    $('.btn.contact-me2').click(function() {
        $('#project').click(); // Trigger a click event on the corresponding navigation item
    });

    // On page load, check if there was an active dropdown
    var activeDropdownId = localStorage.getItem('activeDropdown');
    if (activeDropdownId !== null) {
        $('#' + activeDropdownId).find('.dropdown').slideDown(200);
        $('#' + activeDropdownId).children('a').addClass('active');
        $('#btnAdd').hide(); // Hide the button if a dropdown is active
    }

    // On page load, close dropdowns if on the homepage
    var isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    if (isHomePage) {
        $('.dropdown').slideUp(200); // Close all dropdowns
        $('#btnAdd').show(); // Show the button
        $('.nav li a').removeClass('active'); // Remove active class from all navigation items
        $('#homeNav').addClass('active'); // Add active class to the Home navigation item
        localStorage.removeItem('activeDropdown'); // Clear the saved state in local storage
    }

    // Ensure the correct navigation item is highlighted if navigating to a section of the index.html page
    function highlightNavigationItem() {
        var hash = window.location.hash;
        if (hash) {
            $('.nav li a').removeClass('active'); // Remove active class from all navigation items
            var targetNavItem = $('.nav li a[href$="' + hash + '"]');
            if (targetNavItem.length) {
                targetNavItem.addClass('active'); // Add active class to the target navigation item
            } else if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                $('#homeNav').addClass('active'); // Add active class to the Home navigation item if no match found
            }
        }
    }

    // Call the function to highlight the correct navigation item on page load
    highlightNavigationItem();

    // Call the function to highlight the correct navigation item on hash change
    $(window).on('hashchange', highlightNavigationItem);
});
