import { RealisateurService } from "../../services/realisateur.service.ts";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
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

export function Realisateur() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nationality, setNationality] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await RealisateurService.create({
        name,
        age: parseInt(age),
        nationality
      });
      setSuccess("Réalisateur créé avec succès !");
      setTimeout(() => {
        navigate(`/admin`);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Erreur lors de la création du réalisateur.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <BackLink to="/admin">← Retour à l'administration</BackLink>
      
      <Header>
        <Title>Ajouter un Réalisateur</Title>
        <Subtitle>Remplissez les informations du réalisateur</Subtitle>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <Form onSubmit={handleSubmit}>
        <Field>
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Nom du réalisateur"
          />
        </Field>

        <Field>
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min="1"
            max="150"
            placeholder="Âge"
          />
        </Field>

        <Field>
          <Label htmlFor="nationality">Nationalité</Label>
          <Input
            id="nationality"
            type="text"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            required
            placeholder="Nationalité"
          />
        </Field>

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer le réalisateur"}
        </SubmitButton>
      </Form>
    </Container>
  );
}