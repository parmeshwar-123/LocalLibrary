const { body, validationResult } = require("express-validator");
const BookInstance = require("../models/bookInstance");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find().populate("book").exec();
  console.log("allBookInstances", allBookInstances);
  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookinstance_list: allBookInstances,
  });
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate("book")
    .exec();

  if (bookInstance == null) {
    const err = new Error("Book copy not found!");
    err.status = 404;
    return next(err);
  }

  res.render("bookinstance_details", {
    title: "Book Instance Details",
    bookinstance: bookInstance,
  });
});

exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();

  res.render("bookinstance_form", {
    title: "Create BookInstance",
    book_list: allBooks,
  });
});

exports.bookinstance_create_post = [
    body("book", "Book must be specified").trim().isLength({ min: 1 }).escape(),
    body("imprint", "Imprint must be specified")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
  
    asyncHandler(async (req, res, next) => {
      const errors = validationResult(req);
  
      const bookInstance = new BookInstance({
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back,
      });
  
      if (!errors.isEmpty()) {
        const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
  
        res.render("bookinstance_form", {
          title: "Create BookInstance",
          book_list: allBooks,
          selected_book: bookInstance.book._id,
          errors: errors.array(),
          bookinstance: bookInstance,
        });
        return;
      } else {
        await bookInstance.save();
        res.redirect(bookInstance.url);
      }
    }),
  ];
  

exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send("Book Instance delete get");
});

exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send("Bool Instance delete post");
});

exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("Book Instance  Update GET");
});

exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("Book Instance Update Post");
});