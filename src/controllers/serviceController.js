const getHelloWorld = (req, res) => {
  res.json({ message: "Hello World from Services API!" });
};

module.exports = { getHelloWorld };
