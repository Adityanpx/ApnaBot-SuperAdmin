// app/(dashboard)/vehicle-catalog/page.jsx
// The vehicle catalog moved into Business Settings (Travels / Cab →
// Vehicle types, see components/vehicleCatalog/VehicleCatalogPanel.jsx).
// Kept as a redirect so old links and bookmarks still work.
import { redirect } from 'next/navigation';

export default function VehicleCatalogRedirect() {
  redirect('/business-settings/travels?tab=vehicle-types');
}
