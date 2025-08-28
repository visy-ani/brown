import "./Header.css";

type Props = {
  title: string;
};

export default function Header({ title }: Props) {
  return <h1 className="header">{title}</h1>;
}
