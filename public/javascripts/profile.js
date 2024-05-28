document.addEventListener('DOMContentLoaded', () => {
  const jwtToken = Auth.getAccessToken();

  if (!jwtToken) {
    window.location.href = '/login';
    return;
  }

  fetch('/api/user/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  })
    .then(response => {
      if (!response.ok) {
        if (response.status === 401) {
          return Auth.refreshAccessToken()
            .then(() =>
              fetch('/api/user/profile', {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${Auth.getAccessToken()}`,
                },
              }),
            )
            .catch(error => {
              if (error.message === 'Failed to refresh access token') {
                Auth.removeTokens();
                window.location.href = '/login';
              } else {
                throw error;
              }
            });
        }

        throw new Error('Network response was not ok');
      }

      return response.json();
    })
    .then(user => {
      document.querySelector('#profileName').textContent = user.name;
      document.querySelector('#profileEmail').textContent = user.email;

      fetch('/api/user/profile/avatar', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${Auth.getAccessToken()}`,
        },
      })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          document.querySelector('#profileAvatar').src = url;
        });
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
