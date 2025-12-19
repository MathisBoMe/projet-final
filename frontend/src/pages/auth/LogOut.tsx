import { useAppDispatch } from "../../store/Hooks.ts";
import { logoutUser } from "../../store/authReducer.ts";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LogOut() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(logoutUser()).then(() => {
      navigate('/auth/login')
    })
  }, [dispatch, navigate])

  return (
    <></>
  )
}