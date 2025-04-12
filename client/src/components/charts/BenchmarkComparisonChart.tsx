import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStaggeredAnimation } from "@/hooks/use-animated-data";
import { LineChart, TrendingUp, DollarSign, Percent } from "lucide-react";

interface PerformanceData {
  date: string;
  value: number;
}

interface Benchmark {
  id: string;
  name: string;
  color: string;
  data: PerformanceData[];
}

interface BenchmarkComparisonChartProps {
  portfolioData: PerformanceData[];
  benchmarks: Benchmark[];
  isLoading: boolean;
  title?: string;
  description?: string;
  height?: number;
}

type ChartMode = 'absolute' | 'percent-change';
type TimeRange = '1m' | '3m' | '6m' | 'ytd' | '1y' | '3y' | '5y' | 'max';

const timeRangeOptions = [
  { value: '1m', label: '1 Month' },
  { value: '3m', label: '3 Months' },
  { value: '6m', label: '6 Months' },
  { value: 'ytd', label: 'Year to Date' },
  { value: '1y', label: '1 Year' },
  { value: '3y', label: '3 Years' },
  { value: '5y', label: '5 Years' },
  { value: 'max', label: 'Max' },
];

export default function BenchmarkComparisonChart({
  portfolioData,
  benchmarks,
  isLoading,
  title = "Performance vs. Benchmarks",
  description = "Compare your portfolio performance against market indices",
  height = 400,
}: BenchmarkComparisonChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartMode, setChartMode] = useState<ChartMode>('percent-change');
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  const [activeBenchmarks, setActiveBenchmarks] = useState<Record<string, boolean>>({});
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    values: Record<string, number>;
    xPos: number;
  } | null>(null);

  // Initialize active benchmarks
  useEffect(() => {
    if (benchmarks && benchmarks.length > 0) {
      const initial: Record<string, boolean> = {};
      // By default, enable the first two benchmarks and portfolio
      benchmarks.forEach((benchmark, index) => {
        initial[benchmark.id] = index < 2;
      });
      initial['portfolio'] = true; // Portfolio is always active
      setActiveBenchmarks(initial);
    }
  }, [benchmarks]);

  // Animation spring for data changes
  const chartProps = useSpring({
    opacity: isLoading ? 0.5 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (!portfolioData || portfolioData.length === 0) return [];

    const today = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1m':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(today.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(today.getMonth() - 6);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
        break;
      case '1y':
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case '3y':
        startDate.setFullYear(today.getFullYear() - 3);
        break;
      case '5y':
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      case 'max':
      default:
        // Use entire dataset
        return portfolioData;
    }

    return portfolioData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate;
    });
  }, [portfolioData, timeRange]);

  // Filter benchmark data and calculate percent changes
  const processedData = React.useMemo(() => {
    if (!benchmarks || benchmarks.length === 0 || filteredData.length === 0) {
      return { portfolio: [], benchmarks: [] };
    }

    // For percent change mode, calculate relative to first value
    const calculatePercentChanges = (data: PerformanceData[]): PerformanceData[] => {
      if (data.length === 0) return [];
      const firstValue = data[0].value;
      
      if (firstValue === 0) return data; // Avoid division by zero
      
      return data.map(item => ({
        date: item.date,
        value: chartMode === 'percent-change' 
          ? ((item.value / firstValue) - 1) * 100 
          : item.value
      }));
    };

    // Process portfolio data
    const processedPortfolio = calculatePercentChanges(filteredData);
    
    // Process benchmark data for the same date range
    const firstDate = new Date(filteredData[0].date);
    const lastDate = new Date(filteredData[filteredData.length - 1].date);
    
    const processedBenchmarks = benchmarks.map(benchmark => {
      const filteredBenchmarkData = benchmark.data.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= firstDate && itemDate <= lastDate;
      });
      
      return {
        ...benchmark,
        data: calculatePercentChanges(filteredBenchmarkData)
      };
    });
    
    return { portfolio: processedPortfolio, benchmarks: processedBenchmarks };
  }, [filteredData, benchmarks, chartMode]);

  // Animation for benchmark buttons
  const benchmarkIds = benchmarks.map(b => b.id).concat(['portfolio']);
  const buttonsVisible = useStaggeredAnimation(benchmarkIds, { delay: 500, staggerDelay: 100 });

  // Draw chart
  useEffect(() => {
    if (!svgRef.current || processedData.portfolio.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 30, left: chartMode === 'percent-change' ? 50 : 70 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart container
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Get all data series that are active
    const allSeries: { id: string; name: string; color: string; data: PerformanceData[] }[] = [];
    
    // Add portfolio if active
    if (activeBenchmarks['portfolio']) {
      allSeries.push({
        id: 'portfolio',
        name: 'Your Portfolio',
        color: '#3b82f6', // Blue
        data: processedData.portfolio
      });
    }
    
    // Add active benchmarks
    processedData.benchmarks.forEach(benchmark => {
      if (activeBenchmarks[benchmark.id]) {
        allSeries.push(benchmark);
      }
    });

    // Skip if no active series
    if (allSeries.length === 0) return;

    // Collect all dates and values for scales
    const allDates: Date[] = [];
    const allValues: number[] = [];

    allSeries.forEach(series => {
      series.data.forEach(d => {
        allDates.push(new Date(d.date));
        allValues.push(d.value);
      });
    });

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([0, width]);

    const yMin = d3.min(allValues) || 0;
    const yMax = d3.max(allValues) || 0;
    const yPadding = (yMax - yMin) * 0.1;

    const yScale = d3
      .scaleLinear()
      .domain([
        Math.min(chartMode === 'percent-change' ? -5 : 0, yMin - yPadding),
        yMax + yPadding
      ])
      .range([chartHeight, 0]);

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d, %Y")))
      .selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    const yAxis = chart
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => {
            if (chartMode === 'percent-change') {
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

    // Add zero line for percent change mode
    if (chartMode === 'percent-change') {
      chart
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", "rgba(148, 163, 184, 0.5)")
        .attr("stroke-dasharray", "4,4");
    }

    // Create clip path for animation
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

    // Create line generator
    const line = d3
      .line<PerformanceData>()
      .x(d => xScale(new Date(d.date)))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Draw lines and points for each series
    allSeries.forEach((series, seriesIndex) => {
      // Add line with animation
      chart
        .append("path")
        .datum(series.data)
        .attr("clip-path", `url(#${clipPathId})`)
        .attr("fill", "none")
        .attr("stroke", series.color)
        .attr("stroke-width", series.id === 'portfolio' ? 3 : 2) // Make portfolio line thicker
        .attr("stroke-dasharray", series.id === 'portfolio' ? 0 : 0) // Add dash to benchmarks if desired
        .attr("d", line);

      // Add points with animation for portfolio only (to reduce visual clutter)
      if (series.id === 'portfolio') {
        chart
          .selectAll(`.point-${series.id}`)
          .data(series.data)
          .enter()
          .append("circle")
          .attr("class", `point point-${series.id}`)
          .attr("cx", d => xScale(new Date(d.date)))
          .attr("cy", d => yScale(d.value))
          .attr("r", 0)
          .attr("fill", series.color)
          .transition()
          .delay((_, i) => 1000 + i * 10)
          .duration(300)
          .attr("r", 3);
      }

      // Add series name at the end of the line
      if (series.data.length > 0) {
        const lastPoint = series.data[series.data.length - 1];
        chart
          .append("text")
          .attr("x", xScale(new Date(lastPoint.date)) + 5)
          .attr("y", yScale(lastPoint.value))
          .attr("dy", seriesIndex * 15) // Offset text vertically
          .attr("font-size", "10px")
          .attr("font-weight", series.id === 'portfolio' ? "bold" : "normal")
          .attr("fill", series.color)
          .text(series.name)
          .style("opacity", 0)
          .transition()
          .delay(1500)
          .duration(500)
          .style("opacity", 1);
      }
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

    // Create hover area
    const hoverArea = chart
      .append("rect")
      .attr("width", width)
      .attr("height", chartHeight)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    // Function to find closest date in dataset
    const bisectDate = d3.bisector((d: { date: string }) => new Date(d.date)).left;

    // Mouse interaction
    hoverArea
      .on("mousemove", function(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        
        // Find values for each series at this date point
        const values: Record<string, number> = {};
        let closestDate: string | null = null;
        
        // For each series, find the closest point
        allSeries.forEach(series => {
          if (series.data.length === 0) return;
          
          const i = bisectDate(series.data, x0);
          if (i >= series.data.length) return;
          
          const d0 = series.data[Math.max(0, i - 1)];
          const d1 = series.data[Math.min(series.data.length - 1, i)];
          
          let closestPoint;
          if (d0 && d1) {
            closestPoint = Math.abs(x0.getTime() - new Date(d0.date).getTime()) < 
                          Math.abs(x0.getTime() - new Date(d1.date).getTime()) ? d0 : d1;
          } else {
            closestPoint = d0 || d1;
          }
          
          if (closestPoint) {
            values[series.id] = closestPoint.value;
            if (!closestDate) closestDate = closestPoint.date;
          }
        });
        
        if (closestDate) {
          const xPos = xScale(new Date(closestDate));
          
          // Show crosshair
          crosshairGroup.style("display", null);
          crosshairGroup.select(".crosshair-x").attr("x1", xPos).attr("x2", xPos);
          
          // Update hover state
          setHoveredPoint({
            date: closestDate,
            values,
            xPos
          });
          
          // Highlight points
          chart.selectAll(".point")
            .attr("r", 3)
            .filter(function(d: any) {
              return d.date === closestDate;
            })
            .attr("r", 6)
            .attr("stroke", "white")
            .attr("stroke-width", 2);
        }
      })
      .on("mouseleave", function() {
        crosshairGroup.style("display", "none");
        setHoveredPoint(null);
        
        // Reset points
        chart.selectAll(".point")
          .attr("r", 3)
          .attr("stroke", "none");
      });

  }, [processedData, chartMode, height, activeBenchmarks]);

  // Toggle benchmark visibility
  const toggleBenchmark = (id: string) => {
    setActiveBenchmarks(prev => ({
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
          
          <div className="flex space-x-3 items-center">
            <div className="flex items-center space-x-2">
              <Tabs
                value={chartMode}
                onValueChange={(value) => setChartMode(value as ChartMode)}
                className="w-24"
              >
                <TabsList className="h-8">
                  <TabsTrigger value="percent-change" className="h-8 w-8 p-0">
                    <Percent className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="absolute" className="h-8 w-8 p-0">
                    <DollarSign className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value as TimeRange)}
            >
              <SelectTrigger className="w-[120px] h-8">
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
        
        {/* Benchmark selection */}
        <div className="flex flex-wrap gap-2 mt-2">
          <AnimatePresence>
            <motion.div
              key="portfolio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: buttonsVisible[benchmarkIds.indexOf('portfolio')] ? 1 : 0, y: buttonsVisible[benchmarkIds.indexOf('portfolio')] ? 0 : 10 }}
            >
              <Button
                variant={activeBenchmarks['portfolio'] ? "default" : "outline"}
                size="sm"
                className="h-8 px-3"
                onClick={() => toggleBenchmark('portfolio')}
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <span>Your Portfolio</span>
              </Button>
            </motion.div>
            
            {benchmarks.map((benchmark, index) => (
              <motion.div
                key={benchmark.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: buttonsVisible[benchmarkIds.indexOf(benchmark.id)] ? 1 : 0, y: buttonsVisible[benchmarkIds.indexOf(benchmark.id)] ? 0 : 10 }}
              >
                <Button
                  variant={activeBenchmarks[benchmark.id] ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => toggleBenchmark(benchmark.id)}
                >
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: benchmark.color }}
                  />
                  <span>{benchmark.name}</span>
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <animated.div style={chartProps} className="w-full relative">
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
                    {/* Show portfolio value first if it exists */}
                    {hoveredPoint.values['portfolio'] !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: '#3b82f6' }}
                          />
                          <span className="text-xs font-bold">Your Portfolio</span>
                        </div>
                        <span className="text-xs font-medium">
                          {chartMode === 'percent-change' 
                            ? `${hoveredPoint.values['portfolio'].toFixed(2)}%` 
                            : `$${hoveredPoint.values['portfolio'].toLocaleString()}`}
                        </span>
                      </div>
                    )}
                    
                    {/* Show benchmark values */}
                    {benchmarks.map(benchmark => (
                      hoveredPoint.values[benchmark.id] !== undefined && (
                        <div key={benchmark.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: benchmark.color }}
                            />
                            <span className="text-xs">{benchmark.name}</span>
                          </div>
                          <span className="text-xs font-medium">
                            {chartMode === 'percent-change' 
                              ? `${hoveredPoint.values[benchmark.id].toFixed(2)}%` 
                              : `$${hoveredPoint.values[benchmark.id].toLocaleString()}`}
                          </span>
                        </div>
                      )
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