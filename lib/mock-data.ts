// Mock data for vision prototypes

export interface MockHeading {
  id: string;
  path: string;
  title: string;
  level: number;
}

export interface MockTask {
  id: string;
  title: string;
  due?: string;
  tags: string[];
  status: "ready" | "blocked" | "waiting";
  score: number;
  priority?: "high" | "medium" | "low";
  blockedBy?: string;
  path?: string;
}

export interface MockAction {
  id: string;
  text: string;
  completed: boolean;
  assignee?: string;
}

export interface MockMeeting {
  id: string;
  title: string;
  objective: string;
  attendees: string[];
  projectPath?: string;
  duration?: number;
}

// Mock headings for path autocomplete
export const mockHeadings: MockHeading[] = [
  { id: "1", path: "#/Projects/Launch", title: "Launch", level: 2 },
  { id: "2", path: "#/Projects/Launch/Marketing", title: "Marketing", level: 3 },
  { id: "3", path: "#/Projects/Launch/Engineering", title: "Engineering", level: 3 },
  { id: "4", path: "#/Projects/Rebuild", title: "Rebuild", level: 2 },
  { id: "5", path: "#/Cities/Tokyo", title: "Tokyo", level: 2 },
  { id: "6", path: "#/Cities/Tokyo/Restaurants", title: "Restaurants", level: 3 },
  { id: "7", path: "#/Cities/Paris", title: "Paris", level: 2 },
  { id: "8", path: "#/Cities/Berlin", title: "Berlin", level: 2 },
  { id: "9", path: "#/Work/Meetings", title: "Meetings", level: 2 },
  { id: "10", path: "#/Work/Meetings/Sprint", title: "Sprint", level: 3 },
  { id: "11", path: "#/Personal/Health", title: "Health", level: 2 },
  { id: "12", path: "#/Personal/Goals", title: "Goals", level: 2 },
  { id: "13", path: "#/Reading/Books", title: "Books", level: 2 },
  { id: "14", path: "#/Reading/Articles", title: "Articles", level: 2 },
  { id: "15", path: "#/Shopping/Groceries", title: "Groceries", level: 2 },
  { id: "16", path: "#/Shopping/Electronics", title: "Electronics", level: 2 },
  { id: "17", path: "#/Travel/Itineraries", title: "Itineraries", level: 2 },
  { id: "18", path: "#/Ideas/Startups", title: "Startups", level: 2 },
  { id: "19", path: "#/Ideas/Products", title: "Products", level: 2 },
  { id: "20", path: "#/Learning/Programming", title: "Programming", level: 2 },
];

