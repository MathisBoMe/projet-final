import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/Hooks.ts";
import { NavBar } from "./NavBar.tsx";
import styled from "styled-components";

const Main = styled.main`
    padding: 1em;
    gap: 1em;
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    margin: 0 auto;
`

export function MainLayout() {

  const isLogin = useAppSelector(state => state.auth.isLogin)

  if (!isLogin) {
    return <Navigate to={'/auth/login'} replace/>
  }

  return (
    <>
      <NavBar />
      <Main>
        <Outlet/>
      </Main>
    </>
  )
}