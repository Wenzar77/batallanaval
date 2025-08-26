const HISTORIA_BANK = [
  { q: '¿Qué ciudad amazónica fue ocupada por Perú en 1932, detonando el conflicto con Colombia?', opts: ['Iquitos', 'Leticia', 'Manaos'], a: 1 },
  { q: '¿En qué río hubo acciones navales durante 1932–33?', opts: ['Putumayo', 'Caquetá', 'Amazonas'], a: 2 },
  { q: 'En la Guerra de los Mil Días, ¿qué color representaba a los liberales?', opts: ['Azul', 'Rojo', 'Blanco'], a: 1 },
  { q: 'Una causa económica clave de la Guerra de los Mil Días fue:', opts: ['Oro', 'Banano', 'Café'], a: 2 },
  { q: 'En 1863, Colombia venció a Ecuador en la batalla de:', opts: ['Pichincha', 'Boyacá', 'Cuaspud'], a: 2 },
  { q: '¿Qué presidente ecuatoriano enfrentó a Colombia en 1863?', opts: ['Eloy Alfaro', 'Gabriel García Moreno', 'Antonio Borrero'], a: 1 },
  { q: 'La independencia de la Nueva Granada se consolidó con la batalla de:', opts: ['Ayacucho', 'Boyacá', 'Junín'], a: 1 },
  { q: 'La Campaña Libertadora de 1819 tuvo como objetivo principal:', opts: ['Expulsar tropas realistas', 'Conquistar Panamá', 'Firmar tratado con Perú'], a: 0 },
  { q: 'País con disputas marítimas recientes con Colombia en el Caribe:', opts: ['Nicaragua', 'Bolivia', 'Uruguay'], a: 0 },
];


const DEPORTE_BANK = [
  { q: '¿Qué ciclista colombiano ganó el Giro de Italia en 2014?', opts: ['Nairo Quintana', 'Egan Bernal', 'Rigoberto Urán'], a: 0 },
  { q: '¿En qué año Egan Bernal ganó el Tour de Francia?', opts: ['2017', '2019', '2021'], a: 1 },
  { q: '¿Quién es conocida como la reina del BMX en Colombia?', opts: ['Mariana Pajón', 'Caterine Ibargüen', 'Ingrid Drexel'], a: 0 },
  { q: '¿Qué medalla olímpica ganó Caterine Ibargüen en Río 2016?', opts: ['Oro', 'Plata', 'Bronce'], a: 0 },
  { q: '¿Qué futbolista colombiano jugó en el Real Madrid en 2014?', opts: ['Radamel Falcao', 'James Rodríguez', 'Juan Cuadrado'], a: 1 },
  { q: '¿Qué selección eliminó a Colombia en el Mundial 2018?', opts: ['Brasil', 'Inglaterra', 'Uruguay'], a: 1 },
  { q: '¿Qué arquero colombiano fue figura en penales contra Uruguay en Copa América 2021?', opts: ['David Ospina', 'Camilo Vargas', 'Aldair Quintana'], a: 0 },
  { q: '¿En qué deporte se destacó Óscar Figueroa?', opts: ['Boxeo', 'Halterofilia', 'Lucha libre'], a: 1 },
  { q: '¿Qué jugador colombiano brilló en el Porto antes de llegar al Liverpool?', opts: ['Luis Díaz', 'Teófilo Gutiérrez', 'Jackson Martínez'], a: 0 },
  { q: '¿Qué ciclista apodado "Superman" es colombiano?', opts: ['Sergio Higuita', 'Miguel Ángel López', 'Esteban Chaves'], a: 1 },
  { q: '¿Qué equipo colombiano ganó la Copa Libertadores en 2016?', opts: ['Atlético Nacional', 'América de Cali', 'Junior'], a: 0 },
  { q: '¿Qué boxeador colombiano fue campeón mundial supergallo?', opts: ['Éder Jofre', 'Óscar Rivas', 'Yonnhy Pérez'], a: 2 },
  { q: '¿Qué futbolista es apodado "El Tigre"?', opts: ['James Rodríguez', 'Radamel Falcao García', 'Freddy Rincón'], a: 1 },
  { q: '¿Qué ciclista colombiano ganó la Vuelta a España en 2016?', opts: ['Egan Bernal', 'Nairo Quintana', 'Rigoberto Urán'], a: 1 },
  { q: '¿Qué club colombiano tiene más títulos de liga?', opts: ['Millonarios', 'Atlético Nacional', 'América de Cali'], a: 1 },
  { q: '¿Qué jugadora colombiana fue estrella en la Copa América Femenina 2022?', opts: ['Leicy Santos', 'Catalina Usme', 'Yoreli Rincón'], a: 1 },
  { q: '¿Qué deportista ganó oro olímpico en halterofilia Londres 2012?', opts: ['Óscar Figueroa', 'María Isabel Urrutia', 'Luis Javier Mosquera'], a: 0 },
  { q: '¿Qué selección goleó a Argentina en la Copa América 2019?', opts: ['Brasil', 'Colombia', 'Chile'], a: 1 },
  { q: '¿Qué ciclista colombiano ganó la París-Niza en 2013?', opts: ['Sergio Henao', 'Rigoberto Urán', 'Nairo Quintana'], a: 0 },
  { q: '¿Qué ciudad fue sede de los Juegos Panamericanos Junior 2021?', opts: ['Medellín', 'Cali', 'Barranquilla'], a: 1 },
];


