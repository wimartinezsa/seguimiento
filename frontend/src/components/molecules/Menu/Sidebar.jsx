import { ChevronFirst, ChevronLast, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import logo from "../../../assets/img/LOGOTIC.png";
import { createContext, useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ModalLogout } from "../../../configs/ModalLogout";

const SidebarContext = createContext();

export default function Sidebar({ children }) {
  const [expanded, setExpanded] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      // Si la ventana es menor a 768px (típico de un dispositivo móvil), colapsa el menú.
      setExpanded(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);
    
    // Limpia el listener al desmontar el componente.
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside className="h-screen bg-white text-black shadow-md border-r-1">
      <nav className="h-full flex flex-col justify-between">
        <div>
          <div className="px-4 py-3 hidden md:flex justify-between items-center bg-gradient-to-r bg-[#ffffff]">
          <div className="flex items-center justify-center">
  <img
    src={logo}
    className={`overflow-hidden duration-500 ease-out rounded-full ${expanded ? "w-32" : "w-0"}`}
    alt="Logo"
  />
</div>
            <button
              onClick={() => setExpanded((curr) => !curr)}
              className="p-2 rounded-lg bg-white text-[#54ae6c] hover:bg-gray-100"
            >
              {expanded ? <ChevronFirst /> : <ChevronLast />}
            </button>
          </div>

          <div className="mt-4 pt-3">
            <span className="ml-3 h-8 flex items-center text-[#0d324c] font-semibold">MENÚ</span>
            <SidebarContext.Provider value={{ expanded, setExpanded }}>
              <ul className="flex-1 px-2 mt-4 py-24">
                {children}
              </ul>
            </SidebarContext.Provider>
          </div>
        </div>
        <div className="flex p-3 bottom-5 w-full cursor-pointer border-t-[1px] border-opacity-45 border-gray-200">
          <LogOut className="ml-1 text-gray-600" size={20} />
          <div
            className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-48 ml-3" : "w-0"}`}
          >
            <ModalLogout />
          </div>
        </div>
      </nav>
    </aside>
  );
}

export function SidebarItem({ nav, icon, text, alert }) {
  const { expanded } = useContext(SidebarContext);
  const { pathname } = useLocation();

  const isActive = pathname.startsWith(nav);

  return (
    <Link to={nav}>
      <li
        className={`relative flex items-center py-2 ${expanded ? "px-5" : "pl-3"} my-1 font-medium rounded-md cursor-pointer group ${isActive ? "bg-gradient-to-r bg-[#219162] text-white" : "hover:bg-[#66b77c] hover:text-white text-gray-700"}`}
      >
        {icon}
        <span
          className={`overflow-hidden transition-all duration-300 ${expanded ? "w-48 ml-3" : "w-0"}`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded-full bg-[#4be0a0] z-40 ${expanded ? "" : "top-2"}`}
          ></div>
        )}
        {!expanded && (
          <div
            className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-green-500 bg-opacity-30 text-[#0c8652] text-sm invisible opacity-0 transform -translate-x-3 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-40`}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  );
}


export function SidebarAccordion({ icon, text, children }) {
  const { expanded, setExpanded } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(false);

  const handleAccordionClick = () => {
    if (!expanded) {
      setExpanded(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleAccordionClick}
        className={`flex items-center justify-between cursor-pointer py-2 my-1 font-medium rounded-md bg-lime-100 hover:bg-lime-200 text-gray-700`}
      >
        <div className="flex items-center">
          {icon}
          {expanded && <span className="ml-3">{text}</span>}
        </div>
        {expanded && (isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />)}
      </div>
      <div
        className={`pl-8 overflow-hidden transition-max-height duration-300 ease-in-out ${isOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        {children}
      </div>
    </div>
  );
}
