const Order = require("../models/Order");
const Product = require("../models/Product");
const XLSX = require("xlsx");
const csv = require("fast-csv");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const addOrder = async (req, res) => {
  try {
    const { orderItems, ...orderData } = req.body;

    const customerDetails = {
      phone: orderData.phone,
      email: orderData.email,
      firstName: orderData.firstName,
      lastName: orderData.lastName
    };

    // Validate required fields
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one order item is required"
      });
    }

    // Verify products and calculate total
    let totalAmount = 0;
    const verifiedItems = [];

    for (const item of orderItems) {
      const product = await Product.findById(item.productId._id);

      if (product.length > 0) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId.productName} not found`
        });
      }

      // if (product.stock < item.quantity) {
      //   return res.status(400).json({
      //     success: false,
      //     message: `Insufficient stock for ${product.productName}`
      //   });
      // }

      verifiedItems.push({
        productId: item.productId._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.productPrice
      });

      totalAmount += product.productPrice * item.quantity;
    }

    console.log({ verifiedItems, orderData });
    // Create new order
    const order = new Order({
      customerDetails,
      user: req.user.id,
      itemDetails: verifiedItems,
      totalAmount
    });

    // Save order
    const savedOrder = await order.save();

    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("orderItems.product", "productName productPrice");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Authorization check
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order"
      });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        customer: {
          firstName: order.firstName,
          lastName: order.lastName,
          email: order.email,
          phone: order.phone
        },
        shippingAddress: {
          street: order.streetAddress,
          city: order.city,
          state: order.state,
          zipCode: order.zipCode,
          country: order.country
        },
        items: order.orderItems.map((item) => ({
          product: item.product.productName,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity
        })),
        totalAmount: order.totalAmount,
        orderDate: order.createdAt,
        status: order.orderStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving asdfasdfsdf order",
      error: error.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find();

    // Transform the data
    const flattenedData = orders.map((row) => ({
      OrderID: row.id,
      Date:
        row.formattedDate ||
        new Date(row.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric"
        }),
      Customer: `${row.customerDetails.firstName} ${row.customerDetails.lastName}`,
      Payment: row.paymentDetails.status,
      Total: row.totalAmount,
      "No.Of.Items": row.itemDetails.length,
      Status: row.orderStatus
    }));

    // Respond with the flattened data
    res.status(200).json({
      success: true,
      orders: flattenedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving ordeasfasdfqwerr",
      error: error.message
    });
  }
};

const exportOrdersCsv = async (req, res) => {
  try {
    const orders = await Order.find().exec();
    console.log(orders);

    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    res.setHeader("Content-Type", "text/csv");

    const flattenedData = orders.map((row) => ({
      OrderID: row.id,
      Date: row.formattedDate,
      Customer: row.customerDetails.firstName + row.customerDetails.lastName,
      Payment: row.paymentDetails.status,
      Total: row.totalAmount,
      "No.Of.Items": row.itemDetails.length,
      Status: row.orderStatus
    }));

    const csvStream = csv.format({ headers: true });
    csvStream.pipe(res);
    flattenedData.forEach((row) => csvStream.write(row));
    csvStream.end();
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Internal service error");
  }
};

const exportOrdersExcel = async (req, res) => {
  try {
    const orders = await Order.find().exec();

    const flattenedData = orders.map((row) => ({
      OrderID: row.id,
      Date: row.formattedDate,
      Customer: row.customerDetails.firstName + row.customerDetails.lastName,
      Payment: row.paymentDetails.status,
      Total: row.totalAmount,
      "No.Of.Items": row.itemDetails.length,
      Status: row.orderStatus
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

    const filepath = "products.xlsx";
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, "products.xlsx", (err) => {
      if (err) console.log("error", err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};
const exportOrdersPdf = async (req, res) => {
  try {
    const orders = await Order.find().exec();

    const flattenedData = orders.map((row) => ({
      OrderID: row.id,
      Date: row.formattedDate,
      Customer: row.customerDetails.firstName + row.customerDetails.lastName,
      Payment: row.paymentDetails.status,
      Total: row.totalAmount,
      "No.Of.Items": row.itemDetails.length,
      Status: row.orderStatus
    }));

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=products.pdf");

    // Create a PDF document and pipe it to the response
    const pdfDoc = new PDFDocument();
    pdfDoc.pipe(res);

    // Add content to the PDF
    pdfDoc.fontSize(16).text("Orders List", { align: "center" });
    pdfDoc.moveDown();

    flattenedData.forEach((order, index) => {
      pdfDoc
        .fontSize(12)
        .text(`OrderID: ${order.OrderID}`)
        .text(`Date: ${order.Date}`)
        .text(`Customer: ${order.Customer}`)
        .text(`Payment: ${order.Payment}`)
        .text(`Total: ${order.Total}`)
        .text(`No. Of Items: ${order["No.Of.Items"]}`)
        .text(`Status: ${order.Status}`)
        .moveDown();
    });

    // Finalize the PDF
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
};

module.exports = {
  addOrder,
  getOrder,
  getOrders,
  exportOrdersCsv,
  exportOrdersExcel,
  exportOrdersPdf
};
