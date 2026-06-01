// Top 50 jugadores del Mundial 2026 para el selector de goleador y mejor jugador
// Incluye flag del país. El usuario también puede escribir un nombre libre.

export interface PlayerOption {
  value: string   // nombre normalizado para guardar en DB
  label: string   // nombre para mostrar en UI
  flag: string    // emoji bandera
  country: string
}

export const TOP_PLAYERS_2026: PlayerOption[] = [
  // Argentina 🇦🇷
  { value: 'Lionel Messi',        label: 'Lionel Messi',        flag: '🇦🇷', country: 'Argentina' },
  { value: 'Lautaro Martínez',    label: 'Lautaro Martínez',    flag: '🇦🇷', country: 'Argentina' },
  { value: 'Julián Álvarez',      label: 'Julián Álvarez',      flag: '🇦🇷', country: 'Argentina' },
  { value: 'Enzo Fernández',      label: 'Enzo Fernández',      flag: '🇦🇷', country: 'Argentina' },
  { value: 'Alexis Mac Allister', label: 'Alexis Mac Allister', flag: '🇦🇷', country: 'Argentina' },
  { value: 'Rodrigo De Paul',     label: 'Rodrigo De Paul',     flag: '🇦🇷', country: 'Argentina' },

  // Brasil 🇧🇷
  { value: 'Vinicius Jr',         label: 'Vinicius Jr',         flag: '🇧🇷', country: 'Brasil' },
  { value: 'Rodrygo',             label: 'Rodrygo',             flag: '🇧🇷', country: 'Brasil' },
  { value: 'Raphinha',            label: 'Raphinha',            flag: '🇧🇷', country: 'Brasil' },
  { value: 'Endrick',             label: 'Endrick',             flag: '🇧🇷', country: 'Brasil' },
  { value: 'Lucas Paquetá',       label: 'Lucas Paquetá',       flag: '🇧🇷', country: 'Brasil' },

  // Francia 🇫🇷
  { value: 'Kylian Mbappé',       label: 'Kylian Mbappé',       flag: '🇫🇷', country: 'Francia' },
  { value: 'Antoine Griezmann',   label: 'Antoine Griezmann',   flag: '🇫🇷', country: 'Francia' },
  { value: 'Ousmane Dembélé',     label: 'Ousmane Dembélé',     flag: '🇫🇷', country: 'Francia' },
  { value: 'Aurélien Tchouaméni', label: 'Aurélien Tchouaméni', flag: '🇫🇷', country: 'Francia' },

  // Inglaterra 🏴󠁧󠁢󠁥󠁮󠁧󠁿
  { value: 'Jude Bellingham',     label: 'Jude Bellingham',     flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },
  { value: 'Harry Kane',          label: 'Harry Kane',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },
  { value: 'Bukayo Saka',         label: 'Bukayo Saka',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },
  { value: 'Phil Foden',          label: 'Phil Foden',          flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },
  { value: 'Cole Palmer',         label: 'Cole Palmer',         flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'Inglaterra' },

  // España 🇪🇸
  { value: 'Lamine Yamal',        label: 'Lamine Yamal',        flag: '🇪🇸', country: 'España' },
  { value: 'Pedri',               label: 'Pedri',               flag: '🇪🇸', country: 'España' },
  { value: 'Dani Olmo',           label: 'Dani Olmo',           flag: '🇪🇸', country: 'España' },
  { value: 'Nico Williams',       label: 'Nico Williams',       flag: '🇪🇸', country: 'España' },
  { value: 'Álvaro Morata',       label: 'Álvaro Morata',       flag: '🇪🇸', country: 'España' },

  // Portugal 🇵🇹
  { value: 'Cristiano Ronaldo',   label: 'Cristiano Ronaldo',   flag: '🇵🇹', country: 'Portugal' },
  { value: 'Bernardo Silva',      label: 'Bernardo Silva',      flag: '🇵🇹', country: 'Portugal' },
  { value: 'Gonçalo Ramos',       label: 'Gonçalo Ramos',       flag: '🇵🇹', country: 'Portugal' },
  { value: 'Raphaël Leão',        label: 'Raphaël Leão',        flag: '🇵🇹', country: 'Portugal' },
  { value: 'Vitinha',             label: 'Vitinha',             flag: '🇵🇹', country: 'Portugal' },

  // Alemania 🇩🇪
  { value: 'Florian Wirtz',       label: 'Florian Wirtz',       flag: '🇩🇪', country: 'Alemania' },
  { value: 'Jamal Musiala',       label: 'Jamal Musiala',       flag: '🇩🇪', country: 'Alemania' },
  { value: 'Kai Havertz',         label: 'Kai Havertz',         flag: '🇩🇪', country: 'Alemania' },
  { value: 'Leroy Sané',          label: 'Leroy Sané',          flag: '🇩🇪', country: 'Alemania' },
  { value: 'Niclas Füllkrug',     label: 'Niclas Füllkrug',     flag: '🇩🇪', country: 'Alemania' },

  // Bélgica 🇧🇪
  { value: 'Kevin De Bruyne',     label: 'Kevin De Bruyne',     flag: '🇧🇪', country: 'Bélgica' },
  { value: 'Romelu Lukaku',       label: 'Romelu Lukaku',       flag: '🇧🇪', country: 'Bélgica' },

  // Países Bajos 🇳🇱
  { value: 'Cody Gakpo',          label: 'Cody Gakpo',          flag: '🇳🇱', country: 'Países Bajos' },
  { value: 'Memphis Depay',       label: 'Memphis Depay',       flag: '🇳🇱', country: 'Países Bajos' },
  { value: 'Frenkie de Jong',     label: 'Frenkie de Jong',     flag: '🇳🇱', country: 'Países Bajos' },

  // Uruguay 🇺🇾
  { value: 'Darwin Núñez',        label: 'Darwin Núñez',        flag: '🇺🇾', country: 'Uruguay' },
  { value: 'Federico Valverde',   label: 'Federico Valverde',   flag: '🇺🇾', country: 'Uruguay' },

  // Colombia 🇨🇴
  { value: 'Luis Díaz',           label: 'Luis Díaz',           flag: '🇨🇴', country: 'Colombia' },
  { value: 'James Rodríguez',     label: 'James Rodríguez',     flag: '🇨🇴', country: 'Colombia' },
  { value: 'Jhon Duran',          label: 'Jhon Duran',          flag: '🇨🇴', country: 'Colombia' },

  // Marruecos 🇲🇦
  { value: 'Achraf Hakimi',       label: 'Achraf Hakimi',       flag: '🇲🇦', country: 'Marruecos' },
  { value: 'Youssef En-Nesyri',   label: 'Youssef En-Nesyri',   flag: '🇲🇦', country: 'Marruecos' },

  // Noruega 🇳🇴
  { value: 'Erling Haaland',      label: 'Erling Haaland',      flag: '🇳🇴', country: 'Noruega' },

  // Corea del Sur 🇰🇷
  { value: 'Son Heung-min',       label: 'Son Heung-min',       flag: '🇰🇷', country: 'Corea del Sur' },

  // Japón 🇯🇵
  { value: 'Takefusa Kubo',       label: 'Takefusa Kubo',       flag: '🇯🇵', country: 'Japón' },
  { value: 'Kaoru Mitoma',        label: 'Kaoru Mitoma',        flag: '🇯🇵', country: 'Japón' },

  // México 🇲🇽
  { value: 'Santiago Giménez',    label: 'Santiago Giménez',    flag: '🇲🇽', country: 'México' },

  // Estados Unidos 🇺🇸
  { value: 'Christian Pulisic',   label: 'Christian Pulisic',   flag: '🇺🇸', country: 'Estados Unidos' },

  // Croacia 🇭🇷
  { value: 'Luka Modrić',         label: 'Luka Modrić',         flag: '🇭🇷', country: 'Croacia' },

  // Turquía 🇹🇷
  { value: 'Hakan Calhanoglu',    label: 'Hakan Calhanoglu',    flag: '🇹🇷', country: 'Turquía' },

  // Senegal 🇸🇳
  { value: 'Sadio Mané',          label: 'Sadio Mané',          flag: '🇸🇳', country: 'Senegal' },
]
