import "./Loader.css";

type Props = {
  text?: string;
};

export default function Loader({ text }: Props) {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
}
