// Planteles oficiales Copa Mundial 2026 — 48 selecciones
// Fuente: Football365 / NBC Sports / Wikipedia (listas cerradas al 1-2 jun 2026)
// Equipos con (*) tienen listas preliminares (oficialización 2 jun)

export interface WCPlayer {
  name: string
  team: string
  flag: string
}

const mkPlayers = (team: string, flag: string, names: string[]): WCPlayer[] =>
  names.map((name) => ({ name, team, flag }))

// ── GRUPO A ────────────────────────────────────────────────────────────────
const mexico = mkPlayers('México', '🇲🇽', [
  'Guillermo Ochoa','Raúl Rangel','Carlos Acevedo',
  'Jesús Gallardo','César Montes','Jorge Sánchez','Johan Vásquez','Israel Reyes','Mateo Chávez',
  'Edson Álvarez','Orbelín Pineda','Roberto Alvarado','Luis Romo','Luis Chávez','Érik Lira',
  'Gilberto Mora','Brian Gutiérrez','Obed Vargas','Álvaro Fidalgo',
  'Raúl Jiménez','Alexis Vega','Santiago Giménez','César Huerta','Julián Quiñones',
  'Guillermo Martínez','Armando González',
])

const sudafrica = mkPlayers('Sudáfrica', '🇿🇦', [
  'Ronwen Williams','Ricardo Goss','Sipho Chaine',
  'Aubrey Modiba','Khuliso Mudau','Nkosinathi Sibisi','Mbekezeli Mbokazi','Ime Okon',
  'Samukele Kabini','Khulumani Ndamane','Bradley Cross','Olwethu Makhanya',
  'Teboho Mokoena','Sphephelo Sithole','Thalente Mbatha','Jayden Adams','Kamogelo Sebelebele',
  'Themba Zwane','Lyle Foster','Evidence Makgopa','Oswin Appollis','Iqraam Rayners',
  'Relebohile Mofokeng','Tshepang Moremi','Thapelo Maseko','Thabang Matuludi',
])

const coreadelSur = mkPlayers('Corea del Sur', '🇰🇷', [
  'Kim Seung-gyu','Jo Hyeon-woo','Song Bum-keun',
  'Kim Min-jae','Kim Moon-hwan','Seol Young-woo','Lee Tae-seok','Park Jin-seob',
  'Kim Tae-hyeon','Lee Han-beom','Jens Castrop','Lee Ki-hyuk',
  'Cho Wi-je','Lee Jae-sung','Hwang Hee-chan','Hwang In-beom','Lee Kang-in',
  'Paik Seung-ho','Kim Jin-gyu','Lee Dong-gyeong','Bae Jun-ho','Eom Ji-sung',
  'Yang Hyun-jun','Son Heung-min','Cho Gue-sung','Oh Hyeon-gyu',
])

const republicaCheca = mkPlayers('República Checa', '🇨🇿', [
  'Matěj Kovář','Jindřich Staněk','Lukáš Horníček',
  'Vladimír Coufal','Tomáš Holeš','Ladislav Krejčí','David Zima','Jaroslav Zelený',
  'David Jurásek','David Douděra','Robin Hranáč','Štěpán Chaloupek',
  'Tomáš Souček','Vladimír Darida','Lukáš Provod','Michal Sadílek','Pavel Šulc',
  'Lukáš Červ','Hugo Sochůrek','Alexandr Sojka','Denis Višinský',
  'Patrik Schick','Adam Hložek','Jan Kuchta','Mojmír Chytil','Tomáš Chorý',
])

// ── GRUPO B ────────────────────────────────────────────────────────────────
const canada = mkPlayers('Canadá', '🇨🇦', [
  'Dayne St. Clair','Maxime Crépeau','Owen Goodman',
  'Alistair Johnston','Luc de Fougerolles','Alfie Jones','Joel Waterman',
  'Derek Cornelius','Moïse Bombito','Alphonso Davies','Richie Laryea','Niko Sigur',
  'Mathieu Choinière','Stephen Eustáquio','Ismaël Koné','Liam Millar',
  'Jacob Shaffelburg','Tajon Buchanan','Ali Ahmed','Jonathan Osorio',
  'Nathan Saliba','Marcelo Flores',
  'Cyle Larin','Jonathan David','Tani Oluwaseyi','Promise David',
])

const bosnia = mkPlayers('Bosnia y Herzegovina', '🇧🇦', [
  'Nikola Vasilj','Martin Zlomislić','Osman Hadžikić',
  'Sead Kolašinac','Amar Dedić','Nihad Mujakić','Nikola Katić','Tarik Muharemović',
  'Stjepan Radeljić','Dennis Hadžikadunić','Nidal Čelik',
  'Amir Hadžiahmetović','Ivan Šunjić','Ivan Bašić','Dženis Burnić','Ermin Mahmić',
  'Benjamin Tahirović','Amar Memić','Armin Gigović','Kerim Alajbegović',
  'Esmir Bajraktarević',
  'Ermedin Demirović','Jovo Lukić','Samed Baždar','Haris Tabaković','Edin Džeko',
])

