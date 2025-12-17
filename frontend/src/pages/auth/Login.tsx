import { Link, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/Hooks.ts";
import { login } from "../../store/authReducer.ts";
import { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const Card = styled.div`
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    width: 100%;
    max-width: 400px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`

const Title = styled.h1`
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    color: var(--color-text);
`

const Subtitle = styled.p`
    text-align: center;
    color: var(--color-text-light);
    margin-bottom: 2rem;
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
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

const LinkContainer = styled.div`
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border);
`

const ErrorMessage = styled.div`
    padding: 0.75rem;
    background-color: #fee2e2;
    color: #991b1b;
    border-radius: 0.5rem;
    border: 1px solid #fecaca;
    font-size: 0.875rem;
`

export function Login() {
  const dispatch = useAppDispatch();
  const {isLogin} = useAppSelector((state) => state.auth);
  const {state} = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isLogin) {
    return <Navigate to={state?.from ? state.from : '/'} replace={true}/>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la connexion. Vérifiez vos identifiants.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container>
      <Card>
        <Title>Connexion</Title>
        <Subtitle>Connectez-vous à votre compte</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <Form onSubmit={handleSubmit}>
          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
            />
          </Field>
          
          <Field>
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </Field>
          
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </SubmitButton>
        </Form>
        
        <LinkContainer>
          <p style={{ color: "var(--color-text-light)", marginBottom: "0.5rem" }}>
            Pas encore de compte ?
          </p>
          <Link to={'/auth/register'} style={{ fontWeight: 600 }}>
            Créer un compte
          </Link>
        </LinkContainer>
      </Card>
    </Container>
  );
}