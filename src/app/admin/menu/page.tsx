import { getAllMenuItems, getCategories, getSoldToday } from "@/lib/actions/menu";
import MenuClient from "@/components/admin/MenuClient";

export default async function AdminMenuPage() {
  const [items, categories, soldToday] = await Promise.all([
    getAllMenuItems(),
    getCategories(),
    getSoldToday(),
  ]);
  return <MenuClient initialItems={items} categories={categories} soldToday={soldToday} />;
}
