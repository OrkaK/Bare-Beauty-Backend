const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Get key business metrics via aggregation
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // 1. Total Revenue from Paid Orders
        const revenueResult = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // 2. Active Pending Orders Count
        const pendingOrdersCount = await Order.countDocuments({ paymentStatus: 'Pending' });

        // 3. Top 5 Best-Selling Products (based on quantity sold in Paid orders)
        const topProducts = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $unwind: '$items' },
            { 
                $group: { 
                    _id: '$items.product', 
                    totalSold: { $sum: '$items.quantity' } 
                } 
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    _id: 1,
                    totalSold: 1,
                    name: '$productDetails.name',
                    price: '$productDetails.price'
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                pendingOrdersCount,
                topProducts
            }
        });
    } catch (e) {
        console.error('Aggregation Error:', e);
        res.status(500).json({ message: 'Server error computing dashboard stats' });
    }
};

module.exports = { getDashboardStats };
