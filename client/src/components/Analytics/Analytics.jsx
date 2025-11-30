import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './Analytics.module.css';
import Sidebar from '../common/Sidebar';

const API_URL = process.env.REACT_APP_API_URL;

const Analytics = () => {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analyticsData, setAnalyticsData] = useState({
    missedChatsByWeek: [],
    avgReplyTimeMinutes: 0,
    resolutionPercentage: 0,
    totalTickets: 0,
    resolvedTickets: 0,
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format time in human-readable format
  const formatTime = (minutes) => {
    if (minutes === 0) return '0 secs';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/analytics/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch analytics');

        const result = await response.json();
        if (result.success && result.data) {
          setAnalyticsData(result.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const weeklyData = analyticsData.missedChatsByWeek || [];
  const maxChats = weeklyData.length > 0 ? Math.max(...weeklyData.map((d) => d.count), 1) : 1;

  // Generate smooth curve path using monotonic cubic spline
  const generateCurvePath = (data, maxValue) => {
    if (data.length === 0) return '';
    
    const width = 800;
    const height = 300;
    const padding = { left: 0, right: 0, top: 16, bottom: 32 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const minY = padding.top + chartHeight; // Bottom of chart (y=0)

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
      const y = padding.top + (1 - d.count / maxValue) * chartHeight;
      return { x, y };
    });

    if (points.length === 1) {
      return `M ${points[0].x} ${points[0].y}`;
    }

    // Calculate slopes for monotonic spline
    const slopes = [];
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        slopes[i] = (points[1].y - points[0].y) / (points[1].x - points[0].x);
      } else if (i === points.length - 1) {
        slopes[i] = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x);
      } else {
        const slope1 = (points[i].y - points[i - 1].y) / (points[i].x - points[i - 1].x);
        const slope2 = (points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x);
        slopes[i] = (slope1 + slope2) / 2;
      }
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const m0 = slopes[i];
      const m1 = slopes[i + 1];
      const dx = p1.x - p0.x;

      // Hermite curve control points
      const cp1x = p0.x + dx / 3;
      const cp1y = p0.y + (m0 * dx) / 3;
      const cp2x = p1.x - dx / 3;
      const cp2y = p1.y - (m1 * dx) / 3;

      // Clamp control points to stay within bounds
      const clampedCp1y = Math.max(padding.top, Math.min(minY, cp1y));
      const clampedCp2y = Math.max(padding.top, Math.min(minY, cp2y));

      path += ` C ${cp1x} ${clampedCp1y}, ${cp2x} ${clampedCp2y}, ${p1.x} ${p1.y}`;
    }

    return path;
  };

  // Handle chart point hover
  const handlePointHover = (index) => {
    setHoveredPoint(index);
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout} />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Analytics</h1>
        </header>

        {loading && (
          <div className={styles.loadingContainer}>
            <p className={styles.loadingText}>Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Missed Chats Chart */}
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <h2 className={styles.chartTitle}>Missed Chats</h2>
              </div>
              <div className={styles.chartContainer}>
                {weeklyData.length > 0 ? (
                  <div className={styles.lineChart}>
                    <div className={styles.chartArea}>
                      {/* Y-axis labels */}
                      <div className={styles.yAxis}>
                        <div className={styles.yLabel}>{maxChats}</div>
                        <div className={styles.yLabel}>{Math.round(maxChats * 0.75)}</div>
                        <div className={styles.yLabel}>{Math.round(maxChats * 0.5)}</div>
                        <div className={styles.yLabel}>{Math.round(maxChats * 0.25)}</div>
                        <div className={styles.yLabel}>0</div>
                      </div>

                      {/* Chart SVG */}
                      <svg className={styles.chartSvg} viewBox="0 0 800 300" preserveAspectRatio="none">
                        <defs>
                          {/* Glow filter for the line */}
                          <filter id="glow">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#5B93FF" floodOpacity="0.2" />
                          </filter>
                        </defs>

                        {/* Grid lines */}
                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                          <line
                            key={`grid-${i}`}
                            x1="0"
                            y1={16 + (1 - ratio) * (300 - 16 - 32)}
                            x2="800"
                            y2={16 + (1 - ratio) * (300 - 16 - 32)}
                            stroke="#F7F7F8"
                            strokeWidth="1"
                          />
                        ))}

                        {/* Dotted vertical guide line on hover */}
                        {hoveredPoint !== null && (
                          <line
                            x1={(hoveredPoint / (weeklyData.length - 1 || 1)) * 800}
                            y1="16"
                            x2={(hoveredPoint / (weeklyData.length - 1 || 1)) * 800}
                            y2="268"
                            stroke="#000000"
                            strokeWidth="2"
                            strokeDasharray="4 6"
                            opacity="0.4"
                          />
                        )}

                        {/* Line path with glow */}
                        <path
                          d={generateCurvePath(weeklyData, maxChats)}
                          fill="none"
                          stroke="#00D907"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glow)"
                        />

                        {/* Data points */}
                        {weeklyData.map((d, i) => {
                          const x = (i / (weeklyData.length - 1 || 1)) * 800;
                          const y = 16 + (1 - d.count / maxChats) * (300 - 16 - 32);
                          return (
                            <circle
                              key={`point-${i}`}
                              cx={x}
                              cy={y}
                              r={hoveredPoint === i ? 10 : 8}
                              fill="#FFFFFF"
                              stroke="#000000"
                              strokeWidth="2"
                              style={{ transition: 'r 0.2s ease' }}
                            />
                          );
                        })}
                      </svg>

                      {/* Data points with hover */}
                      <div className={styles.pointsOverlay}>
                        {weeklyData.map(({ count }, i) => {
                          // Calculate exact SVG coordinates (same as circles)
                          const svgX = (i / (weeklyData.length - 1 || 1)) * 800;
                          const svgY = 16 + (1 - count / maxChats) * (300 - 16 - 32);
                          
                          // Convert SVG coordinates to percentages of the SVG container
                          const xPercent = (svgX / 800) * 100;
                          const yPercent = (svgY / 300) * 100;
                          
                          return (
                            <div
                              key={`hover-${i}`}
                              className={styles.pointHotspot}
                              style={{
                                left: `${xPercent}%`,
                                top: `${yPercent}%`,
                              }}
                              onMouseEnter={() => handlePointHover(i)}
                              onMouseLeave={handlePointLeave}
                              role="button"
                              tabIndex={0}
                              aria-label={`Week ${i + 1}: ${count} missed chats`}
                            >
                              {hoveredPoint === i && (
                                <div className={styles.tooltip}>
                                  <div className={styles.tooltipLabel}>Chats</div>
                                  <div className={styles.tooltipValue}>{count}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* X-axis labels */}
                    <div className={styles.xAxis}>
                      {weeklyData.map((_, i) => (
                        <div key={`label-${i}`} className={styles.xLabel}>
                          Week {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={styles.noDataText}>No data for selected period</p>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className={styles.metricsGrid}>
              {/* Average Reply Time */}
              <div className={styles.metricBlock}>
                <div className={styles.metricContent}>
                  <p className={styles.metricLabel}>Average Reply time</p>
                  <p className={styles.metricDescription}>
                    For highest customer satisfaction rates you should aim to reply to an incoming customer's message in 15 seconds or less. Quick responses will get you more conversations, help you earn customers trust and make more sales.
                  </p>
                </div>
                <p className={styles.metricValue}>{formatTime(analyticsData.avgReplyTimeMinutes)}</p>
              </div>

              {/* Resolved Tickets */}
              <div className={styles.metricBlock}>
                <div className={styles.metricContent}>
                  <p className={styles.metricLabel}>Resolved Tickets</p>
                  <p className={styles.metricDescription}>
                    A callback system on a website, as well as proactive invitations, help to attract even more customers. A separate round button for ordering a call with a small animation helps to motivate more customers to make calls.
                  </p>
                </div>
                <div className={styles.donutContainer}>
                  <svg className={styles.donut} viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F7F7F8"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#00D907"
                      strokeWidth="8"
                      strokeDasharray={`${(analyticsData.resolutionPercentage / 100) * 251.2} 251.2`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className={styles.donutText}>
                    <span className={styles.donutPercent}>{analyticsData.resolutionPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Total Chats */}
              <div className={styles.metricBlock}>
                <div className={styles.metricContent}>
                  <p className={`${styles.metricLabel} ${styles.totalChatsLabel}`}>Total Chats</p>
                  <p className={styles.metricDescription}>
                    This metric Shows the total number of chats for all Channels for the selected the selected period
                  </p>
                </div>
                <p className={`${styles.metricValue} ${styles.totalChatsValue}`}>{analyticsData.totalTickets} Chats</p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
