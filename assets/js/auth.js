const apiURL = 'http://localhost:3000/users';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const res = await fetch(`${apiURL}?email=${email}&password=${password}`);
        const users = await res.json();

        if (users.length > 0) {
          alert(`Welcome, ${users[0].firstName}`);
          localStorage.setItem('loggedInUser', JSON.stringify(users[0]));
          window.location.href = 'landing.html';
        } else {
          alert('Invalid credentials');
        }
      } catch (error) {
        console.error(error);
        alert('Login failed');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName = document.getElementById('lastName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const gender = document.getElementById('gender').value;
      const password = document.getElementById('regPassword').value.trim();
      const confirmPassword = document.getElementById('confirmPassword').value.trim();

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const res = await fetch(apiURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, gender, password })
        });

        if (res.ok) {
          alert('Registration successful!');
          registerForm.reset();
          const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('registerModal'));
          modal.hide();
        } else {
          alert('Registration failed');
        }
      } catch (err) {
        console.error(err);
        alert('Something went wrong');
      }
    });
  }
});
