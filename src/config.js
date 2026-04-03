const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:9000/api'
    : ' https://loomix-xlp4.onrender.com';

export default API_URL;