import { useEffect, useState } from "react";
import { RealisateurService } from "../../services/realisateur.service.ts";
import type { JSONSchema7 } from "json-schema";
import Form from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { FilmService } from "../../services/film.service.ts";
import { useNavigate } from "react-router-dom";

export function CreateFilm() {

  const [realisateurs, setRealisateurs] = useState([])

  useEffect(() => {
    RealisateurService.getAll().then((data) => {
      setRealisateurs(data)
    })
  }, [])

  const navigate = useNavigate()

  async function onSubmit(data) {
    FilmService.create(data.formData).then(() => {
      console.log("Film created successfully")
      navigate(`/admin`)
    })
  }

  const schema: JSONSchema7 = {
    title: `Film`,
    type: "object",
    properties: {
      name : { type: "string" },
      release_date : { type: "string", format: "date"},
      réalisateurName: {
        type: "string",
        enum: realisateurs.map((real) => real.name)
      }
    }
  }

  return (
    <Form schema={schema} validator={validator} onSubmit={onSubmit}/>
  )
}