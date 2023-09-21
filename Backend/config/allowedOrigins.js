const allowedOrigins = [
    // 'http://localhost:3000', // this is my front-end url for development
    process.env.FRONTEND_URL,
    // 'chrome-untrusted://new-tab-page', 
]

module.exports = allowedOrigins;