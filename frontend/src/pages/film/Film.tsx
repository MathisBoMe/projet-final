import { useParams, Link } from "react-router-dom";
import { FilmService } from "../../services/film.service.ts";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 1rem;
  
  &:hover {
    color: var(--color-primary-dark);
  }
`

const FilmHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: var(--color-bg-card);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px var(--color-shadow);
`

const FilmTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
`

const FilmMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-light);
`

const Label = styled.span`
  font-weight: 600;
  color: var(--color-text);
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
`

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
`

export function Film() {
  const {id} = useParams();

  const {data: film, isLoading, error} = useQuery({
    queryKey: ["film", id],
    queryFn: () => FilmService.getById(id)
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <div className="spinner"></div>
      </LoadingContainer>
    );
  }

  if (error || !film) {
    return (
      <Container>
        <ErrorMessage>
          Film non trouvé ou erreur lors du chargement.
        </ErrorMessage>
        <BackLink to="/">← Retour à l'accueil</BackLink>
      </Container>
    );
  }

  return (
    <Container>
      <BackLink to="/">← Retour à l'accueil</BackLink>
      
      <FilmHeader>
        <FilmTitle>{film.name}</FilmTitle>
        <FilmMeta>
          <MetaItem>
            <Label>Date de sortie :</Label>
            <span>{film.release_date}</span>
          </MetaItem>
          <MetaItem>
            <Label>ID :</Label>
            <span>{film.id}</span>
          </MetaItem>
        </FilmMeta>
      </FilmHeader>
    </Container>
  );
}