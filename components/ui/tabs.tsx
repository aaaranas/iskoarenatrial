import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("tabs", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsList) {
          return React.cloneElement(child, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ value, onValueChange, children, className }: TabsListProps) {
  return (
    <div className={cn("tabs-list", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, { isActive: child.props.value === value, onClick: () => onValueChange(child.props.value) });
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function TabsTrigger({ value, isActive, onClick, children, className }: TabsTriggerProps) {
  return (
    <button
      className={cn(
        "tabs-trigger",
        isActive ? "active" : "",
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface TabsContentProps {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, activeValue, children, className }: TabsContentProps) {
  if (value !== activeValue) return null;
  return <div className={cn("tabs-content", className)}>{children}</div>;
}