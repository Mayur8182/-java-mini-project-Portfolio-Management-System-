import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpIcon, ArrowDownIcon, LineChart, BarChart } from "lucide-react";

interface PerformanceData {
  date: string;
  value: number;
}

interface AnimatedPerformanceChartProps {
  data: PerformanceData[];
  isLoading: boolean;
  title?: string;
  description?: string;
  height?: number;
  showControls?: boolean;
}

type ChartType = 'line' | 'bar' | 'area';
type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

const timeRangeOptions = [
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function AnimatedPerformanceChart({
  data,
  isLoading,
  title = "Portfolio Performance",
  description = "View your performance over time",
  height = 300,
  showControls = true,
}: AnimatedPerformanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [filteredData, setFilteredData] = useState<PerformanceData[]>([]);
  const [hoveredValue, setHoveredValue] = useState<{ date: string; value: number } | null>(null);
  
  // Animation spring for data changes
  const chartProps = useSpring({
    opacity: isLoading ? 0.5 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Filter data based on selected time range
  useEffect(() => {
    if (!data || data.length === 0) return;

    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1w':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    const filtered = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });

    // Add animation delay for smoother transitions
    setTimeout(() => {
      setFilteredData(filtered);
    }, 300);

  }, [data, timeRange]);

  // Draw chart using D3 and React Spring for animations
  useEffect(() => {
    if (!svgRef.current || !filteredData || filteredData.length === 0) return;

    const svg = d3.select(svgRef.current);
    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear previous elements
    svg.selectAll("*").remove();

    // Create chart container
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates and create scales
    const dateParser = d3.timeParse("%Y-%m-%d");
    const dates = filteredData.map(d => dateParser(d.date)!);
    const values = filteredData.map(d => d.value);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dates) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(values) ? Math.min(0, d3.min(values) as number * 0.9) : 0,
        d3.max(values) ? (d3.max(values) as number) * 1.1 : 100
      ])
      .range([chartHeight, 0]);

    // Create axes
    const xAxis = chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d")));

    const yAxis = chart
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d3.format(",.0f")(d as number)}`));

    // Style the axes
    xAxis
      .selectAll("line")
      .style("stroke", "rgba(148, 163, 184, 0.2)");
    xAxis
      .selectAll("path")
      .style("stroke", "rgba(148, 163, 184, 0.2)");
    yAxis
      .selectAll("line")
      .style("stroke", "rgba(148, 163, 184, 0.2)");
    yAxis
      .selectAll("path")
      .style("stroke", "rgba(148, 163, 184, 0.2)");

    // Create grid lines
    chart
      .append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .style("color", "rgba(148, 163, 184, 0.1)");

    // Define colors and gradients
    const color = "#3b82f6"; // Blue
    const gradientId = "performance-gradient";
    
    // Create gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.7);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.1);

    // Draw the chart based on type
    if (chartType === 'line' || chartType === 'area') {
      // Create line
      const line = d3
        .line<PerformanceData>()
        .x(d => xScale(dateParser(d.date)!))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      // Animate line drawing with clipping path
      const clipPathId = "clip-path-" + Math.random().toString(36).substr(2, 9);
      
      svg
        .append("clipPath")
        .attr("id", clipPathId)
        .append("rect")
        .attr("width", 0)
        .attr("height", chartHeight + margin.top)
        .transition()
        .duration(1000)
        .attr("width", width + margin.left);

      chart
        .append("path")
        .datum(filteredData)
        .attr("clip-path", `url(#${clipPathId})`)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 3)
        .attr("d", line);

      // Add area if area chart
      if (chartType === 'area') {
        const area = d3
          .area<PerformanceData>()
          .x(d => xScale(dateParser(d.date)!))
          .y0(yScale(0))
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX);

        chart
          .append("path")
          .datum(filteredData)
          .attr("clip-path", `url(#${clipPathId})`)
          .attr("fill", `url(#${gradientId})`)
          .attr("d", area);
      }

      // Add animated dots for data points
      chart
        .selectAll(".data-point")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", d => xScale(dateParser(d.date)!))
        .attr("cy", d => yScale(d.value))
        .attr("r", 0)
        .attr("fill", color)
        .transition()
        .delay((_, i) => i * 100)
        .duration(500)
        .attr("r", 4);

    } else if (chartType === 'bar') {
      // Create bars with animation
      const barWidth = Math.max(4, width / filteredData.length - 8);

      chart
        .selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(dateParser(d.date)!) - barWidth / 2)
        .attr("y", chartHeight)
        .attr("width", barWidth)
        .attr("fill", color)
        .attr("rx", 2) // Rounded corners
        .transition()
        .duration(1000)
        .delay((_, i) => i * 50)
        .attr("y", d => yScale(Math.max(0, d.value)))
        .attr("height", d => Math.abs(yScale(0) - yScale(d.value)));
    }

    // Interactive overlay for tooltips
    const overlay = chart
      .append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", chartHeight)
      .style("opacity", 0);

    const tooltip = chart
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0);

    tooltip
      .append("rect")
      .attr("rx", 4)
      .attr("fill", "rgba(17, 24, 39, 0.8)")
      .attr("width", 120)
      .attr("height", 60);

    const tooltipText = tooltip
      .append("text")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "500")
      .attr("x", 10)
      .attr("y", 20);

    tooltipText
      .append("tspan")
      .attr("class", "tooltip-date")
      .attr("x", 10);

    tooltipText
      .append("tspan")
      .attr("class", "tooltip-value")
      .attr("x", 10)
      .attr("dy", 20);

    // Mouse events for tooltips
    overlay
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const date = xScale.invert(mouseX);
        
        // Find the closest data point
        const bisect = d3.bisector((d: PerformanceData) => dateParser(d.date)!).left;
        const index = bisect(filteredData, date);
        const leftPoint = filteredData[Math.max(0, index - 1)];
        const rightPoint = filteredData[Math.min(filteredData.length - 1, index)];
        
        let selectedPoint;
        if (rightPoint && leftPoint) {
          selectedPoint = 
            Math.abs(date.getTime() - dateParser(leftPoint.date)!.getTime()) < 
            Math.abs(date.getTime() - dateParser(rightPoint.date)!.getTime()) 
              ? leftPoint 
              : rightPoint;
        } else {
          selectedPoint = leftPoint || rightPoint;
        }
        
        if (selectedPoint) {
          setHoveredValue({
            date: selectedPoint.date,
            value: selectedPoint.value
          });
          
          const formattedDate = d3.timeFormat("%b %d, %Y")(dateParser(selectedPoint.date)!);
          const formattedValue = `$${d3.format(",.2f")(selectedPoint.value)}`;
          
          tooltip.select(".tooltip-date").text(formattedDate);
          tooltip.select(".tooltip-value").text(formattedValue);
          
          const xPos = xScale(dateParser(selectedPoint.date)!);
          const yPos = yScale(selectedPoint.value);
          
          tooltip
            .attr("transform", `translate(${xPos + 10}, ${yPos - 30})`)
            .transition()
            .duration(100)
            .style("opacity", 1);
            
          // Highlight the closest point
          chart.selectAll(".data-point")
            .attr("r", 4)
            .filter(d => d.date === selectedPoint.date)
            .attr("r", 6)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
        }
      })
      .on("mouseout", function() {
        setHoveredValue(null);
        tooltip
          .transition()
          .duration(300)
          .style("opacity", 0);
          
        chart.selectAll(".data-point")
          .attr("r", 4)
          .attr("stroke", "none");
      });

  }, [filteredData, chartType, height]);

  // Calculate performance metrics
  const performanceMetrics = React.useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return { startValue: 0, endValue: 0, change: 0, percentChange: 0 };
    }

    const startValue = filteredData[0]?.value || 0;
    const endValue = filteredData[filteredData.length - 1]?.value || 0;
    const change = endValue - startValue;
    const percentChange = startValue !== 0 ? (change / startValue) * 100 : 0;

    return { startValue, endValue, change, percentChange };
  }, [filteredData]);

  // Positive or negative trend
  const trend = performanceMetrics.change >= 0 ? 'positive' : 'negative';
  const TrendIcon = trend === 'positive' ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = trend === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          {showControls && (
            <div className="flex space-x-2">
              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as TimeRange)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Tabs
                value={chartType}
                onValueChange={(value) => setChartType(value as ChartType)}
                className="w-[150px]"
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="line" className="text-xs p-1">
                    <LineChart className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="area" className="text-xs p-1">
                    <div className="h-4 w-4 bg-blue-500 opacity-50 rounded-sm" />
                  </TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs p-1">
                    <BarChart className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
        </div>
        
        {/* Performance summary */}
        <div className="mt-2 flex items-center space-x-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={`value-${performanceMetrics.endValue}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold"
            >
              ${performanceMetrics.endValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <motion.span
              key={`percent-${performanceMetrics.percentChange}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm font-medium ${trendColor}`}
            >
              {Math.abs(performanceMetrics.percentChange).toFixed(2)}%
            </motion.span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <animated.div style={chartProps} className="w-full relative">
            {/* Hover tooltip for mobile/touch */}
            {hoveredValue && (
              <div className="absolute top-0 right-0 bg-primary-900/80 text-white text-xs rounded p-2 z-10">
                <div>{new Date(hoveredValue.date).toLocaleDateString()}</div>
                <div className="font-bold">${hoveredValue.value.toLocaleString()}</div>
              </div>
            )}
            
            <svg
              ref={svgRef}
              width="100%"
              height={height}
              className="overflow-visible"
            />
          </animated.div>
        )}
      </CardContent>
    </Card>
  );
}