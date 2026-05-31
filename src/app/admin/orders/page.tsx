import { getOrders } from "@/lib/actions/admin/orders";
import OrderFeed from "@/components/admin/OrderFeed";

export default async function OrdersPage() {
  const initialOrders = await getOrders();
  return <OrderFeed initialOrders={initialOrders} />;
}