const qatar = mkPlayers('Qatar', '🇶🇦', [
  // (*) Lista preliminar
  'Meshaal Barsham','Yousuf Hassan','Mahmoud Abunada',
  'Pedro Miguel','Lucas Mendes','Assim Madibo','Boualem Khoukhi','Tarek Salman',
  'Karim Boudiaf','Abdulaziz Hatem','Ahmed Alaaeldin','Homam Ahmed',
  'Edmilson Junior','Akram Afif','Almoez Ali','Hassan Al-Haydos',
  'Mohammed Muntari','Sultan Al-Brake','Yusuf Abdurisag','Salem Al-Hajri',
  'Musab Kheder',
])

const suiza = mkPlayers('Suiza', '🇨🇭', [
  'Gregor Kobel','Yvon Mvogo','Marvin Keller',
  'Miro Muheim','Silvan Widmer','Nico Elvedi','Manuel Akanji','Ricardo Rodríguez',
  'Eray Comert','Aurèle Amenda','Luca Jaquez',
  'Denis Zakaria','Remo Freuler','Johan Manzambi','Granit Xhaka','Ardon Jashari',
  'Djibril Sow','Christian Fassnacht','Michel Aebischer','Fabian Rieder',
  'Breel Embolo','Dan Ndoye','Ruben Vargas','Noah Okafor','Zeki Amdouni','Cédric Itten',
])

// ── GRUPO C ────────────────────────────────────────────────────────────────
const brasil = mkPlayers('Brasil', '🇧🇷', [
  'Alisson','Ederson','Weverton',
  'Marquinhos','Danilo','Alex Sandro','Gabriel Magalhães','Bremer',
  'Wesley','Roger Ibáñez','Douglas Santos','Léo Pereira',
  'Casemiro','Lucas Paquetá','Bruno Guimarães','Fabinho',
  'Neymar','Vinicius Jr','Raphinha','Gabriel Martinelli','Matheus Cunha',
  'Endrick','Luiz Henrique','Igor Thiago','Rayan','Danilo Santos',
])

const marruecos = mkPlayers('Marruecos', '🇲🇦', [
  'Yassine Bounou','Munir El Kajoui','Ahmed Reda Tagnaouti',
  'Achraf Hakimi','Noussair Mazraoui','Nayef Aguerd','Chadi Riad','Issa Diop',
  'Anass Salah-Eddine','Zakaria El Ouahdi','Redouane Halhal','Youssef Belammari',
  'Sofyan Amrabat','Azzedine Ounahi','Neil El Aynaoui','Bilal El Khannouss',
  'Ismael Saibari','Samir El Mourabet','Ayyoub Bouaddi',
  'Brahim Díaz','Ayoub El Kaabi','Abde Ezzalzouli','Soufiane Rahimi',
  'Chemsdine Talbi','Yassine Gessime','Ayoube Amaimouni',
])

const haiti = mkPlayers('Haití', '🇭🇹', [
  'Johny Placide','Alexandre Pierre','Josué Duverger',
  'Carlens Arcus','Wilguens Paugain','Duke Lacroix','Martin Experience',
  'Jean-Kevin Duverne','Ricardo Adé','Hannes Delcroix','Keeto Thermoncy','Leverton Pierre',
  'Jean-Ricner Bellegarde','Carl Sainté','Pierre Woodenski','Dominique Simon',
  'Frantzdy Pierrot','Duckens Nazon','Derrick Etienne Jr.','Louicius Deedson',
  'Ruben Providence','Josué Casimir','Yassin Fortune','Wilson Isidor',
  'Danny Jean Jacques','Lenny Joseph',
])

const escocia = mkPlayers('Escocia', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', [
  'Craig Gordon','Angus Gunn','Liam Kelly',
  'Grant Hanley','Jack Hendry','Aaron Hickey','Dom Hyam','Scott McKenna',
  'Nathan Patterson','Anthony Ralston','Andy Robertson','John Souttar','Kieran Tierney',
  'Ryan Christie','Findlay Curtis','Lewis Ferguson','Ben Doak','John McGinn',
  'Kenny McLean','Scott McTominay','Jack Fletcher',
  'Che Adams','Lyndon Dykes','George Hirst','Lawrence Shankland','Ross Stewart',
])

// ── GRUPO D ────────────────────────────────────────────────────────────────
const estadosUnidos = mkPlayers('Estados Unidos', '🇺🇸', [
  'Matt Turner','Matt Freese','Chris Brady',
  'Sergiño Dest','Chris Richards','Antonee Robinson','Auston Trusty','Miles Robinson',
  'Tim Ream','Alex Freeman','Max Arfsten','Mark McKenzie','Joe Scally',
  'Tyler Adams','Gio Reyna','Weston McKennie','Sebastian Berhalter',
  'Cristian Roldan','Malik Tillman',
  'Ricardo Pepi','Christian Pulisic','Brenden Aaronson','Haji Wright',
  'Folarin Balogun','Tim Weah','Alejandro Zendejas',
])

