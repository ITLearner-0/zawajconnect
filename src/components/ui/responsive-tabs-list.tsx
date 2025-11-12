import * as React from "react"
import { TabsList } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface ResponsiveTabsListProps extends React.ComponentPropsWithoutRef<typeof TabsList> {
  /**
   * Number of tabs to display
   * Automatically adjusts grid columns for mobile responsiveness
   */
  tabCount: number
  className?: string
}

/**
 * Responsive TabsList that automatically adjusts grid columns for mobile
 *
 * Mobile breakpoints strategy:
 * - 1-2 tabs: Always fit in one row
 * - 3-4 tabs: 2 cols on mobile, full on tablet+
 * - 5-6 tabs: 2 cols on mobile, 3 on tablet, full on desktop
 * - 7+ tabs: 2 cols on mobile, 3 on tablet, 4 on lg, full on xl
 *
 * Example:
 * ```tsx
 * <ResponsiveTabsList tabCount={6}>
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   ...
 * </ResponsiveTabsList>
 * ```
 */
export const ResponsiveTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  ResponsiveTabsListProps
>(({ tabCount, className, children, ...props }, ref) => {
  // Determine responsive grid classes based on tab count
  const getGridClasses = () => {
    if (tabCount <= 2) {
      return "grid-cols-2"
    } else if (tabCount === 3) {
      return "grid-cols-2 sm:grid-cols-3"
    } else if (tabCount === 4) {
      return "grid-cols-2 md:grid-cols-4"
    } else if (tabCount === 5) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
    } else if (tabCount === 6) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6"
    } else if (tabCount === 7) {
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7"
    } else if (tabCount === 8) {
      return "grid-cols-2 sm:grid-cols-4 md:grid-cols-4 xl:grid-cols-8"
    } else {
      // 9+ tabs - most aggressive responsive strategy
      return "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9"
    }
  }

  return (
    <TabsList
      ref={ref}
      className={cn("grid w-full", getGridClasses(), className)}
      {...props}
    >
      {children}
    </TabsList>
  )
})

ResponsiveTabsList.displayName = "ResponsiveTabsList"
