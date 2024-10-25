import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../configs/axiosClient';
import Swal from 'sweetalert2';
import { Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/img/LOGOTIC.png";

export const LoginPage = () => {
  const [mensaje, setMensaje] = useState('');
  const [modalAcciones, setModalAcciones] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const correo = useRef(null);
  const password = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailValue = correo.current.value;
      const passwordValue = password.current.value;
      if (!emailValue || !passwordValue) {
        setMensaje('Los campos son obligatorios');
        setModalAcciones(true);
        return;
      }
      const data = { correo: emailValue, password: passwordValue };
      const response = await axiosClient.post('/validacion', data);
      if (response.status === 200 && response.data.token) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('cargo', user.cargo);
        Swal.fire({
          position: 'top-center',
          icon: 'success',
          title: 'Bienvenido',
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          const usercargo = user.cargo;
          navigate('/home');
        });
      } else {
        setMensaje('Credenciales incorrectas');
        setModalAcciones(false);
        Swal.fire({
          position: 'top-center',
          icon: 'error',
          title: 'Datos Incorrectos',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error) {
      alert('Error del servidor: ' + error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="flex w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/path/to/yamboro2.webp')" }}
    >
      <div className="flex flex-col justify-center w-full px-6 py-12 sm:py-24 bg-white bg-opacity-80 backdrop-blur-md">
        <div className="relative w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg bg-opacity-90">
          <div className="text-center flex flex-col items-center">
            <img className="w-40 mb-6" src={logo} alt="logo" />
            <h4 className="mb-4 text-2xl font-bold text-[#0d324c]">TrackProductivo</h4>
            <p className="mb-6 text-gray-600">Por favor, ingrese a su cuenta</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="relative">
                <input
                  className="peer w-full rounded border border-gray-300 bg-white px-3 py-2 placeholder-transparent focus:border-[#198d57] focus:outline-none focus:ring-1 focus:ring-[#198d57]"
                  type="email"
                  label="Correo"
                  variant="bordered"
                  name="correo"
                  id="correo"
                  ref={correo}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                />
                <label
                  htmlFor="correo"
                  className={`absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all ${usernameFocused || correo.current?.value ? 'transform -translate-y-4 text-[#198d57]' : ''}`}
                >
                  Correo Electrónico
                </label>
              </div>
            </div>
            <div className="mb-6">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="peer w-full rounded border border-gray-300 bg-white px-3 py-2 placeholder-transparent focus:border-[#198d57] focus:outline-none focus:ring-1 focus:ring-[#198d57]"
                  label="Contraseña"
                  variant="bordered"
                  ref={password}
                  name="password"
                  id="password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <button
                  onClick={togglePasswordVisibility}
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <label
                  htmlFor="password"
                  className={`absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all ${passwordFocused || password.current?.value ? 'transform -translate-y-4 text-[#198d57]' : ''}`}
                >
                  Contraseña
                </label>
              </div>
            </div>
            <div className="mb-6">
              <button
                className="w-full px-6 py-2.5 rounded bg-[#74cd62] text-white text-sm font-medium leading-normal shadow-md hover:bg-[#0c8652] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198d57]"
                type="submit"
              >
                Log in
              </button>
            </div>
            <div className="flex justify-center items-center mb-6">
              <a href="/registro" className="text-sm text-[#0d324c] hover:underline">¿No tienes una cuenta?, ¡Registrate!</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );



  
};
