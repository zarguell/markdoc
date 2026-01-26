# Mermaid Flowchart Examples

This document demonstrates various Mermaid diagram types that you can use in BrowserMark.

## Simple Flowchart

A basic flowchart showing a decision process:

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[Done]
```

## Sequence Diagram

Interaction between users and systems:

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Server

    User->>Browser: Click button
    Browser->>Server: Send request
    Server-->>Browser: Return response
    Browser-->>User: Show result
```

## State Diagram

State transitions in a system:

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing
    Processing --> Success
    Processing --> Failed
    Success --> [*]
    Failed --> Idle
```

## Entity Relationship Diagram

Database schema relationships:

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE_ITEM : contains
    PRODUCT ||--o{ LINE_ITEM : "ordered in"
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses

    CUSTOMER {
        string name
        string email
        int id PK
    }
    ORDER {
        int id PK
        date created
        string status
    }
    PRODUCT {
        string name
        float price
        int id PK
    }
```

## Gantt Chart

Project timeline:

```mermaid
gantt
    title Project Development
    dateFormat  YYYY-MM-DD
    section Design
    Research           :done,    des1, 2024-01-01, 2024-01-07
    Wireframes         :active,  des2, 2024-01-08, 5d
    Prototypes         :         des3, after des2, 5d
    section Development
    Frontend           :         dev1, 2024-01-15, 10d
    Backend            :         dev2, 2024-01-15, 10d
    Integration        :         dev3, after dev1, 5d
```

## Class Diagram

Software architecture:

```mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
        +eat()
    }
    class Dog {
        +String breed
        +bark()
        +fetch()
    }
    class Cat {
        +String color
        +meow()
        +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat
```

## Pie Chart

Data visualization:

```mermaid
pie title Browser Market Share
    "Chrome" : 65
    "Safari" : 20
    "Edge" : 5
    "Firefox" : 5
    "Others" : 5
```

## Mindmap

Hierarchical information:

```mermaid
mindmap
  root((BrowserMark))
    Features
      Live Preview
      Export Formats
        PDF
        DOCX
        MHTML
      Diagram Support
    Architecture
      Frontend
      Libraries
      Cloudflare Workers
    Documentation
      README
      Examples
      API Docs
```

## Tips for Using Mermaid

1. **Syntax**: Mermaid uses a simple text-based syntax
2. **Directions**: Use `TD` (top-down) or `LR` (left-right) for flowcharts
3. **Styling**: You can add custom styles with `classDef`
4. **Subgraphs**: Group related nodes with `subgraph`
5. **Testing**: Use the [Mermaid Live Editor](https://mermaid.live/) to test diagrams

For more information, visit the [Mermaid documentation](https://mermaid.js.org/intro/).