// Mock tasks for agenda views
export const mockTasks: MockTask[] = [
  {
    id: "1",
    title: "Review PRs for new feature",
    due: "2025-11-15",
    tags: ["dev", "review"],
    status: "ready",
    score: 85,
    priority: "high",
    path: "#/Projects/Launch/Engineering",
  },
  {
    id: "2",
    title: "Update documentation for API",
    due: "2025-11-16",
    tags: ["docs", "api"],
    status: "ready",
    score: 72,
    priority: "medium",
    path: "#/Projects/Launch/Engineering",
  },
  {
    id: "3",
    title: "Book flight to Tokyo",
    due: "2025-11-14",
    tags: ["travel", "urgent"],
    status: "ready",
    score: 95,
    priority: "high",
    path: "#/Cities/Tokyo",
  },
  {
    id: "4",
    title: "Design marketing assets",
    due: "2025-11-18",
    tags: ["design", "marketing"],
    status: "blocked",
    score: 45,
    priority: "medium",
    blockedBy: "Waiting on brand guidelines",
    path: "#/Projects/Launch/Marketing",
  },
  {
    id: "5",
    title: "Write blog post about launch",
    due: "2025-11-20",
    tags: ["content", "marketing"],
    status: "waiting",
    score: 60,
    priority: "low",
    path: "#/Projects/Launch/Marketing",
  },
  {
    id: "6",
    title: "Call dentist for appointment",
    due: "2025-11-15",
    tags: ["health", "personal"],
    status: "ready",
    score: 78,
    priority: "medium",
    path: "#/Personal/Health",
  },
  {
    id: "7",
    title: "Refactor authentication module",
    due: "2025-11-17",
    tags: ["dev", "refactor"],
    status: "ready",
    score: 68,
    priority: "medium",
    path: "#/Projects/Rebuild",
  },
  {
    id: "8",
    title: "Buy groceries for dinner party",
    due: "2025-11-14",
    tags: ["shopping", "groceries"],
    status: "ready",
    score: 88,
    priority: "high",
    path: "#/Shopping/Groceries",
  },
  {
    id: "9",
    title: "Research new laptop models",
    tags: ["shopping", "research"],
    status: "ready",
    score: 40,
    priority: "low",
    path: "#/Shopping/Electronics",
  },
  {
    id: "10",
    title: "Setup CI/CD pipeline",
    due: "2025-11-19",
    tags: ["dev", "devops"],
    status: "blocked",
    score: 50,
    priority: "high",
    blockedBy: "Need AWS credentials",
    path: "#/Projects/Launch/Engineering",
  },
  {
    id: "11",
    title: "Prepare presentation slides",
    due: "2025-11-21",
    tags: ["work", "presentation"],
    status: "waiting",
    score: 55,
    priority: "medium",
    path: "#/Work/Meetings",
  },
  {
    id: "12",
    title: "Review sprint retrospective notes",
    tags: ["work", "meetings"],
    status: "ready",
    score: 35,
    priority: "low",
    path: "#/Work/Meetings/Sprint",
  },
  {
    id: "13",
    title: 'Finish reading "Atomic Habits"',
    due: "2025-11-22",
    tags: ["reading", "personal"],
    status: "ready",
    score: 42,
    priority: "low",
    path: "#/Reading/Books",
  },
  {
    id: "14",
    title: "Plan Tokyo itinerary",
    due: "2025-11-16",
    tags: ["travel", "planning"],
    status: "ready",
    score: 80,
    priority: "high",
    path: "#/Travel/Itineraries",
  },
  {
    id: "15",
    title: "Write quarterly goals",
    due: "2025-11-30",
    tags: ["goals", "planning"],
    status: "ready",
    score: 65,
    priority: "medium",
    path: "#/Personal/Goals",
  },
];

// Mock meeting data
export const mockMeeting: MockMeeting = {
  id: "mtg-1",
  title: "Product Launch Planning",
  objective: "Align on launch timeline and marketing strategy",
  attendees: ["Alice Johnson", "Bob Smith", "Carol Wang", "David Brown"],
  projectPath: "#/Projects/Launch",
  duration: 60,
};

// Mock recent destinations for refile
export const mockRecentDestinations: MockHeading[] = [
  mockHeadings[0], // Launch
  mockHeadings[4], // Tokyo
  mockHeadings[8], // Meetings
  mockHeadings[11], // Health
  mockHeadings[14], // Groceries
];

// Helper to filter tasks by criteria
export function filterTasksByStatus(status: MockTask["status"]): MockTask[] {
  return mockTasks.filter((task) => task.status === status);
}

export function filterTasksByDueDate(startDate: string, endDate: string): MockTask[] {
  return mockTasks.filter((task) => {
    if (!task.due) return false;
    const dueDate = new Date(task.due);
    return dueDate >= new Date(startDate) && dueDate <= new Date(endDate);
  });
}

export function getTasksDueToday(): MockTask[] {
  const today = new Date().toISOString().split("T")[0];
  return mockTasks.filter((task) => task.due === today);
}

export function getTasksDueNext7Days(): MockTask[] {
  const today = new Date();
  const next7Days = new Date();
  next7Days.setDate(today.getDate() + 7);

  return mockTasks.filter((task) => {
    if (!task.due) return false;
    const dueDate = new Date(task.due);
    return dueDate >= today && dueDate <= next7Days;
  });
}

export function getWaitingTasks(): MockTask[] {
  return filterTasksByStatus("waiting");
}

export function getBlockedTasks(): MockTask[] {
  return filterTasksByStatus("blocked");
}

// Parse capture input (simple parser for demo)
export interface ParsedCapture {
  title: string;
  path?: string;
  due?: string;
  tags: string[];
  raw: string;
}

