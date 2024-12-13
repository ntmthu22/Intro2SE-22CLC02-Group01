const generalController = {
  getIndex: (req, res, next) => {
    let successMessage = req.flash("success");

    if (successMessage.length > 0) {
      successMessage = successMessage[0];
    } else {
      successMessage = null;
    }

    let indexError = req.flash("indexError");

    if (indexError.length > 0) {
      indexError = indexError[0];
    } else {
      indexError = null;
    }

    res.render("general/index", {
      pageTitle: "Home",
      path: "/",
      successMessage: successMessage,
      indexError: indexError,
    });
  },

  getSamples: (req, res, next) => {
    res.render("general/samples", {
      pageTitle: "Samples",
      path: "/samples",
    });
  },

  getTestimonials: (req, res, next) => {
    res.render("general/testimonials", {
      pageTitle: "Testimonials",
      path: "/testimonials",
    });
  },

  getAboutUs: (req, res, next) => {
    res.render("general/about-us", {
      pageTitle: "About Us",
      path: "/about-us",
    });
  },
};

export default generalController;
