import { useEffect } from "react";
import { useState } from "react";
import { Project } from "../db/models/project";

export class ProjectValues {
  public id?: number;
  public name: string = "";
  public goal: string = "";
  public owner: string = "";
  public champion: string = "";
  public adminEmails: string[] = [];

  public constructor(init?: Partial<ProjectValues>) {
    Object.assign(this, init);
  }
}

export function useProjects(search: string) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const getProjects = async (search: string) => {
      setLoading(true);

      try {
        let url = "/api/v1/projects/";
        if (search) {
          url += `q=${search}`;
        }
        const result = await fetch(url);
        const json = await result.json();
        if (result.status === 200) {
          const projectResult: Project[] = json;
          setProjects(projectResult);
        } else {
          setError(json.error);
        }
      } catch (ex) {
        console.error(ex);
        setError("An error occurred when fetching the project information.");
      }

      setLoading(false);
    };

    getProjects(search);
  }, [search]);

  return { projects, error, isLoading }
}

export function useProject(id: string) {
  const [project, setProject] = useState<ProjectValues>();
  const [error, setError] = useState<string>();
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      setLoading(true);

      if (!id) return;

      try {
        const result = await fetch(`/api/v1/projects/${id}`);
        const json = await result.json();
        if (result.status === 200) {
          const projectResult: ProjectValues = json;
          setProject(projectResult);
        } else {
          setError(json.error);
        }
      } catch (ex) {
        console.error(ex);
        setError("An error occurred when fetching the project information.");
      }

      setLoading(false);
    };

    getProject();
  }, [id]);

  return { project, error, isLoading }
}
