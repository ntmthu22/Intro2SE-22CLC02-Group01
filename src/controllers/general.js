const generalController = {
  getIndex: (req, res, next) => {
    res.render("general/index", {
      pageTitle: "Home",
      path: "/",
      user: req.user,
    });
  },

  getFeatures: (req, res, next) => {
    res.render("general/features", {
      pageTitle: "Features",
      path: "/features",
      user: req.user,
    });
  },

  getTestimonials: (req, res, next) => {
    res.render("general/testimonials", {
      pageTitle: "Testimonials",
      path: "/testimonials",
      user: req.user,
    });
  },

  getAboutUs: (req, res, next) => {
    res.render("general/about-us", {
      pageTitle: "About Us",
      path: "/about-us",
      user: req.user,
    });
  },
};

export default generalController;
