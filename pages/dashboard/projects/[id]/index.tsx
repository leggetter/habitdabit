import { useRouter } from "next/router";
import Layout from "../../../../components/layout";

import {
  Heading,
  Table,
  Tbody,
  Tr,
  Td,
  TableContainer,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
} from "@chakra-ui/react";
import { ProjectValues, useProject } from "../../../../lib/project-helpers";
import EditButton from "../../../../components/projects/edit-button";
import HDLinkButton from "../../../../components/hd-link-button";

const ProjectTable = ({ project }: { project: ProjectValues }) => {
  return (
    <>
      <Heading>Project: {project.name}</Heading>

      <TableContainer maxW={800} wordBreak="normal" whiteSpace="normal">
        <Table variant="striped" colorScheme="teal">
          <Tbody>
            <Tr>
              <Td>
                <b>Goal</b>
              </Td>
              <Td>{project.goal}</Td>
            </Tr>
            <Tr>
              <Td>
                <b>Champion</b>
              </Td>
              <Td>{project.champion}</Td>
            </Tr>
            <Tr>
              <Td>
                <b>Owner</b>
              </Td>
              <Td>{project.owner}</Td>
            </Tr>
            <Tr>
              <Td>
                <b>Habit schedule template</b>
              </Td>
              <Td>
                <HDLinkButton
                  ml={2}
                  href={`/dashboard/projects/${project.id}/template`}
                >
                  {project.habitsScheduleTemplate ? "View" : "Create"}
                </HDLinkButton>
              </Td>
            </Tr>
            <Tr>
              <Td>
                <b>Admins</b>
              </Td>
              <Td>
                {project.adminEmails &&
                  project.adminEmails.map((email) => {
                    return <span key={email}>{email}</span>;
                  })}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

export default function ProjectPage() {
  const router = useRouter();

  const { project, error, isLoading } = useProject(router.query.id as string);

  return (
    <Layout>
      {isLoading && <p>⏲️ Loading...</p>}
      {error && <p>{error}</p>}
      {!error && !isLoading && !project && (
        /* TODO: this should be a 404 */ <p>No project found</p>
      )}
      <Breadcrumb mb={5}>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">🏠 Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem>
          <BreadcrumbLink
            href={`/dashboard/projects/${project?.id}`}
            isCurrentPage
          >
            {project?.name}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {project && (
        <>
          <ProjectTable project={project} />

          <Box mt={5}>
            <EditButton id={project.id!} />
          </Box>
        </>
      )}
    </Layout>
  );
}
