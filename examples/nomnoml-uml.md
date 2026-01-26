# Nomnoml UML Diagram Examples

This document demonstrates various Nomnoml diagrams that you can use in BrowserMark.

## Simple Class Relationship

Basic UML-style class diagram:

```nomnoml
[Customer]->[Order]
[Order]->[Product]
```

## Class with Attributes and Methods

More detailed class representation:

```nomnoml
[User|
  name: string
  email: string
  login()
  logout()
]
```

## Association Types

Different relationship types in UML:

```nomnoml
[Parent]0..1 - *[Child]
[Author]+->[Book]
[Company]1+-*[Department]
[Student]->[Course]
[Teacher]aggregates->[Classroom]
```

## Inheritance

Class inheritance hierarchy:

```nomnoml
[Vehicle] <|-- [Car]
[Vehicle] <|-- [Truck]
[Vehicle] <|-- [Motorcycle]
```

## Abstract Class

Abstract classes and interfaces:

```nomnoml
[<abstract>Shape|
  area(): number
  perimeter(): number
]

[Shape] <|-- [Circle]
[Shape] <|-- [Rectangle]
[Circle] uses [Point]
```

## System Architecture

Multi-tier architecture:

```nomnoml
[<frame>Web Application|
  [Browser]-->[Web Server]
  [Web Server]-->[API Layer]
  [API Layer]-->[Database]
  [API Layer]-->[Cache]
]
```

## State Diagram

State transitions:

```nomnoml
[<start>Idle] -> [Processing]
[Processing] -> [<state>Success]
[Processing] -> [<state>Error]
[Error] -> [Idle]
[Success] -> [<end>Done]
```

## Component Diagram

System components:

```nomnoml
[<frame>E-commerce System|
  [Frontend]
  [Backend]
  [Payment Service]
  [Inventory Service]
  [Database]

  [Frontend] --> [Backend]
  [Backend] --> [Payment Service]
  [Backend] --> [Inventory Service]
  [Payment Service] --> [Database]
  [Inventory Service] --> [Database]
]
```

## Sequence Diagram

Interaction between actors:

```nomnoml
[<actor>User] -> [Login Form]
[Login Form] -> [Auth Service]
[Auth Service] -> [Database]
[Database] --> [Auth Service]
[Auth Service] --> [Login Form]
[Login Form] --> [<actor>User]
```

## Package Structure

Organizing code into packages:

```nomnoml
[<package>com.example|
  [<package>model|
    [User]
    [Product]
    [Order]
  ]
  [<package>service|
    [UserService]
    [ProductService]
  ]
  [<package>controller|
    [UserController]
    [ProductController]
  ]
]
```

## Association with Cardinality

Explicit cardinality notation:

```nomnoml
[Department]1..*contains1..*[Employee]
[Employee]0..1reports_to0..1[Manager]
[Project]0..*has1..*[Task]
```

## Composition vs Aggregation

Different relationship strengths:

```nomnoml
[Building]composition++>[Room]
[Room]aggregates0..*>[Furniture]
[Person]association-->[Address]
```

## Notes and Comments

Adding annotations:

```nomnoml
[ClassA|
  method()
]
note: This is a note

[ClassB|
  data: string
]
note right: Important class
```

## Full UML Class Diagram

Complete class diagram example:

```nomnoml
[<abstract>Person|
  #name: string
  #email: string
  +getName(): string
  +getEmail(): string
]

[Person] <|-- [Student]
[Person] <|-- [Professor]

[Student|
  -studentId: string
  -major: string
  +getStudentId(): string
  +register(course: Course)
]

[Professor|
  -employeeId: string
  -department: string
  +getEmployeeId(): string
  +teach(course: Course)
]

[Course|
  -code: string
  -title: string
  -credits: int
  +getCode(): string
  +addStudent(student: Student)
]

[Student]0..*enrolls in0..*[Course]
[Professor]0..*teaches0..*[Course]
```

## Use Case Diagram

Actor and use case relationships:

```nomnoml
[<actor>Customer]
[<actor>Admin]

[Login]
[Browse Products]
[Add to Cart]
[Checkout]
[Manage Products]
[View Orders]

[Customer] --> [Login]
[Customer] --> [Browse Products]
[Customer] --> [Add to Cart]
[Customer] --> [Checkout]
[Customer] --> [View Orders]
[Admin] --> [Manage Products]

[Login] <+[Browse Products]
[Browse Products] <+[Add to Cart]
[Add to Cart] <+[Checkout]
```

## Tips for Using Nomnoml

1. **Syntax**: Nomnoml uses a very simple and clean syntax
2. **Class Syntax**: Use `[ClassName| attributes | methods]` for detailed classes
3. **Relationships**:
   - `->` : Association
   - `-->` : Dependency
   - `<|--` : Inheritance
   - `+-` : Composition
   - `aggregates` : Aggregation
4. **Special Elements**:
   - `[<abstract>...]` : Abstract class
   - `[<frame>...]` : Frame/container
   - `[<package>...]` : Package
   - `[<actor>...]` : Actor
   - `[<start>...]` : Start state
   - `[<end>...]` : End state
   - `[<state>...]` : State
5. **Cardinality**: Use notation like `0..*`, `1..*`, `1..1` before or after relation
6. **Direction**: Arrows show the direction of relationships
7. **Frames**: Group related elements together using `[<frame>title| ... ]`

### Testing Your Diagrams

You can test your Nomnoml diagrams online at:
- [Nomnoml Live Editor](http://www.nomnoml.com/)

For more information, visit the [Nomnoml GitHub repository](https://github.com/skanaar/nomnoml).
