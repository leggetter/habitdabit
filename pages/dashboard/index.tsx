import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Text,
  SimpleGrid,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import HDLinkButton from "../../components/hd-link-button";
import Layout from "../../components/layout";
import { Project } from "../../db/models/project";
import { useProjects } from "../../lib/project-helpers";

const ProjectCard = ({
  id,
  name,
  goalDescription,
  showEditButton,
}: {
  id: string;
  name: string;
  goalDescription: string;
  showEditButton: boolean;
}) => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      mt={5}
      mr={5}
      maxW={400}
    >
      <Stack>
        <CardBody>
          <Heading as="h3" size="md">
            {name}
          </Heading>

          <Text py="2">{goalDescription}</Text>
        </CardBody>

        <CardFooter>
          <HDLinkButton
            href={`/dashboard/projects/${id}`}
            variant="solid"
            colorScheme="green"
            mr={2}
          >
            View
          </HDLinkButton>
          {showEditButton && (
            <HDLinkButton
              href={`/dashboard/projects/${id}/edit`}
              variant="solid"
              colorScheme="blue"
            >
              Edit
            </HDLinkButton>
          )}
        </CardFooter>
      </Stack>
    </Card>
  );
};

const ProjectsList = ({
  projects,
  isAdmin,
}: {
  projects: Project[];
  isAdmin: boolean;
}) => {
  return (
    <SimpleGrid columns={3} spacing={5}>
      {projects.map((project) => {
        return (
          <ProjectCard
            key={project.id}
            id={project.id!.toString()}
            name={project.name}
            goalDescription={project.goalDescription}
            showEditButton={isAdmin}
          />
        );
      })}
    </SimpleGrid>
  );
};

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = session?.user.role === "admin";
  const { projects, error, isLoading } = useProjects(
    router.query.search as string
  );

  return (
    <Layout>
      <Heading as="h1">Dashboard</Heading>

      <Box as="section" mt={10}>
        <Heading as="h2">Projects</Heading>

        <HDLinkButton
          href={`/dashboard/projects/create`}
          variant="solid"
          colorScheme="blue"
        >
          Create
        </HDLinkButton>

        {projects?.length === 0 && <Text>No projects found</Text>}
        {projects?.length > 0 && (
          <ProjectsList isAdmin={isAdmin} projects={projects} />
        )}
      </Box>
    </Layout>
  );
}
