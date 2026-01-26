# Pikchr Technical Diagram Examples

This document demonstrates various Pikchr diagrams that you can use in BrowserMark.

## Simple Flow

Basic flow from one box to another:

```pikchr
box "Server"; arrow; box "Client"
```

## Multi-Step Process

Process flow with multiple steps:

```pikchr
box "Start" width 1.0 cm
arrow
box "Process" width 1.5 cm
arrow
box "End" width 1.0 cm
```

## Decision Flow

Flowchart with decision diamond:

```pikchr
box "Start"
arrow
diamond "Is it working?" fit
arrow "Yes" go down then right 1.0 cm then up
box "Success"
arrow "No" from previous diamond go left then down
box "Debug"
arrow from last box go up then right to "Start"
```

## Simple Network Diagram

Network topology:

```pikchr
box "Router" width 2.0 cm height 1.0 cm fill lightblue
arrow from top of last box go up 0.5 cm
box "Internet" at top of last arrow width 2.0 cm fill lightgray
arrow from bottom center of "Router" go down 0.5 cm
box "Switch" width 2.0 cm fill lightgreen
arrow from bottom of last box go down 0.3 cm then left 0.5 cm
box "PC1" width 1.0 cm fill white
arrow from bottom of "Switch" go down 0.3 cm then right 0.5 cm
box "PC2" width 1.0 cm fill white
```

## Sequence Diagram

Time-based sequence:

```pikchr
box "User" width 0.8 cm
arrow right 1.5 cm
box "Server" width 0.8 cm
arrow down 0.5 cm from 0.3 cm left of "User"
line right 1.5 cm dotted
arrow from top of last line
line right 1.5 cm dotted
arrow from top of last line
```

## State Diagram

State transitions:

```pikchr
circle "Idle" radius 0.3 cm fill lightgreen
arrow right 1.2 cm
circle "Active" radius 0.3 cm fill yellow
arrow right 1.2 cm
circle "Done" radius 0.3 cm fill lightblue
arrow from top of "Active" go up 0.5 cm then left 1.2 cm
line to "Idle"
```

## Container Diagram

Grouping related items:

```pikchr
box width 4.0 cm height 3.0 cm fill lightgray invisible
box "Web Server" at top of box width 2.0 cm fill lightblue
arrow down 0.5 cm from bottom of last box
box "App Server" width 2.0 cm fill lightgreen
arrow down 0.5 cm from bottom of last box
box "Database" width 2.0 cm fill lightcoral
```

## Horizontal Layout

Left-to-right flow with labels:

```pikchr
box "Input"
arrow "process" right 1.5 cm
box "Transform"
arrow "output" right 1.5 cm
box "Result"
```

## Labeled Arrows

Arrows with text labels:

```pikchr
box "A" width 0.8 cm
arrow "data flow" right 1.5 cm
box "B" width 0.8 cm
arrow "feedback" left from bottom of last box to bottom of first box
```

## Grid Layout

Organized grid structure:

```pikchr
box "A1" width 0.7 cm
box "A2" width 0.7 cm at right of previous box
box "A3" width 0.7 cm at right of previous box
box "B1" width 0.7 cm below "A1"
box "B2" width 0.7 cm below "A2"
box "B3" width 0.7 cm below "A3"
arrow from "A1" to "B1"
arrow from "A2" to "B2"
arrow from "A3" to "B3"
```

## Circle Diagram

Process with circles:

```pikchr
circle "Start" radius 0.4 cm fill lightgreen
arrow right 1.0 cm
circle "Step 1" radius 0.4 cm fill lightblue
arrow right 1.0 cm
circle "Step 2" radius 0.4 cm fill lightyellow
arrow right 1.0 cm
circle "End" radius 0.4 cm fill lightcoral
```

## Architecture Diagram

System architecture with multiple components:

```pikchr
# Frontend
box "Frontend" width 2.5 cm height 1.2 cm fill lightblue

# Arrow pointing down
arrow down 0.6 cm

# Backend services
box "API Gateway" width 2.5 cm height 1.0 cm fill lightgreen at top of last arrow

arrow down 0.6 cm

# Services
box "Service A" width 1.1 cm fill lightyellow
box "Service B" width 1.1 cm fill lightyellow at right of previous box

arrow down 0.6 cm from bottom center of "Service A"
arrow down 0.6 cm from bottom center of "Service B"

# Database
box "Database" width 2.5 cm height 1.0 cm fill lightcoral
```

## Feedback Loop

Loop diagram:

```pikchr
box "Input" width 1.0 cm
arrow right 1.5 cm
box "Process" width 1.0 cm
arrow right 1.5 cm
box "Output" width 1.0 cm
arrow from top of last box go up 0.5 cm then left 3.0 cm then down
line to top of first box
```

## Timeline Diagram

Simple timeline:

```pikchr
line right 5.0 cm
box "Q1" width 0.6 cm above line at start
box "Q2" width 0.6 cm above line at 1.25 cm from start
box "Q3" width 0.6 cm above line at 2.5 cm from start
box "Q4" width 0.6 cm above line at 3.75 cm from start
```

## Tips for Using Pikchr

1. **PIC-like Syntax**: Pikchr uses a syntax similar to the PIC diagramming language
2. **Shapes**: Available shapes include:
   - `box` : Rectangle/box
   - `circle` : Circle
   - `diamond` : Diamond shape
   - `ellipse` : Ellipse/oval
   - `line` : Simple line
   - `arrow` : Arrow line
3. **Positioning**:
   - `right`, `left`, `up`, `down` : Directional placement
   - `at` : Specific positioning
   - `from`, `to` : Connect elements
4. **Sizing**:
   - `width`, `height` : Set dimensions
   - `radius` : For circles/arcs
   - `fit` : Auto-size to fit content
5. **Styling**:
   - `fill` : Fill color
   - `color` : Border/line color
   - `thickness` : Line thickness
6. **Invisible Boxes**: Use `invisible` keyword for layout guides
7. **Labels**: Add text in quotes for labels on arrows or boxes
8. **Coordinates**: Use `cm` for measurements in centimeters
9. **Positioning**: Use relative positioning like `at right of previous box`

### Positioning Tips

- Use `from` and `to` to connect specific points on objects
- Use `go` to combine directions (e.g., `go up then right`)
- Use `at` to position relative to other elements
- Points can be specified: `top`, `bottom`, `left`, `right`, `center`

For more information and examples, visit:
- [Pikchr Documentation](https://pikchr.org/home/doc/trunk/doc/README.md)
- [Pikchr Examples](https://pikchr.org/home/doc/trunk/doc/examples.md)
