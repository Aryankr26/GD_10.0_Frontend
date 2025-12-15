// src/components/Owner/OwnersDashboard.jsx
import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";

/* IMPORTS: same folder (adjust paths if your files are in a different folder) */
import DashboardOverview  from "./DashboardOverview";
import { DailyDataBook } from "./DailyDataBook";
import { RokadiUpdate } from "./RokadiUpdate";
//import { BankAccount } from "./BankAccount";
import { FeriwalaSection } from "./FeriwalaSection";
import { LabourSection } from "./LabourSection";
import KabadiwalaSection from "./KabadiwalaSection";
//import { PartnershipAccount } from "./PartnershipAccount";
//import { BusinessReports } from "./BusinessReports";
import { MillSection } from "./MillSection";
import RatesUpdate from "./RatesUpdate";
//import TruckDriver from "./TruckDriver";
import MaalIn from "./MaalIn";

/* menu items */
const menuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "daily-book", label: "Daily Data Book" },
  { id: "rokadi", label: "Rokadi Update" },
  //{ id: "bank", label: "Bank Account" },
  { id: "labour", label: "Labour" },
  { id: "feriwala", label: "Feriwala" },
  //{ id: "truck-driver", label: "Truck Driver" },
  { id: "maal-in", label: "Maal In" },
  { id: "kabadiwala", label: "Kabadiwala" },
 // { id: "partnership", label: "Partnership" },
  { id: "rates-update", label: "Rates Update" },
 // { id: "business-reports", label: "Business Reports" },
  { id: "mill", label: "Party / Mill" },
];

export function OwnersDashboard(props) {
  // props: activeSection (optional), setActiveSection (optional)
  const { activeSection: activeFromProps = "daily-book", setActiveSection } = props;

  // If parent didn't provide a state setter, manage local state
  const [localActive, setLocalActive] = useState(activeFromProps);

  // whichever is "authoritative"
  const currentActive = typeof setActiveSection === "function" ? activeFromProps : localActive;

  // helper to change section safely
  const setSection = (id) => {
    if (typeof setActiveSection === "function") {
      try { 
        setActiveSection(id);
      } catch (e) {
        // fallback to local state on error
        // eslint-disable-next-line no-console
        console.warn("setActiveSection threw:", e);
        setLocalActive(id);
      }
    } else {
      setLocalActive(id);
    }
  };

  const renderOwnerSection = () => {
    switch (currentActive) {
      case "dashboard":
        return <DashboardOverview />;
      case "daily-book":
        return <DailyDataBook />;
      case "maal-in":
        return <MaalIn />;
     // case "truck-driver":
        //return <TruckDriver />;
      case "rokadi":
        return <RokadiUpdate />;
      //case "bank":
        //return <BankAccount />;
      case "labour":
        return <LabourSection />;
      case "feriwala":
        return <FeriwalaSection />;
      case "kabadiwala":
        return <KabadiwalaSection />;
      //case "partnership":
        //return <PartnershipAccount />;
      case "rates-update":
        return <RatesUpdate />;
      //case "business-reports":
       // return <BusinessReports />;
      case "mill":
        return <MillSection />;
      default:
        return <DailyDataBook />;
    }
  };

  return (
    <div className="pt-24 p-4 w-full">
      {/* Open Menu button (dropdown) */}
      <div className="mb-6 flex justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-green-600 text-white px-4 py-2">Open Menu</Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-60" side="bottom">
            {menuItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setSection(item.id)}
                className="cursor-pointer"
                role="menuitem"
              >
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* render the selected section */}
      <div>{renderOwnerSection()}</div>
    </div>
  );
}

export default OwnersDashboard;
