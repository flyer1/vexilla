/**
 * Vexilla Flag Database
 * A comprehensive collection of country flags with capitals, continents,
 * difficulties, design characteristics, and visual mnemonics.
 */

const FLAGS_DATA = [
  {
    name: "France",
    code: "fr",
    capital: "Paris",
    continent: "Europe",
    difficulty: 1,
    colors: ["blue","white","red"],
    features: ["vertical-stripes"],
    fact: "The French Tricolor. Blue is associated with liberty, white with equality, and red with fraternity. It inspired many other tricolor flags around the world."
  },
  {
    name: "Germany",
    code: "de",
    capital: "Berlin",
    continent: "Europe",
    difficulty: 1,
    colors: ["black","red","yellow"],
    features: ["horizontal-stripes"],
    fact: "Black, red, and gold. The colors represent the movement for German unity: out of the black darkness of servitude, through bloody conflict (red), to the golden light of freedom."
  },
  {
    name: "Italy",
    code: "it",
    capital: "Rome",
    continent: "Europe",
    difficulty: 1,
    colors: ["green","white","red"],
    features: ["vertical-stripes"],
    fact: "Green represents the country's plains and hills, white represents the snow-capped Alps, and red represents the blood spilled in the wars of independence."
  },
  {
    name: "United Kingdom",
    code: "gb",
    capital: "London",
    continent: "Europe",
    difficulty: 1,
    colors: ["blue","white","red"],
    features: ["cross"],
    fact: "Known as the Union Jack, it combines the red cross of St George (England), the white saltire of St Andrew (Scotland), and the red saltire of St Patrick (Ireland)."
  },
  {
    name: "Spain",
    code: "es",
    capital: "Madrid",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","yellow"],
    features: ["emblem","horizontal-stripes"],
    fact: "Features horizontal stripes of red, yellow, and red. The central yellow stripe is twice as wide as the red stripes. It features the national coat of arms."
  },
  {
    name: "Netherlands",
    code: "nl",
    capital: "Amsterdam",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white","blue"],
    features: ["horizontal-stripes"],
    fact: "The oldest horizontal tricolor in continuous use. Do not confuse it with Russia's flag (which has a different order: white, blue, red)."
  },
  {
    name: "Belgium",
    code: "be",
    capital: "Brussels",
    continent: "Europe",
    difficulty: 1,
    colors: ["black","yellow","red"],
    features: ["vertical-stripes"],
    fact: "Features vertical stripes of black, yellow, and red, based on the arms of the Duchy of Brabant. It uses a unique almost-square ratio of 13:15."
  },
  {
    name: "Switzerland",
    code: "ch",
    capital: "Bern",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white"],
    features: ["cross","square"],
    fact: "One of only two square national flags (the other is Vatican City). It features a bold white cross on a red background. The Red Cross organization reversed these colors."
  },
  {
    name: "Greece",
    code: "gr",
    capital: "Athens",
    continent: "Europe",
    difficulty: 1,
    colors: ["blue","white"],
    features: ["cross","horizontal-stripes"],
    fact: "The nine blue and white stripes represent the nine syllables of the Greek battle cry 'Eleutheria i Thanatos' (Freedom or Death). The white cross represents Eastern Orthodox Christianity."
  },
  {
    name: "Sweden",
    code: "se",
    capital: "Stockholm",
    continent: "Europe",
    difficulty: 1,
    colors: ["blue","yellow"],
    features: ["cross"],
    fact: "Features a yellow Nordic cross on a blue field. The colors and cross layout were inspired by the coat of arms of Sweden and modeled on Denmark's flag."
  },
  {
    name: "Denmark",
    code: "dk",
    capital: "Copenhagen",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white"],
    features: ["cross"],
    fact: "Known as the Dannebrog. It is the oldest continuously used national flag in the world, originating in 1219 when legend says it fell from the sky during a battle."
  },
  {
    name: "Norway",
    code: "no",
    capital: "Oslo",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white","blue"],
    features: ["cross"],
    fact: "Features a red field with a blue Nordic cross outlined in white. It contains the colors of liberty (red, white, blue) and represents Norway's historical ties with Denmark and Sweden."
  },
  {
    name: "Finland",
    code: "fi",
    capital: "Helsinki",
    continent: "Europe",
    difficulty: 1,
    colors: ["white","blue"],
    features: ["cross"],
    fact: "The blue cross represents Finland's thousands of lakes and blue skies, while the white background represents the winter snow covering the country."
  },
  {
    name: "Ireland",
    code: "ie",
    capital: "Dublin",
    continent: "Europe",
    difficulty: 1,
    colors: ["green","white","orange"],
    features: ["vertical-stripes"],
    fact: "Green represents Irish Catholics, orange represents Irish Protestants (William of Orange), and white represents the hope for lasting peace between them."
  },
  {
    name: "Portugal",
    code: "pt",
    capital: "Lisbon",
    continent: "Europe",
    difficulty: 2,
    colors: ["green","red","yellow"],
    features: ["emblem","vertical-stripes"],
    fact: "Unequal vertical bands of green (hope) and red (blood). The boundary features an armillary sphere (a navigation tool representing the Age of Discoveries) and a shield."
  },
  {
    name: "Austria",
    code: "at",
    capital: "Vienna",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white"],
    features: ["horizontal-stripes"],
    fact: "Three horizontal bands (red-white-red). Legend says Duke Leopold V's white surcoat was completely soaked in blood after battle, except for the strip under his belt."
  },
  {
    name: "Poland",
    code: "pl",
    capital: "Warsaw",
    continent: "Europe",
    difficulty: 1,
    colors: ["white","red"],
    features: ["horizontal-stripes"],
    fact: "Simple white upper and red lower half. White represents peace and purity, and red represents courage and blood spilled for freedom. Reverse of Monaco and Indonesia."
  },
  {
    name: "Ukraine",
    code: "ua",
    capital: "Kyiv",
    continent: "Europe",
    difficulty: 1,
    colors: ["blue","yellow"],
    features: ["horizontal-stripes"],
    fact: "Simple blue and yellow bands. Represents a clear blue sky over golden fields of wheat, reflecting Ukraine's status as a major agricultural breadbasket."
  },
  {
    name: "Iceland",
    code: "is",
    capital: "Reykjavik",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","white","red"],
    features: ["cross"],
    fact: "A blue field with a red cross outlined in white. Blue represents the Atlantic Ocean, white represents snow and ice, and red represents volcanic fire."
  },
  {
    name: "Vatican City",
    code: "va",
    capital: "Vatican City",
    continent: "Europe",
    difficulty: 2,
    colors: ["yellow","white"],
    features: ["emblem","square"],
    fact: "One of only two square national flags. Vertical yellow and white bands. White side features the Crossed Keys of Saint Peter (gold and silver) and the Papal Tiara."
  },
  {
    name: "Monaco",
    code: "mc",
    capital: "Monaco",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","white"],
    features: ["horizontal-stripes"],
    fact: "Red and white horizontal stripes, identical to Indonesia's flag but with a narrower ratio (4:5 vs 2:3) and Monaco's red is slightly darker. Based on the House of Grimaldi colors."
  },
  {
    name: "Andorra",
    code: "ad",
    capital: "Andorra la Vella",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","yellow","red"],
    features: ["emblem","vertical-stripes"],
    fact: "Vertical stripes of blue, yellow, and red. The central yellow band contains the coat of arms. The design combines the colors of France and Spain, its two neighbors."
  },
  {
    name: "Croatia",
    code: "hr",
    capital: "Zagreb",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","white","blue"],
    features: ["emblem","horizontal-stripes"],
    fact: "Red, white, and blue tricolor. Features the famous red-and-white checkerboard shield (chequy) topped by a crown representing Croatia's five historical regions."
  },
  {
    name: "Czechia",
    code: "cz",
    capital: "Prague",
    continent: "Europe",
    difficulty: 1,
    colors: ["white","red","blue"],
    features: ["triangle","horizontal-stripes"],
    fact: "Horizontal white and red bands with a blue triangle/wedge on the hoist side. The blue triangle represents the region of Moravia and prevents confusion with Poland."
  },
  {
    name: "Hungary",
    code: "hu",
    capital: "Budapest",
    continent: "Europe",
    difficulty: 1,
    colors: ["red","white","green"],
    features: ["horizontal-stripes"],
    fact: "Horizontal tricolor of red (strength), white (faithfulness), and green (hope). Same colors as Italy but arranged horizontally."
  },
  {
    name: "Romania",
    code: "ro",
    capital: "Bucharest",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","yellow","red"],
    features: ["vertical-stripes"],
    fact: "Vertical blue, yellow, and red tricolor. It is nearly identical to the flag of Chad, but Romania's blue is slightly lighter."
  },
  {
    name: "Bulgaria",
    code: "bg",
    capital: "Sofia",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","green","red"],
    features: ["horizontal-stripes"],
    fact: "Horizontal bands of white (peace), green (agriculture), and red (courage). Very similar to Italy's colors but horizontal instead of vertical."
  },
  {
    name: "Estonia",
    code: "ee",
    capital: "Tallinn",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","black","white"],
    features: ["horizontal-stripes"],
    fact: "One of the most striking color schemes: blue for the sky and loyalty, black for the fertile soil and past struggles, and white for snow, purity, and hope."
  },
  {
    name: "Latvia",
    code: "lv",
    capital: "Riga",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","white"],
    features: ["horizontal-stripes"],
    fact: "Features a unique dark carmine red flag with a thin white horizontal stripe in the middle. The color is sometimes called 'Latvian red'."
  },
  {
    name: "Lithuania",
    code: "lt",
    capital: "Vilnius",
    continent: "Europe",
    difficulty: 2,
    colors: ["yellow","green","red"],
    features: ["horizontal-stripes"],
    fact: "Horizontal bands: yellow representing the sun and prosperity, green for the forests and freedom, and red for the courage and blood shed for the nation."
  },
  {
    name: "Slovakia",
    code: "sk",
    capital: "Bratislava",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","blue","red"],
    features: ["emblem","horizontal-stripes"],
    fact: "Uses the Pan-Slavic white, blue, and red horizontal stripes. The left side features the coat of arms showing a white double cross on three blue hills."
  },
  {
    name: "Slovenia",
    code: "si",
    capital: "Ljubljana",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","blue","red"],
    features: ["emblem","horizontal-stripes"],
    fact: "Uses the Pan-Slavic white, blue, and red stripes. The canton features the coat of arms depicting Mount Triglav (Slovenia's highest peak), rivers, and three yellow stars."
  },
  {
    name: "Albania",
    code: "al",
    capital: "Tirana",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","black"],
    features: ["emblem"],
    fact: "A bold, solid red field with a black double-headed eagle in the center. The eagle dates back to national hero Skanderbeg's revolt against the Ottomans."
  },
  {
    name: "Bosnia and Herzegovina",
    code: "ba",
    capital: "Sarajevo",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","yellow","white"],
    features: ["triangle","stars"],
    fact: "A yellow right triangle (representing the country's shape and its three ethnic groups) and a diagonal row of white stars on a blue field."
  },
  {
    name: "North Macedonia",
    code: "mk",
    capital: "Skopje",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","yellow"],
    features: ["sun"],
    fact: "A golden yellow sun with eight rays radiating out to the edges of a bright red field. Represents the 'new sun of liberty' mentioned in the national anthem."
  },
  {
    name: "Malta",
    code: "mt",
    capital: "Valletta",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","red"],
    features: ["cross"],
    fact: "Vertical halves of white and red. The top-left canton contains the George Cross (a British military decoration awarded for heroism during WWII) outlined in red."
  },
  {
    name: "San Marino",
    code: "sm",
    capital: "San Marino",
    continent: "Europe",
    difficulty: 3,
    colors: ["white","blue"],
    features: ["emblem","horizontal-stripes"],
    fact: "White and light blue horizontal bands. Features the national coat of arms in the center, which includes three towers on peaks, representing the three fortresses of Mount Titano."
  },
  {
    name: "Liechtenstein",
    code: "li",
    capital: "Vaduz",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","red","yellow"],
    features: ["crown","horizontal-stripes"],
    fact: "Blue and red horizontal bands. The gold prince's crown in the canton was added in 1937 after Liechtenstein realized their flag was identical to Haiti's during the 1936 Olympics."
  },
  {
    name: "Montenegro",
    code: "me",
    capital: "Podgorica",
    continent: "Europe",
    difficulty: 3,
    colors: ["red","yellow"],
    features: ["emblem"],
    fact: "A red flag with a golden border and a golden double-headed eagle in the center, carrying a shield with a lion passant. Derived from the royal standard of King Nikola I."
  },
  {
    name: "Moldova",
    code: "md",
    capital: "Chisinau",
    continent: "Europe",
    difficulty: 3,
    colors: ["blue","yellow","red"],
    features: ["emblem","vertical-stripes"],
    fact: "Similar vertical blue-yellow-red stripes as Romania, but with a brown eagle holding a shield with an aurochs (wild ox) head in the center."
  },
  {
    name: "Cyprus",
    code: "cy",
    capital: "Nicosia",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","orange","green"],
    features: ["emblem","map"],
    fact: "Features a copper-colored map of the island (copper was discovered here) above two olive branches representing peace. The background is pure white."
  },
  {
    name: "Luxembourg",
    code: "lu",
    capital: "Luxembourg",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","white","blue"],
    features: ["horizontal-stripes"],
    fact: "Horizontal red, white, and blue stripes. Almost identical to the Netherlands, but uses a lighter sky-blue shade and is longer (ratio of 3:5 vs 2:3)."
  },
  {
    name: "Belarus",
    code: "by",
    capital: "Minsk",
    continent: "Europe",
    difficulty: 3,
    colors: ["red","green","white"],
    features: ["pattern","horizontal-stripes"],
    fact: "A large red band over a green band, with a vertical white-on-red traditional ornamental pattern along the hoist side."
  },
  {
    name: "Japan",
    code: "jp",
    capital: "Tokyo",
    continent: "Asia",
    difficulty: 1,
    colors: ["white","red"],
    features: ["circle"],
    fact: "Known as Hinomaru (circle of the sun). A solid red disk representing the rising sun centered on a plain white field."
  },
  {
    name: "China",
    code: "cn",
    capital: "Beijing",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","yellow"],
    features: ["stars"],
    fact: "Red field with a large gold star (representing the Communist Party) and a semi-circle of four smaller stars (representing the four social classes of society)."
  },
  {
    name: "India",
    code: "in",
    capital: "New Delhi",
    continent: "Asia",
    difficulty: 1,
    colors: ["orange","white","green","blue"],
    features: ["circle","horizontal-stripes"],
    fact: "Saffron representing courage, white representing peace, green representing faith. The blue wheel in the center is the Ashoka Chakra with 24 spokes."
  },
  {
    name: "South Korea",
    code: "kr",
    capital: "Seoul",
    continent: "Asia",
    difficulty: 1,
    colors: ["white","red","blue","black"],
    features: ["circle","symbols"],
    fact: "A white field with a red-and-blue Taegeuk (yin-yang) in the center, representing universal balance. Four black trigrams represent sky, sun, water, and earth."
  },
  {
    name: "North Korea",
    code: "kp",
    capital: "Pyongyang",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white","blue"],
    features: ["star","circle","horizontal-stripes"],
    fact: "A red central panel with blue stripes at the top and bottom. A red communist star is positioned within a white circle toward the hoist."
  },
  {
    name: "Israel",
    code: "il",
    capital: "Jerusalem",
    continent: "Asia",
    difficulty: 1,
    colors: ["white","blue"],
    features: ["star","horizontal-stripes"],
    fact: "Features a blue Star of David between two blue horizontal stripes. The design is based on the Tallit, the traditional Jewish prayer shawl."
  },
  {
    name: "Saudi Arabia",
    code: "sa",
    capital: "Riyadh",
    continent: "Asia",
    difficulty: 2,
    colors: ["green","white"],
    features: ["text","sword"],
    fact: "A green Islamic flag containing the Shahada (declaration of faith) in white Arabic script. Below the script is a white sword representing justice and strength."
  },
  {
    name: "Turkey",
    code: "tr",
    capital: "Ankara",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","white"],
    features: ["crescent","star"],
    fact: "A white crescent moon and a five-pointed star on a red background. These Ottoman symbols represent progress, light, and history."
  },
  {
    name: "Vietnam",
    code: "vn",
    capital: "Hanoi",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","yellow"],
    features: ["star"],
    fact: "A large yellow five-pointed star in the center of a solid red field. The red represents blood of revolution, and the five points of the star represent workers, peasants, soldiers, intellectuals, and youth."
  },
  {
    name: "Indonesia",
    code: "id",
    capital: "Jakarta",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","white"],
    features: ["horizontal-stripes"],
    fact: "Red and white horizontal stripes. Red represents physical energy, white represents spiritual purity. Identical to Monaco but uses a wider 2:3 ratio."
  },
  {
    name: "Singapore",
    code: "sg",
    capital: "Singapore",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white"],
    features: ["crescent","stars"],
    fact: "Red over white. The red canton contains a white crescent moon (a young nation on the rise) and five stars in a circle (democracy, peace, progress, justice, and equality)."
  },
  {
    name: "Malaysia",
    code: "my",
    capital: "Kuala Lumpur",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white","blue","yellow"],
    features: ["crescent","star","horizontal-stripes"],
    fact: "Known as the Stripes of Glory. 14 red and white stripes and a blue canton with a yellow crescent and a 14-pointed star, representing the 13 states and federal government."
  },
  {
    name: "Philippines",
    code: "ph",
    capital: "Manila",
    continent: "Asia",
    difficulty: 2,
    colors: ["blue","red","white","yellow"],
    features: ["triangle","sun","stars"],
    fact: "Blue and red stripes with a white triangle containing an 8-rayed sun and three stars. In times of war, the flag is flown upside down with the red stripe on top."
  },
  {
    name: "Thailand",
    code: "th",
    capital: "Bangkok",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","white","blue"],
    features: ["horizontal-stripes"],
    fact: "Five horizontal stripes: red (nation), white (religion), and a double-width blue (monarchy) in the center. The blue was introduced to honor WWI allies."
  },
  {
    name: "Pakistan",
    code: "pk",
    capital: "Islamabad",
    continent: "Asia",
    difficulty: 1,
    colors: ["green","white"],
    features: ["crescent","star","vertical-stripes"],
    fact: "A dark green field (representing the Muslim majority) with a white vertical bar at the hoist (representing religious minorities). A crescent moon and star represent progress and light."
  },
  {
    name: "Bangladesh",
    code: "bd",
    capital: "Dhaka",
    continent: "Asia",
    difficulty: 2,
    colors: ["green","red"],
    features: ["circle"],
    fact: "A red disc on a bottle green field. The red disk represents the sun of independence and blood shed for freedom (and is slightly offset to the hoist so it appears centered when flying)."
  },
  {
    name: "Taiwan",
    code: "tw",
    capital: "Taipei",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","blue","white"],
    features: ["sun"],
    fact: "A red flag with a blue canton containing a white sun with 12 rays. The rays represent the 12 hours of the day and 12 months of the year, symbolizing continuous progress."
  },
  {
    name: "Mongolia",
    code: "mn",
    capital: "Ulaanbaatar",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","blue","yellow"],
    features: ["symbol","vertical-stripes"],
    fact: "Red-blue-red vertical bands. The hoist band features the yellow 'Soyombo' symbol, a column containing representations of fire, sun, moon, triangles, and yin-yang."
  },
  {
    name: "Nepal",
    code: "np",
    capital: "Kathmandu",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","blue","white"],
    features: ["non-quadrilateral","sun","crescent"],
    fact: "The world's only non-quadrilateral national flag. It consists of two stacked triangles outlined in blue with a crescent moon (royal house) and sun (Rana dynasty) symbols."
  },
  {
    name: "Sri Lanka",
    code: "lk",
    capital: "Sri Jayawardenepura Kotte",
    continent: "Asia",
    difficulty: 3,
    colors: ["yellow","green","orange","maroon"],
    features: ["emblem","vertical-stripes"],
    fact: "Known as the Lion Flag. A golden lion holding a sword in a maroon field (Sinhalese majority), with green (Muslims) and orange (Tamils) stripes on the left."
  },
  {
    name: "Iran",
    code: "ir",
    capital: "Tehran",
    continent: "Asia",
    difficulty: 3,
    colors: ["green","white","red"],
    features: ["emblem","text","horizontal-stripes"],
    fact: "Green-white-red bands with the red emblem (a stylized representation of Allah) in the center. The borders of the stripes contain the phrase 'Allahu Akbar' repeated 22 times."
  },
  {
    name: "Iraq",
    code: "iq",
    capital: "Baghdad",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white","black","green"],
    features: ["text","horizontal-stripes"],
    fact: "Red, white, and black horizontal bands. In the center is the phrase 'Allahu Akbar' (God is Greatest) written in green Kufic script."
  },
  {
    name: "Jordan",
    code: "jo",
    capital: "Amman",
    continent: "Asia",
    difficulty: 3,
    colors: ["black","white","green","red"],
    features: ["triangle","star","horizontal-stripes"],
    fact: "Black, white, and green stripes representing early Islamic Caliphates, with a red chevron/triangle containing a white 7-pointed star representing the opening verses of the Quran."
  },
  {
    name: "Lebanon",
    code: "lb",
    capital: "Beirut",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","white","green"],
    features: ["tree","horizontal-stripes"],
    fact: "A green Lebanon Cedar tree (symbolizing holiness, eternity, and peace) in the center of a wide white band, bordered by red stripes at the top and bottom."
  },
  {
    name: "Kazakhstan",
    code: "kz",
    capital: "Astana",
    continent: "Asia",
    difficulty: 2,
    colors: ["blue","yellow"],
    features: ["sun","eagle","pattern"],
    fact: "Sky blue representing the endless sky and peace. It features a golden sun with 32 rays, a soaring steppe eagle, and a national ornamental pattern along the hoist."
  },
  {
    name: "United Arab Emirates",
    code: "ae",
    capital: "Abu Dhabi",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","green","white","black"],
    features: ["horizontal-stripes","vertical-stripes"],
    fact: "A vertical red stripe on the left representing loyalty, with green (hope/fertility), white (peace/neutrality), and black (oil wealth/strength) horizontal stripes."
  },
  {
    name: "Qatar",
    code: "qa",
    capital: "Doha",
    continent: "Asia",
    difficulty: 2,
    colors: ["maroon","white"],
    features: ["serrated"],
    fact: "A maroon flag with a white nine-point serrated (zigzag) edge at the hoist. It is the only national flag that is more than twice as wide as it is tall (11:28 ratio)."
  },
  {
    name: "Bahrain",
    code: "bh",
    capital: "Manama",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white"],
    features: ["serrated"],
    fact: "Red flag with a white five-point serrated edge at the hoist. The five points represent the five pillars of Islam. Very similar to Qatar but uses red and is 3:5 in ratio."
  },
  {
    name: "Oman",
    code: "om",
    capital: "Muscat",
    continent: "Asia",
    difficulty: 3,
    colors: ["red","white","green"],
    features: ["emblem","horizontal-stripes"],
    fact: "Three horizontal bands (white, red, green) with a vertical red stripe on the left. The canton features the national emblem (crossed daggers/khanjar over a belt)."
  },
  {
    name: "Yemen",
    code: "ye",
    capital: "Sana'a",
    continent: "Asia",
    difficulty: 1,
    colors: ["red","white","black"],
    features: ["horizontal-stripes"],
    fact: "Simple red, white, and black horizontal bands. The colors represent the blood of martyrs (red), a bright future (white), and a dark past (black)."
  },
  {
    name: "Kuwait",
    code: "kw",
    capital: "Kuwait City",
    continent: "Asia",
    difficulty: 2,
    colors: ["green","white","red","black"],
    features: ["trapezoid","horizontal-stripes"],
    fact: "Three horizontal stripes (green, white, red) with a black trapezoid at the hoist. The colors represent pastures (green), deeds (white), swords (red), and battles (black)."
  },
  {
    name: "Syria",
    code: "sy",
    capital: "Damascus",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","white","black","green"],
    features: ["stars","horizontal-stripes"],
    fact: "Red, white, and black horizontal stripes with two green stars in the middle. The stars represent the former union between Syria and Egypt."
  },
  {
    name: "Cambodia",
    code: "kh",
    capital: "Phnom Penh",
    continent: "Asia",
    difficulty: 2,
    colors: ["blue","red","white"],
    features: ["emblem","horizontal-stripes"],
    fact: "A red band bordered by blue bands, featuring the white silhouette of Angkor Wat in the center. One of only a few flags to feature a real building."
  },
  {
    name: "United States",
    code: "us",
    capital: "Washington, D.C.",
    continent: "Americas",
    difficulty: 1,
    colors: ["red","white","blue"],
    features: ["stars","horizontal-stripes"],
    fact: "The Stars and Stripes. 50 white stars represent the 50 current states, and 13 alternating red and white stripes represent the original 13 colonies."
  },
  {
    name: "Canada",
    code: "ca",
    capital: "Ottawa",
    continent: "Americas",
    difficulty: 1,
    colors: ["red","white"],
    features: ["leaf","vertical-stripes"],
    fact: "Known as the Maple Leaf. A stylized red maple leaf sits on a central white square, bordered by two red vertical bands representing the Pacific and Atlantic oceans."
  },
  {
    name: "Mexico",
    code: "mx",
    capital: "Mexico City",
    continent: "Americas",
    difficulty: 1,
    colors: ["green","white","red"],
    features: ["emblem","vertical-stripes"],
    fact: "Green-white-red vertical bands with the national emblem (an eagle perched on a cactus eating a snake) based on the Aztec legend of Tenochtitlan's founding."
  },
  {
    name: "Brazil",
    code: "br",
    capital: "Brasilia",
    continent: "Americas",
    difficulty: 1,
    colors: ["green","yellow","blue","white"],
    features: ["globe","text"],
    fact: "Green field (Amazon rainforest) with a yellow rhombus (mineral wealth). Enclosed is a blue celestial disc depicting the night sky over Rio de Janeiro, with the motto 'Ordem e Progresso'."
  },
  {
    name: "Argentina",
    code: "ar",
    capital: "Buenos Aires",
    continent: "Americas",
    difficulty: 1,
    colors: ["blue","white","yellow"],
    features: ["sun","horizontal-stripes"],
    fact: "Three horizontal bands of light blue, white, and light blue. In the center is the golden 'Sun of May' (Sol de Mayo) representing the Inca sun god Inti."
  },
  {
    name: "Colombia",
    code: "co",
    capital: "Bogota",
    continent: "Americas",
    difficulty: 1,
    colors: ["yellow","blue","red"],
    features: ["horizontal-stripes"],
    fact: "Horizontal yellow, blue, and red stripes. The yellow band is twice as wide as the other two. Yellow is wealth/gold, blue is oceans, and red is blood spilled for independence."
  },
  {
    name: "Peru",
    code: "pe",
    capital: "Lima",
    continent: "Americas",
    difficulty: 1,
    colors: ["red","white"],
    features: ["vertical-stripes"],
    fact: "Vertical red-white-red stripes. The colors are said to have been chosen by General San Martín after seeing a flock of red-winged, white-breasted flamingos fly overhead."
  },
  {
    name: "Chile",
    code: "cl",
    capital: "Santiago",
    continent: "Americas",
    difficulty: 1,
    colors: ["red","white","blue"],
    features: ["star","horizontal-stripes"],
    fact: "Known as La Estrella Solitaria (The Lone Star). An upper white and lower red band, with a blue square in the canton containing a white five-pointed star."
  },
  {
    name: "Venezuela",
    code: "ve",
    capital: "Caracas",
    continent: "Americas",
    difficulty: 2,
    colors: ["yellow","blue","red","white"],
    features: ["stars","horizontal-stripes"],
    fact: "Yellow-blue-red stripes with an arc of eight white five-pointed stars in the center representing the eight provinces. The eighth star was championed by Simón Bolívar."
  },
  {
    name: "Cuba",
    code: "cu",
    capital: "Havana",
    continent: "Americas",
    difficulty: 1,
    colors: ["blue","white","red"],
    features: ["triangle","star","horizontal-stripes"],
    fact: "Five blue and white stripes, representing the military departments. A red triangle (strength and blood) at the hoist contains a white star representing absolute freedom."
  },
  {
    name: "Jamaica",
    code: "jm",
    capital: "Kingston",
    continent: "Americas",
    difficulty: 1,
    colors: ["green","black","yellow"],
    features: ["cross","diagonal"],
    fact: "A gold diagonal cross (saltire) dividing the flag into green (top/bottom, agricultural wealth) and black (sides, hardships overcome) triangles. One of only two national flags with no red, white, or blue."
  },
  {
    name: "Bahamas",
    code: "bs",
    capital: "Nassau",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","yellow","black"],
    features: ["triangle","horizontal-stripes"],
    fact: "Three horizontal bands of aquamarine (waters) and gold (sands) with a black triangle (representing the vigor and force of the people) pointing from the hoist."
  },
  {
    name: "Costa Rica",
    code: "cr",
    capital: "San Jose",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","white","red"],
    features: ["horizontal-stripes"],
    fact: "Five horizontal stripes: blue, white, double-width red, white, and blue. Blue represents the sky, white represents peace, and red represents the warmth and blood shed for the nation."
  },
  {
    name: "Panama",
    code: "pa",
    capital: "Panama City",
    continent: "Americas",
    difficulty: 2,
    colors: ["white","blue","red"],
    features: ["stars"],
    fact: "Divided into four quarters: white with blue star, blue (conservatives), white with red star, red (liberals). The white represents peace between the parties."
  },
  {
    name: "Uruguay",
    code: "uy",
    capital: "Montevideo",
    continent: "Americas",
    difficulty: 2,
    colors: ["white","blue","yellow"],
    features: ["sun","horizontal-stripes"],
    fact: "Nine stripes of alternating white and blue (representing the nine original departments) with the golden 'Sun of May' placed in the white canton."
  },
  {
    name: "Ecuador",
    code: "ec",
    capital: "Quito",
    continent: "Americas",
    difficulty: 2,
    colors: ["yellow","blue","red"],
    features: ["emblem","horizontal-stripes"],
    fact: "Like Colombia's flag (wide yellow stripe on top), but features the national coat of arms in the center, depicting an Andean condor representing power and defense."
  },
  {
    name: "Bolivia",
    code: "bo",
    capital: "Sucre",
    continent: "Americas",
    difficulty: 2,
    colors: ["red","yellow","green"],
    features: ["horizontal-stripes"],
    fact: "Horizontal red (courage), yellow (mineral resources), and green (fertility and agriculture) stripes. Often features the national coat of arms in the center."
  },
  {
    name: "Paraguay",
    code: "py",
    capital: "Asuncion",
    continent: "Americas",
    difficulty: 3,
    colors: ["red","white","blue"],
    features: ["emblem","horizontal-stripes"],
    fact: "The only national flag with different symbols on the front and back! The front (obverse) shows the national coat of arms; the back (reverse) shows the Treasury Seal with a lion."
  },
  {
    name: "Dominican Republic",
    code: "do",
    capital: "Santo Domingo",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","red","white"],
    features: ["cross","emblem"],
    fact: "A white cross divides the flag into blue (liberty) and red (blood) alternating quarters. A central shield features a Bible open to John 8:32 ('The truth shall make you free')."
  },
  {
    name: "Guatemala",
    code: "gt",
    capital: "Guatemala City",
    continent: "Americas",
    difficulty: 3,
    colors: ["blue","white"],
    features: ["emblem","vertical-stripes"],
    fact: "Vertical bands of sky blue (between two oceans) and white (peace). The center features a coat of arms with the Resplendent Quetzal bird, representing autonomy."
  },
  {
    name: "Honduras",
    code: "hn",
    capital: "Tegucigalpa",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","white"],
    features: ["stars","horizontal-stripes"],
    fact: "Three horizontal bands: blue, white, blue. The central white band contains five blue stars in an 'X' pattern, representing the five former members of the Federal Republic."
  },
  {
    name: "South Africa",
    code: "za",
    capital: "Pretoria",
    continent: "Africa",
    difficulty: 1,
    colors: ["red","blue","green","yellow","black","white"],
    features: ["y-shape"],
    fact: "One of the most colorful flags. Features a green horizontal Y-shape, representing the convergence of diverse groups and unity. Combines Pan-African and colonial colors."
  },
  {
    name: "Egypt",
    code: "eg",
    capital: "Cairo",
    continent: "Africa",
    difficulty: 1,
    colors: ["red","white","black","yellow"],
    features: ["emblem","horizontal-stripes"],
    fact: "Red, white, and black horizontal bands. In the center is the golden 'Eagle of Saladin', a historical symbol of Arab unity."
  },
  {
    name: "Nigeria",
    code: "ng",
    capital: "Abuja",
    continent: "Africa",
    difficulty: 1,
    colors: ["green","white"],
    features: ["vertical-stripes"],
    fact: "Three vertical bands: green, white, and green. The green represents the country's rich forests and agricultural wealth, while the white represents peace."
  },
  {
    name: "Kenya",
    code: "ke",
    capital: "Nairobi",
    continent: "Africa",
    difficulty: 1,
    colors: ["black","red","green","white"],
    features: ["emblem","horizontal-stripes"],
    fact: "Black, red, and green stripes separated by narrow white borders. It features a traditional red, white, and black Maasai shield with two crossed spears representing defense."
  },
  {
    name: "Morocco",
    code: "ma",
    capital: "Rabat",
    continent: "Africa",
    difficulty: 1,
    colors: ["red","green"],
    features: ["star"],
    fact: "A solid red field with a green hollow pentagram (the Seal of Solomon) in the center. The green represents Islam and red represents the royal dynasty."
  },
  {
    name: "Ethiopia",
    code: "et",
    capital: "Addis Ababa",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red","blue"],
    features: ["circle","star","horizontal-stripes"],
    fact: "The origin of the Pan-African green-yellow-red colors. It features a central blue disc with a yellow pentagram emitting five rays of light, representing unity and equality."
  },
  {
    name: "Ghana",
    code: "gh",
    capital: "Accra",
    continent: "Africa",
    difficulty: 1,
    colors: ["red","yellow","green","black"],
    features: ["star","horizontal-stripes"],
    fact: "Red-yellow-green stripes with a single black star in the center. The black star represents the lodestar of African freedom and was inspired by the Black Star Line shipping line."
  },
  {
    name: "Madagascar",
    code: "mg",
    capital: "Antananarivo",
    continent: "Africa",
    difficulty: 2,
    colors: ["white","red","green"],
    features: ["horizontal-stripes","vertical-stripes"],
    fact: "A vertical white band on the left, with horizontal red and green bands on the right. White represents purity, red sovereignty, and green hope."
  },
  {
    name: "Algeria",
    code: "dz",
    capital: "Algiers",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","white","red"],
    features: ["crescent","star"],
    fact: "Vertical green (Islam/nature) and white (purity/peace) halves. In the center is a red crescent moon and five-pointed star, representing the nation's Islamic heritage."
  },
  {
    name: "Tunisia",
    code: "tn",
    capital: "Tunis",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","white"],
    features: ["circle","crescent","star"],
    fact: "A red flag containing a white circle enclosing a red crescent moon and five-pointed star. Very similar to Turkey's flag but placed inside a white circle of peace."
  },
  {
    name: "Senegal",
    code: "sn",
    capital: "Dakar",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red"],
    features: ["star","vertical-stripes"],
    fact: "Vertical green, yellow, and red bands with a green star in the center. Similar to Mali's flag, which has the same colors but no star."
  },
  {
    name: "Cameroon",
    code: "cm",
    capital: "Yaounde",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","red","yellow"],
    features: ["star","vertical-stripes"],
    fact: "Vertical green, red, and yellow bands with a golden star in the center red band (representing unity). The yellow represents the sun and northern savannahs."
  },
  {
    name: "Ivory Coast",
    code: "ci",
    capital: "Yamoussoukro",
    continent: "Africa",
    difficulty: 2,
    colors: ["orange","white","green"],
    features: ["vertical-stripes"],
    fact: "Vertical orange, white, and green bands. It is the reverse of Ireland's flag (green-white-orange). Orange is the savannah, white is unity, and green is hope/forests."
  },
  {
    name: "Angola",
    code: "ao",
    capital: "Luanda",
    continent: "Africa",
    difficulty: 3,
    colors: ["red","black","yellow"],
    features: ["emblem"],
    fact: "Red (freedom) and black (African continent) horizontal bands. The golden emblem features a crossed machete (peasantry) and half-cogwheel (workers), resembling the Soviet hammer and sickle."
  },
  {
    name: "Zimbabwe",
    code: "zw",
    capital: "Harare",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","yellow","red","black","white"],
    features: ["triangle","bird","star","horizontal-stripes"],
    fact: "Seven horizontal stripes. A white triangle on the left contains a red five-pointed star (hope/peace) and the golden 'Zimbabwe Bird' representing historic ruins."
  },
  {
    name: "Tanzania",
    code: "tz",
    capital: "Dodoma",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","black","blue"],
    features: ["diagonal"],
    fact: "Divided diagonally by a black band with yellow borders: green (vegetation) in the top-left, blue (the Indian Ocean and lakes) in the bottom-right."
  },
  {
    name: "Democratic Republic of the Congo",
    code: "cd",
    capital: "Kinshasa",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","yellow","red"],
    features: ["diagonal","star"],
    fact: "A sky blue field with a yellow-bordered red diagonal stripe, representing the blood of martyrs and resources. A yellow star in the canton represents a bright future."
  },
  {
    name: "Uganda",
    code: "ug",
    capital: "Kampala",
    continent: "Africa",
    difficulty: 3,
    colors: ["black","yellow","red","white"],
    features: ["bird","horizontal-stripes"],
    fact: "Six horizontal stripes of black (African people), yellow (sun), and red (brotherhood). A white circle in the center contains a Grey Crowned Crane, the national symbol."
  },
  {
    name: "Australia",
    code: "au",
    capital: "Canberra",
    continent: "Oceania",
    difficulty: 1,
    colors: ["blue","white","red"],
    features: ["stars","union-jack"],
    fact: "Blue field with the Union Jack in the canton, a large seven-pointed Commonwealth Star (representing the 6 states and territories), and five stars of the Southern Cross."
  },
  {
    name: "New Zealand",
    code: "nz",
    capital: "Wellington",
    continent: "Oceania",
    difficulty: 1,
    colors: ["blue","white","red"],
    features: ["stars","union-jack"],
    fact: "Similar to Australia, but features four five-pointed red stars outlined in white (representing the Southern Cross constellation) and does not have the Commonwealth Star."
  },
  {
    name: "Fiji",
    code: "fj",
    capital: "Suva",
    continent: "Oceania",
    difficulty: 2,
    colors: ["blue","white","red"],
    features: ["union-jack","emblem"],
    fact: "Light blue background (representing the Pacific Ocean) with the Union Jack in the canton and the national coat of arms depicting sugarcane, bananas, and a coconut palm."
  },
  {
    name: "Papua New Guinea",
    code: "pg",
    capital: "Port Moresby",
    continent: "Oceania",
    difficulty: 2,
    colors: ["black","red","yellow","white"],
    features: ["diagonal","stars","bird"],
    fact: "Divided diagonally: the black triangle contains the Southern Cross constellation, and the red triangle contains a silhouette of the golden Raggiana Bird of Paradise."
  },
  {
    name: "Samoa",
    code: "ws",
    capital: "Apia",
    continent: "Oceania",
    difficulty: 3,
    colors: ["red","blue","white"],
    features: ["stars"],
    fact: "A red flag with a blue canton containing five white stars representing the Southern Cross constellation. Used to symbolize freedom and christianity."
  },
  {
    name: "Afghanistan",
    code: "af",
    capital: "Kabul",
    continent: "Asia",
    difficulty: 3,
    colors: ["black","red","green","white"],
    features: ["emblem","vertical-stripes"],
    fact: "Black represents its dark history, red for blood shed for independence, green for hope. Features the national emblem with a mihrab (mosque pulpit)."
  },
  {
    name: "Antigua and Barbuda",
    code: "ag",
    capital: "St. John's",
    continent: "Americas",
    difficulty: 3,
    colors: ["red","black","blue","white","yellow"],
    features: ["triangle","sun"],
    fact: "Red represents dynamism, black is African heritage, blue is the Caribbean Sea, white is sand, and yellow is the rising sun."
  },
  {
    name: "Armenia",
    code: "am",
    capital: "Yerevan",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","blue","orange"],
    features: ["horizontal-stripes"],
    fact: "Red represents the Armenian Highlands and struggle for survival, blue for peaceful skies, orange for talent and hard work."
  },
  {
    name: "Azerbaijan",
    code: "az",
    capital: "Baku",
    continent: "Asia",
    difficulty: 2,
    colors: ["blue","red","green","white"],
    features: ["crescent","star","horizontal-stripes"],
    fact: "Blue represents Turkic heritage, red represents modernization, green represents Islam. Features an 8-pointed star for the 8 Turkic branches."
  },
  {
    name: "Barbados",
    code: "bb",
    capital: "Bridgetown",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","yellow","black"],
    features: ["emblem","vertical-stripes"],
    fact: "Ultramarine bands represent the sea and sky, yellow for the sand. The black trident head in the center symbolizes independence from Britain."
  },
  {
    name: "Belize",
    code: "bz",
    capital: "Belmopan",
    continent: "Americas",
    difficulty: 3,
    colors: ["blue","red","white","green"],
    features: ["emblem"],
    fact: "Features two woodcutters holding tools inside a coat of arms, symbolizing the logging industry. It has the most colors of any national flag!"
  },
  {
    name: "Benin",
    code: "bj",
    capital: "Porto-Novo",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red"],
    features: ["horizontal-stripes","vertical-stripes"],
    fact: "Green represents hope and revival, yellow represents the savannahs, red represents courage. Vertical green band on hoist with yellow/red horizontal stripes."
  },
  {
    name: "Bhutan",
    code: "bt",
    capital: "Thimphu",
    continent: "Asia",
    difficulty: 2,
    colors: ["yellow","orange","white"],
    features: ["diagonal","emblem"],
    fact: "Divided diagonally: yellow represents royalty, orange represents Buddhism, with the white dragon (Druk) in the center holding jewels."
  },
  {
    name: "Botswana",
    code: "bw",
    capital: "Gaborone",
    continent: "Africa",
    difficulty: 2,
    colors: ["blue","black","white"],
    features: ["horizontal-stripes"],
    fact: "Light blue represents water (pula) and rain, which is highly precious. The black stripe outlined in white represents racial harmony and the zebra."
  },
  {
    name: "Brunei",
    code: "bn",
    capital: "Bandar Seri Begawan",
    continent: "Asia",
    difficulty: 3,
    colors: ["yellow","white","black","red"],
    features: ["diagonal","emblem"],
    fact: "Yellow represents the Sultan, black/white diagonal bands represent early ministers. Red crest in center represents Islam and peace."
  },
  {
    name: "Burkina Faso",
    code: "bf",
    capital: "Ouagadougou",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","green","yellow"],
    features: ["star","horizontal-stripes"],
    fact: "Red represents the revolution, green represents agricultural wealth, with a yellow five-pointed star in the center representing the guide of the revolution."
  },
  {
    name: "Burundi",
    code: "bi",
    capital: "Gitega",
    continent: "Africa",
    difficulty: 3,
    colors: ["red","green","white"],
    features: ["cross","diagonal","stars"],
    fact: "A white saltire (diagonal cross) divides the flag. Green is hope, red is struggle, white is peace. The three red stars represent the national motto: Unity, Work, Progress."
  },
  {
    name: "Cabo Verde",
    code: "cv",
    capital: "Praia",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","white","red","yellow"],
    features: ["stars","horizontal-stripes"],
    fact: "Blue represents the Atlantic Ocean, ten gold stars in a circle represent the main islands, and the red/white stripes represent the path to progress."
  },
  {
    name: "Central African Republic",
    code: "cf",
    capital: "Bangui",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","white","green","yellow","red"],
    features: ["star","horizontal-stripes","vertical-stripes"],
    fact: "Combines French colonial colors (blue, white, red) and Pan-African colors (green, yellow, red) with a vertical red stripe crossing them all."
  },
  {
    name: "Chad",
    code: "td",
    capital: "N'Djamena",
    continent: "Africa",
    difficulty: 2,
    colors: ["blue","yellow","red"],
    features: ["vertical-stripes"],
    fact: "Identical to Romania's flag, but uses a slightly darker indigo blue. Combines French tricolor style with Pan-African colors."
  },
  {
    name: "Comoros",
    code: "km",
    capital: "Moroni",
    continent: "Africa",
    difficulty: 3,
    colors: ["yellow","white","red","blue","green"],
    features: ["crescent","stars","horizontal-stripes"],
    fact: "Four stripes represent the islands: yellow (Moheli), white (Mayotte), red (Anjouan), blue (Grande Comore), with a green triangle containing a crescent."
  },
  {
    name: "Congo, Republic",
    code: "cg",
    capital: "Brazzaville",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red"],
    features: ["diagonal"],
    fact: "Features diagonal bands of green (agriculture/hope), yellow (noble character), and red (struggle for freedom)."
  },
  {
    name: "Djibouti",
    code: "dj",
    capital: "Djibouti",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","green","white","red"],
    features: ["triangle","star"],
    fact: "Light blue represents the Issa people, green represents the Afar people, white triangle represents peace, with a red star for unity."
  },
  {
    name: "Dominica",
    code: "dm",
    capital: "Roseau",
    continent: "Americas",
    difficulty: 3,
    colors: ["green","yellow","black","white","red"],
    features: ["cross","circle","emblem"],
    fact: "Features the Sisserou Parrot in the center (national bird), surrounded by ten green stars (parishes) on a cross of yellow, black, and white."
  },
  {
    name: "El Salvador",
    code: "sv",
    capital: "San Salvador",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","white","yellow","green"],
    features: ["emblem","horizontal-stripes"],
    fact: "Blue represents the oceans, white represents peace. Features the national coat of arms in the center, very similar to Nicaragua."
  },
  {
    name: "Equatorial Guinea",
    code: "gq",
    capital: "Malabo",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","white","red","blue"],
    features: ["triangle","emblem","horizontal-stripes"],
    fact: "Green represents agriculture, white peace, red independence, with a blue triangle for the sea. Features the silk-cotton tree in the coat of arms."
  },
  {
    name: "Eritrea",
    code: "er",
    capital: "Asmara",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","red","blue","yellow"],
    features: ["triangle","emblem"],
    fact: "A red triangle dividing green and blue. The gold emblem is an olive branch encircled by an olive wreath, representing liberation."
  },
  {
    name: "Eswatini",
    code: "sz",
    capital: "Mbabane",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","yellow","red","black","white"],
    features: ["emblem","horizontal-stripes"],
    fact: "Red represents past struggles, blue peace, yellow wealth. Features a Swazi shield (Nguni shield) with spears and staff in the center."
  },
  {
    name: "Gabon",
    code: "ga",
    capital: "Libreville",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","blue"],
    features: ["horizontal-stripes"],
    fact: "Green represents Gabon's extensive equatorial forests, yellow represents the Equator which passes through, blue represents the Atlantic Ocean."
  },
  {
    name: "Gambia",
    code: "gm",
    capital: "Banjul",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","blue","green","white"],
    features: ["horizontal-stripes"],
    fact: "Red represents the sun and savannah, blue represents the Gambia River flowing through, green represents the land, separated by white borders."
  },
  {
    name: "Georgia",
    code: "ge",
    capital: "Tbilisi",
    continent: "Europe",
    difficulty: 2,
    colors: ["white","red"],
    features: ["cross"],
    fact: "Features a red St. George Cross on a white background, with four smaller Jerusalem crosses in the quarters, representing Christianity."
  },
  {
    name: "Grenada",
    code: "gd",
    capital: "St. George's",
    continent: "Americas",
    difficulty: 3,
    colors: ["red","yellow","green"],
    features: ["stars","diagonal","emblem"],
    fact: "Red border with stars, diagonal quarters of yellow and green. Features a nutmeg clove on the left (the island is known as the Spice Isle)."
  },
  {
    name: "Guinea",
    code: "gn",
    capital: "Conakry",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","yellow","green"],
    features: ["vertical-stripes"],
    fact: "Vertical red, yellow, and green tricolor. Red represents the blood of martyrs, yellow represents gold and sun, green represents agricultural resources."
  },
  {
    name: "Guinea-Bissau",
    code: "gw",
    capital: "Bissau",
    continent: "Africa",
    difficulty: 3,
    colors: ["red","yellow","green","black"],
    features: ["star","horizontal-stripes","vertical-stripes"],
    fact: "Vertical red band on the hoist with a black star (African freedom), and horizontal yellow and green stripes on the right."
  },
  {
    name: "Guyana",
    code: "gy",
    capital: "Georgetown",
    continent: "Americas",
    difficulty: 3,
    colors: ["green","yellow","red","black","white"],
    features: ["triangle"],
    fact: "Known as the Golden Arrowhead. Green represents agriculture, yellow represents mineral wealth, and red represents dynamism, outlined in black and white."
  },
  {
    name: "Haiti",
    code: "ht",
    capital: "Port-au-Prince",
    continent: "Americas",
    difficulty: 3,
    colors: ["blue","red","white","green","yellow"],
    features: ["emblem","horizontal-stripes"],
    fact: "Blue and red horizontal bands. Features the national coat of arms on a white square in the center, depicting a palm tree and weapons."
  },
  {
    name: "Kiribati",
    code: "ki",
    capital: "Tarawa",
    continent: "Oceania",
    difficulty: 3,
    colors: ["red","blue","white","yellow"],
    features: ["sun","waves","bird"],
    fact: "Upper half red with a golden frigate bird flying over a rising sun, lower half features blue and white wavy bands representing the Pacific Ocean."
  },
  {
    name: "Kosovo",
    code: "xk",
    capital: "Pristina",
    continent: "Europe",
    difficulty: 2,
    colors: ["blue","yellow","white"],
    features: ["stars","map"],
    fact: "Features the outline map of Kosovo in gold, below six white stars representing the country's six main ethnic groups, set on a blue background."
  },
  {
    name: "Kyrgyzstan",
    code: "kg",
    capital: "Bishkek",
    continent: "Asia",
    difficulty: 3,
    colors: ["red","yellow"],
    features: ["sun","circle"],
    fact: "Red representing bravery, containing a yellow sun with 40 rays (the 40 Kyrgyz tribes) crossed by a tunduk (traditional yurt dome top)."
  },
  {
    name: "Laos",
    code: "la",
    capital: "Vientiane",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","blue","white"],
    features: ["circle","horizontal-stripes"],
    fact: "Red stripes represent blood shed for independence, blue represents the Mekong River, and the white disc represents the full moon over the river."
  },
  {
    name: "Lesotho",
    code: "ls",
    capital: "Maseru",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","white","green","black"],
    features: ["emblem","horizontal-stripes"],
    fact: "Blue, white, and green horizontal stripes. Features a black Basotho hat (mokorotlo) in the center, representing the indigenous Basotho people."
  },
  {
    name: "Liberia",
    code: "lr",
    capital: "Monrovia",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","white","blue"],
    features: ["star","horizontal-stripes"],
    fact: "Modeles on the US flag. 11 stripes represent the signers of the declaration of independence, with a single white star on a blue field."
  },
  {
    name: "Libya",
    code: "ly",
    capital: "Tripoli",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","black","green","white"],
    features: ["crescent","star","horizontal-stripes"],
    fact: "Red, black, and green horizontal stripes. Features a white crescent moon and star in the center black stripe, symbolizing the Senussi dynasty."
  },
  {
    name: "Malawi",
    code: "mw",
    capital: "Lilongwe",
    continent: "Africa",
    difficulty: 3,
    colors: ["black","red","green"],
    features: ["sun","horizontal-stripes"],
    fact: "Black represents the African people, red represents the blood of struggle, green represents nature. Features a red rising sun representing dawn of freedom."
  },
  {
    name: "Maldives",
    code: "mv",
    capital: "Malé",
    continent: "Asia",
    difficulty: 2,
    colors: ["red","green","white"],
    features: ["crescent"],
    fact: "Red border represents blood of national heroes, green center represents peace and coconut palms, with a white crescent moon representing Islam."
  },
  {
    name: "Mali",
    code: "ml",
    capital: "Bamako",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red"],
    features: ["vertical-stripes"],
    fact: "Vertical green, yellow, and red tricolor. Identical to Senegal but lacks the green star. Combines hope, resources, and sacrifices."
  },
  {
    name: "Marshall Islands",
    code: "mh",
    capital: "Majuro",
    continent: "Oceania",
    difficulty: 3,
    colors: ["blue","orange","white"],
    features: ["star","diagonal","horizontal-stripes"],
    fact: "Blue represents the Pacific, diagonal orange/white stripes represent the equator and two island chains. Features a 24-pointed star."
  },
  {
    name: "Mauritania",
    code: "mr",
    capital: "Nouakchott",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red"],
    features: ["crescent","star","horizontal-stripes"],
    fact: "Green field with red stripes at top and bottom. Features a gold horizontal crescent moon and star, traditional symbols of Islam and prosperity."
  },
  {
    name: "Mauritius",
    code: "mu",
    capital: "Port Louis",
    continent: "Africa",
    difficulty: 3,
    colors: ["red","blue","yellow","green"],
    features: ["horizontal-stripes"],
    fact: "Known as the Four Bands. Red represents struggle, blue represents the Indian Ocean, yellow represents the light of independence, green represents vegetation."
  },
  {
    name: "Micronesia",
    code: "fm",
    capital: "Palikir",
    continent: "Oceania",
    difficulty: 3,
    colors: ["blue","white"],
    features: ["stars"],
    fact: "Light blue representing the Pacific Ocean, with four white stars arranged in a circle representing the four island states."
  },
  {
    name: "Mozambique",
    code: "mz",
    capital: "Maputo",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","black","yellow","red","white"],
    features: ["triangle","emblem","horizontal-stripes"],
    fact: "Features an AK-47 assault rifle with a bayonet crossed with a hoe, set on an open book inside a red triangle, symbolizing defense, agriculture, and education."
  },
  {
    name: "Myanmar",
    code: "mm",
    capital: "Naypyidaw",
    continent: "Asia",
    difficulty: 2,
    colors: ["yellow","green","red","white"],
    features: ["star","horizontal-stripes"],
    fact: "Yellow represents solidarity, green represents peace and tranquility, red represents courage and decisiveness, with a large white star in the center."
  },
  {
    name: "Namibia",
    code: "na",
    capital: "Windhoek",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","red","green","yellow","white"],
    features: ["diagonal","sun"],
    fact: "Divided diagonally by a red stripe outlined in white: blue (sky/ocean) with a gold 12-rayed sun on the left, green (agriculture) on the right."
  },
  {
    name: "Nauru",
    code: "nr",
    capital: "Yaren",
    continent: "Oceania",
    difficulty: 3,
    colors: ["blue","yellow","white"],
    features: ["star","horizontal-stripes"],
    fact: "Blue representing the Pacific, yellow horizontal stripe representing the Equator. The 12-pointed star represents Nauru's position just south of the Equator."
  },
  {
    name: "Nicaragua",
    code: "ni",
    capital: "Managua",
    continent: "Americas",
    difficulty: 2,
    colors: ["blue","white","yellow","green"],
    features: ["emblem","horizontal-stripes"],
    fact: "Blue-white-blue horizontal bands, containing the national coat of arms featuring a triangle, five volcanoes, and a rainbow."
  },
  {
    name: "Niger",
    code: "ne",
    capital: "Niamey",
    continent: "Africa",
    difficulty: 3,
    colors: ["orange","white","green"],
    features: ["circle","horizontal-stripes"],
    fact: "Orange represents the Sahara Desert, white represents purity, green represents fertile lands. Features a central orange circle representing the sun."
  },
  {
    name: "Palau",
    code: "pw",
    capital: "Ngerulmud",
    continent: "Oceania",
    difficulty: 2,
    colors: ["blue","yellow"],
    features: ["circle"],
    fact: "A gold circle (representing the full moon, which is a symbol of peace and activity) set on a sky blue background representing the ocean."
  },
  {
    name: "Palestine",
    code: "ps",
    capital: "Ramallah",
    continent: "Asia",
    difficulty: 2,
    colors: ["black","white","green","red"],
    features: ["triangle","horizontal-stripes"],
    fact: "Horizontal black, white, and green stripes representing Islamic dynasties, with a red triangle pointing from the hoist."
  },
  {
    name: "Russia",
    code: "ru",
    capital: "Moscow",
    continent: "Europe",
    difficulty: 1,
    colors: ["white","blue","red"],
    features: ["horizontal-stripes"],
    fact: "The pan-Slavic horizontal tricolor of white, blue, and red. It inspired many other Slavic nation flags in the 19th century."
  },
  {
    name: "Rwanda",
    code: "rw",
    capital: "Kigali",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","yellow","green"],
    features: ["sun","horizontal-stripes"],
    fact: "Blue represents peace and happiness, yellow represents economic development, green represents prosperity. Features a golden sun in the top right."
  },
  {
    name: "Saint Kitts and Nevis",
    code: "kn",
    capital: "Basseterre",
    continent: "Americas",
    difficulty: 3,
    colors: ["green","red","black","yellow","white"],
    features: ["diagonal","stars"],
    fact: "Divided diagonally by a black band with yellow borders: green (fertility) on left, red (struggle) on right, with two white stars representing hope."
  },
  {
    name: "Saint Lucia",
    code: "lc",
    capital: "Castries",
    continent: "Americas",
    difficulty: 3,
    colors: ["blue","yellow","black","white"],
    features: ["triangle"],
    fact: "Cerulean blue represents the sea, with a black and gold isosceles triangle representing the island's volcanic Pitons peaks."
  },
  {
    name: "Saint Vincent and the Grenadines",
    code: "vc",
    capital: "Kingstown",
    continent: "Americas",
    difficulty: 3,
    colors: ["blue","yellow","green"],
    features: ["symbols","vertical-stripes"],
    fact: "Blue-yellow-green vertical bands. The center yellow band contains three green diamonds arranged in a 'V' pattern, representing the Grenadine islands."
  },
  {
    name: "Sao Tome and Principe",
    code: "st",
    capital: "São Tomé",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","yellow","red","black"],
    features: ["stars","horizontal-stripes"],
    fact: "Green-yellow-green horizontal bands with a red triangle at the hoist. Features two black stars on the yellow band representing the two main islands."
  },
  {
    name: "Serbia",
    code: "rs",
    capital: "Belgrade",
    continent: "Europe",
    difficulty: 2,
    colors: ["red","blue","white"],
    features: ["emblem","horizontal-stripes"],
    fact: "Horizontal red, blue, and white stripes (reverse of Russia) with the national coat of arms containing a double-headed eagle on the left."
  },
  {
    name: "Seychelles",
    code: "sc",
    capital: "Victoria",
    continent: "Africa",
    difficulty: 3,
    colors: ["blue","yellow","red","white","green"],
    features: ["diagonal"],
    fact: "Features five oblique diagonal bands radiating from the bottom hoist corner: blue, yellow, red, white, green, representing a dynamic new country."
  },
  {
    name: "Sierra Leone",
    code: "sl",
    capital: "Freetown",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","white","blue"],
    features: ["horizontal-stripes"],
    fact: "Horizontal bands of green (agriculture and mountains), white (unity and justice), and blue (the Atlantic Ocean and Bintumani harbor)."
  },
  {
    name: "Solomon Islands",
    code: "sb",
    capital: "Honiara",
    continent: "Oceania",
    difficulty: 3,
    colors: ["blue","green","yellow","white"],
    features: ["diagonal","stars"],
    fact: "Divided diagonally by a yellow stripe representing sunshine: blue (water) with 5 white stars (main islands) on left, green (land) on right."
  },
  {
    name: "Somalia",
    code: "so",
    capital: "Mogadishu",
    continent: "Africa",
    difficulty: 2,
    colors: ["blue","white"],
    features: ["star"],
    fact: "A light blue field (representing the sky and UN assistance) with a single white five-pointed Star of Unity in the center."
  },
  {
    name: "South Sudan",
    code: "ss",
    capital: "Juba",
    continent: "Africa",
    difficulty: 3,
    colors: ["black","red","green","white","blue","yellow"],
    features: ["triangle","star","horizontal-stripes"],
    fact: "Horizontal black-red-green stripes with white borders. Features a blue triangle with a yellow star on the left, representing the Nile and unity."
  },
  {
    name: "Sudan",
    code: "sd",
    capital: "Khartoum",
    continent: "Africa",
    difficulty: 2,
    colors: ["red","white","black","green"],
    features: ["triangle","horizontal-stripes"],
    fact: "Red, white, and black horizontal bands representing Arab history, with a green triangle (Islam and agriculture) at the hoist."
  },
  {
    name: "Suriname",
    code: "sr",
    capital: "Paramaribo",
    continent: "Americas",
    difficulty: 3,
    colors: ["green","red","white","yellow"],
    features: ["star","horizontal-stripes"],
    fact: "Green bands at top/bottom, red center band with white borders. Contains a golden five-pointed star in the center representing unity."
  },
  {
    name: "Tajikistan",
    code: "tj",
    capital: "Dushanbe",
    continent: "Asia",
    difficulty: 3,
    colors: ["red","white","green","yellow"],
    features: ["crown","stars","horizontal-stripes"],
    fact: "Red-white-green horizontal bands. The white band is wider and features a gold crown topped by an arc of seven stars (representing Tajik culture)."
  },
  {
    name: "Timor-Leste",
    code: "tl",
    capital: "Dili",
    continent: "Asia",
    difficulty: 3,
    colors: ["red","black","yellow","white"],
    features: ["triangle","star"],
    fact: "A red field with a yellow triangle on the hoist, overlapped by a black triangle containing a white star (representing the light that guides the nation)."
  },
  {
    name: "Togo",
    code: "tg",
    capital: "Lomé",
    continent: "Africa",
    difficulty: 2,
    colors: ["green","yellow","red","white"],
    features: ["star","horizontal-stripes"],
    fact: "Five horizontal green and yellow stripes, with a red canton containing a white five-pointed star. Green represents agriculture, yellow represents labor."
  },
  {
    name: "Tonga",
    code: "to",
    capital: "Nuku'alofa",
    continent: "Oceania",
    difficulty: 2,
    colors: ["red","white"],
    features: ["cross"],
    fact: "A solid red field with a white canton containing a red Greek cross, representing the nation's devotion to Christianity."
  },
  {
    name: "Trinidad and Tobago",
    code: "tt",
    capital: "Port of Spain",
    continent: "Americas",
    difficulty: 2,
    colors: ["red","black","white"],
    features: ["diagonal"],
    fact: "A red field divided diagonally by a black stripe outlined in white. Red represents fire/courage, black represents earth/dedication."
  },
  {
    name: "Turkmenistan",
    code: "tm",
    capital: "Ashgabat",
    continent: "Asia",
    difficulty: 3,
    colors: ["green","red","white","yellow"],
    features: ["crescent","stars","pattern"],
    fact: "The most detailed national flag. Green field with a crescent, five stars, and a vertical red stripe containing five traditional carpet guls (tribal designs)."
  },
  {
    name: "Tuvalu",
    code: "tv",
    capital: "Funafuti",
    continent: "Oceania",
    difficulty: 3,
    colors: ["blue","yellow","white","red"],
    features: ["stars","union-jack"],
    fact: "A light blue Ensign with the Union Jack in the canton. It features nine gold stars representing the nine islands of Tuvalu arranged geographically."
  },
  {
    name: "Uzbekistan",
    code: "uz",
    capital: "Tashkent",
    continent: "Asia",
    difficulty: 2,
    colors: ["blue","white","green","red"],
    features: ["crescent","stars","horizontal-stripes"],
    fact: "Blue-white-green bands with red divider lines. Features a crescent moon (independence/rebirth) and twelve stars (representing the 12 calendar months/zodiac)."
  },
  {
    name: "Vanuatu",
    code: "vu",
    capital: "Port Vila",
    continent: "Oceania",
    difficulty: 3,
    colors: ["red","green","black","yellow"],
    features: ["emblem","horizontal-stripes"],
    fact: "Red/green horizontal stripes with a black triangle at the hoist. Features a yellow pig's tusk (wealth) encircling two crossed namele palm leaves."
  },
  {
    name: "Zambia",
    code: "zm",
    capital: "Lusaka",
    continent: "Africa",
    difficulty: 3,
    colors: ["green","orange","black","red"],
    features: ["emblem"],
    fact: "A green field with a block of three vertical stripes (red, black, orange) in the bottom right, topped by an orange African fish eagle in flight."
  }
];

// Export to window object for browser access
if (typeof window !== 'undefined') {
  window.FLAGS_DATA = FLAGS_DATA;
}