const paraguay = mkPlayers('Paraguay', '🇵🇾', [
  // (*) Lista preliminar — jugadores probables
  'Antony Silva','Rodrigo Muñoz','Jorge Benítez',
  'Gustavo Gómez','Fabián Balbuena','Rogelio Funes Mori','Santiago Arzamendia',
  'Mathías Villasanti','Andrés Cubas','Ángel Cardozo Lucena',
  'Miguel Almirón','Julio Enciso','Alejandro Romero Gamarra','Ramón Sosa',
  'Richard Sánchez','Roberto Morales','Braian Samudio',
  'Ángel Romero','Carlos González','Iván Torres','Antonio Sanabria',
  'Néstor Camacho','Diego Gómez','Walber','Matías Espinoza','Junior Alonso',
])

const australia = mkPlayers('Australia', '🇦🇺', [
  'Mathew Ryan','Paul Izzo','Patrick Beach',
  'Miloš Degenek','Alessandro Circati','Jacob Italiano','Jordan Bos',
  'Jason Geria','Kai Trewin','Aziz Behich','Harry Souttar','Cameron Burgess',
  'Lucas Herrington','Connor Metcalfe','Ajdin Hrustić','Aiden O\'Neill',
  'Cameron Devlin','Jackson Irvine','Paul Okon-Engstler',
  'Mathew Leckie','Mohamed Touré','Awer Mabil','Nestory Irankunda',
  'Cristian Volpato','Nishan Velupillay','Tete Yengi',
])

const turquia = mkPlayers('Turquía', '🇹🇷', [
  // (*) Lista preliminar
  'Mert Günok','Altay Bayındır','Doğan Alemdar',
  'Zeki Çelik','Merih Demiral','Kaan Ayhan','Samet Akaydın','Ferdi Kadıoğlu',
  'Uğurcan Çakır','Abdülkerim Bardakcı','İlkay Gündoğan',
  'Hakan Çalhanoğlu','Arda Güler','Kerem Aktürkoğlu','Barış Alper Yılmaz',
  'Okay Yokuşlu','Salih Özcan','Kaan Calışkan',
  'Cenk Tosun','Baris Yilmaz','Yusuf Yazıcı',
  'Burak Yılmaz','Halil Dervişoğlu','Cengiz Ünder','Serdar Dursun','Edin Džeko',
])

// ── GRUPO E ────────────────────────────────────────────────────────────────
const alemania = mkPlayers('Alemania', '🇩🇪', [
  'Manuel Neuer','Oliver Baumann','Alexander Nübel',
  'Antonio Rüdiger','Waldemar Anton','Jonathan Tah','Nico Schlotterbeck',
  'Nathaniel Brown','David Raum','Malick Thiaw',
  'Aleksandar Pavlović','Joshua Kimmich','Leon Goretzka','Jamie Leweling',
  'Jamal Musiala','Pascal Groß','Angelo Stiller','Florian Wirtz',
  'Leroy Sané','Nadiem Amiri','Felix Nmecha','Lennart Karl',
  'Kai Havertz','Nick Woltemade','Maximilian Beier','Deniz Undav',
])

const curazao = mkPlayers('Curazao', '🇨🇼', [
  'Eloy Room','Tyrick Bodak','Trevor Doornbusch',
  'Shurandy Sambo','Jurien Gaari','Roshon van Eijma','Sherel Floranus',
  'Armando Obispo','Joshua Brenet','Riechedly Bazoer','Deveron Fonville',
  'Godfried Roemeratoe','Juninho Bacuna','Livano Comenencia','Leandro Bacuna',
  'Tyrese Noslin','Ar\'jany Martha','Kevin Felida',
  'Jürgen Locadia','Jeremy Antonisse','Sontje Hansen','Kenji Gorre',
  'Jearl Margaritha','Brandley Kuwas','Gervane Kastaneer','Tahith Chong',
])

const costadeMarfil = mkPlayers('Costa de Marfil', '🇨🇮', [
  'Yahia Fofana','Alban Lafont','Mohamed Koné',
  'Ghislain Konan','Odilon Kossounou','Wilfried Singo','Evan Ndicka',
  'Emmanuel Agbadou','Guela Doue','Ousmane Diomandé','Christopher Operi',
  'Franck Kessié','Jean-Michaël Séri','Ibrahim Sangaré','Seko Fofana',
  'Christ Inao Oulaï','Parfait Guiagon',
  'Nicolas Pépé','Oumar Diakité','Simon Adingra','Evann Guessand',
  'Amad Diallo','Yan Diomandé','Bazoumana Touré','Elye Wahi','Ange-Yoan Bonny',
])

const ecuador = mkPlayers('Ecuador', '🇪🇨', [
  'Hernán Galíndez','Moisés Ramírez','Gonzalo Valle',
  'Félix Torres','Piero Hincapié','Joel Ordóñez','Willian Pacho',
  'Pervis Estupiñán','Angelo Preciado','Jackson Porozo','Denil Castillo',
  'John Yeboah','Kendry Páez','Alan Minda','Pedro Vite','Gonzalo Plata',
  'Moisés Caicedo','Yaimar Medina','Kevin Rodríguez',
  'Enner Valencia','Anthony Valencia','Jordy Caicedo',
  'Nilson Angulo','Jeremy Arévalo','Alan Franco','John Mercado',
])

