"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronRight, ChevronDown, Check, Square } from "lucide-react";
import type { Block } from "@/lib/types";
import { PropertyChips } from "@/components/properties";

interface NodeProps {
  block: Block;
  level: number;
  isSelected: boolean;
  isFolded: boolean;
  hasChildren: boolean;
  onToggleFold: (_blockId: string) => void;
  onZoom: (_blockId: string) => void;
  onSelect: (_blockId: string) => void;
  onUpdateTitle: (_blockId: string, _newTitle: string) => void;
  onToggleTodo: (_blockId: string) => void;
}

export function Node({
  block,
  level,
  isSelected,
  isFolded,
  hasChildren,
  onToggleFold,
  onZoom,
  onSelect,
  onUpdateTitle,
  onToggleTodo,
}: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(block.title || block.content || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Focus node when selected
  useEffect(() => {
    if (isSelected && !isEditing && nodeRef.current) {
      nodeRef.current.focus();
    }
  }, [isSelected, isEditing]);

  const handleSaveEdit = () => {
    if (editValue.trim() !== "" && editValue !== (block.title || block.content)) {
      onUpdateTitle(block.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      setEditValue(block.title || block.content || "");
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    onSelect(block.id);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChevronClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleFold(block.id);
    }
  };

  const handleHeadingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (block.type === "heading") {
      onZoom(block.id);
    }
  };

  const handleTodoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onToggleTodo(block.id);
  };

  const getIndentationClass = () => {
    const indent = level * 4;
    return `pl-${indent}`;
  };

  const renderChevron = () => {
    if (!hasChildren) {
      return <div className="w-5 h-5" />;
    }

    return (
      <button
        onClick={handleChevronClick}
        className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
        aria-label={isFolded ? "Expand" : "Collapse"}
      >
        {isFolded ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        )}
      </button>
    );
  };

  const renderTodoCheckbox = () => {
    if (block.type !== "todo") return null;

    // Check if block has TODO property
    const isDone = block.content?.includes("DONE");

    return (
      <button
        onClick={handleTodoClick}
        className="w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
        aria-label={isDone ? "Mark as TODO" : "Mark as DONE"}
      >
        {isDone ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Square className="w-4 h-4 text-gray-600" />
        )}
      </button>
    );
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    const displayText = block.title || block.content || "Untitled";

    switch (block.type) {
      case "heading":
        return (
          <button
            onClick={handleHeadingClick}
            className="flex-1 text-left font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            {displayText}
          </button>
        );

      case "todo":
        return <span className="flex-1 text-gray-800">{displayText}</span>;

      case "paragraph":
        return <span className="flex-1 text-gray-800">{displayText}</span>;

      case "view":
        return <span className="flex-1 text-purple-600 font-medium">{displayText}</span>;

      default:
        return <span className="flex-1 text-gray-800">{displayText}</span>;
    }
  };

  const renderTags = () => {
    if (!block.tags || block.tags.length === 0) return null;

    return (
      <div className="flex gap-1 ml-2">
        {block.tags.map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      ref={nodeRef}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`
        cursor-pointer transition-colors
        ${getIndentationClass()}
        ${isSelected ? "bg-blue-50 ring-2 ring-blue-500 ring-inset" : "hover:bg-gray-100"}
      `}
      role="treeitem"
      aria-selected={isSelected}
      aria-expanded={hasChildren ? !isFolded : undefined}
      aria-level={level}
    >
      <div className="flex items-center gap-2 py-1 px-2">
        {renderChevron()}
        {renderTodoCheckbox()}
        {renderContent()}
        {renderTags()}
      </div>
      <div className="px-2 pb-1">
        <PropertyChips blockId={block.id} />
      </div>
    </div>
  );
}
