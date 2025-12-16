import validator from "@rjsf/validator-ajv8";
import type { JSONSchema7 } from "json-schema";
import Form from "@rjsf/core";
import { RealisateurService } from "../../services/realisateur.service.ts";
import { useNavigate } from "react-router-dom";

export function Realisateur() {

  const navigate = useNavigate()

  const schema: JSONSchema7 = {
    title: `Realisateur`,
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number" },
      nationality: { type: "string" },
    },
    required: ["name", "age", "nationality"]
  }

  async function onSubmit(data) {
    RealisateurService.create(data.formData).then(() => {
      console.log("Realisateur created successfully")
      navigate(`/admin`)
    })
  }
  return (
    <Form schema={schema} validator={validator} onSubmit={onSubmit}/>
  )
}

// todo : add services and api integration