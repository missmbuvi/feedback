let selectedRestaurantId = null;

// Open feedback modal
function leaveFeedback(restaurantId) {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    alert('Please log in first.');
    return;
  }

  $.get(`http://127.0.0.1:3000/feedback?userId=${loggedInUser.id}&restaurantId=${restaurantId}`, function (existingFeedback) {
    if (existingFeedback.length > 0) {
      alert('You have already submitted feedback for this restaurant.');
    } else {
      selectedRestaurantId = restaurantId;
      $('#feedback-modal').removeClass('d-none').addClass('d-block');
    }
  });
}

$(document).ready(function () {
  const apiURL = 'http://127.0.0.1:3000/restaurants';

  // Load and display restaurants
  $.get(apiURL, function (data) {
    const $container = $('#restaurant-list');
    $container.empty().addClass('row');

    data.forEach(restaurant => {
      $container.append(`
        <div class="col-lg-3 col-md-4 col-12 mb-4">
          <div class="card shadow-sm h-100">
            <img src="${restaurant.logoUrl}" class="card-img-top" alt="${restaurant.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${restaurant.name}</h5>
                <p class="card-text text-muted">${restaurant.location}</p>
              </div>
              <button onclick="leaveFeedback('${restaurant.id}')" class="btn btn-white mt-3 w-100" style="background-color: #5B1816; color: white; font-weight: bold; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);">Leave Feedback</button>
            </div>
          </div>
        </div>
      `);
    });
  });

  // Cancel feedback
  $('#cancel-feedback').on('click', function () {
    $('#feedback-modal').removeClass('d-block').addClass('d-none');
    $('#feedback-form')[0].reset();
  });

  // Submit feedback
  $('#feedback-form').on('submit', function (e) {
    e.preventDefault();

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      alert('Please log in first.');
      return;
    }

    const feedbackData = {
      userId: loggedInUser.id,
      userFirstName: loggedInUser.firstName,
      restaurantId: selectedRestaurantId,
      rating: $('input[name="rating"]:checked').val(),
      quality: $('input[name="quality"]:checked').val(),
      hygiene: $('input[name="hygiene"]:checked').val(),
      speed: $('input[name="speed"]:checked').val(),
      courteous: $('input[name="courteous"]:checked').val(),
      cleanliness: $('input[name="cleanliness"]:checked').val(),
      orderTime: $('input[name="orderTime"]:checked').val(),
      recommend: $('input[name="recommend"]:checked').val(),
      comments: $('textarea[name="comments"]').val(),
      timestamp: new Date().toISOString()
    };

    $.ajax({
      url: 'http://127.0.0.1:3000/feedback',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(feedbackData),
      success: function () {
        // Point incrementation after successful submission
        const newPoints = Number(loggedInUser.points || 0) + 25;

        $.ajax({
          url: `http://127.0.0.1:3000/users/${loggedInUser.id}`,
          method: 'PATCH',
          contentType: 'application/json',
          data: JSON.stringify({ points: newPoints }),
          success: function (updatedUser) {
            // Update localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            alert('Feedback submitted successfully! You earned 25 points.');
            // Redirect
            window.location.href = 'profile.html';
          },
          error: function () {
            alert('Feedback saved, but failed to update points.');
          }
        });
      },
      error: function () {
        alert('Error submitting feedback.');
      }
    });
  });
});