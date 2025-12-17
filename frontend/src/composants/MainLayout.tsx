import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/Hooks.ts";
import { NavBar } from "./NavBar.tsx";
import styled from "styled-components";

const Main = styled.main`
    padding: 2rem;
    gap: 2rem;
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    margin: 0 auto;
    min-height: calc(100vh - 70px);
`

export function MainLayout() {
  const isLogin = useAppSelector(state => state.auth.isLogin);

  if (!isLogin) {
    return <Navigate to={'/auth/login'} replace/>;
  }

  return (
    <>
      <NavBar />
      <Main>
        <Outlet/>
      </Main>
    </>
  );
}