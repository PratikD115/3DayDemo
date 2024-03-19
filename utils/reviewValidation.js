exports.validRating = (rating) => {
  if (typeof rating !== "number") {
    throw new Error("rating Shoud be number");
  }
  if (rating > 5 || rating < 1) {
    throw new Error("rating Number should be between 1 to 5");
  }
};

exports.validSummary = (summary) => {
  if (summary.trim() === "") {
    throw new Error("Please provide summary");
  }
};