// ── GRUPO F ────────────────────────────────────────────────────────────────
const paisesBasos = mkPlayers('Países Bajos', '🇳🇱', [
  'Mark Flekken','Robin Roefs','Bart Verbruggen',
  'Nathan Aké','Denzel Dumfries','Jorrel Hato','Jurriën Timber',
  'Micky van de Ven','Virgil van Dijk','Jan-Paul van Hecke',
  'Mats Wieffer','Frenkie de Jong','Marten de Roon','Ryan Gravenberch',
  'Justin Kluivert','Teun Koopmeiners','Tijjani Reijnders','Guus Til','Quinten Timber',
  'Brian Brobbey','Memphis Depay','Cody Gakpo',
  'Noa Lang','Donyell Malen','Crysencio Summerville','Wout Weghorst',
])

const japon = mkPlayers('Japón', '🇯🇵', [
  'Zion Suzuki','Keisuke Osako','Tomoki Hayakawa',
  'Yukinari Sugawara','Shōgo Taniguchi','Kō Itakura','Yuto Nagatomo',
  'Tsuyoshi Watanabe','Ayumu Seko','Hiroki Itō','Takehiro Tomiyasu','Junnosuke Suzuki',
  'Wataru Endō','Ao Tanaka','Takefusa Kubo','Ritsu Dōan',
  'Keito Nakamura','Junya Itō','Daichi Kamada','Kaishu Sano','Keisuke Gotō',
  'Daizen Maeda','Yuito Suzuki','Ayase Ueda','Kōki Ogawa','Kento Shiogai',
])

const suecia = mkPlayers('Suecia', '🇸🇪', [
  'Jacob Widell Zetterström','Viktor Johansson','Kristoffer Nordfeldt',
  'Gustaf Lagerbielke','Victor Lindelöf','Isak Hien','Gabriel Gudmundsson',
  'Herman Johansson','Daniel Svensson','Hjalmar Ekdal','Carl Starfelt','Eric Smith',
  'Elliot Stroud','Lucas Bergvall','Ken Sema','Jesper Karlström',
  'Yasin Ayari','Mattias Svanberg','Besfort Zeneli','Taha Ali',
  'Alexander Isak','Benjamin Nygren','Anthony Elanga',
  'Viktor Gyökeres','Alexander Bernhardsson','Gustaf Nilsson',
])

const tunez = mkPlayers('Túnez', '🇹🇳', [
  'Aymen Dahmen','Sabri Ben Hessen','Abdelmouhib Chamakh',
  'Montassar Talbi','Dylan Bronn','Ali Abdi','Yan Valery',
  'Mohamed Amine Ben Hamida','Moutas Neffati','Omar Rekik','Adem Arous','Raed Chikhaoui',
  'Ellyes Skhiri','Hannibal Mejbri','Anis Ben Slimane',
  'Mortadha Ben Ouanes','Ismael Gharbi','Mohamed Hadj Mahmoud','Rani Khedira',
  'Elias Achouri','Firas Chaouat','Hazem Mastouri',
  'Elias Saad','Sebastian Tounekti','Khalil Ayari','Rayan Elloumi',
])

// ── GRUPO G ────────────────────────────────────────────────────────────────
const belgica = mkPlayers('Bélgica', '🇧🇪', [
  'Thibaut Courtois','Senne Lammens','Mike Penders',
  'Thomas Meunier','Timothy Castagne','Arthur Théate','Zeno Debast',
  'Maxim De Cuyper','Brandon Mechele','Koni De Winter','Joaquin Seys','Nathan Ngoy',
  'Axel Witsel','Kevin De Bruyne','Youri Tielemans','Hans Vanaken',
  'Amadou Onana','Nicolas Raskin',
  'Romelu Lukaku','Leandro Trossard','Jérémy Doku','Dodi Lukebakio',
  'Charles De Ketelaere','Alexis Saelemaekers','Diego Moreira','Matías Fernández-Pardo',
])

const egipto = mkPlayers('Egipto', '🇪🇬', [
  'Mohamed El Shenawy','Mostafa Shobeir','Mohamed Alaa',
  'El Mahdy Soliman','Hamdy Fathy','Ramy Rabia','Mohamed Hany',
  'Ahmed Abou El Fotouh','Mohamed Abdelmonem','Yasser Ibrahim',
  'Hossam Abdelmaguid','Karim Hafez','Tarek Alaa','Marwan Attia',
  'Emam Ashour','Mohanad Lasheen','Mahmoud Saber','Nabil Emad','Mostafa Ziko',
  'Mohamed Salah','Trezeguet','Zizo','Omar Marmoush',
  'Ibrahim Adel','Haissem Hassan','Hamza Abdelkarim',
])

