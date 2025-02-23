const routes = (app) => {
  app.use("/api/v1/auth", require("./auth.route"));
  app.use("/api/v1/donation", require("./donation.route"));
  app.use("/api/v1/doner", require("./doner.route"));
  app.use("/api/v1/hospital-request", require("./hospitalRequest.route"));
};

module.exports = routes;
