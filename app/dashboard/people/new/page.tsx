import { PersonForm } from "@/components/dashboard/content/person-form"
import type { TeamGroup } from "@/lib"

const teams = new Set<TeamGroup>(["executive", "council", "management"])

const NewPersonPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ team?: string }>
}) => {
  const params = await searchParams
  const team = teams.has(params.team as TeamGroup)
    ? (params.team as TeamGroup)
    : "executive"
  return <PersonForm defaultTeam={team} />
}

export default NewPersonPage
