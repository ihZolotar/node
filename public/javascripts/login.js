document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#loginForm');

  const fetchWithAuth = (url, options = {}) => {
    options = {
      ...options,
      headers: { ...options.headers },
    };
    const jwtToken = Auth.getAccessToken();
    if (jwtToken) {
      options.headers.Authorization = `Bearer ${jwtToken}`;
    }

    return fetch(url, options);
  };

  loginForm.addEventListener('submit', event => {
    event.preventDefault();

    const email = document.querySelector('#loginEmail').value;
    const password = document.querySelector('#loginPassword').value;

    fetchWithAuth('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.accessToken && data.refreshToken) {
          Auth.setAccessToken(data.accessToken);
          Auth.setRefreshToken(data.refreshToken);
          window.location.href = '/profile';
        } else {
          console.error('Error:', data);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});