const iran = mkPlayers('Irán', '🇮🇷', [
  // (*) Lista pendiente de confirmación oficial
  'Alireza Beiranvand','Hossein Hosseini','Amir Abedzadeh',
  'Ehsan Hajsafi','Morteza Pouraliganji','Majid Hosseini','Mohammad Karimi',
  'Sadegh Moharrami','Shojae Khalilzadeh','Milad Mohammadi',
  'Alireza Jahanbakhsh','Mehdi Taremi','Ahmad Noorollahi','Saeid Ezatolahi',
  'Vahid Amiri','Ali Gholizadeh','Mohammad Mohebi','Reza Ghoochannejhad',
  'Karim Ansarifard','Sardar Azmoun','Allahyar Sayyadmanesh',
  'Mohammad Ghazi','Mehdi Ghayedi','Omid Noorafkan','Saman Ghoddos','Roozbeh Cheshmi',
])

const nuevaZelanda = mkPlayers('Nueva Zelanda', '🇳🇿', [
  'Max Crocombe','Alex Paulsen','Michael Woud',
  'Tim Payne','Francis De Vries','Tyler Bindon','Michael Boxall',
  'Liberato Cacace','Nando Pijnaker','Finn Surman','Callan Elliot','Tommy Smith',
  'Joe Bell','Marko Stamenić','Alex Rufer','Ryan Thomas',
  'Lachlan Bayliss','Matt Garbett',
  'Chris Wood','Sarpreet Singh','Eli Just','Kosta Barbarouses',
  'Ben Waine','Ben Old','Callum McCowatt','Jesse Randall',
])

// ── GRUPO H ────────────────────────────────────────────────────────────────
const espana = mkPlayers('España', '🇪🇸', [
  'Unai Simón','David Raya','Joan García',
  'Aymeric Laporte','Marc Cucurella','Marcos Llorente','Éric García','Pedro Porro',
  'Alejandro Grimaldo','Pau Cubarsí','Marc Pubill',
  'Rodri','Dani Olmo','Mikel Merino','Fabián Ruiz','Pedri','Gavi',
  'Martín Zubimendi','Alex Baena',
  'Ferran Torres','Mikel Oyarzabal','Nico Williams','Lamine Yamal',
  'Yeremy Pino','Borja Iglesias','Víctor Muñoz',
])

const caboVerde = mkPlayers('Cabo Verde', '🇨🇻', [
  'Vozinha','Márcio Rosa','CJ dos Santos',
  'Stopira','Roberto Lopes','João Paulo','Diney','Logan Costa',
  'Steven Moreira','Wagner Pina','Sidny Lopes Cabral','Kelvin Pires',
  'Jamiro Monteiro','Kevin Pina','Deroy Duarte','Telmo Arcanjo',
  'Laros Duarte','Yannick Semedo',
  'Ryan Mendes','Garry Rodrigues','Willy Semedo','Jovane Cabral',
  'Gilson Tavares','Dailon Livramento','Helio Varela','Nuno da Costa',
])

const arabiaSaudita = mkPlayers('Arabia Saudita', '🇸🇦', [
  'Mohammed Al-Owais','Nawaf Al-Aqidi','Ahmed Al-Kasser',
  'Saud Abdulhamid','Hassan Al-Tambakti','Abdulelah Al-Amri',
  'Nawaf Boushal','Ali Majrashi','Ali Lajami','Hassan Kadesh','Moteb Al-Harbi',
  'Jehad Thakri','Mohammed Abu Al-Shamat',
  'Salem Al-Dawsari','Mohamed Kanno','Nasser Al-Dawsari','Abdullah Al-Khaibari',
  'Musab Al-Juwayr','Ayman Yahya','Ziyad Al-Johani','Sultan Mandash','Alaa Al-Hejji',
  'Firas Al-Buraikan','Saleh Al-Shehri','Abdullah Al-Hamdan','Khalid Al-Ghannam',
])

const uruguay = mkPlayers('Uruguay', '🇺🇾', [
  'Fernando Muslera','Sergio Rochet','Santiago Mele',
  'José María Giménez','Mathías Olivera','Guillermo Varela','Ronald Araújo',
  'Sebastián Cáceres','Joaquín Piquerez','Santiago Bueno','Matías Viña',
  'Rodrigo Bentancur','Federico Valverde','Giorgian de Arrascaeta',
  'Facundo Pellistri','Manuel Ugarte','Nicolás de la Cruz',
  'Brian Rodríguez','Maximiliano Araújo','Agustín Canobbio',
  'Emiliano Martínez','Rodrigo Zalazar','Juan Manuel Sanabria',
  'Darwin Núñez','Federico Viñas','Rodrigo Aguirre',
])

// ── GRUPO I ────────────────────────────────────────────────────────────────
const francia = mkPlayers('Francia', '🇫🇷', [
  'Mike Maignan','Brice Samba','Robin Risser',
  'Malo Gusto','Lucas Digne','Dayot Upamecano','Jules Koundé','Ibrahima Konaté',
  'William Saliba','Théo Hernández','Lucas Hernández','Maxence Lacroix',
  'N\'Golo Kanté','Adrien Rabiot','Manu Koné','Aurélien Tchouaméni','Warren Zaïre-Emery',
  'Ousmane Dembélé','Marcus Thuram','Kylian Mbappé','Michael Olise',
  'Bradley Barcola','Désire Doué','Jean-Philippe Mateta','Rayan Cherki','Maghnes Akliouche',
])

