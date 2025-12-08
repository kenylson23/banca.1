import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building2 } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, restaurantName, restaurantLogo, ...props }) {
        const hasRestaurantInfo = restaurantName || restaurantLogo;
        
        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3 w-full">
              {hasRestaurantInfo && (
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={restaurantLogo} alt={restaurantName || 'Restaurant'} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {restaurantName ? restaurantName.substring(0, 2).toUpperCase() : <Building2 className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="grid gap-1 flex-1">
                {hasRestaurantInfo && restaurantName && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {restaurantName}
                  </span>
                )}
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
