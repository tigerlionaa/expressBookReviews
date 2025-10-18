const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Helper function to check if a username is valid (exists)
const isValid = (username)=>{
    return users.some(user => user.username === username);
}

// Helper function to check if username and password match our records
const authenticatedUser = (username,password)=>{
    return users.some(user => user.username === username && user.password === password);
}

// Task 7: Only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in. Username and password are required."});
    }

    if (authenticatedUser(username,password)) {
        // Create a JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 }); // Token expires in 1 hour

        // Save user credentials in the session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.user.data; // Get username from the JWT payload

    if (!reviewText) {
        return res.status(400).json({message: "Review text is required."});
    }

    if (books[isbn]) {
        // Add or update the review
        books[isbn].reviews[username] = reviewText;
        return res.status(200).json({message: `The review for the book with ISBN ${isbn} has been added/updated.`});
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data; // Get username from the JWT payload

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            // Delete the user's review
            delete books[isbn].reviews[username];
            return res.status(200).json({message: `Review for the book with ISBN ${isbn} by user ${username} deleted.`});
        } else {
            return res.status(404).json({message: `No review found by user ${username} for the book with ISBN ${isbn}.`});
        }
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;