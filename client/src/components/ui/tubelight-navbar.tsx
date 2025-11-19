import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link } from "wouter"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeItem?: string
  onItemClick?: (item: NavItem) => void
}

export function TubelightNavBar({ items, className, activeItem, onItemClick }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(activeItem || items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (activeItem) {
      setActiveTab(activeItem)
    }
  }, [activeItem])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleClick = (item: NavItem, e?: React.MouseEvent) => {
    // Prevent navigation for hash links
    if (item.url === "#" && e) {
      e.preventDefault()
    }
    setActiveTab(item.name)
    onItemClick?.(item)
  }

  return (
    <div
      className={cn(
        !className?.includes('relative') && !className?.includes('absolute') && !className?.includes('static') 
          ? "fixed bottom-0 left-1/2 -translate-x-1/2 z-50 mb-6"
          : "",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          const itemContent = (
            <>
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10 pointer-events-none"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full pointer-events-none">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2 pointer-events-none" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1 pointer-events-none" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2 pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </>
          )

          const itemClasses = cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors border-0 bg-transparent",
            "text-foreground/80 hover:text-primary",
            isActive && "bg-muted text-primary",
          )

          // Use button for hash links to prevent navigation
          if (item.url === "#") {
            return (
              <button
                key={item.name}
                type="button"
                onClick={(e) => handleClick(item, e)}
                className={itemClasses}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {itemContent}
              </button>
            )
          }

          // Use Link for actual routes
          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={(e) => handleClick(item, e)}
              className={itemClasses}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {itemContent}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
