var routes = function(app) {
  app.get("/", function(req, res) {
    res.sendFile("views/index.html");
    console.log("Received GET");
  });
  
  app.get("assets/:folder/:name", function(req, res) {
    var folder = req.params.folder;
    var file = req.params.name;
    res.sendFile("assets/" + folder + "/" + file);
    console.log(`Received GET at ${folder}/${file}`);
  });
};
 
module.exports = routes;