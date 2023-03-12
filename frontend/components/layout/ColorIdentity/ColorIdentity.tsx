import ManaSymbol from "../ManaSymbol/ManaSymbol";

type Props = {
  colors: string[];
  size?: "medium" | "small";
};

const ColorIdentity = ({ colors, size = "medium" }: Props) => {
  const colorIdentityDescription = colors.join(", ");

  return (
    <div className="w-full text-center">
      <p className="sr-only">Color Identity: {colorIdentityDescription}</p>
      {colors.map((color) => (
        <ManaSymbol symbol={color} size={size} key={color} ariaHidden />
      ))}
    </div>
  );
};

export default ColorIdentity;
