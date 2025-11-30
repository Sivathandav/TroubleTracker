const Ticket = require('../models/Ticket');
const Customization = require('../models/Customization');

// @desc    Get missed chats by week (last 10 weeks)
// @route   GET /api/analytics/missed-chats
// @access  Protected (Admin only)
const getMissedChatsByWeek = async (req, res) => {
  try {
    // Get customization settings for threshold
    const settings = await Customization.getSettings();
    const thresholdMinutes = settings.missedChatThresholdMinutes || 10;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    // Calculate date 10 weeks ago
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70); // 10 weeks = 70 days

    // Get all unresolved tickets from last 10 weeks
    const tickets = await Ticket.find({
      createdAt: { $gte: tenWeeksAgo },
      status: 'unresolved',
      firstReplyAt: null,
    });

    // Group by week
    const weeklyData = [];
    for (let i = 9; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const missedCount = tickets.filter((ticket) => {
        const timeSinceCreation = Date.now() - ticket.createdAt.getTime();
        const isMissed = timeSinceCreation > thresholdMs;
        const isInWeek =
          ticket.createdAt >= weekStart && ticket.createdAt < weekEnd;
        return isMissed && isInWeek;
      }).length;

      weeklyData.push({
        week: `Week ${10 - i}`,
        count: missedCount,
      });
    }

    res.status(200).json({
      success: true,
      data: weeklyData,
    });
  } catch (error) {
    console.error('Get missed chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching missed chats',
    });
  }
};

// @desc    Get average reply time
// @route   GET /api/analytics/avg-reply-time
// @access  Protected (Admin only)
const getAvgReplyTime = async (req, res) => {
  try {
    // Get all tickets with first reply
    const tickets = await Ticket.find({
      firstReplyAt: { $ne: null },
    });

    if (tickets.length === 0) {
      return res.status(200).json({
        success: true,
        avgReplyTime: '0h',
        avgReplyTimeMinutes: 0,
      });
    }

    // Calculate average time to first reply
    const totalReplyTime = tickets.reduce((sum, ticket) => {
      const replyTime = ticket.firstReplyAt - ticket.createdAt;
      return sum + replyTime;
    }, 0);

    const avgReplyTimeMs = totalReplyTime / tickets.length;
    const avgReplyTimeMinutes = Math.round(avgReplyTimeMs / (1000 * 60));
    const avgReplyTimeHours = (avgReplyTimeMinutes / 60).toFixed(1);

    res.status(200).json({
      success: true,
      avgReplyTime: `${avgReplyTimeHours}h`,
      avgReplyTimeMinutes,
    });
  } catch (error) {
    console.error('Get avg reply time error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating average reply time',
    });
  }
};

// @desc    Get resolution rate
// @route   GET /api/analytics/resolution-rate
// @access  Protected (Admin only)
const getResolutionRate = async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });

    const resolutionPercentage =
      totalTickets > 0
        ? ((resolvedTickets / totalTickets) * 100).toFixed(1)
        : 0;

    res.status(200).json({
      success: true,
      totalTickets,
      resolvedTickets,
      resolutionPercentage: parseFloat(resolutionPercentage),
    });
  } catch (error) {
    console.error('Get resolution rate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error calculating resolution rate',
    });
  }
};

// @desc    Get all analytics data
// @route   GET /api/analytics/dashboard
// @access  Protected (Admin only)
const getDashboardAnalytics = async (req, res) => {
  try {
    console.log('Fetching dashboard analytics...');
    
    // Get customization settings for threshold
    const settings = await Customization.getSettings();
    console.log('Customization settings:', settings);
    
    const thresholdMinutes = settings.missedChatThreshold || 5;
    const thresholdMs = thresholdMinutes * 60 * 1000;

    // Calculate date 10 weeks ago
    const tenWeeksAgo = new Date();
    tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70);

    // Get missed chats by week
    const unresolvedTickets = await Ticket.find({
      createdAt: { $gte: tenWeeksAgo },
      status: 'unresolved',
      firstReplyAt: null,
    });

    const missedChatsByWeek = [];
    for (let i = 9; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const missedCount = unresolvedTickets.filter((ticket) => {
        const timeSinceCreation = Date.now() - ticket.createdAt.getTime();
        const isMissed = timeSinceCreation > thresholdMs;
        const isInWeek =
          ticket.createdAt >= weekStart && ticket.createdAt < weekEnd;
        return isMissed && isInWeek;
      }).length;

      missedChatsByWeek.push({
        week: `Week ${10 - i}`,
        count: missedCount,
      });
    }

    // Get average reply time
    const ticketsWithReply = await Ticket.find({
      firstReplyAt: { $ne: null },
    });

    let avgReplyTime = '0h';
    let avgReplyTimeMinutes = 0;

    if (ticketsWithReply.length > 0) {
      const totalReplyTime = ticketsWithReply.reduce((sum, ticket) => {
        const replyTime = ticket.firstReplyAt - ticket.createdAt;
        return sum + replyTime;
      }, 0);

      const avgReplyTimeMs = totalReplyTime / ticketsWithReply.length;
      avgReplyTimeMinutes = Math.round(avgReplyTimeMs / (1000 * 60));
      const avgReplyTimeHours = (avgReplyTimeMinutes / 60).toFixed(1);
      avgReplyTime = `${avgReplyTimeHours}h`;
    }

    // Get resolution rate
    const totalTickets = await Ticket.countDocuments();
    const resolvedTickets = await Ticket.countDocuments({ status: 'resolved' });
    const resolutionPercentage =
      totalTickets > 0
        ? parseFloat(((resolvedTickets / totalTickets) * 100).toFixed(1))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        missedChatsByWeek,
        avgReplyTime,
        avgReplyTimeMinutes,
        totalTickets,
        resolvedTickets,
        resolutionPercentage,
      },
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics',
      error: error.message,
    });
  }
};

module.exports = {
  getMissedChatsByWeek,
  getAvgReplyTime,
  getResolutionRate,
  getDashboardAnalytics,
};
