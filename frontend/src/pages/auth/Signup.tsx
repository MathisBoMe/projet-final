import { useAppSelector } from "../../store/Hooks.ts";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { customAxios } from "../../utils/customAxios.ts";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import type { JSONSchema7 } from "json-schema";
import styled from "styled-components";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100vh;
    margin: 0 auto;
    max-width: 400px;
`

export function Signup() {

  const {isLogin} = useAppSelector((state) => state.auth)
  const {state} = useLocation()

  const navigate = useNavigate()

  function register(data) {
    customAxios.post("/api/user/register", data.formData).then(() => {
      navigate("/auth/login")
    })
  }

  const schema: JSONSchema7 = {
    title: "Register",
    type: "object",
    properties: {
      email: {type: "string", title: "Email"},
      username: {type: "string", title: "Username"},
      password: {type: "string", title: "Password"},
    },
    required: ["email", "username", "password"]
  }

  const uiSchema = {
    password: {
      "ui:widget": "password"
    }
  }

  if (isLogin) {
    return <Navigate to={state?.from ? state.from : '/'} replace={true}/>
  }

  return (
    <Container>
      <Form schema={schema} validator={validator} uiSchema={uiSchema} onSubmit={register}/>
      <Link to={"/auth/login"}>Login</Link>
    </Container>
  )
}