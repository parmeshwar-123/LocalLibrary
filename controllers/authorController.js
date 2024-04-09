const { body, validationResult } = require("express-validator");
const Author = require("../models/author");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");

exports.createAuthor = async (req, res) => {
  try {
    const auther = await Author.create(req.body);
    res.status(201).json({ message: "Author created successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ first_name: 1 }).exec();

  res.render("author_list", { title: "Author List", author_list: allAuthors });
});

exports.author_detail = asyncHandler(async (req, res, next) => {
  const authorId = req.params.id;
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(authorId).exec(),
    Book.find({ author: authorId }, "title summary").exec(),
  ]);

  if (author === null) {
    const err = new Error("Author not found!");
    err.status = 404;
    return next(err);
  }

  res.render("author_details", {
    title: "Author Details",
    author: author,
    author_books: allBooksByAuthor,
  });
});

exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
});

// Handle Author create on POST.
exports.author_create_post = [
    // Validate and sanitize fields.
    body("first_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("First name must be specified.")
      .isAlphanumeric()
      .withMessage("First name has non-alphanumeric characters."),
    body("last_name")
      .trim()
      .isLength({ min: 1 })
      .escape()
      .withMessage("Family name must be specified.")
      .isAlphanumeric()
      .withMessage("Family name has non-alphanumeric characters."),
    body("date_of_birth", "Invalid date of birth")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
    body("date_of_death", "Invalid date of death")
      .optional({ values: "falsy" })
      .isISO8601()
      .toDate(),
  
    // Process request after validation and sanitization.
    asyncHandler(async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create Author object with escaped and trimmed data
      const author = new Author({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render("author_form", {
          title: "Create Author",
          author: author,
          errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid.
  
        // Save author.
        await author.save();
        // Redirect to new author record.
        res.redirect(author.url);
      }
    }),
  ];  

exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});


exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("Author update Get");
});

exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("Author update Post");
});
