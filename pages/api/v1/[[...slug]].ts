// pages/api/hello.js
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { tigrisDb } from "../../../lib/tigris";
import { Project } from "../../../db/models/project";
import { User } from "../../../db/models/user";
import { ProjectValues } from "../../../lib/project-helpers";
import { FindQuery, LogicalOperator, Status } from "@tigrisdata/core";

// Default Req and Res are IncomingMessage and ServerResponse
// You may want to pass in NextApiRequest and NextApiResponse
const router = createRouter<NextApiRequest & { params?: { id: number } }, NextApiResponse>();

const projects = tigrisDb.getCollection<Project>(Project);

router
  .use(async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions)
    // console.log('session', session);
    if (!session) {
      res.status(401).end();
      return;
    }

    const start = Date.now();
    await next(); // call next in chain
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);
  })
  .get("/api/v1/projects", async (req, res: NextApiResponse<Project[] | { error: string }>) => {
    try {
      const search = req.query.search as string;

      if (search) {
        const iterator = projects.search({ q: search })
        const searchResults = await iterator.toArray();
        let projectResults: Project[] = [];
        const results = searchResults.forEach(searchResult => {
          projectResults = projectResults.concat(searchResult.hits.map(hit => hit.document));
        })
        return res.status(200).json(projectResults);
      }
      else {
        const cursor = projects.findMany();
        return res.status(200).json(await cursor.toArray());
      }
    }
    catch (e: any) {
      return res.status(500).json({ error: e.toString() });
    }
  })
  .patch("/api/v1/projects/:id", async (req, res: NextApiResponse<Project | { error: string }>) => {
    // TODO: ensure permissions to edit Project

    try {
      const id = req.params!.id;
      const project = await projects.findOne({ filter: { id } });

      if (!project) {
        res.status(404).json({ error: `A project with id "${id}" could not be found.` });
      }
      else {
        // You cannot edit the owner or champion (for now)
        // so those values are not being changed
        const projectUpdateRequest = req.body as ProjectValues;
        const result = await projects.updateOne({
          filter: {
            id: project.id,
          },
          fields: {
            name: projectUpdateRequest.name,
            goalDescription: projectUpdateRequest.goal,
          }
        });

        if (result.status === Status.Updated) {
          res.status(200).json(project);
        }
        else {
          res.status(500).json({ error: "Project update request did not result in an updated status." })
        }
      }
    }
    catch (ex) {
      console.error(ex)
      res.status(500).json({ error: "Unexpected server error in PATCH /api/va/project/[id]" })
    }
  })
  .get("/api/v1/projects/:id", async (req, res: NextApiResponse<ProjectValues | { error: string }>) => {
    // TODO: ensure that the current session user has permission to view the project
    // 1. owner 2. champion 3. an admin

    try {
      const id = req.params!.id;

      const projects = tigrisDb.getCollection<Project>(Project);
      const project = await projects.findOne({ filter: { id } });

      if (project) {
        // TODO: get the owner, champion, and admins for the project
        const projectValues = new ProjectValues({ id: project.id, goal: project.goalDescription, name: project.name });

        const usersCollection = tigrisDb.getCollection<User>(User);
        const query: FindQuery<User> = {
          filter: {
            op: LogicalOperator.OR,
            selectorFilters: [
              { id: project.ownerId },
              { id: project.championId },
              ...project.adminIds.map(id => { return { id } })
            ],
          },
        };

        const usersCursor = usersCollection.findMany(query);
        const users = await usersCursor.toArray();
        projectValues.champion = users.find(u => u.id === project.championId)!.email;
        projectValues.owner = users.find(u => u.id === project.ownerId)!.email;
        projectValues.adminEmails = users.filter(
          u => project.adminIds.includes(u.id!)
        ).map(u => u.email);

        console.log("projectValues", projectValues);
        res.status(200).json(projectValues);
      }
      else {
        res.status(404).json({ error: `Project with id "${id}" not found` });
      }
    }
    catch (ex) {
      console.error(ex)
      res.status(500).json({ error: "Unexpected server error in POST /api/va/project/[id]" })
    }
  })
  .post("/api/v1/projects", async (req, res) => {
    const session = await getServerSession(req, res, authOptions)
    const projectCreationRequest = req.body as ProjectValues;

    if (projectCreationRequest.owner !== session?.user.email) {
      res.status(403).json({ error: "The provided owner email does not match the current logged in user" });
      return;
    }

    try {
      const users = tigrisDb.getCollection<User>(User);

      let owner = await users.findOne({ filter: { email: projectCreationRequest.owner } });
      if (!owner) {
        owner = await users.insertOne({
          name: session.user.name || "",
          email: session.user.email,
          createdAt: new Date(),
        });

        console.log("New user created for owner", owner);

        // This should never happen as the user should be created at signup
        // TODO: create user at signup
        // res.status(404).json({ error: "The owner could not be found." });
        // return
      }
      else {
        console.log("Owner already exists.", owner);
      }

      let champion = await users.findOne({ filter: { email: projectCreationRequest.champion } });
      if (!champion) {

        champion = await users.insertOne({
          name: "",
          email: projectCreationRequest.champion,
          createdAt: new Date(),
        });

        console.log("New user created for owner", champion);
        // TODO: should the champion be created if they don't exist? Probably!
        // res.status(404).json({ error: "The champion could not be found." });
      }
      else {
        console.log('Champion already exists.', champion)
      }

      const creationDate = new Date();
      const projects = tigrisDb.getCollection<Project>(Project);
      const insertedProject = await projects.insertOne({
        name: projectCreationRequest.name,
        championId: champion.id!,
        goalDescription: projectCreationRequest.goal,
        ownerId: owner.id!,
        adminIds: [owner.id!],
        startDate: creationDate,
      });

      res.status(201).json(insertedProject)
    }
    catch (ex) {
      console.error(ex)

      res.status(500).json({ error: "unexpected server error" });
    }
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error(err);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});