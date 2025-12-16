import { Link } from "react-router-dom";

export function Admin() {
  return (
    <>
    <Link to={'/admin/film'}>Go to Film Admin</Link>
    <Link to={'/admin/realisateur'}>Go to Realisateur Admin</Link>
    </>
  )
}