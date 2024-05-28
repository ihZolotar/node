class Auth {
  static getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  static setAccessToken(token) {
    localStorage.setItem('accessToken', token);
  }

  static setRefreshToken(token) {
    localStorage.setItem('refreshToken', token);
  }

  static removeTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  static async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    const response = await fetch('/api/auth/token/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    this.setAccessToken(data.accessToken);
  }
}
