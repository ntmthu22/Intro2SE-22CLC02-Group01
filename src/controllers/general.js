exports.getIndex = (req, res, next) => {
  res.render("general/index", {
    pageTitle: "Home",
    path: "/",
  });
};

exports.getFeatures = (req, res, next) => {
  res.render("general/features", {
    pageTitle: "Features",
    path: "/features",
  });
};

exports.getTestimonials = (req, res, next) => {
  res.render("general/testimonials", {
    pageTitle: "Testimonials",
    path: "/testimonials",
  });
};

exports.getAboutUs = (req, res, next) => {
  res.render("general/about-us", {
    pageTitle: "About Us",
    path: "/about-us",
  });
};
