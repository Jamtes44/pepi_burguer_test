export const PRODUCTS = [
    // ==========================================
    // HAMBURGUESAS
    // ==========================================
    {
      id: 'h1',
      name: 'Pepi Clásica',
      category: 'hamburguesas',
      description: '150g de carne artesanal, queso cheddar, lechuga, tomate, cebolla caramelizada y salsa de la casa.',
      priceSolo: 16000,
      priceCombo: 22000,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: true,
      hasSauces: true
    },
    {
      id: 'h2',
      name: 'Pepi Tocino BBQ',
      category: 'hamburguesas',
      description: '150g de carne artesanal, doble tocineta crocante, queso cheddar, cebolla crispy y salsa BBQ ahumada.',
      priceSolo: 19000,
      priceCombo: 25000,
      image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f6?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: true,
      hasSauces: true
    },
    {
      id: 'h3',
      name: 'Pepi Doble Queso & Bacon',
      category: 'hamburguesas',
      description: 'Doble carne de 120g, doble tocineta, queso americano fundido y pepinillos artesanales.',
      priceSolo: 24000,
      priceCombo: 30000,
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: true,
      hasSauces: true
    },
  
    // ==========================================
    // SALCHIPAPAS
    // ==========================================
    {
      id: 's1',
      name: 'Salchipapa Tradicional',
      category: 'salchipapas',
      description: 'Papas a la francesa crocantes, salchicha manguera premium, queso costeño rallado y huevo de codorniz.',
      priceSolo: 14000,
      priceCombo: 19000,
      image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=800',
      hasProteins: true,
      hasVeggies: false,
      hasSauces: true
    },
    {
      id: 's2',
      name: 'Salchipapa Salvaje',
      category: 'salchipapas',
      description: 'Papas grandes con salchicha manguera, carne desmechada, pollo desmechado, tocineta y queso fundido.',
      priceSolo: 22000,
      priceCombo: 27000,
      image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=80&w=800',
      hasProteins: true,
      hasVeggies: false,
      hasSauces: true
    },
  
    // ==========================================
    // PERROS CALIENTES
    // ==========================================
    {
      id: 'p1',
      name: 'Perro Especial Pepi',
      category: 'perros',
      description: 'Salchicha americana, ripio de papa, tocineta picada, queso mozzarella fundido y salsa tártara.',
      priceSolo: 12000,
      priceCombo: 17000,
      image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: false,
      hasSauces: true
    },
    {
      id: 'p2',
      name: 'Perro Gratinado Tocineta',
      category: 'perros',
      description: 'Salchicha suiza, doble tocineta, abundante queso gratinado, cebolla picada y piña artesanal.',
      priceSolo: 15000,
      priceCombo: 20000,
      image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: false,
      hasSauces: true
    },
  
    // ==========================================
    // BURRITOS
    // ==========================================
    {
      id: 'b1',
      name: 'Burrito Mixto',
      category: 'burritos',
      description: 'Tortilla gigante de trigo, carne desmechada, pollo, frijol refrito, guacamole, pico de gallo y queso.',
      priceSolo: 18000,
      priceCombo: 23000,
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=800',
      hasProteins: true,
      hasVeggies: true,
      hasSauces: true
    },
  
    // ==========================================
    // BEBIDAS Y ADICIONALES
    // ==========================================
    {
      id: 'a1',
      name: 'Papas Francesas Porción',
      category: 'adicionales',
      description: 'Porción individual de papas crocantes sazonadas con sal de la casa.',
      priceSolo: 6000,
      priceCombo: null,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: false,
      hasSauces: false
    },
    {
      id: 'beb1',
      name: 'Gaseosa 400ml',
      category: 'bebidas',
      description: 'Coca-Cola, Coca-Cola Zero, Cuatro o Sprite helada.',
      priceSolo: 4500,
      priceCombo: null,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
      hasProteins: false,
      hasVeggies: false,
      hasSauces: false
    }
  ];
  
  // Opciones globales del personalizador
  export const CUSTOMIZER_OPTIONS = {
    proteins: ['Carne Res', 'Pollo Desmechado', 'Carne Desmechada', 'Mixto (Carne + Pollo)'],
    veggies: ['Lechuga', 'Tomate', 'Cebolla Caramelizada', 'Pepinillos'],
    sauces: ['Salsa Pepi (Especial)', 'Salsa Tártara', 'Salsa BBQ', 'Salsa de Ajo', 'Salsa de Piña', 'Mostaza', 'Salsa Tomate'],
    additionals: [
      { id: 'add_cheese', name: 'Queso Cheddar Extra', price: 3000 },
      { id: 'add_bacon', name: 'Tocineta Crocante Extra', price: 4000 },
      { id: 'add_egg', name: 'Huevo de Codorniz (3 uds)', price: 2500 }
    ],
    drinks: ['Coca-Cola', 'Coca-Cola Zero', 'Cuatro', 'Sprite', 'Agua Manantial']
  };