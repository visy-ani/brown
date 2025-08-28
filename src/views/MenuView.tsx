import Button from "../components/Button/Button";
import Header from "../components/Header/Header";
import "./MenuView.css";

type Props = {
  onColorExtractor: () => void;
  onTextEditor: () => void;
};

export default function MenuView({ onColorExtractor, onTextEditor }: Props) {
  return (
    <div className="menu-view">
      <div className="loki-header">
        <div className="horn-decoration">⚡</div>
        <Header title="LOKI" />
        <div className="subtitle">God of Mischief Developer Tools</div>
      </div>

      <div className="tool-menu">
        <div className="active-tools">
          <Button onClick={onColorExtractor} variant="primary">
            <span className="button-icon">🎨</span>
            Color Palette Extractor
          </Button>
          <Button onClick={onTextEditor} variant="secondary">
            <span className="button-icon">✍️</span>
            Live Text Editor
          </Button>
        </div>

        <div className="upcoming-section">
          <h2 className="section-title">
            <span className="title-decoration">⚔️</span>
            Upcoming Arsenal
            <span className="title-decoration">⚔️</span>
          </h2>
          
          <div className="upcoming-grid">
            <Button variant="ghost">
              <span className="button-icon">🕵️</span>
              CSS Inspector
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🔤</span>
              List All Fonts
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🖋</span>
              Fonts Changer
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🎯</span>
              Color Picker
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📦</span>
              Move Element
            </Button>
            <Button variant="ghost">
              <span className="button-icon">❌</span>
              Delete Element
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📤</span>
              Export Element
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🖼</span>
              Extract Images
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📏</span>
              Page Ruler
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📐</span>
              Page Outline
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🖼</span>
              Image Replacer
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📸</span>
              Take Screenshot
            </Button>
            <Button variant="ghost">
              <span className="button-icon">⚡</span>
              Performance Analyzer
            </Button>
            <Button variant="ghost">
              <span className="button-icon">🧪</span>
              Accessibility Checker
            </Button>
            <Button variant="ghost">
              <span className="button-icon">📊</span>
              SEO Insights
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}