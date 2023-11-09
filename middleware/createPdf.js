const PDFDocument = require("pdfkit-table")
const { monthly, salesData, Yearly, weekly } = require("./managements")
const { User, Products } = require("../model/Mongoose")

const createMonthly = async (req, res, next) => {
    const monthlyData = await monthly();

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="monthly_sales_report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text(`Monthly Sales Report ${monthlyData.startDate} to ${monthlyData.endDate}`);
    doc.moveDown(2);

    doc.fontSize(12).text('Company Name: Endgame Gaming');
    doc.fontSize(12).text('Sales Report From: ' + monthlyData.startDate);
    doc.fontSize(12).text('Sales Report Till: ' + monthlyData.endDate);
    doc.fontSize(12).text('Total Orders: ' + monthlyData.count);
    doc.fontSize(12).text('Total Users: ' + monthlyData.users);
    doc.fontSize(12).text('Total Products: ' + (await Products.find()).length);
    doc.fontSize(12).text('Average Sales Total Increase: ' + monthlyData.average);
    doc.fontSize(12).text('Total Revenue: ' + monthlyData.total + ' /-');
    doc.fontSize(12).text('Total Downloads: ' + monthlyData.products);
    doc.fontSize(12).text('Most Downloaded: ' + monthlyData.mostDownloaded[0].name);
    doc.fontSize(12).text('Download Count: ' + monthlyData.mostDownloaded[0].downloads);
    doc.moveDown(2);

    const orders = monthlyData.orders;

    for (const order of orders) {
        order.user = await User.findById(order.userId);
        for (const item of order.items) {
            item.data = await Products.findById(item.productId);
        }
    }

    const table = {
        headers: ['User Name', 'Order ID', 'Quantity', 'Price'],
        rows: orders.map((item) => [
            item.user.name,
            item._id.toString(),
            item.items.length.toString(),
            item.total.toString(),
        ]),
    };

    doc.table(table, {
        width: 600,
        headerLines: 1,
        align: 'center',
    });

    doc.end();
};


const Daily = async (req, res, next) => {
    const monthlyData = await salesData()


    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="daily_sales_report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text(`Daily Sales Report ${monthlyData.startDate}`);
    doc.moveDown(2);

    doc.fontSize(12).text('Company Name: Endgame Gaming');
    doc.fontSize(12).text('Sales Report From: ' + monthlyData.startDate);
    doc.fontSize(12).text('Total Orders: ' + monthlyData.count);
    doc.fontSize(12).text('Total Users: ' + monthlyData.users);
    doc.fontSize(12).text('Total Products: ' + (await Products.find()).length);
    doc.fontSize(12).text('Average Sales Total Increase: ' + monthlyData.average);
    doc.fontSize(12).text('Total Revenue: ' + monthlyData.total + ' /-');
    doc.fontSize(12).text('Total Downloads: ' + monthlyData.products);
    doc.fontSize(12).text('Most Downloaded: ' + monthlyData.mostDownloaded[0].name);
    doc.fontSize(12).text('Download Count: ' + monthlyData.mostDownloaded[0].downloads);
    doc.moveDown(2);

    const orders = monthlyData.orders;

    for (const order of orders) {
        order.user = await User.findById(order.userId);
        for (const item of order.items) {
            item.data = await Products.findById(item.productId);
        }
    }

    const table = {
        headers: ['User Name', 'Order ID', 'Quantity', 'Price'],
        rows: orders.map((item) => [
            item.user.name,
            item._id.toString(),
            item.items.length.toString(),
            item.total.toString(),
        ]),
    };

    doc.table(table, {
        width: 600,
        headerLines: 1,
        align: 'center',
    });

    doc.end();
}

const yearly = async (req, res, next) => {
    const monthlyData = await Yearly()


    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="yearly_sales_report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text(`Yearly Sales Report ${monthlyData.startDate} to ${monthlyData.endDate}`);
    doc.moveDown(2);

    doc.fontSize(12).text('Company Name: Endgame Gaming');
    doc.fontSize(12).text('Sales Report From: ' + monthlyData.startDate);
    doc.fontSize(12).text('Total Orders: ' + monthlyData.count);
    doc.fontSize(12).text('Total Users: ' + monthlyData.users);
    doc.fontSize(12).text('Total Products: ' + (await Products.find()).length);
    doc.fontSize(12).text('Average Sales Total Increase: ' + monthlyData.average);
    doc.fontSize(12).text('Total Revenue: ' + monthlyData.total + ' /-');
    doc.fontSize(12).text('Total Downloads: ' + monthlyData.products);
    doc.fontSize(12).text('Most Downloaded: ' + monthlyData.mostDownloaded[0].name);
    doc.fontSize(12).text('Download Count: ' + monthlyData.mostDownloaded[0].downloads);
    doc.moveDown(2);

    const orders = monthlyData.orders;

    for (const order of orders) {
        order.user = await User.findById(order.userId);
        for (const item of order.items) {
            item.data = await Products.findById(item.productId);
        }
    }

    const table = {
        headers: ['User Name', 'Order ID', 'Quantity', 'Price'],
        rows: orders.map((item) => [
            item.user.name,
            item._id.toString(),
            item.items.length.toString(),
            item.total.toString(),
        ]),
    };

    doc.table(table, {
        width: 600,
        headerLines: 1,
        align: 'center',
    });

    doc.end();
}

const Weekly = async (req, res, next) => {
    const monthlyData = await weekly()


    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="weekly_sales_report.pdf"');
    doc.pipe(res);

    doc.fontSize(20).text(`Weekly Sales Report ${monthlyData.startDate} to ${monthlyData.endDate}`);
    doc.moveDown(2);

    doc.fontSize(12).text('Company Name: Endgame Gaming');
    doc.fontSize(12).text('Sales Report From: ' + monthlyData.startDate);
    doc.fontSize(12).text('Total Orders: ' + monthlyData.count);
    doc.fontSize(12).text('Total Users: ' + monthlyData.users);
    doc.fontSize(12).text('Total Products: ' + (await Products.find()).length);
    doc.fontSize(12).text('Average Sales Total Increase: ' + monthlyData.average);
    doc.fontSize(12).text('Total Revenue: ' + monthlyData.total + ' /-');
    doc.fontSize(12).text('Total Downloads: ' + monthlyData.products);
    doc.fontSize(12).text('Most Downloaded: ' + monthlyData.mostDownloaded[0].name);
    doc.fontSize(12).text('Download Count: ' + monthlyData.mostDownloaded[0].downloads);
    doc.moveDown(2);

    const orders = monthlyData.orders;

    for (const order of orders) {
        order.user = await User.findById(order.userId);
        for (const item of order.items) {
            item.data = await Products.findById(item.productId);
        }
    }

    const table = {
        headers: ['User Name', 'Order ID', 'Quantity', 'Price'],
        rows: orders.map((item) => [
            item.user.name,
            item._id.toString(),
            item.items.length.toString(),
            item.total.toString(),
        ]),
    };

    doc.table(table, {
        width: 600,
        headerLines: 1,
        align: 'center',
    });

    doc.end();
}

module.exports = { createMonthly , Daily  , yearly , Weekly}