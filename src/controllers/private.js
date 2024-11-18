exports.getIndex = (req, res, next) => {
  res.render("home/index", {
    pageTitle: "Home",
    path: '/',
  });
};

exports.getFeatures = (req, res, next) => {
  res.render("home/features", {
    pageTitle: "Features",
    path: '/features',
  });
};

exports.getTestimonials = (req, res, next) => {
  res.render("home/testimonials", {
    pageTitle: "Testimonials",
    path: '/testimonials',
  });
};

exports.getAboutUs = (req, res, next) => {
  res.render("home/about-us", {
    pageTitle: "About Us",
    path: '/about-us',
  });
};

