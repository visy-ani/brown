import "./ColorGrid.css";

type Props = {
  colors: string[];
};

export default function ColorGrid({ colors }: Props) {
  return (
    <div className="color-grid">
      {colors.map((color, index) => (
        <div key={index} className="color-item">
          <div
            className="color-swatch"
            style={{ backgroundColor: color }}
            title={color}
          />
          <span className="color-code">{color}</span>
        </div>
      ))}
    </div>
  );
}
