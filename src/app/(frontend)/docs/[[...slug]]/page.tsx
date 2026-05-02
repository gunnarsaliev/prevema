export default async function Docs({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  console.log(slug)
  return (
    <div>
      <h1>
        See docs for {slug[0]} {slug[1] && `and ${slug[1]}`}
      </h1>
    </div>
  )
}
