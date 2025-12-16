import { useAppDispatch } from "../../store/Hooks.ts";
import { authActions } from "../../store/authReducer.ts";
import { useEffect } from "react";

export function LogOut() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(authActions.logout())
  }, [dispatch])

  return (
    <></>
  )
}