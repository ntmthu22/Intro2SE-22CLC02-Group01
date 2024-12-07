const generalController = {
  getIndex: (req, res, next) => {
    let successMessage = req.flash("success");

    if (successMessage.length > 0) {
      successMessage = successMessage[0];
    } else {
      successMessage = null;
    }
    
    res.render("general/index", {
      pageTitle: "Home",
      path: "/",
      user: req.user,
      successMessage: successMessage,
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
