const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Task 6: Register a new user (No change)
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const userExists = users.some(user => user.username === username);
    if (!userExists) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user. Please provide username and password"});
});


// Task 10 (was Task 1): Get the book list available in the shop using async-await
public_users.get('/', async function (req, res) {
  try {
    const allBooks = await new Promise((resolve, reject) => {
      resolve(books);
    });
    res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    res.status(500).json({message: "An error occurred while fetching the book list."});
  }
});


// Task 11 (was Task 2): Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({message: error});
  }
 });
  

// Task 12 (was Task 3): Get book details based on author using async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
        const authorBooks = await new Promise((resolve, reject) => {
            const results = [];
            const bookKeys = Object.keys(books);
            bookKeys.forEach(key => {
                if (books[key].author === author) {
                    results.push(books[key]);
                }
            });

            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found by this author");
            }
        });
        return res.status(200).json(authorBooks);
    } catch (error) {
        return res.status(404).json({message: error});
    }
});


// Task 13 (was Task 4): Get all books based on title using async-await (CORRECTED)
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
        const titleBooks = await new Promise((resolve, reject) => {
            const results = [];
            const bookKeys = Object.keys(books);
            bookKeys.forEach(key => {
                if (books[key].title === title) {
                    results.push(books[key]);
                }
            });

            // CORRECTED: Check 'results.length' instead of 'titleBooks.length'
            if (results.length > 0) {
                resolve(results);
            } else {
                reject("No books found with this title");
            }
        });
        return res.status(200).json(titleBooks);
    } catch (error) {
        return res.status(404).json({message: error});
    }
});


// Task 5: Get book review (No change)
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn] && books[isbn].reviews) {
      return res.status(200).json(books[isbn].reviews);
  } else {
      return res.status(404).json({message: "Reviews not found for this book"});
  }
});

module.exports.general = public_users;