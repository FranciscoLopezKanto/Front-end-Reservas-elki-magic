

const BiciTours = () => {
  const tours = [
    {
     
      name: 'Arriendo de bicicletas por 4 hrs',
      price: 8.000,
      image: '/imagenes/bici1.jpg',
    },
    {
      
      name: 'Arriendo de bicicletas medio dia',
      price: 10.000,
      image: '/imagenes/bici2.jpg',
    },
    {
      
      name: 'Tour guiado Bicicleta',
      price: 25.000,
      image: '/imagenes/tourbici.jpg',
    },
    {
      
      name: 'Descenso Alcohuaz',
      price: 30.000,
      image: '/imagenes/alcohuaz.jpg',
    },
    {
      
      name: 'Descenso Pisco del Elqui',
      price: 25.000,
      image: '/imagenes/pisco.jpg',
    },
  ];

  
/// xD lo mismo
  return (
    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', fontFamily: 'Arial, sans-serif' }}>
    <div style={{ display: 'flex' }}>
      {tours.map((tour) => (
        <div key={tour.id} style={{ marginRight: '20px' }}>
          <img src={tour.image} alt="" className="img-con-marco" style={{ width: '300px', height: '300px' }} />
          <h3>{tour.name}</h3>
          <p>Precio: ${tour.price}</p>
        </div>
      ))}
      </div>

      
    </div>
  );
};

export default BiciTours;
