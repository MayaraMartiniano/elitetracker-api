import { Router, request, response } from "express";
import { HabitsController } from "./controllers/habits.controller";

import packageJson from "../package.json";

export const routes = Router();

const habitsController = new HabitsController();

routes.get("/", (request, response) => {
	const { name, description, version } = packageJson;

	return response.status(200).json({ name, description, version });
});

routes.get("/habits", habitsController.index);
routes.post("/habits", habitsController.store);
routes.delete("/habits/:id", habitsController.remove);
routes.patch("/habits/:id/toggle", habitsController.toggle);
