import { Link } from 'react-router-dom';

interface Props { title: string }
export default function PathInfo({ title }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="recipe-breadcrumb">
      <Link to="/">Home</Link><span aria-hidden="true"> / </span>
      <span aria-current="page">{title}</span>
    </nav>
  );
}
