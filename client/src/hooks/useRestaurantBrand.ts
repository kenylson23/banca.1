import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import type { Restaurant } from "@shared/schema";

interface RestaurantBrand {
  name: string;
  logo?: string;
  restaurantId?: string;
}

export function useRestaurantBrand(overrideRestaurantId?: string) {
  const { user } = useAuth();
  const restaurantId = overrideRestaurantId || user?.restaurantId;

  const { data: restaurant, isLoading } = useQuery<Restaurant>({
    queryKey: ['/api/public/restaurants', restaurantId ?? 'none'],
    enabled: !!restaurantId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const brand: RestaurantBrand = {
    name: restaurant?.name || '',
    logo: restaurant?.logoUrl || undefined,
    restaurantId: restaurantId,
  } as RestaurantBrand;

  return {
    brand,
    isLoading,
    hasRestaurant: !!restaurant,
    isReady: !!restaurant,
  };
}