const senegal = mkPlayers('Senegal', '🇸🇳', [
  'Édouard Mendy','Mory Diaw','Yehvann Diouf',
  'Krepin Diatta','Antoine Mendy','Kalidou Koulibaly','El Hadji Malick Diouf',
  'Mamadou Sarr','Moussa Niakhaté','Moustapha Mbow','Abdoulaye Seck','Ismail Jakobs',
  'Idrissa Gana Gueye','Pape Guèye','Lamine Camara','Habib Diarra',
  'Pathé Ciss','Pape Matar Sarr','Ilay Camara',
  'Sadio Mané','Ismaïla Sarr','Iliman Ndiaye','Assane Diao',
  'Nicolas Jackson','Bamba Dieng','Ibrahim Mbaye',
])

const irak = mkPlayers('Irak', '🇮🇶', [
  'Jalal Hassan','Fahad Talib','Ahmed Basil',
  'Rebin Sulaka','Manaf Younis','Merchas Doski','Hussein Ali','Zaid Tahseen',
  'Frans Putros','Ahmed Yahya','Mustafa Saadoon','Akam Hashim',
  'Ibrahim Bayesh','Amir Al-Ammari','Ali Jasim','Youssef Amyn',
  'Zidane Iqbal','Marko Farji','Kevin Yakob','Aimar Sher','Zaid Ismail',
  'Ahmed Qasem','Aymen Hussein','Mohanad Ali','Ali Al-Hamadi','Ali Yousuf',
])

const noruega = mkPlayers('Noruega', '🇳🇴', [
  'Ørjan Nyland','Sander Tangvik','Egil Selvik',
  'Kristoffer Ajer','Leo Østigård','David Møller Wolfe','Fredrik André Bjørkan',
  'Marcus Holmgren Pedersen','Torbjørn Heggem','Sondre Langås','Henrik Falchener','Julian Ryerson',
  'Morten Thorsby','Patrick Berg','Sander Berge','Martin Ødegaard',
  'Fredrik Aursnes','Kristian Thorstvedt','Thelo Aasgaard',
  'Antonio Nusa','Andreas Schjelderup','Oscar Bobb','Jens Petter Hauge',
  'Alexander Sørloth','Erling Haaland','Jørgen Strand Larsen',
])

// ── GRUPO J ────────────────────────────────────────────────────────────────
const argentina = mkPlayers('Argentina', '🇦🇷', [
  'Emiliano Martínez','Gerónimo Rulli','Juan Musso',
  'Gonzalo Montiel','Nahuel Molina','Lisandro Martínez','Nicolás Otamendi',
  'Leonardo Balerdi','Cristian Romero','Facundo Medina','Nicolás Tagliafico',
  'Leandro Paredes','Rodrigo De Paul','Exequiel Palacios','Enzo Fernández',
  'Alexis Mac Allister','Giovani Lo Celso','Valentín Barco',
  'Lionel Messi','Nicolás Paz','Thiago Almada','Nicolás González',
  'Giuliano Simeone','Lautaro Martínez','Julián Álvarez','José Manuel López',
])

const argelia = mkPlayers('Argelia', '🇩🇿', [
  'Luca Zidane','Oussama Benbot','Melvin Mastil',
  'Aïssa Mandi','Ramy Bensebaïni','Mohamed Amine Tougai','Rayan Aït-Nouri',
  'Jaouen Hadjam','Rafik Belghali','Zineddine Belaïd','Achref Abada','Samir Chergui',
  'Nabil Bentaleb','Ramiz Zerrouki','Hicham Boudaoui','Fares Chaïbi',
  'Houssem Aouar','Ibrahim Maza','Yacine Titraoui',
  'Riyad Mahrez','Mohamed Amoura','Amine Gouiri','Anis Hadj Moussa',
  'Adil Boulbina','Nadhir Benbouali','Fares Ghedjemis',
])

const austria = mkPlayers('Austria', '🇦🇹', [
  'Alexander Schlager','Florian Wiegele','Patrick Pentz',
  'David Affengruber','Kevin Danso','Stefan Posch','David Alaba','Philipp Lienhart',
  'Philipp Mwene','Alexander Prass','Marco Friedl','Michael Svoboda',
  'Xaver Schlager','Nicolas Seiwald','Marcel Sabitzer','Florian Grillitsch',
  'Carney Chukwuemeka','Romano Schmid','Christoph Baumgartner','Konrad Laimer',
  'Patrick Wimmer','Paul Wanner','Alessandro Schöpf',
  'Marko Arnautovic','Michael Gregoritsch','Sasa Kalajdzic',
])

