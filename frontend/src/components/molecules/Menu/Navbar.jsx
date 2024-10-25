import React, { useEffect, useState } from 'react';
import { User } from "@nextui-org/user";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Input } from "@nextui-org/react";
import { SearchIcon } from 'lucide-react';

export const Navbar2 = ({ title }) => {
  const [userData, setUserData] = useState({ nombres: '', cargo: '' });

  useEffect(() => {
    // Obtener el usuario de localStorage al cargar el componente
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        nombres: storedUser.nombres || 'Usuario', // Asegúrate de que el nombre exista
        cargo: storedUser.cargo || 'Rol desconocido', // Asegúrate de que el cargo exista
      });
    }
  }, []);

  return (
    <nav className="sticky top-0 z-20 w-full bg-white shadow-md dark:bg-neutral-800">
      <Navbar>
        <NavbarContent className="flex justify-between items-center px-4">
          <NavbarBrand>
            <p className="font-bold text-base sm:text-xl text-gray-800 dark:text-white">
              TrackProductivo
            </p>
          </NavbarBrand>
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="hidden md:block mr-2">
                <User
                  avatarSrc="https://via.placeholder.com/150"
                  bordered
                  as="button"
                  size="xs"
                  color="primary"
                />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold md:text-base text-gray-800 dark:text-white">
                  {userData.nombres}
                </span>
                <span className="text-xs md:text-sm text-gray-500 dark:text-gray-300">
                  {userData.cargo}
                </span>
              </div>
            </div>
          </div>
        </NavbarContent>
      </Navbar>
    </nav>
  );
};