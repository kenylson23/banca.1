import "./_group.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { NewOrderDialog } from "./_shared/NewOrderDialogResponsive";
import { queryClient } from "./_shared/mockDependencies";

export function MobileResponsive() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="dark min-h-screen bg-background p-2 text-foreground sm:p-4">
        <NewOrderDialog open onOpenChange={() => undefined} restaurantId="preview-restaurant" />
      </main>
    </QueryClientProvider>
  );
}