const jordania = mkPlayers('Jordania', '🇯🇴', [
  // (*) Lista preliminar
  'Yazeed Abulaila','Khaled Al-Daly','Ahmad Qasem',
  'Baha Abdelrahman','Mohammad Al-Dmeiri','Bahloul Al-Sa\'deh','Ahmad Saleh',
  'Anas Bani Yaseen','Khaled Tarawneh','Wesam Abu Ali',
  'Musa Al-Taamari','Yazan Al-Arab','Hamza Al-Dardour','Omar Al-Somah',
  'Mohammad Abu Zreiq','Nizar Al-Momani',
  'Yazan Naimat','Mohammad Qasim','Ibrahim Naber',
  'Moaath Al-Junaidi','Khalid Al-Boul','Ahmad Hamarsheh','Yahya Al-Rawashdeh',
  'Amer Shafi','Feras Ibrahim','Samer Awad',
])

// ── GRUPO K ────────────────────────────────────────────────────────────────
const portugal = mkPlayers('Portugal', '🇵🇹', [
  'Diogo Costa','José Sá','Rui Silva',
  'Rúben Dias','João Cancelo','Nelson Semedo','Nuno Mendes','Diogo Dalot',
  'Gonçalo Inácio','Renato Veiga','Tomás Araújo',
  'Bernardo Silva','Bruno Fernandes','Rúben Neves','Vitinha','João Neves',
  'Matheus Nunes','Francisco Trincão','Samu Costa',
  'Cristiano Ronaldo','João Félix','Rafael Leão','Gonçalo Guedes',
  'Gonçalo Ramos','Pedro Neto','Francisco Conceição',
])

const repDemCongo = mkPlayers('Rep. Dem. del Congo', '🇨🇩', [
  'Timothy Fayulu','Lionel Mpasi','Matthieu Epolo',
  'Chancel Mbemba','Arthur Masuaku','Gédéon Kalulu','Joris Kayembe',
  'Dylan Batubinsika','Axel Tuanzebe','Aaron Wan-Bissaka','Steve Kapuadi',
  'Meschak Elia','Samuel Moutoussamy','Edo Kayembe','Théo Bongonda',
  'Charles Pickel','Gaël Kakuta','Noah Sadiki','Nathanaël Mbuku',
  'Ngal\'ayel Mukau','Brian Cipenga',
  'Cédric Bakambu','Fiston Mayele','Yoane Wissa','Simon Banza','Aaron Tshibola',
])

const uzbekistan = mkPlayers('Uzbekistán', '🇺🇿', [
  // (*) Lista preliminar
  'Abduvohid Nematov','Otabek Shukurov','Husan Muhamedov',
  'Sanjar Tursunov','Khurshid Beknazarov','Jasurbek Jaloliddinov','Dilshod Hamidov',
  'Mukhammad Koraboyev','Anzur Ismailov','Bekhruz Tursunov',
  'Jaloliddin Masharipov','Abbosbek Fayzullaev','Khojiakbar Alijonov',
  'Ilkhom Sukhrobov','Akbar Tursunmurodov',
  'Nodirbek Abdukholiqov','Dostonbek Khamdamov','Shakhzod Ergashev',
  'Eldor Shomurodov','Abror Ismoilov','Sherzod Nasrullayev',
  'Otabek Yusupov','Laziz Azimov','Nodir Tursunov',
  'Bekzod Holmatov','Mirhusayn Toshmetov',
])

const colombia = mkPlayers('Colombia', '🇨🇴', [
  'David Ospina','Camilo Vargas','Álvaro Montero',
  'Dávinson Sánchez','Santiago Arias','Yerry Mina','Daniel Muñoz',
  'Johan Mojica','Jhon Lucumí','Deiver Machado','Willer Ditta',
  'James Rodríguez','Jefferson Lerma','Juan Fernando Quintero',
  'Jhon Arias','Richard Ríos','Kevin Castaño','Jorge Carrascal',
  'Jaminton Campaz','Juan Camilo Portilla','Gustavo Puerta',
  'Luis Díaz','Jhon Córdoba','Luis Suárez','Cucho Hernández','Carlos Andres Gómez',
])

// ── GRUPO L ────────────────────────────────────────────────────────────────
const inglaterra = mkPlayers('Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', [
  'Jordan Pickford','Dean Henderson','James Trafford',
  'Reece James','Dan Burn','Marc Guéhi','Ezri Konsa','Tino Livramento',
  'Nico O\'Reilly','Jarell Quansah','John Stones','Djed Spence',
  'Elliot Anderson','Jude Bellingham','Jordan Henderson','Declan Rice',
  'Kobbie Mainoo','Eberechi Eze','Anthony Gordon','Noni Madueke','Morgan Rogers',
  'Bukayo Saka','Marcus Rashford','Harry Kane','Ivan Toney','Ollie Watkins',
])

const croacia = mkPlayers('Croacia', '🇭🇷', [
  'Dominik Livaković','Dominik Kotarski','Ivo Pandur',
  'Joško Gvardiol','Duje Ćaleta-Car','Josip Šutalo','Josip Staniašić',
  'Marin Pongračić','Martin Erlić','Luka Vušković',
  'Luka Modrić','Mateo Kovačić','Mario Pašalić','Nikola Vlašić',
  'Luka Sučić','Martin Baturina','Kristijan Jakić','Petar Sučić','Nikola Moro','Toni Fruk',
  'Ivan Perišić','Andrej Kramarić','Ante Budimir',
  'Marco Pašalić','Petar Muša','Igor Matanovič',
])

