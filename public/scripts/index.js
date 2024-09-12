let users;
  const dropdownContainer = document.querySelector('#dropdown-container');
  const dropdownTemplate = document.querySelector('#dropdown-template').innerHTML;
  const roomInput = document.querySelector('#js-room-input');
  const form = document.querySelector('#join-form');

  // Function to fetch users and render the dropdown
  async function fetchUser() {
    const userRequest = await fetch('https://chat-app-9u7m.onrender.com/getUsers', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    users = await userRequest.json();
    console.log(users);

    if (users.length > 0) {
      const html = Mustache.render(dropdownTemplate, { users });
      dropdownContainer.innerHTML = html;

      // Attach event listener to the dropdown
      const dropdown = document.querySelector('#dropdown');
      dropdown.addEventListener('change', function() {
        roomInput.value = ''; // Clear the room input if a dropdown is selected
      });
    }
  }

  fetchUser();

  // Form submit handler
  form.addEventListener('submit', function(event) {
    // Prevent default form submission
    event.preventDefault();

    const formData = new FormData(form);
    const username = formData.get('username');
    const roomFromInput = roomInput.value;
    const roomFromDropdown = document.querySelector('#dropdown').value;

    let room = roomFromInput ? roomFromInput : roomFromDropdown;

    // Build the URL query string
    let queryString = `?username=${encodeURIComponent(username)}`;
    
    // Add room to query string only if a value exists
    if (room) {
      queryString += `&room=${encodeURIComponent(room)}`;
    }

    // Redirect to the constructed URL
    window.location.href = form.action + queryString;
  });