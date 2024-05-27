document.addEventListener('DOMContentLoaded', () => {
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

  fetchWithAuth('/api/auth/logout', {
    method: 'POST',
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      Auth.removeTokens();
      window.location.href = '/login';
    })
    .catch(error => {
      console.error('Error:', error);
    });
});
