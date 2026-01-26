# Graphviz (DOT) Graph Examples

This document demonstrates various Graphviz DOT diagrams that you can use in BrowserMark.

## Directed Graph (digraph)

A simple directed graph showing relationships:

```dot
digraph G {
    A -> B;
    B -> C;
    C -> D;
    D -> A;
}
```

## Undirected Graph

An undirected graph using `graph` instead of `digraph`:

```dot
graph H {
    A -- B;
    B -- C;
    C -- D;
    D -- A;
    A -- C;
}
```

## Network Topology

A more complex network diagram:

```dot
digraph Network {
    rankdir=LR;
    node [shape=box];

    Internet [shape=cloud];
    Router [shape= diamond];
    Switch;
    PC1 [label="Workstation 1"];
    PC2 [label="Workstation 2"];
    Server [shape=box3d];

    Internet -> Router;
    Router -> Switch;
    Switch -> PC1;
    Switch -> PC2;
    Switch -> Server;
}
```

## Organization Chart

Hierarchical structure with styling:

```dot
digraph OrgChart {
    node [shape=box, style="rounded,filled", fillcolor=lightblue];
    edge [arrowhead=vee];

    CEO -> CTO;
    CEO -> CFO;
    CEO -> COO;

    CTO -> "Engineering Manager";
    CTO -> "QA Lead";

    "Engineering Manager" -> "Developer 1";
    "Engineering Manager" -> "Developer 2";

    CFO -> Accountant;
    COO -> "Ops Manager";
}
```

## State Machine

State transitions with labels:

```dot
digraph StateMachine {
    rankdir=LR;
    size="8,5";

    node [shape = circle];
    Idle -> Processing [label = "start"];
    Processing -> Success [label = "complete"];
    Processing -> Failed [label = "error"];
    Failed -> Idle [label = "retry"];
    Success -> Idle [label = "reset", style = dashed];
}
```

## Binary Tree

Tree structure data structure:

```dot
digraph BinaryTree {
    node [shape=circle];
    edge [arrowhead=vee];

    Root -> Left;
    Root -> Right;

    Left -> LLeft;
    Left -> LRight;

    Right -> RLeft;
    Right -> RRight;

    {rank=same; LLeft; LRight; RLeft; RRight}
}
```

## Flowchart with Decisions

Process flow with decision points:

```dot
digraph Flowchart {
    node [shape=box];
    Start [shape=ellipse, style=filled, fillcolor=green];
    Decision [shape=diamond];
    End [shape=ellipse, style=filled, fillcolor=red];

    Start -> Decision;
    Decision -> Process1 [label="Yes"];
    Decision -> Process2 [label="No"];
    Process1 -> End;
    Process2 -> End;
}
```

## Database Schema

Entity relationships:

```dot
digraph DatabaseSchema {
    rankdir=TB;
    node [shape=box, style=filled];

    Users [fillcolor=lightblue];
    Orders [fillcolor=lightgreen];
    Products [fillcolor=lightyellow];
    OrderItems [fillcolor=lightcoral];

    Users -> Orders [label="1:N"];
    Orders -> OrderItems [label="1:N"];
    Products -> OrderItems [label="1:N"];
}
```

## Graph with Subgraphs

Grouping related nodes:

```dot
digraph Cluster {
    compound=true;

    subgraph cluster_client {
        label = "Client Side";
        style = filled;
        color = lightgrey;
        node [style=filled, color=white];
        Browser;
        Mobile;
    }

    subgraph cluster_server {
        label = "Server Side";
        style = filled;
        color = lightblue;
        node [style=filled, color=white];
        WebServer;
        Database;
        API;
    }

    Browser -> WebServer;
    Mobile -> API;
    WebServer -> Database;
    API -> Database;
}
```

## Styled Edges

Different arrow styles:

```dot
digraph EdgeStyles {
    rankdir=LR;

    A -> B [label="solid", style=solid];
    C -> D [label="dashed", style=dashed];
    E -> F [label="dotted", style=dotted];
    G -> H [label="bold", style=bold, penwidth=2.0];
    I -> J [label="colored", color=red];
}
```

## Tips for Using Graphviz

1. **Directed vs Undirected**: Use `digraph` for arrows (`->`) and `graph` for lines (`--`)
2. **Layout**: Control direction with `rankdir=LR` (left-right) or `rankdir=TB` (top-bottom)
3. **Shapes**: Available shapes include `box`, `ellipse`, `circle`, `diamond`, `box3d`, etc.
4. **Styling**: Add colors, styles, and labels to nodes and edges
5. **Subgraphs**: Use `subgraph` to group related nodes visually
6. **Rank**: Use `{rank=same; node1; node2;}` to align nodes at same level

### Language Identifiers

You can use either `dot` or `graphviz` as the language identifier:
- ````dot
  ```dot
  digraph G { ... }
  ```
  ````
- ````dot
  ```graphviz
  digraph G { ... }
  ```
  ````

For more information, visit the [Graphviz documentation](https://graphviz.org/documentation/).
