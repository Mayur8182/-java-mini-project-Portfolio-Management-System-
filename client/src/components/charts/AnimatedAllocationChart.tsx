import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import * as d3 from 'd3';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PieChart, BarChart3 } from "lucide-react";
import { useStaggeredAnimation, useAnimatedData } from "@/hooks/use-animated-data";

interface AssetAllocation {
  type: string;
  percentage: number;
  value: number;
}

interface AnimatedAllocationChartProps {
  data: AssetAllocation[];
  isLoading: boolean;
  title?: string;
  description?: string;
  height?: number;
}

type ChartType = 'pie' | 'bar';

export default function AnimatedAllocationChart({
  data,
  isLoading,
  title = "Asset Allocation",
  description = "Distribution of your portfolio by asset type",
  height = 400
}: AnimatedAllocationChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [selectedAsset, setSelectedAsset] = useState<AssetAllocation | null>(null);

  // Animation spring for data changes
  const chartProps = useSpring({
    opacity: isLoading ? 0.3 : 1,
    scale: isLoading ? 0.9 : 1,
    config: { tension: 300, friction: 20 },
  });

  // Animate data updates
  const animatedData = useAnimatedData(data, undefined, { 
    duration: 1000, 
    staggerDelay: 50 
  });

  // Animate asset buttons
  const isVisible = useStaggeredAnimation(data || [], { 
    delay: 500, 
    staggerDelay: 100 
  });

  // Colors for the chart
  const colorScale = d3.scaleOrdinal<string>()
    .domain(data.map(d => d.type))
    .range([
      '#3b82f6', // Blue
      '#10b981', // Green
      '#f59e0b', // Amber
      '#ef4444', // Red
      '#8b5cf6', // Purple
      '#ec4899', // Pink
      '#06b6d4', // Cyan
    ]);

  // Draw pie chart
  const drawPieChart = () => {
    if (!svgRef.current || !animatedData || animatedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const chartHeight = height;
    const radius = Math.min(width, chartHeight) / 2 * 0.8;

    // Create chart container
    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${chartHeight / 2})`);

    // Create pie layout
    const pie = d3.pie<AssetAllocation>()
      .value(d => d.percentage)
      .sort(null)
      .padAngle(0.02);

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<AssetAllocation>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius);

    // Create hover arc for animation
    const hoverArc = d3.arc<d3.PieArcDatum<AssetAllocation>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 1.08);

    // Generate arcs
    const arcs = pie(animatedData);

    // Function to create the interpolation for arc transitions
    const arcTween = (d: d3.PieArcDatum<AssetAllocation>) => {
      return function(t: number) {
        return arc(d) as string;
      };
    };

    // Add slices with animation
    const slices = chart
      .selectAll(".arc")
      .data(arcs)
      .enter()
      .append("g")
      .attr("class", "arc");

    // Append path with animation
    slices
      .append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.type))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("opacity", 0.9)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc as any);
        
        setSelectedAsset(d.data);
        
        // Show tooltip
        d3.select(this.parentNode)
          .select(".tooltip")
          .style("opacity", 1)
          .attr("transform", (d: any) => {
            const centroid = arc.centroid(d);
            return `translate(${centroid[0] * 1.4},${centroid[1] * 1.4})`;
          });
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc as any);
        
        // Hide tooltip
        d3.select(this.parentNode)
          .select(".tooltip")
          .style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attrTween("d", arcTween);

    // Add tooltip boxes
    const tooltips = slices
      .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Tooltip background
    tooltips
      .append("rect")
      .attr("width", 120)
      .attr("height", 45)
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "white")
      .attr("stroke", "#e2e8f0")
      .attr("transform", "translate(-60, -22)");

    // Tooltip text
    tooltips
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .attr("fill", "#334155")
      .attr("dy", -5)
      .text(d => d.data.type);

    tooltips
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .attr("dy", 12)
      .text(d => `${d.data.percentage.toFixed(1)}% / $${d.data.value.toLocaleString()}`);

    // Add legend with animation
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width / 2}, ${height - 20})`);

    // Only show legend for smaller datasets to avoid clutter
    if (animatedData.length <= 5) {
      const legendItems = legend
        .selectAll(".legend-item")
        .data(animatedData)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(${i * 100 - (animatedData.length * 50) + 50}, 0)`);

      // Add colored circles
      legendItems
        .append("circle")
        .attr("r", 5)
        .attr("fill", d => colorScale(d.type))
        .style("opacity", 0)
        .transition()
        .delay((_, i) => 1000 + i * 100)
        .duration(500)
        .style("opacity", 0.9);

      // Add type labels
      legendItems
        .append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "10px")
        .attr("fill", "#64748b")
        .text(d => d.type)
        .style("opacity", 0)
        .transition()
        .delay((_, i) => 1000 + i * 100)
        .duration(500)
        .style("opacity", 1);
    }
  };

  // Draw bar chart
  const drawBarChart = () => {
    if (!svgRef.current || !animatedData || animatedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Create chart container
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Sort data by percentage descending
    const sortedData = [...animatedData].sort((a, b) => b.percentage - a.percentage);

    // Create scales
    const xScale = d3
      .scaleBand<string>()
      .domain(sortedData.map(d => d.type))
      .range([0, width])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, d => d.percentage) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Add X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    chart
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(5)
          .tickFormat(d => `${d}%`)
      )
      .selectAll("text")
      .style("font-size", "10px");

    // Add grid lines
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

    // Add bars with animation
    chart
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.type) || 0)
      .attr("y", chartHeight) // Start from bottom
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // Start with height 0
      .attr("fill", d => colorScale(d.type))
      .attr("rx", 4) // Rounded corners
      .attr("ry", 4)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.7);
        
        setSelectedAsset(d);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1);
      })
      .transition()
      .duration(1000)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(d.percentage))
      .attr("height", d => chartHeight - yScale(d.percentage));

    // Add value labels
    chart
      .selectAll(".value-label")
      .data(sortedData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", d => (xScale(d.type) || 0) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.percentage) - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "#64748b")
      .text(d => `${d.percentage.toFixed(1)}%`)
      .style("opacity", 0)
      .transition()
      .duration(500)
      .delay((d, i) => 1000 + i * 100)
      .style("opacity", 1);

    // Add Y axis label
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -chartHeight / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#64748b")
      .text("Allocation (%)");
  };

  // Update chart when data or chart type changes
  useEffect(() => {
    if (chartType === 'pie') {
      drawPieChart();
    } else {
      drawBarChart();
    }
  }, [animatedData, chartType]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <Tabs
            value={chartType}
            onValueChange={(value) => setChartType(value as ChartType)}
            className="w-24"
          >
            <TabsList className="h-8">
              <TabsTrigger value="pie" className="h-8 w-8 p-0">
                <PieChart className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="bar" className="h-8 w-8 p-0">
                <BarChart3 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : (
          <div className="space-y-4">
            <animated.div style={chartProps} className="w-full relative">
              <svg
                ref={svgRef}
                width="100%"
                height={height}
                className="overflow-visible"
              />
            </animated.div>
            
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              <AnimatePresence>
                {data.map((asset, index) => (
                  <motion.div
                    key={asset.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isVisible[index] ? 1 : 0, y: isVisible[index] ? 0 : 10 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Button
                      variant={selectedAsset?.type === asset.type ? "secondary" : "outline"}
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => setSelectedAsset(asset === selectedAsset ? null : asset)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: colorScale(asset.type) }}
                      />
                      <span>{asset.type}</span>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">
                        {asset.percentage.toFixed(1)}%
                      </Badge>
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {selectedAsset && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 p-4 rounded-lg mt-2 overflow-hidden"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: colorScale(selectedAsset.type) }} 
                    />
                    <h4 className="font-semibold">{selectedAsset.type}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Allocation</p>
                      <p className="font-medium">{selectedAsset.percentage.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Value</p>
                      <p className="font-medium">${selectedAsset.value.toLocaleString()}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}