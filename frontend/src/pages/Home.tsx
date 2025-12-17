import { FilmService } from "../services/film.service.ts";
import { useQuery } from "@tanstack/react-query";
import { Film } from "../composants/Film.tsx";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-text);
`

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: var(--color-text-light);
`

const FilmsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text-light);
`

const ErrorMessage = styled.div`
  padding: 1rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
`

export function Home() {
  const {data: films, isLoading, error} = useQuery({
    queryKey: ["films"],
    queryFn: () => FilmService.getAll()
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <div className="spinner"></div>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>
          Erreur lors du chargement des films. Veuillez réessayer.
        </ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Bienvenue sur Cinema</Title>
        <Subtitle>Découvrez notre collection de films</Subtitle>
      </Header>
      
      {films && films.length > 0 ? (
        <FilmsGrid>
          {films.map((film) => (
            <Film key={film.id} film={film}/>
          ))}
        </FilmsGrid>
      ) : (
        <EmptyState>
          <h2>Aucun film disponible</h2>
          <p>Les films apparaîtront ici une fois ajoutés.</p>
        </EmptyState>
      )}
    </Container>
  );
}