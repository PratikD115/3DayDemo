exports.validTitle = (title) => {
  if (title.trim() === "") {
    throw new Error("Please enter the Title");
  }
};

exports.validGenres = (genres) => {
  if (genres.trim() === "") {
    throw new Error("Please enter the genres field");
  }
};

exports.validCategory = (category) => {
  if (category.trim() === "") {
    throw new Error("Please enter the category");
  }
};
exports.validDirector = (director) => {
  if (director.trim() === "") {
    throw new Error("Please enter the director name");
  }
};