const FARANDULA_BANK = [
  { q: '¿Qué cantante paisa lanzó el álbum "Colores" en 2020?', opts: ['Maluma', 'J Balvin', 'Karol G'], a: 1 },
  { q: '¿Quién protagonizó la serie "La Reina del Flow"?', opts: ['Carolina Ramírez', 'Carmen Villalobos', 'Greeicy Rendón'], a: 0 },
  { q: 'En 2021, Karol G lanzó el éxito global:', opts: ['Tusa', 'Bichota', 'Provenza'], a: 1 },
  { q: '¿Qué artista colombiano colaboró con Shakira en "La Bicicleta"?', opts: ['Juanes', 'Carlos Vives', 'Sebastián Yatra'], a: 1 },
  { q: '¿Quién ganó "La Voz Kids Colombia" en 2015?', opts: ['Andrés Cepeda', 'Camilo Echeverry', 'Fabián Torres'], a: 2 },
  { q: '¿Qué actor colombiano interpretó a Pablo Escobar en "Narcos"?', opts: ['Manolo Cardona', 'Andrés Parra', 'Wagner Moura'], a: 1 },
  { q: '¿Quién fue la Señorita Colombia en 2014 y Miss Universo en 2015 (aunque inicialmente hubo confusión)?', opts: ['Paulina Vega', 'Ariadna Gutiérrez', 'Valeria Morales'], a: 1 },
  { q: '¿Qué presentador colombiano fue parte de "Yo me llamo"?', opts: ['Jota Mario Valencia', 'Ernesto Calzadilla', 'Carlos Calero'], a: 2 },
  { q: 'En 2022, Greeicy Rendón y Mike Bahía anunciaron:', opts: ['Su separación', 'El nacimiento de su hijo', 'Un álbum conjunto'], a: 1 },
  { q: '¿Qué cantante paisa lanzó la canción "ADMV"?', opts: ['Maluma', 'J Balvin', 'Feid'], a: 0 },
  { q: '¿Qué novela colombiana fue remake de "Café con aroma de mujer" en 2021?', opts: ['Yo soy Betty, la fea', 'Café', 'Pasión de gavilanes'], a: 1 },
  { q: '¿Qué actor colombiano interpretó a Sebastián Vallejo en "Café con aroma de mujer" (2021)?', opts: ['Sebastián Martínez', 'William Levy', 'Diego Cadavid'], a: 1 },
  { q: '¿Qué ciudad vio nacer al cantante Feid?', opts: ['Medellín', 'Bogotá', 'Cali'], a: 0 },
  { q: '¿Quién fue juez en "A Otro Nivel"?', opts: ['Fonseca', 'Silvestre Dangond', 'Carlos Vives'], a: 2 },
  { q: '¿Qué influencer caleña es conocida como "La Liendra"?', opts: ['María Legarda', 'Andrés Villa', 'Mauricio Gómez'], a: 2 },
  { q: 'En 2019, Sebastián Yatra tuvo gran éxito con la canción:', opts: ['Robarte un beso', 'Traicionera', 'Cristina'], a: 2 },
  { q: '¿Qué actriz interpretó a "Rosario Tijeras" en la versión 2016?', opts: ['Majida Issa', 'Carolina Ramírez', 'Ana María Orozco'], a: 0 },
  { q: '¿Qué cantante colombiana protagonizó la película "Encanto" con su voz?', opts: ['Shakira', 'Carolina Gaitán', 'Fanny Lu'], a: 1 },
  { q: '¿Qué comediante colombiano ganó fama con "Sábados Felices"?', opts: ['Hassam', 'Polilla', 'Don Jediondo'], a: 0 },
  { q: '¿Qué cantante fue pareja de Anuel AA?', opts: ['Karol G', 'Farina', 'Greeicy'], a: 0 },
];

// =============================
// File: data/trivia_colombia_extra.js
// =============================
const TRIVIA_COLOMBIA_EXTRA = [
  {
    q: "¿Cuál es el volcán activo más alto de Colombia?",
    opts: ["Nevado del Ruiz", "Galeras", "Nevado del Huila", "Puracé"],
    a: 2
  },
  {
    q: "¿En qué departamento se encuentra la Catedral de Sal de Zipaquirá?",
    opts: ["Boyacá", "Cundinamarca", "Santander", "Tolima"],
    a: 1
  },
  {
    q: "¿Cuál es el lago más grande de Colombia?",
    opts: ["Lago Tota", "Laguna de Fúquene", "Laguna de la Cocha", "Lago Calima"],
    a: 0
  },
  {
    q: "¿Cuál es el desierto más grande de Colombia?",
    opts: ["Tatacoa", "Guajira", "La Candelaria", "Occidente"],
    a: 1
  },
  {
    q: "¿En qué departamento está el Parque Nacional Natural Chiribiquete?",
    opts: ["Caquetá", "Guaviare", "Amazonas", "Meta"],
    a: 0
  },
  {
    q: "¿Qué ciudad colombiana es conocida como la 'Ciudad de la Eterna Primavera'?",
    opts: ["Bogotá", "Medellín", "Cali", "Pereira"],
    a: 1
  },
  {
    q: "¿Qué río delimita la frontera sur entre Colombia y Perú?",
    opts: ["Río Putumayo", "Río Amazonas", "Río Caquetá", "Río Apaporis"],
    a: 1
  },
  {
    q: "¿Cuál es el pico nevado más alto de Colombia?",
    opts: ["Nevado del Ruiz", "Pico Cristóbal Colón", "Pico Simón Bolívar", "Nevado del Huila"],
    a: 1
  },
  {
    q: "¿En qué cordillera está ubicado el Nevado del Ruiz?",
    opts: ["Cordillera Oriental", "Cordillera Central", "Cordillera Occidental", "Sierra Nevada"],
    a: 1
  },
  {
    q: "¿Cuál es la ciudad más antigua de Colombia fundada por los españoles?",
    opts: ["Cartagena", "Santa Marta", "Popayán", "Tunja"],
    a: 1
  },
  {
    q: "¿Qué río atraviesa la ciudad de Bogotá?",
    opts: ["Río Tunjuelo", "Río Magdalena", "Río Bogotá", "Río Sumapaz"],
    a: 2
  },
  {
    q: "¿Cuál es la capital del departamento del Vaupés?",
    opts: ["Mocoa", "Mitú", "Leticia", "San José del Guaviare"],
    a: 1
  },
  {
    q: "¿Qué ciudad colombiana es conocida como la 'Sucursal del Cielo'?",
    opts: ["Medellín", "Cali", "Barranquilla", "Cartagena"],
    a: 1
  },
  {
    q: "¿Qué desierto colombiano es famoso por su observación astronómica?",
    opts: ["Guajira", "Tatacoa", "Sumapaz", "Sabana de Bogotá"],
    a: 1
  },
  {
    q: "¿Cuál es el río más caudaloso de Colombia?",
    opts: ["Magdalena", "Amazonas", "Orinoco", "Caquetá"],
    a: 1
  },
  {
    q: "¿Qué ciudad es conocida como la 'Capital Musical de Colombia'?",
    opts: ["Ibagué", "Popayán", "Neiva", "Villavicencio"],
    a: 0
  },
  {
    q: "¿Qué isla colombiana es famosa por su ecosistema único y tiburones martillo?",
    opts: ["San Andrés", "Isla Gorgona", "Isla Malpelo", "Providencia"],
    a: 2
  },
  {
    q: "¿Qué puerto colombiano es el más importante sobre el océano Pacífico?",
    opts: ["Tumaco", "Buenaventura", "Bahía Solano", "Quibdó"],
    a: 1
  },
  {
    q: "¿Qué ciudad es llamada 'La Heroica'?",
    opts: ["Cartagena", "Santa Marta", "Barranquilla", "Tunja"],
    a: 0
  },
  {
    q: "¿Cuál es el río que atraviesa el Cañón del Chicamocha?",
    opts: ["Río Cauca", "Río Chicamocha", "Río Suárez", "Río Magdalena"],
    a: 1
  },
  {
    q: "¿Qué ciudad colombiana es conocida como la 'Ciudad Blanca'?",
    opts: ["Popayán", "Tunja", "Santa Marta", "Manizales"],
    a: 0
  },
  {
    q: "¿En qué ciudad se encuentra el Cerro de Monserrate?",
    opts: ["Medellín", "Bogotá", "Cali", "Pasto"],
    a: 1
  },
  {
    q: "¿Qué parque natural colombiano es Patrimonio de la Humanidad y refugio de manatíes?",
    opts: ["Tayrona", "Amacayacu", "Chiribiquete", "Los Katíos"],
    a: 3
  },
  {
    q: "¿Qué departamento colombiano limita con 5 países?",
    opts: ["Amazonas", "Guainía", "Vichada", "Putumayo"],
    a: 1
  },
  {
    q: "¿Cuál es el río que marca la frontera natural entre Colombia y Venezuela?",
    opts: ["Río Orinoco", "Río Arauca", "Río Meta", "Río Guaviare"],
    a: 0
  },
  {
    q: "¿Qué volcán destruyó la ciudad de Armero en 1985?",
    opts: ["Nevado del Ruiz", "Galeras", "Machín", "Puracé"],
    a: 0
  },
  {
    q: "¿Qué ciudad es la capital del departamento del Chocó?",
    opts: ["Quibdó", "Apartadó", "Bahía Solano", "Turbo"],
    a: 0
  },
  {
    q: "¿En qué ciudad se realiza el Carnaval de Negros y Blancos?",
    opts: ["Barranquilla", "Pasto", "Cali", "Cartagena"],
    a: 1
  },
  {
    q: "¿Qué departamento alberga el Santuario de Fauna y Flora de los Flamencos?",
    opts: ["La Guajira", "Cesar", "Magdalena", "Atlántico"],
    a: 0
  },
  {
    q: "¿Cuál es el río que pasa por Villavicencio?",
    opts: ["Guatiquía", "Meta", "Guaviare", "Ariari"],
    a: 0
  },
  {
    q: "¿Qué cordillera atraviesa la ciudad de Bucaramanga?",
    opts: ["Cordillera Oriental", "Cordillera Central", "Cordillera Occidental", "Sierra Nevada"],
    a: 0
  },
  {
    q: "¿Qué departamento es conocido como 'El pulmón de Colombia'?",
    opts: ["Meta", "Amazonas", "Guaviare", "Caquetá"],
    a: 1
  },
  {
    q: "¿Qué isla colombiana fue prisión y hoy es parque natural?",
    opts: ["Gorgona", "Malpelo", "Providencia", "Rosario"],
    a: 0
  },
  {
    q: "¿Cuál es la capital del departamento de Putumayo?",
    opts: ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez"],
    a: 0
  },
  {
    q: "¿Qué ciudad es conocida como 'La Ciudad Bonita de Colombia'?",
    opts: ["Cúcuta", "Bucaramanga", "Tunja", "Neiva"],
    a: 1
  },
  {
    q: "¿Qué volcán está ubicado cerca de la ciudad de Pasto?",
    opts: ["Galeras", "Doña Juana", "Azufral", "Puracé"],
    a: 0
  },
  {
    q: "¿Qué parque natural colombiano protege el ecosistema del río Apaporis?",
    opts: ["Chiribiquete", "La Paya", "Amacayacu", "Tinigua"],
    a: 0
  },
  {
    q: "¿En qué ciudad está el Parque Nacional Natural Tayrona?",
    opts: ["Cartagena", "Santa Marta", "Barranquilla", "Riohacha"],
    a: 1
  },
  {
    q: "¿Qué desierto es famoso por sus festivales de música Wayúu?",
    opts: ["Tatacoa", "La Guajira", "La Candelaria", "Occidente"],
    a: 1
  },
  {
    q: "¿Qué montaña es conocida como la 'estrella fluvial de Colombia'?",
    opts: ["Sierra Nevada de Santa Marta", "Macizo Colombiano", "Nevado del Ruiz", "Páramo de Sumapaz"],
    a: 1
  },
  {
    q: "¿Cuál es el río que forma parte de las 'Siete Maravillas Naturales de Colombia' por sus colores?",
    opts: ["Caño Cristales", "Río Magdalena", "Río Atrato", "Río Amazonas"],
    a: 0
  },
  {
    q: "¿Qué ciudad colombiana es llamada 'La Ciudad de los Puentes'?",
    opts: ["Villavicencio", "Honda", "Girardot", "Ipiales"],
    a: 1
  },
  {
    q: "¿En qué departamento se encuentra la Laguna de la Cocha?",
    opts: ["Nariño", "Putumayo", "Cauca", "Caquetá"],
    a: 0
  },
  {
    q: "¿Cuál es el aeropuerto internacional de Cartagena?",
    opts: ["Matecaña", "El Dorado", "Rafael Núñez", "José María Córdova"],
    a: 2
  },
  {
    q: "¿Qué región de Colombia es conocida como 'La Puerta de la Amazonía'?",
    opts: ["Caquetá", "Guaviare", "Putumayo", "Meta"],
    a: 0
  },
  {
    q: "¿Qué río colombiano fue declarado 'río de interés cultural y patrimonio nacional'?",
    opts: ["Río Magdalena", "Río Cauca", "Río Atrato", "Río Meta"],
    a: 2
  },
  {
    q: "¿Qué ciudad del Caribe colombiano celebra la Batalla de Flores en su carnaval?",
    opts: ["Santa Marta", "Barranquilla", "Cartagena", "Sincelejo"],
    a: 1
  },
  {
    q: "¿Qué parque natural es conocido como 'la catedral de la naturaleza'?",
    opts: ["Chiribiquete", "Los Nevados", "Sumapaz", "Macarena"],
    a: 0
  },
  {
    q: "¿Qué ciudad está más cerca a la frontera con Ecuador?",
    opts: ["Ipiales", "Pasto", "Popayán", "Mocoa"],
    a: 0
  },
  {
    q: "¿En qué departamento se encuentra la Sierra de la Macarena?",
    opts: ["Meta", "Guaviare", "Caquetá", "Putumayo"],
    a: 0
  }
];

// =============================
// File: data/trivia_slogans_colombia.js
// =============================
const TRIVIA_SLOGANS_COLOMBIA = [
  {
    q: "¿Qué producto usó el famoso eslogan 'Póngale locha a la vida'?",
    opts: ["Pony Malta", "Postobón", "Águila", "Colombiana"],
    a: 0
  },
  {
    q: "¿De qué marca es el eslogan 'El sabor de la alegría'?",
    opts: ["Colombiana", "Postobón", "Pepsi", "Pony Malta"],
    a: 0
  },
  {
    q: "El eslogan 'Lo mejor de Colombia' fue usado por:",
    opts: ["Café de Colombia", "Juan Valdez", "Postobón", "Colombiana"],
    a: 1
  },
  {
    q: "¿Qué producto tenía como lema 'Energía para la vida'?",
    opts: ["Pony Malta", "Milo", "Colcafé", "Kola Román"],
    a: 0
  },
  {
    q: "¿Qué marca usó el lema 'Un país que progresa es un país que lee'?",
    opts: ["Norma", "Carvajal", "Colsubsidio", "Tintero"],
    a: 0
  },
  {
    q: "¿El lema 'Frescura que dura' corresponde a qué producto?",
    opts: ["Kolynos", "Colgate", "Signal", "Crest"],
    a: 1
  },
  {
    q: "¿Qué cerveza popularizó el eslogan 'La cerveza del Caribe'?",
    opts: ["Águila", "Poker", "Club Colombia", "Costeña"],
    a: 3
  },
  {
    q: "El famoso lema 'Destapa la felicidad' fue adoptado en Colombia por:",
    opts: ["Coca-Cola", "Postobón", "Colombiana", "Pepsi"],
    a: 0
  },
  {
    q: "¿Qué producto tenía el eslogan 'Con toda confianza'?",
    opts: ["Colpatria", "Colpatria Seguros", "Banco Caja Social", "Banco de Bogotá"],
    a: 2
  },
  {
    q: "¿Qué marca usó el eslogan 'El sabor de nuestra tierra'?",
    opts: ["Colombiana", "Ramo", "Juan Valdez", "Colcafé"],
    a: 1
  },
  {
    q: "El lema 'Refresca tu vida' fue de:",
    opts: ["Pepsi", "Sprite", "7Up", "Postobón"],
    a: 1
  },
  {
    q: "¿De qué producto era el eslogan 'Porque su salud lo merece'?",
    opts: ["Colsubsidio", "Cruz Verde", "Cafam", "Farmatodo"],
    a: 0
  },
  {
    q: "¿Qué gaseosa tenía el lema 'Qué viva el sabor'?",
    opts: ["Colombiana", "Pepsi", "Manzana Postobón", "Pony Malta"],
    a: 2
  },
  {
    q: "El famoso eslogan 'El que sabe, sabe' fue de:",
    opts: ["Colcafé", "Águila", "Bavaria", "Postobón"],
    a: 0
  },
  {
    q: "¿Cuál producto tenía como eslogan 'Rico y rendidor'?",
    opts: ["Margarina La Fina", "Sello Rojo", "Nescafé", "Arroz Diana"],
    a: 3
  },
  {
    q: "El eslogan 'Tan colombiana como tú' pertenece a:",
    opts: ["Colombiana", "Pony Malta", "Postobón", "Águila"],
    a: 0
  },
  {
    q: "¿Qué marca usó el lema 'El poder de la suavidad'?",
    opts: ["Familia", "Nosotras", "Higietex", "Scott"],
    a: 0
  },
  {
    q: "¿Cuál empresa bancaria tenía el lema 'Su banco amigo'?",
    opts: ["Banco Popular", "Banco de Bogotá", "Davivienda", "Banco Agrario"],
    a: 0
  },
  {
    q: "El eslogan 'A su servicio siempre' fue de:",
    opts: ["Avianca", "Copetrán", "Expreso Bolivariano", "Satena"],
    a: 0
  },
  {
    q: "¿Qué producto de golosinas usaba el lema 'Chocorramo, el ponqué con chocolate'?",
    opts: ["Ramo", "Bimbo", "Nestlé", "Milo"],
    a: 0
  },
  {
    q: "El lema 'Donde está tu dinero está tu corazón' fue de:",
    opts: ["Davivienda", "Banco Popular", "BBVA", "Bancolombia"],
    a: 3
  },
  {
    q: "¿Qué gaseosa popularizó el lema 'Tómate la vida en serio'?",
    opts: ["Coca-Cola", "Pepsi", "Postobón", "7Up"],
    a: 1
  },
  {
    q: "El famoso eslogan 'El banco rojo' pertenece a:",
    opts: ["Banco de Bogotá", "Davivienda", "Colpatria", "Bancolombia"],
    a: 2
  },
  {
    q: "¿Qué empresa utilizó el icónico lema 'Donde su dinero está seguro'?",
    opts: ["Banco de Bogotá", "Banco Popular", "BBVA", "Colpatria"],
    a: 0
  },
  {
    q: "El eslogan 'Con toda confianza' lo usó:",
    opts: ["Banco Caja Social", "Banco Agrario", "Banco de Bogotá", "Banco Colpatria"],
    a: 0
  },
  {
    q: "¿Qué producto tenía la frase 'Es para todos'?",
    opts: ["Águila", "Postobón", "Pony Malta", "Club Colombia"],
    a: 0
  },
  {
    q: "El lema 'Una cerveza que nos une' corresponde a:",
    opts: ["Club Colombia", "Águila", "Poker", "Costeña"],
    a: 2
  },
  {
    q: "El icónico eslogan 'Usted no está solo' es de:",
    opts: ["Colsubsidio", "Seguros Bolívar", "Cruz Verde", "Cafam"],
    a: 1
  },
  {
    q: "¿Qué producto usó la frase 'Para chuparse los dedos' en Colombia?",
    opts: ["KFC", "Frisby", "Ramo", "Colombina"],
    a: 1
  },
  {
    q: "El eslogan 'Con toda confianza' también fue utilizado por:",
    opts: ["Banco Caja Social", "Banco Agrario", "Banco Colpatria", "Banco Popular"],
    a: 2
  },
  {
    q: "¿Qué producto tenía el eslogan 'Siempre con algo más'?",
    opts: ["Colsubsidio", "Cafam", "Éxito", "Alkosto"],
    a: 2
  },
  {
    q: "¿Qué empresa utilizaba el lema 'Colombia es pasión'?",
    opts: ["Proexport", "Marca País Colombia", "Avianca", "Café de Colombia"],
    a: 1
  },
  {
    q: "El famoso 'Con toda confianza' en los 90 fue usado por:",
    opts: ["Banco Caja Social", "Banco Agrario", "Banco Colpatria", "Banco de Bogotá"],
    a: 0
  },
  {
    q: "¿Qué marca de golosinas tuvo el eslogan 'Si es Jet es bueno'?",
    opts: ["Chocolatina Jet", "Chocorramo", "Bianchi", "Nestlé"],
    a: 0
  },
  {
    q: "El eslogan 'Donde está tu dinero está tu corazón' lo recordamos de:",
    opts: ["Bancolombia", "Banco Popular", "Colpatria", "Davivienda"],
    a: 0
  },
  {
    q: "El icónico lema 'Su seguro amigo' corresponde a:",
    opts: ["Seguros Bolívar", "Sura", "Axa Colpatria", "Mapfre"],
    a: 0
  },
  {
    q: "¿Qué gaseosa tenía el eslogan 'Sabor de Colombia'?",
    opts: ["Colombiana", "Manzana Postobón", "Kola Román", "7Up"],
    a: 0
  },
  {
    q: "El lema 'Una cerveza bien fría, por favor' era de:",
    opts: ["Águila", "Club Colombia", "Poker", "Costeña"],
    a: 1
  },
  {
    q: "El famoso 'Vive la música, vive Caracol' fue de:",
    opts: ["RCN", "Caracol TV", "Señal Colombia", "Teleantioquia"],
    a: 1
  },
  {
    q: "El lema 'Donde está la diversión' fue de:",
    opts: ["Caracol TV", "RCN Televisión", "Señal Colombia", "Telecaribe"],
    a: 0
  },
  {
    q: "El famoso eslogan 'El que la hace la paga' en campañas fue de:",
    opts: ["Fiscalía General", "Policía Nacional", "Gobierno Nacional", "Procuraduría"],
    a: 0
  },
  {
    q: "¿Qué producto usaba la frase 'Una sonrisa lo cambia todo'?",
    opts: ["Colgate", "Coca-Cola", "Familia", "Colombina"],
    a: 0
  },
  {
    q: "El eslogan 'Una cerveza con clase' pertenece a:",
    opts: ["Águila", "Poker", "Club Colombia", "Costeña"],
    a: 2
  },
  {
    q: "¿Qué marca tenía como lema 'Porque la vida es para disfrutarla'?",
    opts: ["Coca-Cola", "Águila", "Postobón", "Milo"],
    a: 1
  },
  {
    q: "El lema 'Vive el sabor' se relaciona con:",
    opts: ["Pepsi", "Manzana Postobón", "Colombiana", "7Up"],
    a: 2
  },
  {
    q: "¿Qué banco usó el famoso 'El poder de lo simple'?",
    opts: ["BBVA", "Davivienda", "Bancolombia", "Banco Popular"],
    a: 0
  },
  {
    q: "El eslogan 'Con toda confianza' también lo usó:",
    opts: ["Colpatria", "Caja Social", "Banco Agrario", "Banco Bogotá"],
    a: 1
  },
  {
    q: "El lema 'Siempre a tu lado' pertenece a:",
    opts: ["Seguros Bolívar", "Familia", "Sura", "Mapfre"],
    a: 2
  },
  {
    q: "El icónico eslogan 'Dónde está su dinero está su hogar' es de:",
    opts: ["Davivienda", "Banco Agrario", "Banco Popular", "Colpatria"],
    a: 0
  }
];

// =============================
// File: data/trivia_novelas_colombia.js
// =============================
const TRIVIA_NOVELAS_COLOMBIA = [
  {
    q: "¿Cuál es la telenovela colombiana más famosa en el mundo?",
    opts: ["Yo soy Betty, la fea", "Café con aroma de mujer", "Pedro el escamoso", "Pasión de gavilanes"],
    a: 0
  },
  {
    q: "¿Qué actriz interpretó a Beatriz Pinzón Solano en 'Yo soy Betty, la fea'?",
    opts: ["Ana María Orozco", "Natalia Ramírez", "Marcela Carvajal", "Amparo Grisales"],
    a: 0
  },
  {
    q: "¿Qué actor interpretó a Don Armando Mendoza en 'Yo soy Betty, la fea'?",
    opts: ["Jorge Enrique Abello", "Miguel Varoni", "Guy Ecker", "Fernando Gaitán"],
    a: 0
  },
  {
    q: "¿Cuál de estas novelas transcurre en el mundo del café?",
    opts: ["Café con aroma de mujer", "Pedro el escamoso", "Las Juanas", "Pura Sangre"],
    a: 0
  },
  {
    q: "¿Quién fue el creador de 'Yo soy Betty, la fea'?",
    opts: ["Fernando Gaitán", "Julio Jiménez", "Dago García", "Mauricio Navas"],
    a: 0
  },
  {
    q: "¿Cuál es la novela donde aparece el personaje 'El Pirulino'?",
    opts: ["Pedro el escamoso", "Chepe Fortuna", "Oye bonita", "La costeña y el cachaco"],
    a: 0
  },
  {
    q: "¿En qué novela aparece el personaje 'Don Jediondo'?",
    opts: ["La posada", "Sábados Felices", "La mujer del presidente", "Pecados capitales"],
    a: 1
  },
  {
    q: "¿Qué novela popularizó la canción 'El pirulino'?",
    opts: ["Pedro el escamoso", "Betty la fea", "Las Juanas", "Amor a la plancha"],
    a: 0
  },
  {
    q: "¿Cuál es la novela donde cinco hermanas descubren que comparten el mismo padre?",
    opts: ["Las Juanas", "Las hermanitas Calle", "La Saga", "O todos en la cama"],
    a: 0
  },
  {
    q: "¿Qué novela mostraba la vida de la cantante Helenita Vargas?",
    opts: ["La ronca de oro", "Amor sincero", "Garzón vive", "La luz de mis ojos"],
    a: 0
  },
  {
    q: "¿Qué novela contaba la vida del humorista Jaime Garzón?",
    opts: ["Garzón vive", "El Joe", "Tarde lo conocí", "Amar y vivir"],
    a: 0
  },
  {
    q: "¿Qué novela mostró la vida de Diomedes Díaz?",
    opts: ["El Cacique de la Junta", "Diomedes, el Cacique de La Junta", "Oye bonita", "Escalona"],
    a: 1
  },
  {
    q: "¿Cuál fue la primera novela colombiana exportada a más de 70 países?",
    opts: ["Café con aroma de mujer", "Betty la fea", "Pasión de gavilanes", "Pedro el escamoso"],
    a: 0
  },
  {
    q: "¿En qué novela aparece el personaje de Hugo Lombardi?",
    opts: ["Betty la fea", "Pura Sangre", "Francisco el matemático", "Hasta que la plata nos separe"],
    a: 0
  },
  {
    q: "¿Qué novela juvenil relataba la vida de estudiantes en un colegio de Bogotá?",
    opts: ["Francisco el matemático", "Clase aparte", "De pies a cabeza", "A mano limpia"],
    a: 0
  },
  {
    q: "¿Qué novela popularizó la frase 'Ah bueno, nos pillamos'?",
    opts: ["Francisco el matemático", "Pedro el escamoso", "Clase aparte", "Los Reyes"],
    a: 0
  },
  {
    q: "¿Qué novela mostraba las aventuras de la familia Reyes?",
    opts: ["Los Reyes", "Pasión de gavilanes", "Vecinos", "A corazón abierto"],
    a: 0
  },
  {
    q: "¿Qué actor interpretó a Pedro Coral Tavera en 'Pedro el escamoso'?",
    opts: ["Miguel Varoni", "Jorge Enrique Abello", "Diego Trujillo", "Andrés Parra"],
    a: 0
  },
  {
    q: "¿Qué novela fue la primera en mostrar médicos en un hospital colombiano?",
    opts: ["A corazón abierto", "Sala de urgencias", "La mujer en el espejo", "Pura sangre"],
    a: 1
  },
  {
    q: "¿Qué novela colombiana fue la primera adaptación de 'Grey's Anatomy'?",
    opts: ["A corazón abierto", "Amar y vivir", "La ley del corazón", "Rosario Tijeras"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Margarita Rosa de Francisco como Gaviota?",
    opts: ["Café con aroma de mujer", "Amor sincero", "Yo amo a Paquita Gallego", "Gallito Ramírez"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Margarita Rosa de Francisco y Carlos Vives?",
    opts: ["Gallito Ramírez", "Café con aroma de mujer", "Amor a la plancha", "Escalona"],
    a: 0
  },
  {
    q: "¿Qué novela contó la vida del cantante Carlos Vives en sus inicios?",
    opts: ["Escalona", "Amar y vivir", "El Joe", "Tarde lo conocí"],
    a: 0
  },
  {
    q: "¿Cuál de estas novelas es de época y muestra la vida en un pueblo cafetero?",
    opts: ["Café con aroma de mujer", "La casa de las dos palmas", "Pura Sangre", "Los pecados de Inés de Hinojosa"],
    a: 1
  },
  {
    q: "¿Qué novela generó polémica por mostrar las pasiones y tragedias coloniales?",
    opts: ["Los pecados de Inés de Hinojosa", "La potra Zaina", "Sangre de lobos", "Amores cruzados"],
    a: 0
  },
  {
    q: "¿Qué novela popularizó a la 'potra Zaina'?",
    opts: ["La potra Zaina", "Gallito Ramírez", "Pasión de gavilanes", "Pura sangre"],
    a: 0
  },
  {
    q: "¿Qué novela fue la primera gran producción de RTI para el mundo?",
    opts: ["La vorágine", "La abuela", "Señora Isabel", "Café con aroma de mujer"],
    a: 2
  },
  {
    q: "¿Qué novela abordó la violencia en Colombia desde los años 40?",
    opts: ["La casa de las dos palmas", "La vorágine", "Amor a la plancha", "Vecinos"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Amparo Grisales en los 80?",
    opts: ["En cuerpo ajeno", "La mujer en el espejo", "Amor a la plancha", "Las aguas mansas"],
    a: 0
  },
  {
    q: "¿Qué novela fue la base para 'Pasión de gavilanes'?",
    opts: ["Las aguas mansas", "Amor a la plancha", "Café con aroma de mujer", "Los Reyes"],
    a: 0
  },
  {
    q: "¿Qué novela fue una de las primeras en mostrar un presidente ficticio?",
    opts: ["La mujer del presidente", "La costeña y el cachaco", "Pura sangre", "Garzón vive"],
    a: 0
  },
  {
    q: "¿Qué novela mostró la vida de la cantante Patricia Teherán?",
    opts: ["Tarde lo conocí", "Amar y vivir", "Garzón vive", "Oye bonita"],
    a: 0
  },
  {
    q: "¿Qué novela fue un remake en 2019 con Carmen Villalobos?",
    opts: ["Café con aroma de mujer", "Betty en Nueva York", "Amar y vivir", "La ley del corazón"],
    a: 2
  },
  {
    q: "¿Qué novela protagonizó Natalia Oreiro en Colombia?",
    opts: ["Muñeca brava", "Amor a la plancha", "La costeña y el cachaco", "Amores cruzados"],
    a: 1
  },
  {
    q: "¿Qué novela colombiana tuvo la banda sonora de Joe Arroyo?",
    opts: ["El Joe, la leyenda", "Escalona", "Amar y vivir", "Oye bonita"],
    a: 0
  },
  {
    q: "¿Qué novela se desarrollaba en la costa Caribe con humor y política?",
    opts: ["Chepe Fortuna", "Vecinos", "Los Reyes", "La costeña y el cachaco"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Flora Martínez como Rosario?",
    opts: ["Rosario Tijeras", "Sin tetas no hay paraíso", "Pura sangre", "La mujer en el espejo"],
    a: 0
  },
  {
    q: "¿Qué novela inspiró la frase 'Las mujeres también matan'?",
    opts: ["Rosario Tijeras", "Sin senos no hay paraíso", "Las muñecas de la mafia", "La viuda de la mafia"],
    a: 3
  },
  {
    q: "¿Qué novela adaptó el libro 'Sin tetas no hay paraíso'?",
    opts: ["Sin senos sí hay paraíso", "Rosario Tijeras", "Las muñecas de la mafia", "Amar y vivir"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Catherine Siachoque y Miguel Varoni?",
    opts: ["Las Juanas", "La viuda de Blanco", "La casa de las dos palmas", "Pecados capitales"],
    a: 1
  },
  {
    q: "¿Qué novela fue un éxito en los 2000 con el personaje Alejo el de la guitarra?",
    opts: ["Oye bonita", "Amar y vivir", "Escalona", "El Joe"],
    a: 0
  },
  {
    q: "¿Qué novela mostró la historia de los Rodríguez Orejuela?",
    opts: ["El cartel de los sapos", "Pablo Escobar: El patrón del mal", "Alias JJ", "En la boca del lobo"],
    a: 0
  },
  {
    q: "¿Qué novela contó la vida de Pablo Escobar?",
    opts: ["Escobar, el patrón del mal", "El cartel de los sapos", "Alias JJ", "Narcos"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Amparo Grisales como 'Lucrecia'?",
    opts: ["En cuerpo ajeno", "La viuda de Blanco", "Señora Isabel", "Los pecados de Inés de Hinojosa"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Robinson Díaz como 'El Cabo'?",
    opts: ["El cartel de los sapos", "Escobar, el patrón del mal", "Alias JJ", "La saga"],
    a: 0
  },
  {
    q: "¿Qué novela contaba la historia de la familia Manrique?",
    opts: ["La saga, negocio de familia", "Pecados capitales", "Pura sangre", "Los Reyes"],
    a: 0
  },
  {
    q: "¿Qué novela fue protagonizada por Julián Román como Jaime Garzón?",
    opts: ["Garzón vive", "Amor a la plancha", "Tarde lo conocí", "Oye bonita"],
    a: 0
  },
  {
    q: "¿Qué novela fue remake en México y EE.UU. como 'Ugly Betty'?",
    opts: ["Yo soy Betty, la fea", "Café con aroma de mujer", "Pedro el escamoso", "Las Juanas"],
    a: 0
  },
  {
    q: "¿Qué novela popularizó la canción 'La gota fría'?",
    opts: ["Escalona", "Amar y vivir", "Oye bonita", "El Joe"],
    a: 0
  }
];


// =============================
// File: data/trivia_corrupcion_colombia.js
// =============================
export const TRIVIA_CORRUPCION_COLOMBIA = [
  {
    q: "¿Qué gran escándalo político de los años 90 estuvo relacionado con dineros del narcotráfico en una campaña presidencial?",
    opts: ["Proceso 8.000", "Carrusel de la contratación", "Interbolsa", "Agro Ingreso Seguro"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción en Bogotá se conoció como 'El carrusel de la contratación'?",
    opts: ["Desfalco en hospitales", "Irregularidades en obras públicas", "Falsos positivos", "Crisis de la salud"],
    a: 1
  },
  {
    q: "¿Qué fondo agropecuario fue cuestionado por favorecer indebidamente a familias adineradas?",
    opts: ["Plan Colombia", "Agro Ingreso Seguro", "Reficar", "Pensional ISS"],
    a: 1
  },
  {
    q: "¿Qué compañía brasilera protagonizó un escándalo mundial de sobornos que también afectó a Colombia?",
    opts: ["Camargo Corrêa", "Vale", "Odebrecht", "Petrobras"],
    a: 2
  },
  {
    q: "¿Qué proyecto de infraestructura presentó sobrecostos millonarios en Cartagena?",
    opts: ["Reficar", "Ruta del Sol II", "Navelena", "Agro Ingreso Seguro"],
    a: 0
  },
  {
    q: "¿Qué entidad financiera protagonizó el escándalo bursátil más grande de Colombia en 2012?",
    opts: ["Interbolsa", "Banco de Occidente", "Granahorrar", "Fiducafé"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción involucró la construcción de la Ruta del Sol II?",
    opts: ["Odebrecht", "Carrusel de la contratación", "Proceso 8.000", "Reficar"],
    a: 0
  },
  {
    q: "¿Cómo se llamó el escándalo de falsos contratos en la Dirección Nacional de Estupefacientes?",
    opts: ["Falsos positivos", "Cartel de la toga", "Cartel de la DNE", "Proceso 8.000"],
    a: 2
  },
  {
    q: "¿Qué escándalo judicial involucró a magistrados de la Corte Suprema de Justicia?",
    opts: ["Cartel de la toga", "Proceso 8.000", "Odebrecht", "Interbolsa"],
    a: 0
  },
  {
    q: "¿Qué cartel de corrupción afectó el sistema de salud en Córdoba?",
    opts: ["Cartel de la hemofilia", "Cartel de los pañales", "Cartel de la toga", "Cartel de la gasolina"],
    a: 0
  },
  {
    q: "¿Qué escándalo de corrupción consistía en falsificar pacientes para desviar recursos de la salud?",
    opts: ["Cartel de la hemofilia", "Carrusel de la contratación", "Agro Ingreso Seguro", "Cartel de la toga"],
    a: 0
  },
  {
    q: "¿Qué cartel infló el costo de pañales y otros insumos para obtener sobreprecios?",
    opts: ["Cartel de la hemofilia", "Cartel de los pañales", "Cartel de la toga", "Cartel de la gasolina"],
    a: 1
  },
  {
    q: "¿Qué escándalo de 2017 involucró sobornos para manipular fallos judiciales?",
    opts: ["Cartel de la toga", "Proceso 8.000", "Reficar", "Navelena"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción giró alrededor del proyecto Navelena en el río Magdalena?",
    opts: ["Carrusel de la contratación", "Odebrecht", "Interbolsa", "Proceso 8.000"],
    a: 1
  },
  {
    q: "¿Qué escándalo se conoció como 'Cartel de la gasolina'?",
    opts: ["Contrabando y falsificación de facturas de combustible", "Venta de gas subsidiado", "Lavado de activos en estaciones", "Subsidios a diésel"],
    a: 0
  },
  {
    q: "¿Qué desfalco en el sector salud fue llamado 'Cartel de la salud'?",
    opts: ["Irregularidades en hospitales públicos", "Contratos falsos en EPS", "Sobreprecios en medicamentos", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué escándalo de los años 80 involucró el Fondo Nacional del Café?",
    opts: ["Proceso 8.000", "Interbolsa", "Dragacol", "Créditos de Fedecafé"],
    a: 3
  },
  {
    q: "¿Qué empresa estatal estuvo involucrada en el caso Dragacol?",
    opts: ["Ministerio de Obras Públicas", "Ministerio de Defensa", "Ministerio de Hacienda", "Ministerio de Comunicaciones"],
    a: 0
  },
  {
    q: "¿Qué escándalo fue bautizado 'Foncolpuertos'?",
    opts: ["Fraude en liquidación de puertos estatales", "Subsidios agrícolas", "Carrusel de la contratación", "Cartel de la toga"],
    a: 0
  },
  {
    q: "¿Qué sector se vio afectado en el escándalo de Cajanal?",
    opts: ["Pensiones", "Salud", "Educación", "Vivienda"],
    a: 0
  },
  {
    q: "¿Qué irregularidad se detectó en la liquidación del ISS?",
    opts: ["Pensiones ficticias", "Cobro a fallecidos", "Pagos dobles", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué se descubrió en el escándalo del 'Cartel de los enfermos mentales'?",
    opts: ["Pacientes falsos con tratamientos costosos", "Compra de medicamentos vencidos", "Clínicas inexistentes", "Exámenes duplicados"],
    a: 0
  },
  {
    q: "¿Qué caso mostró corrupción en subsidios de vivienda en Bogotá?",
    opts: ["Cartel de la hemofilia", "Carrusel de la contratación", "Cartel de la vivienda", "Foncolpuertos"],
    a: 2
  },
  {
    q: "¿Qué escándalo se conoció como el 'Cartel del azúcar'?",
    opts: ["Fijación ilegal de precios", "Subsidios irregulares", "Contratos ficticios", "Lavado de dinero"],
    a: 0
  },
  {
    q: "¿Qué escándalo fue conocido como el 'Cartel del cemento'?",
    opts: ["Manipulación de precios en la construcción", "Obras inconclusas", "Contratos inflados", "Uso de cemento adulterado"],
    a: 0
  },
  {
    q: "¿Qué caso se llamó 'Cartel del papel higiénico'?",
    opts: ["Colusión entre empresas de papel", "Subsidios ilegales", "Contratos fantasma", "Lavado de activos"],
    a: 0
  },
  {
    q: "¿Qué institución se vio envuelta en el 'Cartel del oro'?",
    opts: ["Minería ilegal y exportaciones falsas", "Banco de la República", "Ministerio de Minas", "Proexport"],
    a: 0
  },
  {
    q: "¿Qué caso se conoció como 'Cartel de los cuadernos'?",
    opts: ["Sobornos en útiles escolares", "Sobreprecios en contratos de papelería", "Fraude en colegios", "Lavado de dinero"],
    a: 1
  },
  {
    q: "¿Qué escándalo de corrupción afectó el sistema carcelario?",
    opts: ["Cartel de las cárceles", "Carrusel de la contratación", "Cartel de la toga", "Proceso 8.000"],
    a: 0
  },
  {
    q: "¿Qué se conoció como el 'Cartel del chance'?",
    opts: ["Corrupción en loterías y apuestas", "Fraude en rifas", "Lavado en casinos", "Subsidios ilegales"],
    a: 0
  },
  {
    q: "¿Qué escándalo se llamó 'Cartel de la gasolina de la Guajira'?",
    opts: ["Contrabando de combustible desde Venezuela", "Subsidios falsos", "Fraude en facturación", "Corrupción en Ecopetrol"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción afectó la construcción de colegios en Bogotá?",
    opts: ["Cartel de los cuadernos", "Cartel de la educación", "Carrusel de la contratación", "Cartel de las aulas"],
    a: 1
  },
  {
    q: "¿Qué se conoció como el 'Cartel de los medicamentos'?",
    opts: ["Sobreprecios y falsificación de medicinas", "Fraude en EPS", "Compra de medicinas vencidas", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué escándalo involucró recursos de la alimentación escolar?",
    opts: ["Cartel de los refrigerios", "Carrusel de la contratación", "Agro Ingreso Seguro", "Foncolpuertos"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción se llamó 'Cartel del agua'?",
    opts: ["Sobreprecios en acueductos", "Fraude en facturas de agua", "Desvío de recursos públicos", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué irregularidad tuvo el caso de los Nule?",
    opts: ["Contratos amañados en Bogotá", "Fraude bancario", "Lavado de activos", "Corrupción en salud"],
    a: 0
  },
  {
    q: "¿Qué sector fue afectado por el 'Cartel de la educación en Córdoba'?",
    opts: ["Nóminas de maestros fantasmas", "Sobreprecios en colegios", "Fraude en subsidios", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué caso de corrupción afectó el manejo de la EPS Saludcoop?",
    opts: ["Desvío de recursos de la salud", "Pagos a clínicas falsas", "Compra de medicinas vencidas", "Nóminas fantasmas"],
    a: 0
  },
  {
    q: "¿Qué se conoció como 'Cartel de la chatarrización'?",
    opts: ["Fraude en subsidios a transportadores", "Compra de buses falsos", "Venta de licencias ilegales", "Sobornos en tránsito"],
    a: 0
  },
  {
    q: "¿Qué cartel afectó la importación de arroz en Colombia?",
    opts: ["Cartel del arroz", "Cartel del azúcar", "Cartel del café", "Cartel del maíz"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción fue conocido como 'Cartel de los jueces'?",
    opts: ["Venta de fallos judiciales", "Contratos falsos", "Fraude electoral", "Subsidios ilegales"],
    a: 0
  },
  {
    q: "¿Qué irregularidad se conoció en el escándalo de Electricaribe?",
    opts: ["Mal manejo de recursos y sobrefacturación", "Fraude en salud", "Cartel de la toga", "Agro Ingreso Seguro"],
    a: 0
  },
  {
    q: "¿Qué se descubrió en el 'Cartel de la alimentación escolar'?",
    opts: ["Niños fantasmas en comedores", "Contratos inflados", "Comida vencida", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué caso de corrupción involucró licencias ambientales irregulares?",
    opts: ["Cartel ambiental", "Cartel de los páramos", "Cartel de la minería", "Cartel verde"],
    a: 3
  },
  {
    q: "¿Qué escándalo fue conocido como el 'Cartel de los uniformes'?",
    opts: ["Sobreprecios en dotaciones escolares", "Contratos militares", "Fraude en hospitales", "Lavado de activos"],
    a: 0
  },
  {
    q: "¿Qué caso afectó el programa de subsidios del SISBEN?",
    opts: ["Sisben fantasma", "Cartel del Sisben", "Fraude en salud", "Cartel de las EPS"],
    a: 1
  },
  {
    q: "¿Qué escándalo fue llamado 'Cartel de la gasolina subsidiada'?",
    opts: ["Contrabando y reventa de gasolina", "Fraude en facturas", "Subsidios falsos", "Corrupción en Ecopetrol"],
    a: 0
  },
  {
    q: "¿Qué irregularidad se conoció como el 'Cartel de las ambulancias'?",
    opts: ["Cobros falsos de traslados", "Ambulancias inexistentes", "Pacientes fantasmas", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué escándalo se llamó 'Cartel de los cuadernos universitarios'?",
    opts: ["Fraude en compras de útiles en universidades", "Sobreprecios en papelería", "Contratos inflados en educación", "Todas las anteriores"],
    a: 3
  },
  {
    q: "¿Qué escándalo reveló la manipulación de regalías petroleras?",
    opts: ["Cartel de las regalías", "Cartel del oro", "Cartel del petróleo", "Cartel de la minería"],
    a: 0
  },
  {
    q: "¿Qué caso de corrupción se conoció como 'Dragacol'?",
    opts: ["Indemnización fraudulenta al Estado", "Contrabando de drogas", "Fraude en EPS", "Lavado de activos"],
    a: 0
  },
  {
    q: "¿Qué irregularidad se descubrió en 'Foncolpuertos'?",
    opts: ["Pagos indebidos a trabajadores liquidados", "Fraude en salud", "Corrupción en educación", "Cartel del oro"],
    a: 0
  }
];



export const TRIVIA_BANK = [
  ...HISTORIA_BANK,
  ...FARANDULA_BANK,
  ...DEPORTE_BANK,
  ...TRIVIA_COLOMBIA_EXTRA,
  ...TRIVIA_SLOGANS_COLOMBIA,
  ...TRIVIA_NOVELAS_COLOMBIA,
  ...TRIVIA_CORRUPCION_COLOMBIA
];