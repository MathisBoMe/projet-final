

export function Film({film}) {
  return (
    <>
      <h2>
        {film.name} ({film.release_date})
      </h2>
    </>
  )
}