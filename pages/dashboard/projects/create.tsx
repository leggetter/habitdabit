import { Heading } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import AccessDenied from "../../../components/access-denied";
import Layout from "../../../components/layout";
import { useRouter } from "next/router";
import ProjectForm from "../../../components/projects/project-form";
import { Project } from "../../../db/models/project";
import { ProjectValues } from "../../../lib/project-helpers";

export default function CreateProject() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmissionComplete = (project: Project) => {
    router.push(`/dashboard/projects/${project.id}`);
  };

  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading as="h1">Create Project</Heading>

      <ProjectForm
        method="POST"
        action="/api/v1/projects"
        project={new ProjectValues({ owner: session.user.email })}
        onSubmitComplete={handleSubmissionComplete}
      />
    </Layout>
  );
}
