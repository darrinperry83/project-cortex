import type { Block, Prop } from "./types";
import { slugify } from "./path";

type PredicateFn = (_block: Block, _props: Prop[]) => boolean;

/**
 * Parses a DSL query string and returns a predicate function
 * Supports queries like:
 * - type:heading
 * - tag:coffee
 * - path:/Cities/*
 * - prop.category=coffee
 * - prop.visited=false
 * - prop.rating>=4
 * - Multiple conditions with AND (space-separated)
 */
export function parseDSL(dsl: string): PredicateFn {
  const conditions = dsl
    .trim()
    .split(/\s+AND\s+|\s+/)
    .filter((c) => c.length > 0);

  const predicates: PredicateFn[] = conditions.map(parseCondition);

  // Return a function that checks all predicates (AND logic)
  return (block: Block, props: Prop[]) => {
    return predicates.every((predicate) => predicate(block, props));
  };
}

/**
 * Parses a single condition and returns a predicate function
 */
function parseCondition(condition: string): PredicateFn {
  // Type filter: type:heading
  if (condition.startsWith("type:")) {
    const type = condition.substring(5);
    return (block: Block, _props: Prop[]) => block.type === type;
  }

  // Tag filter: tag:coffee
  if (condition.startsWith("tag:")) {
    const tag = condition.substring(4);
    return (block: Block, _props: Prop[]) => block.tags.includes(tag);
  }

  // Path filter: path:/Cities/* or path:/Cities/Tokyo
  if (condition.startsWith("path:")) {
    const pathPattern = condition.substring(5);
    return createPathPredicate(pathPattern);
  }

  // Property filter: prop.key=value or prop.key>=value
  if (condition.startsWith("prop.")) {
    return createPropertyPredicate(condition);
  }

  // Unknown condition - return false
  console.warn(`Unknown DSL condition: ${condition}`);
  return (_block: Block, _props: Prop[]) => false;
}

/**
 * Creates a predicate for path matching with glob support
 */
function createPathPredicate(pathPattern: string): PredicateFn {
  const parts = pathPattern.replace(/^#?\/?/, "").split("/");
  const hasGlob = parts.some((p) => p === "*");

  return (block: Block, _props: Prop[]) => {
    // We need to build the path asynchronously, so we'll cache it
    // For now, we'll use a synchronous approximation
    // In a real implementation, you might want to pre-compute paths
    // or use a different approach

    // This is a simplified version that matches based on block hierarchy
    // A full implementation would need async support or pre-computed paths
    if (hasGlob) {
      // For glob patterns, we do a simpler check
      // Check if any part of the pattern matches the block's title
      const slugifiedTitle = block.title ? slugify(block.title) : "";
      return parts.some((part) => {
        if (part === "*") return true;
        return slugify(part) === slugifiedTitle;
      });
    } else {
      // Exact path matching - for now, just check the last part
      const lastPart = parts[parts.length - 1];
      const slugifiedTitle = block.title ? slugify(block.title) : "";
      return slugify(lastPart) === slugifiedTitle;
    }
  };
}

/**
 * Creates a predicate for property matching with comparison operators
 */
function createPropertyPredicate(condition: string): PredicateFn {
  // Extract: prop.key OPERATOR value
  const propPrefix = "prop.";
  const withoutPrefix = condition.substring(propPrefix.length);

  // Match operators: >=, <=, >, <, =
  const operatorMatch = withoutPrefix.match(/(>=|<=|>|<|=)/);
  if (!operatorMatch) {
    console.warn(`Invalid property condition: ${condition}`);
    return () => false;
  }

  const operator = operatorMatch[1];
  const operatorIndex = operatorMatch.index!;

  const key = withoutPrefix.substring(0, operatorIndex);
  const valueStr = withoutPrefix.substring(operatorIndex + operator.length);

  return (block: Block, props: Prop[]) => {
    const prop = props.find((p) => p.blockId === block.id && p.key === key);
    if (!prop) return false;

    return comparePropertyValue(prop, operator, valueStr);
  };
}

/**
 * Compares a property value with a target value using the specified operator
 */
function comparePropertyValue(prop: Prop, operator: string, valueStr: string): boolean {
  // Determine the actual value based on kind
  let actualValue: string | number | boolean | null = null;

  switch (prop.kind) {
    case "string":
      actualValue = prop.s ?? null;
      break;
    case "number":
      actualValue = prop.n ?? null;
      break;
    case "boolean":
      actualValue = prop.b ?? null;
      break;
    case "date":
    case "datetime":
      actualValue = prop.d ?? null;
      break;
    case "taglist":
      actualValue = prop.t ?? null;
      break;
    default:
      return false;
  }

  if (actualValue === null) return false;

  // Parse target value based on property kind
  let targetValue: string | number | boolean;

  if (prop.kind === "number") {
    targetValue = parseFloat(valueStr);
    if (isNaN(targetValue)) return false;
  } else if (prop.kind === "boolean") {
    targetValue = valueStr.toLowerCase() === "true";
  } else {
    targetValue = valueStr;
  }

  // Perform comparison
  switch (operator) {
    case "=":
      return actualValue === targetValue;
    case ">":
      return actualValue > targetValue;
    case "<":
      return actualValue < targetValue;
    case ">=":
      return actualValue >= targetValue;
    case "<=":
      return actualValue <= targetValue;
    default:
      return false;
  }
}

/**
 * Applies a DSL query to an array of blocks and their properties
 * @param dsl The query string
 * @param blocks Array of blocks to filter
 * @param props Array of all properties
 * @returns Filtered blocks that match the query
 */
export function applyDSL(dsl: string, blocks: Block[], props: Prop[]): Block[] {
  const predicate = parseDSL(dsl);
  return blocks.filter((block) => {
    const blockProps = props.filter((p) => p.blockId === block.id);
    return predicate(block, blockProps);
  });
}
