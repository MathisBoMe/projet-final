import styled from "styled-components";
import { Link } from "react-router-dom";

const FilmCard = styled(Link)`
  display: block;
  background: var(--color-bg-card);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    box-shadow: 0 4px 12px var(--color-shadow);
    transform: translateY(-2px);
  }
`

const FilmTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--color-text);
`

const FilmDate = styled.p`
  color: var(--color-text-light);
  font-size: 0.875rem;
`

const FilmId = styled.span`
  display: inline-block;
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
`

export function Film({film}) {
  return (
    <FilmCard to={`/film/${film.id}`}>
      <FilmTitle>{film.name}</FilmTitle>
      <FilmDate>Sortie : {film.release_date}</FilmDate>
      <FilmId>ID: {film.id}</FilmId>
    </FilmCard>
  );
}