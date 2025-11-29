import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormattedMenu, linkTo } from "./side-menu";
import clsx from "clsx";

interface SidebarProps {
  menu: Array<FormattedMenu | string>;
}

const Sidebar: React.FC<SidebarProps> = ({ menu }) => {
  const navigate = useNavigate();
  const [menuState, setMenuState] = useState(menu);
  console.log("Sidebar menu:", menuState);  

  const toggleDropdown = (item: FormattedMenu) => {
    item.activeDropdown = !item.activeDropdown;
    setMenuState([...menuState]);
  };

  const renderMenu = (menuItems: Array<FormattedMenu | string>) => {
    return menuItems.map((item, index) => {
      if (typeof item === "string") {
        return (
          <li
            key={index}
            className="text-gray-400 uppercase text-xs font-semibold px-4 py-2"
          >
            {item}
          </li>
        );
      }

      return (
        <li key={index}>
          <div
            className={clsx(
              "flex items-center px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
              item.active
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => {
              if (item.pathname && !item.subMenu) {
                linkTo(item, navigate);
              } else if (item.subMenu) {
                toggleDropdown(item);
              }
            }}
          >
            <i className={`menu-icon ${item.icon}`}></i>
            <span className="truncate">{item.title}</span>
            {item.subMenu && (
              <i
                className={clsx(
                  "ml-auto transition-transform duration-200",
                  item.activeDropdown ? "rotate-180" : "rotate-0"
                )}
              >
                ▼
              </i>
            )}
          </div>
          {item.subMenu && item.activeDropdown && (
            <ul className="pl-8 space-y-2">
              {renderMenu(item.subMenu)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <div className="sidebar">
      <ul className="space-y-2">{renderMenu(menuState)}</ul>
    </div>
  );
};

export default Sidebar;
