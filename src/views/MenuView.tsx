import Button from "../components/Button/Button";
import Header from "../components/Header/Header";

type Props = {
  onColorExtractor: () => void;
  onTextEditor: () => void;
};

export default function MenuView({ onColorExtractor, onTextEditor }: Props) {
  return (
    <div className="menu-view">
      <Header title="AI Frontend Toolkit" />
      <div className="tool-menu">
        <Button onClick={onColorExtractor}>🎨 Color Palette Extractor</Button>
        <Button onClick={onTextEditor} variant="secondary">
          ✍️ AI Content Editor
        </Button>
      </div>
    </div>
  );
}
