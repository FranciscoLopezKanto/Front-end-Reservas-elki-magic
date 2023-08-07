// pages/index.js
"use client"

/*
________________________________________________________________________________________________________________________________

nunca olvidar el "use client" si no da error 
________________________________________________________________________________________________________________________________

*/
// pages/index.js
import React, { useState, useEffect } from 'react';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import axios from 'axios';

import './globals.css';
import Header from './Header';
import BiciTours from './BiciTours';
import VehiculeTours from './VehiculeTours';
import FacebookPlugin from './FacebookPlugin';
import Maps from './Maps';
import SelloCalidad from './SelloCalidad';

function DatePicker() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [cantidad_personas, setCantidadPersonas] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [servicios, setServicios] = useState([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');
  const [cuposDisponibles, setCuposDisponibles] = useState(0);
  const [blockedDates, setBlockedDates] = useState([]);
  const [showBlockedDates, setShowBlockedDates] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reservasEnFecha, setReservasEnFecha] = useState([]); 
  const [correo, setCorreo] = useState('');
  const images = [
    '/imagenes/pisco.jpg',
    '/imagenes/tourbici.jpg',
    '/imagenes/bici2.jpg',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
  
    return () => clearInterval(interval);
  }, [images.length]);  

  useEffect(() => {
    axios
      .get('https://backedpago.fly.dev/api/servicios')
      .then((response) => {
        setServicios(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    fetchBlockedDates();
  }, []);

  const fetchBlockedDates = async () => {
    try {
      const res = await axios.get('https://backedpago.fly.dev/api/blocked-dates');
      setBlockedDates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setReservasEnFecha([]); // Agregado aquí para reiniciar las reservas en fecha
    fetchReservasEnFecha(date);
  };

  const fetchReservasEnFecha = (date) => {
    const formattedDate = formatDate(date);
    axios
      .get(`https://backedpago.fly.dev/api/reservas/${formattedDate}`)
      .then((response) => {
        setReservasEnFecha(response.data);

        if (response.data.length > 0) {
          const reservaServicioId = response.data[0].servicio_id;
          const servicio = servicios.find((servicio) => servicio.id === reservaServicioId);
          const nombreServicio = servicio?.nombre;
          const totalCupos = servicio?.cupos_maximos - response.data.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0);

          setServicioSeleccionado(nombreServicio);
          setCuposDisponibles(totalCupos);
        } else {
          setServicioSeleccionado('');
          setCuposDisponibles(0);
        }
      })
      .catch((error) => {
        console.error(error);
        setReservasEnFecha([]);
        setServicioSeleccionado('');
        setCuposDisponibles(0);
      });
  };

  const formatDate = (date) => {
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const saveDateToDatabase = () => {
    const formattedDate = formatDate(selectedDate);
  
    if (formattedDate && validateServicioId() && validateCantidadPersonas()) {
      const selectedServicio = servicios.find((servicio) => servicio.id === parseInt(servicioId));
      
      if (selectedServicio) {
        const descripcion = `${selectedServicio.nombre} para ${cantidad_personas} persona/s en la fecha ${selectedDate.toLocaleDateString()}`;
        const valorServicioSeleccionado = selectedServicio ? selectedServicio.valor_servicio : 0;
  
        const data = {
          servicio_id: parseInt(servicioId),
          fecha_reserva: formattedDate,
          correo: correo,
          cantidad_personas: parseInt(cantidad_personas),
          valor_pagado: parseInt(valorServicioSeleccionado * cantidad_personas),
          description: descripcion
        };
    
        axios
          .post('https://backedpago.fly.dev/reservas', data)
          .then((response) => {
            console.log(response.data);
            
    
            window.location.href = response.data.redirectUrl;
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  };
  
    
  const maxCupos = servicios.find((servicio) => servicio.id === parseInt(servicioId))?.cupos_maximos || 0;
  const toggleBlockedDates = () => {
    setShowBlockedDates(!showBlockedDates);
  };

  const validateServicioId = () => {
    const parsedServicioId = parseInt(servicioId);
    return !isNaN(parsedServicioId) && parsedServicioId >= 1 && parsedServicioId <= 7;
  };

  const validateCantidadPersonas = () => {
    const parsedCantidadPersonas = parseInt(cantidad_personas);
    const selectedServicio = servicios.find((servicio) => servicio.id === parseInt(servicioId));
  
    const cuposRestantes = maxCupos - reservasEnFecha.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0);
  
    return (
      !isNaN(parsedCantidadPersonas) &&
      parsedCantidadPersonas >= 1 &&
      selectedServicio &&
      parsedCantidadPersonas <= cuposRestantes
    );
  };
  
 

  return (
    <div className="container">
      <Header />
      <div class="image-gallery">
        <img src={images[currentImageIndex]} alt={`Imagen ${currentImageIndex + 1}`} />
        <div class="gallery-title">Nuestros Servicios</div>
      </div>

      <div className="Tour" style={{ marginTop: '-70px' }}>
        <BiciTours />
        <VehiculeTours />
      </div>
      <div className="form-container">
        <h1>Reserva tu tour</h1>
        <button onClick={toggleBlockedDates}>
          {showBlockedDates ? 'Ocultar' : 'Mostrar'} Fechas no disponibles
        </button>
        {showBlockedDates && (
          <ul>
            {blockedDates.map((date, index) => (
              <li key={index} className="blocked-date">
                {date.fecha_reserva}
              </li>
            ))}
          </ul>
        )}
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          minDate={new Date()} // Establece la fecha mínima como la fecha actual
        />
        <p>Servicios</p>
        <select
          value={servicioId}
          onChange={(e) => setServicioId(e.target.value)}
          placeholder="Selecciona un servicio"
        >
        <option value="">Selecciona un servicio</option>
        {servicios.map((servicio) => (
          (servicioSeleccionado && reservasEnFecha.some(reserva => reserva.servicio_id === servicio.id)) ||
          (!servicioSeleccionado || !reservasEnFecha.length) ? (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ) : null
        ))}
      </select>


        <input
          type="number"
          value={cantidad_personas}
          onChange={(e) => setCantidadPersonas(e.target.value)}
          placeholder={`Cantidad de personas (1-${maxCupos - reservasEnFecha.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0)})`}
          max={maxCupos - reservasEnFecha.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0)}
          min={servicioSeleccionado ? 1 : 0}
          style={{ width: '100%', padding: '4px' }}
/>

<input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo electrónico"
          />
        {!validateCantidadPersonas() && (
          <p className="error-message">
            Por favor, ingresa una cantidad de personas válida (1 a {maxCupos - reservasEnFecha.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0)}).
          </p>
        )}

        {servicioSeleccionado && (
          <div>
            <p>
              Hay reservas en la fecha seleccionada del servicio {servicioSeleccionado}.
            </p>
            <p>
              Cupos  {cuposDisponibles}
            </p>
            <p>
              Cantidad de personas en reservas: {reservasEnFecha.reduce((total, reserva) => total + parseInt(reserva.total_personas), 0)}
            </p>
          
          </div>
        )}
        {!servicioSeleccionado && <p>No hay reservas en la fecha seleccionada.</p>}
       

        <button onClick={saveDateToDatabase}>Pagar</button>
      </div>

      <div className="FacebookPlugin" style={{ position: 'absolute', bottom: '-1415px', right: '140px' }}>
        <FacebookPlugin />
      </div>

      <div className="Maps" style={{ position: 'absolute', bottom: '-1650px', right: '500px' }}>
        <Maps />
      </div>

      <div className="Sello">
        <SelloCalidad />
      </div>
    </div>
  );
}

export default DatePicker;
