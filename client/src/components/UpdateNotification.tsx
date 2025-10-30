import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { activateUpdate } from "../registerServiceWorker";

export function UpdateNotification() {
  const { toast } = useToast();
  const [pendingWorker, setPendingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newWorker = customEvent.detail.serviceWorker;
      setPendingWorker(newWorker);

      toast({
        title: "Nova atualização disponível!",
        description: "Uma nova versão do sistema está pronta para ser instalada.",
        action: (
          <Button
            size="sm"
            onClick={() => {
              if (newWorker) {
                activateUpdate(newWorker);
              }
            }}
            data-testid="button-update-app"
          >
            Atualizar
          </Button>
        ),
        duration: Infinity,
      });
    };

    window.addEventListener('app-update-available', handleUpdate);

    return () => {
      window.removeEventListener('app-update-available', handleUpdate);
    };
  }, [toast]);

  return null;
}
