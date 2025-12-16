import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/Hooks.ts";
import { authActions } from "../store/authReducer.ts";

const Container = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
    padding: 0 2rem;
    position: sticky;
    top: 0;
    background-color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    z-index: 100;
`

const Title = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--color-primary-dark);
  }
`

const Nav = styled.nav`
  display: flex;
  gap: 1.5rem;
  align-items: center;
`

const NavLink = styled(Link)`
  font-weight: 500;
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-bg);
    color: var(--color-primary);
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-text-light);
  font-size: 0.875rem;
`

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background-color: var(--color-danger);
  
  &:hover {
    background-color: #dc2626;
  }
`

export function NavBar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(authActions.logout());
    navigate('/auth/login');
  };

  const tabs = [
    { name: "Accueil", path: "/" },
    { name: "Admin", path: "/admin" },
  ];

  return (
    <Container>
      <Title to="/">🎬 Cinema</Title>
      <Nav>
        {tabs.map((tab) => (
          <NavLink to={tab.path} key={tab.name}>
            {tab.name}
          </NavLink>
        ))}
        {user && (
          <UserInfo>
            <span>{user.username || user.email}</span>
            <LogoutButton onClick={handleLogout}>
              Déconnexion
            </LogoutButton>
          </UserInfo>
        )}
      </Nav>
    </Container>
  );
}