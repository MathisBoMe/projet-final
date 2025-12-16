import { Link, Navigate, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/Hooks.ts";
import { login } from "../../store/authReducer.ts";
import Form from "@rjsf/core";
import type { JSONSchema7 } from "json-schema";
import validator from "@rjsf/validator-ajv8";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100vh;
    margin: 0 auto;
    max-width: 400px;
`

export function Login() {

  const dispatch = useAppDispatch()

  const {isLogin} = useAppSelector((state) => state.auth)
  const {state} = useLocation()

  if (isLogin) {
    return <Navigate to={state?.from ? state.from : '/'} replace={true}/>
  }

  const schema: JSONSchema7 = {
    title: "Login",
    type: "object",
    properties: {
      email: {type: "string", title: "Email"},
      password: {type: "string", title: "Password"}
    },
    required: ["email", "password"]
  }

  const uiSchema = {
    password: {
      "ui:widget": "password"
    }
  }

  function handleLogin(data) {
    dispatch(login(data.formData))
  }

  return (
    <Container>
      <Form schema={schema} validator={validator} uiSchema={uiSchema} onSubmit={handleLogin}/>
      <Link to={'/auth/register'}>Register</Link>
    </Container>
  )
}