export function parseCaptureInput(input: string): ParsedCapture {
  const result: ParsedCapture = {
    title: "",
    tags: [],
    raw: input,
  };

  // Extract tags (#word)
  const tagMatches = input.match(/#(\w+)/g);
  if (tagMatches) {
    result.tags = tagMatches.map((tag) => tag.substring(1));
    // Remove tags from the remaining string
    input = input.replace(/#\w+/g, "").trim();
  }

  // Extract path (@path)
  const pathMatch = input.match(/@([\w/]+)/);
  if (pathMatch) {
    result.path = pathMatch[1];
    input = input.replace(/@[\w/]+/, "").trim();
  }

  // Extract due date (due keyword followed by date)
  const dueMatch = input.match(/due\s+(\w+)/i);
  if (dueMatch) {
    result.due = dueMatch[1];
    input = input.replace(/due\s+\w+/i, "").trim();
  }

  // Remaining text is the title
  result.title = input.trim();

  return result;
}

// Fuzzy search for headings
export function fuzzySearchHeadings(query: string): MockHeading[] {
  if (!query) return mockHeadings;

  const lowerQuery = query.toLowerCase();
  return mockHeadings.filter(
    (heading) =>
      heading.title.toLowerCase().includes(lowerQuery) ||
      heading.path.toLowerCase().includes(lowerQuery)
  );
}

// Mock block data for outline view
export interface MockBlock {
  id: string;
  title: string;
  type: "heading" | "todo" | "text";
  level: number;
  path: string;
  children?: MockBlock[];
  status?: "todo" | "next" | "wip" | "waiting" | "done";
  properties?: Record<string, string | number | boolean>;
  collapsed?: boolean;
}

export const mockBlocks: MockBlock[] = [
  {
    id: "b1",
    title: "Cities",
    type: "heading",
    level: 1,
    path: "#/Cities",
    children: [
      {
        id: "b2",
        title: "Tokyo",
        type: "heading",
        level: 2,
        path: "#/Cities/Tokyo",
        properties: { visited: true, rating: 5, category: "city" },
        children: [
          {
            id: "b3",
            title: "Visit Senso-ji Temple",
            type: "todo",
            level: 3,
            path: "#/Cities/Tokyo/Visit Senso-ji Temple",
            status: "done",
            properties: { category: "temple", visited: true, price: 0 },
          },
          {
            id: "b4",
            title: "Explore Shibuya Crossing",
            type: "todo",
            level: 3,
            path: "#/Cities/Tokyo/Explore Shibuya Crossing",
            status: "done",
            properties: { category: "landmark", visited: true, price: 0 },
          },
          {
            id: "b5",
            title: "Restaurants",
            type: "heading",
            level: 3,
            path: "#/Cities/Tokyo/Restaurants",
            children: [
              {
                id: "b6",
                title: "Sukiyabashi Jiro",
                type: "todo",
                level: 4,
                path: "#/Cities/Tokyo/Restaurants/Sukiyabashi Jiro",
                status: "waiting",
                properties: { category: "sushi", visited: false, price: 300, rating: 5 },
              },
              {
                id: "b7",
                title: "Ichiran Ramen",
                type: "todo",
                level: 4,
                path: "#/Cities/Tokyo/Restaurants/Ichiran Ramen",
                status: "done",
                properties: { category: "ramen", visited: true, price: 12, rating: 4 },
              },
            ],
          },
        ],
      },
      {
        id: "b8",
        title: "Paris",
        type: "heading",
        level: 2,
        path: "#/Cities/Paris",
        properties: { visited: false, rating: 0, category: "city" },
        children: [
          {
            id: "b9",
            title: "Visit Eiffel Tower",
            type: "todo",
            level: 3,
            path: "#/Cities/Paris/Visit Eiffel Tower",
            status: "next",
            properties: { category: "landmark", visited: false, price: 25 },
          },
          {
            id: "b10",
            title: "Louvre Museum",
            type: "todo",
            level: 3,
            path: "#/Cities/Paris/Louvre Museum",
            status: "next",
            properties: { category: "museum", visited: false, price: 17 },
          },
          {
            id: "b11",
            title: "Coffee Shops",
            type: "heading",
            level: 3,
            path: "#/Cities/Paris/Coffee Shops",
            children: [
              {
                id: "b12",
                title: "Cafe de Flore",
                type: "todo",
                level: 4,
                path: "#/Cities/Paris/Coffee Shops/Cafe de Flore",
                status: "todo",
                properties: { category: "coffee", visited: false, price: 8 },
              },
            ],
          },
        ],
      },
      {
        id: "b13",
        title: "Berlin",
        type: "heading",
        level: 2,
        path: "#/Cities/Berlin",
        properties: { visited: false, rating: 0, category: "city" },
        children: [
          {
            id: "b14",
            title: "Brandenburg Gate",
            type: "todo",
            level: 3,
            path: "#/Cities/Berlin/Brandenburg Gate",
            status: "todo",
            properties: { category: "landmark", visited: false, price: 0 },
          },
        ],
      },
    ],
  },
  {
    id: "b20",
    title: "Trading",
    type: "heading",
    level: 1,
    path: "#/Trading",
    children: [
      {
        id: "b21",
        title: "Strategies",
        type: "heading",
        level: 2,
        path: "#/Trading/Strategies",
        children: [
          {
            id: "b22",
            title: "Breakout Setup A",
            type: "todo",
            level: 3,
            path: "#/Trading/Strategies/Breakout Setup A",
            status: "wip",
            properties: { setup: "breakout", risk_reward: 3.5, win_rate: 65 },
          },
          {
            id: "b23",
            title: "Mean Reversion B",
            type: "todo",
            level: 3,
            path: "#/Trading/Strategies/Mean Reversion B",
            status: "next",
            properties: { setup: "mean_reversion", risk_reward: 2.2, win_rate: 58 },
          },
          {
            id: "b24",
            title: "Momentum Setup C",
            type: "todo",
            level: 3,
            path: "#/Trading/Strategies/Momentum Setup C",
            status: "done",
            properties: { setup: "momentum", risk_reward: 1.8, win_rate: 45 },
          },
        ],
      },
      {
        id: "b25",
        title: "Journal",
        type: "heading",
        level: 2,
        path: "#/Trading/Journal",
        children: [
          {
            id: "b26",
            title: "Trade 2025-11-10",
            type: "todo",
            level: 3,
            path: "#/Trading/Journal/Trade 2025-11-10",
            status: "done",
            properties: { setup: "breakout", risk_reward: 4.0, win_rate: 100, pnl: 250 },
          },
          {
            id: "b27",
            title: "Trade 2025-11-11",
            type: "todo",
            level: 3,
            path: "#/Trading/Journal/Trade 2025-11-11",
            status: "done",
            properties: { setup: "mean_reversion", risk_reward: 2.5, win_rate: 100, pnl: 150 },
          },
        ],
      },
    ],
  },
  {
    id: "b30",
    title: "Projects",
    type: "heading",
    level: 1,
    path: "#/Projects",
    children: [
      {
        id: "b31",
        title: "Launch",
        type: "heading",
        level: 2,
        path: "#/Projects/Launch",
        properties: { status: "active", priority: "high" },
        children: [
          {
            id: "b32",
            title: "Marketing",
            type: "heading",
            level: 3,
            path: "#/Projects/Launch/Marketing",
            children: [
              {
                id: "b33",
                title: "Design marketing assets",
                type: "todo",
                level: 4,
                path: "#/Projects/Launch/Marketing/Design marketing assets",
                status: "wip",
                properties: { assignee: "Alice", priority: "high" },
              },
              {
                id: "b34",
                title: "Write blog post",
                type: "todo",
                level: 4,
                path: "#/Projects/Launch/Marketing/Write blog post",
                status: "waiting",
                properties: { assignee: "Bob", priority: "medium" },
              },
            ],
          },
          {
            id: "b35",
            title: "Engineering",
            type: "heading",
            level: 3,
            path: "#/Projects/Launch/Engineering",
            children: [
              {
                id: "b36",
                title: "Review PRs",
                type: "todo",
                level: 4,
                path: "#/Projects/Launch/Engineering/Review PRs",
                status: "next",
                properties: { assignee: "Charlie", priority: "high" },
              },
              {
                id: "b37",
                title: "Update API docs",
                type: "todo",
                level: 4,
                path: "#/Projects/Launch/Engineering/Update API docs",
                status: "todo",
                properties: { assignee: "David", priority: "medium" },
              },
            ],
          },
        ],
      },
      {
        id: "b38",
        title: "Rebuild",
        type: "heading",
        level: 2,
        path: "#/Projects/Rebuild",
        properties: { status: "planning", priority: "medium" },
        children: [
          {
            id: "b39",
            title: "Refactor auth module",
            type: "todo",
            level: 3,
            path: "#/Projects/Rebuild/Refactor auth module",
            status: "next",
            properties: { assignee: "Eve", priority: "high" },
          },
        ],
      },
    ],
  },
  {
    id: "b40",
    title: "Work",
    type: "heading",
    level: 1,
    path: "#/Work",
    children: [
      {
        id: "b41",
        title: "Meetings",
        type: "heading",
        level: 2,
        path: "#/Work/Meetings",
        children: [
          {
            id: "b42",
            title: "Sprint Planning",
            type: "todo",
            level: 3,
            path: "#/Work/Meetings/Sprint Planning",
            status: "done",
            properties: { duration: 60, attendees: 5 },
          },
          {
            id: "b43",
            title: "Product Review",
            type: "todo",
            level: 3,
            path: "#/Work/Meetings/Product Review",
            status: "next",
            properties: { duration: 45, attendees: 8 },
          },
        ],
      },
    ],
  },
  {
    id: "b50",
    title: "Personal",
    type: "heading",
    level: 1,
    path: "#/Personal",
    children: [
      {
        id: "b51",
        title: "Health",
        type: "heading",
        level: 2,
        path: "#/Personal/Health",
        children: [
          {
            id: "b52",
            title: "Schedule dentist appointment",
            type: "todo",
            level: 3,
            path: "#/Personal/Health/Schedule dentist appointment",
            status: "next",
            properties: { priority: "medium" },
          },
          {
            id: "b53",
            title: "Buy vitamins",
            type: "todo",
            level: 3,
            path: "#/Personal/Health/Buy vitamins",
            status: "todo",
            properties: { priority: "low" },
          },
        ],
      },
      {
        id: "b54",
        title: "Goals",
        type: "heading",
        level: 2,
        path: "#/Personal/Goals",
        children: [
          {
            id: "b55",
            title: "Write Q4 goals",
            type: "todo",
            level: 3,
            path: "#/Personal/Goals/Write Q4 goals",
            status: "wip",
            properties: { priority: "high" },
          },
        ],
      },
    ],
  },
];

// Flatten blocks for table views
export function flattenBlocks(blocks: MockBlock[]): MockBlock[] {
  const result: MockBlock[] = [];

  function traverse(block: MockBlock) {
    result.push(block);
    if (block.children) {
      block.children.forEach(traverse);
    }
  }

  blocks.forEach(traverse);
  return result;
}

// Property columns for slice builder
export const mockPropertyColumns = [
  "category",
  "visited",
  "rating",
  "price",
  "setup",
  "risk_reward",
  "win_rate",
  "pnl",
  "assignee",
  "priority",
  "status",
  "duration",
  "attendees",
];

// Example slice queries
export const exampleSliceQueries = [
  {
    name: "Unvisited Coffee Shops in Cities",
    query: "path:/Cities/* AND prop.category=coffee AND prop.visited=false",
    description: "Find all coffee shops in cities that haven't been visited yet",
  },
  {
    name: "High R:R Trading Setups",
    query: "path:/Trading/* AND prop.risk_reward>=2",
    description: "Trading setups with risk-reward ratio of 2 or higher",
  },
  {
    name: "High Priority Project Tasks",
    query: "path:/Projects/* AND prop.priority=high AND status!=done",
    description: "All high priority tasks in projects that aren't completed",
  },
  {
    name: "Next Actions",
    query: "status=next",
    description: "All tasks marked as next actions across the entire outline",
  },
  {
    name: "Waiting Tasks",
    query: "status=waiting",
    description: "All tasks currently in waiting state",
  },
];

// Field types for collection builder
export interface FieldType {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultValue?: any;
}

export const fieldTypes: FieldType[] = [
  {
    id: "text",
    name: "Text",
    icon: "Type",
    description: "Single line text input",
  },
  {
    id: "number",
    name: "Number",
    icon: "Hash",
    description: "Numeric value",
  },
  {
    id: "date",
    name: "Date",
    icon: "Calendar",
    description: "Date picker",
  },
  {
    id: "boolean",
    name: "Checkbox",
    icon: "CheckSquare",
    description: "True/false toggle",
  },
  {
    id: "select",
    name: "Select",
    icon: "List",
    description: "Dropdown selection",
  },
  {
    id: "reference",
    name: "Reference",
    icon: "Link",
    description: "Link to another block or type",
  },
];
