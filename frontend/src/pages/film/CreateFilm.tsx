import { useEffect, useState } from "react";
import { RealisateurService } from "../../services/realisateur.service.ts";
import { FilmService } from "../../services/film.service.ts";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text);
`

const Subtitle = styled.p`
  color: var(--color-text-light);
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--color-bg-card);
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px var(--color-shadow);
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--color-text);
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: var(--color-bg-card);
  cursor: pointer;
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 600;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: var(--color-primary-dark);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
  font-size: 0.875rem;
`

const SuccessMessage = styled.div`
  padding: 0.75rem;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 0.5rem;
  border: 1px solid #a7f3d0;
  font-size: 0.875rem;
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`

export function CreateFilm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [realisateurName, setRealisateurName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {data: realisateurs, isLoading: isLoadingRealisateurs} = useQuery({
    queryKey: ["realisateurs"],
    queryFn: () => RealisateurService.getAll()
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await FilmService.create({
        name,
        release_date: releaseDate,
        réalisateurName: realisateurName
      });
      setSuccess("Film créé avec succès !");
      setTimeout(() => {
        navigate(`/admin`);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erreur lors de la création du film.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingRealisateurs) {
    return (
      <Container>
        <LoadingContainer>
          <div className="spinner"></div>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <BackLink to="/admin">← Retour à l'administration</BackLink>
      
      <Header>
        <Title>Ajouter un Film</Title>
        <Subtitle>Remplissez les informations du film</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="name">Titre du film</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Titre du film"
          />
        </Field>

        <Field>
          <Label htmlFor="release_date">Date de sortie</Label>
          <Input
            id="release_date"
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Label htmlFor="realisateur">Réalisateur</Label>
          <Select
            id="realisateur"
            value={realisateurName}
            onChange={(e) => setRealisateurName(e.target.value)}
            required
          >
            <option value="">Sélectionnez un réalisateur</option>
            {realisateurs?.map((real: any) => (
              <option key={real.id} value={real.name}>
                {real.name} ({real.nationality})
              </option>
            ))}
          </Select>
        </Field>

        <SubmitButton type="submit" disabled={isLoading || !realisateurs?.length}>
          {isLoading ? "Création..." : "Créer le film"}
        </SubmitButton>
      </Form>
    </Container>
  );
}