import { useParams } from "react-router-dom";
import { FilmService } from "../../services/film.service.ts";
import { useQuery } from "@tanstack/react-query";

export function Film() {

  const {id} = useParams()

  const {data: film} = useQuery({
    queryKey: ["film", id],
    queryFn: () => FilmService.getById(id)
  })

  return (
    <>
      <h1>{film?.name}</h1>
      <p>{film?.release_date}</p>
    </>
  )
}