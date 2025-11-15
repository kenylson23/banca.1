import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, QrCode, Share2 } from "lucide-react";

export function MarketingCard() {
  return (
    <Card data-testid="card-marketing-tools">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="h-5 w-5" />
          Ferramentas de marketing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm" data-testid="button-qr-codes">
          <QrCode className="h-4 w-4 mr-2" />
          QR Codes das mesas
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm" data-testid="button-share-menu">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar menu
        </Button>
      </CardContent>
    </Card>
  );
}
