import React from "react";
import styles from "./artCircle.module.scss";

export type ArtCircleProps = {
  title?: string;
  size?: number;
  cardName: keyof typeof CARD_ARTS;
  className?: string;
};

const CARD_ARTS = {
  Brainstorm: {
    uid: "beb755c1-9221-480e-bef9-73f1f13a3345.jpg?1592712969",
    artist: "DiTerlizzi",
  },
  "Bruvac the Grandiloquent": {
    uid: "5b43bdc7-e49e-4848-9101-6cad2ecab4dc",
    artist: "Ekaterina Burmak",
  },
  Chaosphere: {
    uid: "bd41cb92-578b-4fc8-b1e6-56604088fcd5",
    artist: "Steve Luke",
  },
  "Codie, Vociferous Codex": {
    uid: "ea476ee1-67d9-4dd8-a5ac-f68a155eb18b",
    artist: "Daniel Ljunggren",
  },
  Doorkeeper: {
    uid: "ca527a9e-3a01-4e0b-add4-a6882f1c89d1",
    artist: "Kev Walker",
  },
  Exploration: {
    uid: "ce4c6535-afea-4704-b35c-badeb04c4f4c",
    artist: "Florian de Gesincourt",
  },
  "Fist of Suns": {
    uid: "2a499b65-8a7e-4fbc-a09b-826b8454d857",
    artist: "Arnie Swekel",
  },
  "Fractured Identity": {
    uid: "b2f73f5d-1aad-48c2-9e74-5f7bdd87900f",
    artist: "Yongjae Choi",
  },
  "Frantic Search": {
    uid: "441f8b2f-c8cb-4340-a92f-116c2276e906",
    artist: "Jeff Miracola",
  },
  "Go Blank": {
    uid: "846e8657-7435-44c6-a997-b8b156d0cd2c",
    artist: "Wylie Beckert",
  },
  "Goblin Guide": {
    uid: "62d2058c-3f20-4566-b366-93a2cbbe682f",
    artist: "Mark Zug",
  },
  "Kethis, the Hidden Hand": {
    uid: "fe28de73-76f3-4a9e-a020-dbe5921b9be5",
    artist: "Yongjae Choi",
  },
  "Korvold, Fae-Cursed King": {
    uid: "92ea1575-eb64-43b5-b604-c6e23054f228",
    artist: "Wisnu Tan",
  },
  "Leovold, Emissary of Trest": {
    uid: "cedfc5b7-9242-4680-b284-debc8b5a9bc7",
    artist: "Magali Villeneuve",
  },
  "Long-Term Plans": {
    uid: "d236e528-2cb1-4de5-a4fd-b80516e4a1f9",
    artist: "Ben Thompson",
  },
  "Master Healer": {
    uid: "ed8acbfb-a836-44c4-b655-f5dc919941cc",
    artist: "Greg Hildebrandt & Tim Hildebrandt",
  },
  Peek: {
    uid: "f50843cc-20ac-4746-816e-f2630aa31594",
    artist: "Adam Rex",
  },
  "Revel in Riches": {
    uid: "79b0e035-8716-469d-99ae-a530cd96ef09",
    artist: "Eric Deschamps",
  },
  "Smothering Tithe": {
    uid: "f25a4bbe-2af0-4d4a-95d4-d52c5937c747",
    artist: "Mark Behm",
  },
  "Spoils of Adventure": {
    uid: "9b3b1ef0-a653-4adb-8112-82d4822446b4",
    artist: "Zezhou Chen",
  },
  "Stet, Draconic Proofreader": {
    uid: "d57a6d9d-f0e9-4c5a-bacf-7a6c30d65b08",
    artist: "Dmitry Burmak",
  },
  "The Grand Calcutron": {
    uid: "3c1e38a2-d817-4f19-aabf-02dc72c78259",
    artist: "Sean Murray",
  },
  "Thespian's Stage": {
    uid: "269a926d-7788-4668-8bd8-7572dbf5f5eb",
    artist: "John Avon",
  },
  "Tribute Mage": {
    uid: "6c180888-6acd-401b-815a-6ed434482681",
    artist: "Scott Murphy",
  },
  "Kenrith, the Returned King": {
    uid: "0e259db1-14db-4314-998c-6a076a28d8cb",
    artist: "Kieran Yanner",
  }
};

const ArtCircle: React.FC<ArtCircleProps> = ({
  title,
  cardName,
  size,
  className,
}: ArtCircleProps) => {
  const { uid, artist } = CARD_ARTS[cardName];

  const imgSrc = `https://cards.scryfall.io/art_crop/front/${uid[0]}/${uid[1]}/${uid}.jpg`;

  const customSize = size ? size : 16;

  const style = {
    height: `${customSize}rem`,
    width: `${customSize}rem`,
  };

  const customTitle = title ? title : `${cardName} by ${artist}`;

  return (
    <img
      style={style}
      alt={customTitle}
      src={imgSrc}
      className={`${styles.artCircle} ${className && className}`}
      title={customTitle}
      aria-hidden="true"
    />
  );
};

export default ArtCircle;
