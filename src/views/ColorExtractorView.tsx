import Button from "../components/Button/Button";
import ColorGrid from "../components/ColorGrid/ColorGrid";
import Loader from "../components/Loader/Loader";
import ErrorMessage from "../components/ErrorMessage/ErrorMessage";

type Props = {
  colors: string[];
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
};

export default function ColorExtractorView({
  colors,
  isLoading,
  error,
  onBack,
}: Props) {
  return (
    <div className="color-extractor-view">
      <Button variant="ghost" onClick={onBack}>
        ← Back to Menu
      </Button>
      <h1>Page Color Palette</h1>

      {isLoading ? (
        <Loader text="Scanning page..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <ColorGrid colors={colors} />
      )}
    </div>
  );
}
