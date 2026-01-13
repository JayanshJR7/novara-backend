import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, format } from 'date-fns';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiArrowLeft, FiArrowUp, FiArrowDown, FiPackage } from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import './RevenueAnalytics.css';

const RevenueAnalytics = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [revenueFilter, setRevenueFilter] = useState('monthly');
    const [revenueData, setRevenueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        currentRevenue: 0,
        previousRevenue: 0,
        growthRate: 0,
        totalOrders: 0,
        avgOrderValue: 0
    });

    const formatNumber = (num) => {
        if (num >= 1000000000) {
            return '₹' + (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return '₹' + (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return '₹' + (num / 1000).toFixed(2) + 'K';
        }
        return '₹' + num.toFixed(2);
    };

    const formatNumberWithoutSymbol = (num) => {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toFixed(2);
    };

    const cardRefs = useRef([]);
    const chartRef = useRef(null);

    useEffect(() => {
        fetchRevenueData();
    }, []);

    useEffect(() => {
        if (!loading) {
            animateCards();
            animateChart();
        }
    }, [loading]);

    useEffect(() => {
        if (orders.length > 0) {
            calculateStats();
            prepareChartData();
        }
    }, [revenueFilter, orders]);

    const fetchRevenueData = async () => {
        try {
            setLoading(true);
            const ordersData = await ordersAPI.getAllOrders();
            const confirmedOrders = ordersData.orders.filter(
                o => o.orderStatus === 'confirmed' ||
                    o.orderStatus === 'processing' ||
                    o.orderStatus === 'shipped' ||
                    o.orderStatus === 'delivered'
            );
            setOrders(confirmedOrders);
        } catch (error) {
            console.error('Failed to fetch revenue data:', error);
        } finally {
            setLoading(false);
        }
    };

    const animateCards = () => {
        gsap.fromTo(
            cardRefs.current,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out'
            }
        );
    };

    const animateChart = () => {
        if (chartRef.current) {
            gsap.fromTo(
                chartRef.current,
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: 'power3.out'
                }
            );
        }
    };

    const calculateStats = () => {
        const now = new Date();
        let currentPeriodOrders = [];
        let previousPeriodOrders = [];

        switch (revenueFilter) {
            case 'weekly':
                const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
                const prevWeekStart = new Date(weekStart);
                prevWeekStart.setDate(prevWeekStart.getDate() - 7);
                const prevWeekEnd = new Date(weekEnd);
                prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

                currentPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= weekStart && orderDate <= weekEnd;
                });
                previousPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= prevWeekStart && orderDate <= prevWeekEnd;
                });
                break;

            case 'monthly':
                const monthStart = startOfMonth(now);
                const monthEnd = endOfMonth(now);
                const prevMonth = new Date(now);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                const prevMonthStart = startOfMonth(prevMonth);
                const prevMonthEnd = endOfMonth(prevMonth);

                currentPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= monthStart && orderDate <= monthEnd;
                });
                previousPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
                });
                break;

            case 'yearly':
                const yearStart = startOfYear(now);
                const yearEnd = endOfYear(now);
                const prevYear = new Date(now);
                prevYear.setFullYear(prevYear.getFullYear() - 1);
                const prevYearStart = startOfYear(prevYear);
                const prevYearEnd = endOfYear(prevYear);

                currentPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= yearStart && orderDate <= yearEnd;
                });
                previousPeriodOrders = orders.filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= prevYearStart && orderDate <= prevYearEnd;
                });
                break;

            default:
                currentPeriodOrders = orders;
                previousPeriodOrders = [];
        }

        const currentRevenue = currentPeriodOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const growthRate = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
        const avgOrderValue = currentPeriodOrders.length > 0 ? currentRevenue / currentPeriodOrders.length : 0;

        setStats({
            currentRevenue,
            previousRevenue,
            growthRate,
            totalOrders: currentPeriodOrders.length,
            avgOrderValue
        });
    };

    const prepareChartData = () => {
        const now = new Date();
        let groupedData = {};

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            let key;
            let inRange = false;

            switch (revenueFilter) {
                case 'weekly':
                    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
                    if (orderDate >= weekStart) {
                        key = format(orderDate, 'EEE');
                        inRange = true;
                    }
                    break;
                case 'monthly':
                    const monthStart = startOfMonth(now);
                    if (orderDate >= monthStart) {
                        key = format(orderDate, 'MMM dd');
                        inRange = true;
                    }
                    break;
                case 'yearly':
                    const yearStart = startOfYear(now);
                    if (orderDate >= yearStart) {
                        key = format(orderDate, 'MMM');
                        inRange = true;
                    }
                    break;
                default:
                    key = format(orderDate, 'MMM yyyy');
                    inRange = true;
            }

            if (key && inRange) {
                if (!groupedData[key]) {
                    groupedData[key] = { revenue: 0, orders: 0 };
                }
                groupedData[key].revenue += order.totalAmount || 0;
                groupedData[key].orders += 1;
            }
        });

        const chartData = Object.keys(groupedData).map(key => ({
            period: key,
            revenue: groupedData[key].revenue,
            orders: groupedData[key].orders
        }));

        setRevenueData(chartData);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    <p className="tooltip-revenue">
                        {payload[0].dataKey === 'revenue'
                            ? formatNumber(payload[0].value)
                            : `Revenue: ${formatNumber(payload[0].value)}`
                        }
                    </p>
                    {payload[1] && (
                        <p className="tooltip-orders">Orders: {payload[1].value}</p>
                    )}
                    {payload.length === 1 && payload[0].dataKey === 'orders' && (
                        <p className="tooltip-orders">Orders: {payload[0].value}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loader"></div>
                <p>Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="revenue-analytics"> 
            <Navbar />

            <div className="analytics-container">
                <div className="analytics-header">
                    <button className="back-button" onClick={() => navigate('/admin/')}>
                        <FiArrowLeft /> Back to Dashboard
                    </button>
                    <h1>Revenue Analytics</h1>
                    <p>Track your business performance and growth</p>
                </div>

                <div className="filter-section">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${revenueFilter === 'weekly' ? 'active' : ''}`}
                            onClick={() => setRevenueFilter('weekly')}
                        >
                            <FiCalendar /> Weekly
                        </button>
                        <button
                            className={`filter-btn ${revenueFilter === 'monthly' ? 'active' : ''}`}
                            onClick={() => setRevenueFilter('monthly')}
                        >
                            <FiCalendar /> Monthly
                        </button>
                        <button
                            className={`filter-btn ${revenueFilter === 'yearly' ? 'active' : ''}`}
                            onClick={() => setRevenueFilter('yearly')}
                        >
                            <FiCalendar /> Yearly
                        </button>
                        <button
                            className={`filter-btn ${revenueFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setRevenueFilter('all')}
                        >
                            <FiCalendar /> All Time
                        </button>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card glass" ref={el => cardRefs.current[0] = el}>
                        <div className="stat-icon">
                            <FaRupeeSign />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Current Revenue</p>
                            <h2 className="stat-value">{formatNumber(stats.currentRevenue)}</h2>
                            <div className={`stat-change ${stats.growthRate >= 0 ? 'positive' : 'negative'}`}>
                                {stats.previousRevenue > 0 ? (
                                    <>
                                        {stats.growthRate >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                                        <span>{Math.abs(stats.growthRate).toFixed(1)}% vs previous period</span>
                                    </>
                                ) : (
                                    <>
                                        <FiArrowUp />
                                        <span>First orders of the period! 🎉</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="stat-card glass" ref={el => cardRefs.current[1] = el}>
                        <div className="stat-icon">
                            <FiPackage />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Total Orders</p>
                            <h2 className="stat-value">{stats.totalOrders}</h2>
                            <p className="stat-subtext">In selected period</p>
                        </div>
                    </div>

                    <div className="stat-card glass" ref={el => cardRefs.current[2] = el}>
                        <div className="stat-icon">
                            <FiTrendingUp />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Avg Order Value</p>
                            <h2 className="stat-value">{formatNumber(stats.avgOrderValue)}</h2>
                            <p className="stat-subtext">Per order average</p>
                        </div>
                    </div>

                    <div className="stat-card glass" ref={el => cardRefs.current[3] = el}>
                        <div className="stat-icon">
                            <FaRupeeSign />
                        </div>
                        <div className="stat-content">
                            <p className="stat-label">Previous Period</p>
                            <h2 className="stat-value">{formatNumber(stats.previousRevenue)}</h2>
                            <p className="stat-subtext">Comparison baseline</p>
                        </div>
                    </div>
                </div>

                <div className="charts-section" ref={chartRef}>
                    <div className="chart-container glass">
                        <div className="chart-header">
                            <h3>Revenue Trends</h3>
                            <p>Track your revenue performance over time</p>
                        </div>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#300708" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#300708" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="period"
                                        stroke="#fff"
                                        style={{ fontFamily: 'Poppins', fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.7)"
                                        style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: '500' }}
                                        tickFormatter={(value) => formatNumberWithoutSymbol(value)}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#300708"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">
                                <p>No revenue data available for the selected period</p>
                            </div>
                        )}
                    </div>

                    <div className="chart-container glass">
                        <div className="chart-header">
                            <h3>Orders Distribution</h3>
                            <p>Number of orders across the period</p>
                        </div>
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                                    <XAxis
                                        dataKey="period"
                                        stroke="rgba(255,255,255,0.7)"
                                        style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: '500' }}
                                    />
                                    <YAxis
                                        stroke="rgba(255,255,255,0.7)"
                                        style={{ fontFamily: 'Poppins', fontSize: '13px', fontWeight: '500' }}
                                    // No formatter needed here since it's order count
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>
                                    <Bar
                                        dataKey="orders"
                                        fill="url(#barGradient)"
                                        radius={[12, 12, 0, 0]}
                                        animationDuration={1500}
                                        maxBarSize={60}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data">
                                <p>No order data available for the selected period</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="insights-section glass">
                    <h3>Key Insights</h3>
                    <div className="insights-grid">
                        <div className="insight-card">
                            <div className="insight-icon">📈</div>
                            <p className="insight-text">
                                {stats.growthRate >= 0
                                    ? `Revenue is up ${stats.growthRate.toFixed(1)}% compared to the previous period`
                                    : `Revenue is down ${Math.abs(stats.growthRate).toFixed(1)}% compared to the previous period`
                                }
                            </p>
                        </div>
                        <div className="insight-card">
                            <div className="insight-icon"></div>
                            <p className="insight-text">
                                Average order value is {formatNumber(stats.avgOrderValue)}
                            </p>
                        </div>
                        <div className="insight-card">
                            <div className="insight-icon">📦</div>
                            <p className="insight-text">
                                Total of {stats.totalOrders} orders in the selected period
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueAnalytics;