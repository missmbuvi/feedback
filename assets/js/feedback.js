const loggedInUser = JSON.parse(localStorage.getItem('user'));
if (!loggedInUser) {
  alert('User not found. Please log in.');
  return;
}

fetch(`http://localhost:3000/users/${loggedInUser.id}`)
  .then(res => res.json())
  .then(user => {
    const updatedPoints = Number(user.points || 0) + 25;
    return fetch(`http://localhost:3000/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points: updatedPoints })
    });
  })
  .then(() => {
    console.log("Points updated!");
    window.location.href = 'profile.html';
  })
  .catch(err => {
    console.error("Error updating points:", err);
    alert('Failed to update your reward progress.');
  });
