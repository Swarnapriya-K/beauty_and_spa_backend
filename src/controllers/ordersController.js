const getHelloWorld = (req, res) => {
  res.json({ message: "Hello World from Orders API!" });
};

module.exports = { getHelloWorld };
