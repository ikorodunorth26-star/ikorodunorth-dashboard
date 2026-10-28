import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { publicSiteUrl } from "@/lib/brand"
import {
  publicNews,
  publicOffices,
  publicProjects,
  publicWards,
  type PublicNewsStory,
} from "@/lib/site/public-site"

const latestNews = publicNews.slice(0, 8)

function countLabel(items: PublicNewsStory[], group: PublicNewsStory["group"]) {
  return items.filter((item) => item.group === group).length
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: number
  detail: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}

const DashboardView = () => {
  const communityStories = countLabel(publicNews, "community")
  const councilStories = countLabel(publicNews, "council")
  const projectStories = countLabel(publicNews, "projects")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          What is currently published on the Ikorodu North LCDA website.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="News stories"
          value={publicNews.length}
          detail={`${communityStories} community, ${councilStories} council, ${projectStories} projects`}
        />
        <StatCard
          label="Council projects"
          value={publicProjects.length}
          detail="Health, roads, water and education"
        />
        <StatCard
          label="Communities"
          value={publicWards.length}
          detail={publicWards.map((ward) => ward.name).join(", ")}
        />
        <StatCard
          label="Departments and units"
          value={publicOffices.departments + publicOffices.units}
          detail={`${publicOffices.departments} departments, ${publicOffices.units} units`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Executive officers"
          value={publicOffices.executive}
          detail="Vice Chairman, supervisors and advisers"
        />
        <StatCard
          label="Legislative members"
          value={publicOffices.legislative}
          detail="Councillors of the Legislative House"
        />
        <StatCard
          label="Management team"
          value={publicOffices.management}
          detail="Officers at the Isiu secretariat"
        />
        <StatCard
          label="Landmarks"
          value={publicOffices.landmarks}
          detail="Places published on the public map"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest news</CardTitle>
          <CardDescription>The lead stories on the public news page.</CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <a href={`${publicSiteUrl}/news`} target="_blank" rel="noreferrer">
                News page
              </a>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Story</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {latestNews.map((story) => (
                <TableRow key={story.slug}>
                  <TableCell className="max-w-md whitespace-normal font-medium">
                    <a
                      href={`${publicSiteUrl}/news/${story.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {story.title}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{story.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {story.date}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Council projects recorded on the website.</CardDescription>
            <CardAction>
              <Button variant="outline" size="sm" asChild>
                <a href={`${publicSiteUrl}/projects`} target="_blank" rel="noreferrer">
                  Projects page
                </a>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Place</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicProjects.map((project) => (
                  <TableRow key={project.slug}>
                    <TableCell className="max-w-sm whitespace-normal">
                      <a
                        href={`${publicSiteUrl}/projects/${project.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {project.title}
                      </a>
                      <div className="mt-1">
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{project.location}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {project.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communities</CardTitle>
            <CardDescription>Local projects and facilities on each ward page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ward</TableHead>
                  <TableHead className="text-right">Projects</TableHead>
                  <TableHead className="text-right">Facilities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publicWards.map((ward) => (
                  <TableRow key={ward.slug}>
                    <TableCell className="font-medium">
                      <a
                        href={`${publicSiteUrl}/communities/${ward.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {ward.name}
                      </a>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{ward.projects}</TableCell>
                    <TableCell className="text-right tabular-nums">{ward.facilities}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardView
