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

export const TRIVIA_BANK = [
  ...HISTORIA_BANK,
  ...FARANDULA_BANK,
  ...DEPORTE_BANK
];