const ghana = mkPlayers('Ghana', '🇬🇭', [
  // (*) Lista pendiente de confirmación
  'Lawrence Ati-Zigi','Abdul Manaf Nurudeen','Danlad Ibrahim',
  'Andrew Ayew','Alexander Djiku','Alidu Seidu','Tariqe Fosu',
  'Abdul Mumin','Daniel Amartey','Gideon Mensah',
  'Thomas Partey','Majeed Ashimeru','Kudus Mohammed','Salis Abdul Samed',
  'Jordan Ayew','Daniel Afriyie Barnieh','Inaki Williams','Nico Williams',
  'Osman Bukari','Ernest Nuamah','Antoine Semenyo',
  'Joel Fameyeh','Elisha Owusu','Patrick Klu','Felix Afena-Gyan','Benjamin Asare',
])

const panama = mkPlayers('Panamá', '🇵🇦', [
  'Luis Mejía','Orlando Mosquera','César Samudio',
  'Éric Davis','Fidel Escobar','Michael Amir Murillo','Roderick Miller',
  'Andrés Andrade','César Blackman','José Córdoba','Jiovany Ramos','Jorge Gutiérrez',
  'Edgardo Fariña','Aníbal Godoy','Alberto Quintero','Yoel Bárcenas',
  'Adalberto Carrasquilla','José Luís Rodríguez','Cristian Martínez','César Yanis',
  'Carlos Harvey','Azarías Londoño',
  'Ismael Díaz','Cecilio Waterman','José Fajardo','Tomás Rodríguez',
])

// ── EXPORT COMPLETO ────────────────────────────────────────────────────────
export const WC2026_PLAYERS: WCPlayer[] = [
  ...mexico, ...sudafrica, ...coreadelSur, ...republicaCheca,
  ...canada, ...bosnia, ...qatar, ...suiza,
  ...brasil, ...marruecos, ...haiti, ...escocia,
  ...estadosUnidos, ...paraguay, ...australia, ...turquia,
  ...alemania, ...curazao, ...costadeMarfil, ...ecuador,
  ...paisesBasos, ...japon, ...suecia, ...tunez,
  ...belgica, ...egipto, ...iran, ...nuevaZelanda,
  ...espana, ...caboVerde, ...arabiaSaudita, ...uruguay,
  ...francia, ...senegal, ...irak, ...noruega,
  ...argentina, ...argelia, ...austria, ...jordania,
  ...portugal, ...repDemCongo, ...uzbekistan, ...colombia,
  ...inglaterra, ...croacia, ...ghana, ...panama,
]

// Teams list (para el selector de campeón)
export const WC2026_TEAMS = [
  { name: 'México', flag: '🇲🇽' },
  { name: 'Sudáfrica', flag: '🇿🇦' },
  { name: 'Corea del Sur', flag: '🇰🇷' },
  { name: 'República Checa', flag: '🇨🇿' },
  { name: 'Canadá', flag: '🇨🇦' },
  { name: 'Bosnia y Herzegovina', flag: '🇧🇦' },
  { name: 'Qatar', flag: '🇶🇦' },
  { name: 'Suiza', flag: '🇨🇭' },
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'Marruecos', flag: '🇲🇦' },
  { name: 'Haití', flag: '🇭🇹' },
  { name: 'Escocia', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  { name: 'Estados Unidos', flag: '🇺🇸' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Turquía', flag: '🇹🇷' },
  { name: 'Alemania', flag: '🇩🇪' },
  { name: 'Curazao', flag: '🇨🇼' },
  { name: 'Costa de Marfil', flag: '🇨🇮' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'Países Bajos', flag: '🇳🇱' },
  { name: 'Japón', flag: '🇯🇵' },
  { name: 'Suecia', flag: '🇸🇪' },
  { name: 'Túnez', flag: '🇹🇳' },
  { name: 'Bélgica', flag: '🇧🇪' },
  { name: 'Egipto', flag: '🇪🇬' },
  { name: 'Irán', flag: '🇮🇷' },
  { name: 'Nueva Zelanda', flag: '🇳🇿' },
  { name: 'España', flag: '🇪🇸' },
  { name: 'Cabo Verde', flag: '🇨🇻' },
  { name: 'Arabia Saudita', flag: '🇸🇦' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Francia', flag: '🇫🇷' },
  { name: 'Senegal', flag: '🇸🇳' },
  { name: 'Irak', flag: '🇮🇶' },
  { name: 'Noruega', flag: '🇳🇴' },
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Argelia', flag: '🇩🇿' },
  { name: 'Austria', flag: '🇦🇹' },
  { name: 'Jordania', flag: '🇯🇴' },
  { name: 'Portugal', flag: '🇵🇹' },
  { name: 'Rep. Dem. del Congo', flag: '🇨🇩' },
  { name: 'Uzbekistán', flag: '🇺🇿' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Inglaterra', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'Croacia', flag: '🇭🇷' },
  { name: 'Ghana', flag: '🇬🇭' },
  { name: 'Panamá', flag: '🇵🇦' },
]
