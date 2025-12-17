import { Link } from "react-router-dom";
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

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`

const AdminCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  background: var(--color-bg-card);
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px var(--color-shadow);
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  
  &:hover {
    box-shadow: 0 4px 12px var(--color-shadow);
    transform: translateY(-2px);
  }
`

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
`

const CardDescription = styled.p`
  color: var(--color-text-light);
  line-height: 1.6;
`

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 0.5rem;
`

export function Admin() {
  return (
    <Container>
      <Header>
        <Title>Administration</Title>
        <Subtitle>Gérez les films et réalisateurs</Subtitle>
      </Header>
      
      <CardsGrid>
        <AdminCard to={'/admin/film'}>
          <CardIcon>🎬</CardIcon>
          <CardTitle>Gérer les Films</CardTitle>
          <CardDescription>
            Ajoutez, modifiez ou supprimez des films de la base de données.
          </CardDescription>
        </AdminCard>
        
        <AdminCard to={'/admin/realisateur'}>
          <CardIcon>👤</CardIcon>
          <CardTitle>Gérer les Réalisateurs</CardTitle>
          <CardDescription>
            Ajoutez, modifiez ou supprimez des réalisateurs de la base de données.
          </CardDescription>
        </AdminCard>
      </CardsGrid>
    </Container>
  );
}