import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LineChart, TrendingUp, TrendingDown, Activity } from "lucide-react";

interface ComparisonDataPoint {
  date: string;
  value: number;
}

interface ComparisonSeries {
  id: string;
  name: string;
  color: string;
  data: ComparisonDataPoint[];
}

interface AnimatedComparisonChartProps {
  series: ComparisonSeries[];
  isLoading: boolean;
  title?: string;
  description?: string;
  height?: number;
}

type ChartMode = 'absolute' | 'relative';
type TimeRange = '1w' | '1m' | '3m' | '6m' | '1y' | 'all';

const timeRangeOptions = [
  { value: '1w', label: '1 Week' },
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' },
];

export default function AnimatedComparisonChart({
  series,
  isLoading,
  title = "Performance Comparison",
  description = "Compare performance of different investments",
  height = 350,
}: AnimatedComparisonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('absolute');
  const [timeRange, setTimeRange] = useState<TimeRange>('3m');
  const [filteredSeries, setFilteredSeries] = useState<ComparisonSeries[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    series: ComparisonSeries[];
    xPos: number;
    values: { [id: string]: number };
  } | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<{ [id: string]: boolean }>({});

  // Animation spring
  const chartProps = useSpring({
    opacity: isLoading ? 0.5 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Initialize visible series
  useEffect(() => {
    if (!series) return;
    
    const initialVisible: { [id: string]: boolean } = {};
    series.forEach(s => {
      initialVisible[s.id] = true;
    });
    
    setVisibleSeries(initialVisible);
  }, [series]);

  // Filter data by time range
  useEffect(() => {
    if (!series || series.length === 0) return;

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

    // Filter data by date range and compute relative values if needed
    const filtered = series.map(s => {
      const filteredData = s.data.filter(d => {
        const itemDate = new Date(d.date);
        return itemDate >= startDate;
      });

      if (chartMode === 'relative' && filteredData.length > 0) {
        // Convert to percentage change from first value
        const baseValue = filteredData[0].value;
        const relativeData = filteredData.map(d => ({
          date: d.date,
          value: baseValue !== 0 ? ((d.value / baseValue) - 1) * 100 : 0
        }));
        
        return { ...s, data: relativeData };
      }
      
      return { ...s, data: filteredData };
    });

    setTimeout(() => {
      setFilteredSeries(filtered);
    }, 300);
  }, [series, timeRange, chartMode]);

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || !filteredSeries || filteredSeries.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 50, bottom: 30, left: chartMode === 'relative' ? 50 : 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart container
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get all visible series data points
    const allVisibleSeries = filteredSeries.filter(s => visibleSeries[s.id]);
    if (allVisibleSeries.length === 0) return;

    // Find all unique dates across all series
    const allDates = new Set<string>();
    allVisibleSeries.forEach(s => {
      s.data.forEach(d => allDates.add(d.date));
    });
    
    const dateArray = Array.from(allDates).sort();
    
    // Get all values to define Y scale
    const allValues: number[] = [];
    allVisibleSeries.forEach(s => {
      s.data.forEach(d => allValues.push(d.value));
    });

    // Create scales
    const dateParser = d3.timeParse("%Y-%m-%d");
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(dateArray.map(d => dateParser(d)!)) as [Date, Date])
      .range([0, width]);

    // For y-scale, ensure some padding around the data
    const yMin = d3.min(allValues) || 0;
    const yMax = d3.max(allValues) || 0;
    const yPadding = (yMax - yMin) * 0.1;
    
    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(chartMode === 'relative' ? -10 : 0, yMin - yPadding),
        yMax + yPadding
      ])
      .range([chartHeight, 0]);

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d")))
      .selectAll("text")
      .style("font-size", "10px");

    // Add Y axis
    const yAxis = chart
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => {
            if (chartMode === 'relative') {
              return `${d3.format("+.1f")(d)}%`;
            } else {
              return `$${d3.format(",")(d)}`;
            }
          })
      );

    // Style axes
    yAxis
      .selectAll("line")
      .style("stroke", "rgba(148, 163, 184, 0.2)");
    yAxis
      .selectAll("path")
      .style("stroke", "rgba(148, 163, 184, 0.2)");

    // Add grid
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

    // Add zero line for relative mode
    if (chartMode === 'relative') {
      chart
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "rgba(148, 163, 184, 0.5)")
        .attr("stroke-dasharray", "4,4");
    }

    // Create line generator
    const line = d3
      .line<ComparisonDataPoint>()
      .x(d => xScale(dateParser(d.date)!))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add clipPath for animation
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

    // Draw a line for each series
    allVisibleSeries.forEach(s => {
      if (s.data.length < 2) return;

      // Draw line
      chart
        .append("path")
        .datum(s.data)
        .attr("clip-path", `url(#${clipPathId})`)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", 3)
        .attr("d", line);

      // Animate points
      chart
        .selectAll(`.point-${s.id}`)
        .data(s.data)
        .enter()
        .append("circle")
        .attr("class", `point point-${s.id}`)
        .attr("cx", d => xScale(dateParser(d.date)!))
        .attr("cy", d => yScale(d.value))
        .attr("r", 0)
        .attr("fill", s.color)
        .transition()
        .delay((_, i) => 1000 + i * 50)
        .duration(300)
        .attr("r", 3);
    });

    // Create crosshair for interactive hover
    const crosshairGroup = chart.append("g").attr("class", "crosshair").style("display", "none");
    
    // Vertical line
    crosshairGroup
      .append("line")
      .attr("class", "crosshair-x")
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    // Create hover target area
    const hoverArea = chart
      .append("rect")
      .attr("width", width)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    // Mouse interaction
    hoverArea
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        
        // Find the closest date
        const bisectDate = d3.bisector((d: string) => dateParser(d)!).left;
        const index = bisectDate(dateArray, x0);
        const d0 = dateArray[Math.max(0, index - 1)];
        const d1 = dateArray[Math.min(dateArray.length - 1, index)];
        
        let closestDate;
        if (d0 && d1) {
          closestDate = Math.abs(x0.getTime() - dateParser(d0)!.getTime()) < 
                       Math.abs(x0.getTime() - dateParser(d1)!.getTime()) ? d0 : d1;
        } else {
          closestDate = d0 || d1;
        }
        
        if (!closestDate) return;
        
        const xPos = xScale(dateParser(closestDate)!);
        
        // Show crosshair
        crosshairGroup.style("display", null);
        crosshairGroup.select(".crosshair-x").attr("x1", xPos).attr("x2", xPos);
        
        // Collect values for all series at this date
        const values: { [id: string]: number } = {};
        const seriesWithData: ComparisonSeries[] = [];
        
        allVisibleSeries.forEach(s => {
          const point = s.data.find(p => p.date === closestDate);
          if (point) {
            values[s.id] = point.value;
            seriesWithData.push(s);
            
            // Highlight points
            chart.selectAll(`.point-${s.id}`)
              .attr("r", 3)
              .filter(d => d.date === closestDate)
              .attr("r", 6)
              .attr("stroke", "white")
              .attr("stroke-width", 2);
          }
        });
        
        setHoveredPoint({
          date: closestDate,
          series: seriesWithData,
          values,
          xPos
        });
      })
      .on("mouseleave", function() {
        crosshairGroup.style("display", "none");
        setHoveredPoint(null);
        
        // Reset point sizes
        chart.selectAll(".point")
          .attr("r", 3)
          .attr("stroke", "none");
      });

  }, [filteredSeries, chartMode, height, visibleSeries]);

  // Toggle series visibility
  const toggleSeries = (id: string) => {
    setVisibleSeries(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex space-x-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="comparison-mode" className="text-xs">
                {chartMode === 'relative' ? 'Relative %' : 'Absolute $'}
              </Label>
              <Switch
                id="comparison-mode"
                checked={chartMode === 'relative'}
                onCheckedChange={(checked) => setChartMode(checked ? 'relative' : 'absolute')}
              />
            </div>
            
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <animated.div style={chartProps} className="w-full relative">
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {series.map((s) => (
                <Button
                  key={s.id}
                  variant={visibleSeries[s.id] ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => toggleSeries(s.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: s.color }}
                  />
                  <span>{s.name}</span>
                </Button>
              ))}
            </div>
            
            {/* Hover tooltip */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-3 z-10 border border-gray-200"
                  style={{ maxWidth: '250px' }}
                >
                  <p className="text-sm font-medium mb-1">
                    {new Date(hoveredPoint.date).toLocaleDateString()}
                  </p>
                  <div className="space-y-1">
                    {hoveredPoint.series.map(s => (
                      <div key={s.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="text-xs">{s.name}</span>
                        </div>
                        <span className="text-xs font-medium">
                          {chartMode === 'relative' 
                            ? `${hoveredPoint.values[s.id].toFixed(2)}%` 
                            : `$${hoveredPoint.values[s.id].toLocaleString()}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Chart */}
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