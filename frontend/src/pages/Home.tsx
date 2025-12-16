import { FilmService } from "../services/film.service.ts";
import { useQuery } from "@tanstack/react-query";
import { Film } from "../composants/Film.tsx";
import { Link } from "react-router-dom";

export function Home() {

  const {data: films} = useQuery({
    queryKey: ["films"],
    queryFn: () => FilmService.getAll()
  })

  return (
    <>Home
      {films?.map((film) => (
        <Link key={film._id} to={`/film/${film.id}`}>
        <Film key={film.id} film={film}/>
    </Link>
      ))}
    </>
  );
}