const rewardList = [
  { name: 'Free Fries', points: 100, image: 'assets/img/fries.jpeg' },
  { name: 'Free Soft Drink', points: 200, image: 'assets/img/soft drink.jpeg' },
  { name: 'Free Dessert', points: 350, image: 'assets/img/dessert.png' },
  { name: 'Free Burger', points: 500, image: 'assets/img/burger.png' },
  { name: 'Buy 1 Get 1 Free', points: 750, image: 'assets/img/free.png' },
  { name: 'Free Delivery', points: 1500, image: 'assets/img/delivery.png' },
  { name: '20% Discount', points: 3000, image: 'assets/img/20.png' },
  { name: 'Free Dinner for two', points: 5000, image: 'assets/img/two peple.png' }
];

document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!user) {
    alert('Please log in to view your profile.');
    window.location.href = 'index.html';
    return;
  }

  const profileSection = document.querySelector('.profile-section div');
  if (profileSection) {
    profileSection.querySelector('h4').textContent = `${user.firstName} ${user.lastName}`;
    profileSection.querySelector('p').textContent = user.email;
  }

  const profileImg = document.querySelector('.profile-section img');
  if (user.avatarUrl) {
    profileImg.src = user.avatarUrl;
  }

  const updateProgressBar = (points) => {
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const maxPoints = 5000;
    const percentage = Math.min((points / maxPoints) * 100, 100);

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      progressBar.setAttribute('aria-valuenow', points);
    }

    if (progressText) {
      progressText.textContent = `You’ve earned ${points} out of ${maxPoints} points`;
    }
  };

  const syncRewardCards = (points, claimedRewards = []) => {
    const rewardsContainer = document.querySelector('.rewards-scroll');
    const template = document.getElementById('rewardTemplate');

    const existingCards = rewardsContainer.querySelectorAll('.reward-card');
    existingCards.forEach(card => {
      if (!card.classList.contains('d-none')) {
        card.remove();
      }
    });

    rewardList.forEach(reward => {
      const clone = template.cloneNode(true);
      clone.classList.remove('d-none');
      clone.querySelector('img').src = reward.image;
      clone.querySelector('.reward-name').textContent = reward.name;
      clone.querySelector('.reward-points').textContent = `${reward.points} Points`;
      const button = clone.querySelector('.reward-btn');

      if (claimedRewards.includes(reward.name)) {
        button.textContent = 'Claimed';
        button.className = 'btn btn-secondary reward-btn';
        button.disabled = true;
      } else if (points >= reward.points) {
        button.textContent = 'Claim';
        button.className = 'btn btn-success reward-btn';
        button.disabled = false;
        button.addEventListener('click', () => handleRewardClaim(reward.name));
      } else {
        button.textContent = 'Locked';
        button.className = 'btn btn-danger reward-btn';
        button.disabled = true;
      }

      rewardsContainer.appendChild(clone);

      // Show reward popup for the most recently claimed one
      const recentlyClaimed = localStorage.getItem("recentlyClaimedReward");
      if (recentlyClaimed && recentlyClaimed === reward.name) {
        document.getElementById('rewardName').textContent = reward.name;
        document.getElementById('rewardPopup').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
        localStorage.removeItem("recentlyClaimedReward");
      }
    });
  };

  const handleRewardClaim = async (rewardName, card) => {
    let latestUser;
    try {
      const res = await fetch(`http://localhost:3000/users/${user.id}`);
      latestUser = await res.json();
    } catch (err) {
      console.error("Failed to fetch user for claiming reward:", err);
      return alert("Could not process reward at this time.");
    }

    const claimed = latestUser.claimedRewards || [];
    if (claimed.includes(rewardName)) return;

    claimed.push(rewardName);
    const updatedUser = { ...latestUser, claimedRewards: claimed };

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const freshUser = await response.json();
        localStorage.setItem('loggedInUser', JSON.stringify(freshUser));
        updateProgressBar(freshUser.points);
        
        // Delay showing popup until DOM is re-synced
        syncRewardCards(freshUser.points, freshUser.claimedRewards);

        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
          document.getElementById('rewardName').textContent = rewardName;
          document.getElementById('rewardPopup').style.display = 'block';
          document.getElementById('overlay').style.display = 'block';
        }, 50);
      } else {
        alert('Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Something went wrong');
    }
  };


  // Initial load
  fetch(`http://localhost:3000/users/${user.id}`)
    .then(res => res.json())
    .then(latestUser => {
      localStorage.setItem('loggedInUser', JSON.stringify(latestUser));
      updateProgressBar(latestUser.points || 0);
      syncRewardCards(latestUser.points || 0, latestUser.claimedRewards || []);
    })
    .catch(err => {
      console.error('Failed to fetch user progress:', err);
    });

  // Edit profile modal
  const editBtn = document.querySelector('.edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      document.getElementById('firstNameInput').value = user.firstName;
      document.getElementById('lastNameInput').value = user.lastName;
      document.getElementById('emailInput').value = user.email;
      const modal = new bootstrap.Modal(document.getElementById('editProfileModal'));
      modal.show();
    });
  }

  const editForm = document.getElementById('editProfileForm');
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      firstName: document.getElementById('firstNameInput').value,
      lastName: document.getElementById('lastNameInput').value,
      email: document.getElementById('emailInput').value,
    };

    const newPassword = document.getElementById('passwordInput').value;
    if (newPassword) {
      updatedUser.password = newPassword;
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        const newUser = await response.json();
        localStorage.setItem('loggedInUser', JSON.stringify(newUser));
        alert('Profile updated successfully');
        location.reload();
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Something went wrong');
    }
  });

  // Popup controls
  document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('rewardPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  });

  document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('rewardPopup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
  });
});

//Logout

document.addEventListener('DOMContentLoaded', function () {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('loggedInUser');
      window.location.href = 'index.html';
    });
  }
});
