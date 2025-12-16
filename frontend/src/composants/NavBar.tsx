import styled from "styled-components";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/Hooks.ts";

const Container = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding-inline: 1em;
    position: sticky;
    top: 0;
    background-color: white;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
`

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`

export function NavBar() {

  const user = useAppSelector((state) => state.auth.user)

  const tabs = [
    { name: "Home", path: "/" },
    {name: "Admin", path: "/admin"},
  ]

  return (
    <Container>
      <Title>Cinema</Title>
      <Nav>
        {tabs.map((tab) => (
          <Link to={tab.path} key={tab.name}>
            {tab.name}
          </Link>
        ))}
      </Nav>
    </Container>
  )
}