// middlewares/auth.js
const { validateToken } = require("../services/authentication");

function checkforAuthenicationCookie(CookieName) {  // Make sure to pass the correct cookie name
    return (req, res, next) => {  // Use '=>' for the middleware function
        const tokenCookieValue = req.cookies[CookieName];

        if (!tokenCookieValue) {
            return next(); // Call 'next()' to proceed if there's no token
        }

        try {
            // Validate the token and attach user data to 'req.user'
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
        } catch (error) {
            console.error("Invalid token:", error); // Log the error for debugging
        }

        next();  // Call 'next()' to proceed after processing the token
    };
}

module.exports = {
    checkforAuthenicationCookie,
};
