import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const taskInputSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo")
});

type TaskInput = z.infer<typeof taskInputSchema>;

interface TaskItem extends TaskInput {
  id: string;
  createdAt: string;
}

const tasks: TaskItem[] = [];

export const case02CrudRouter = Router();

case02CrudRouter.get("/", (_req, res) => {
  res.json({ case: "02-typescript-crud", count: tasks.length, data: tasks });
});

case02CrudRouter.post("/", (req, res) => {
  const parsed = taskInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const task: TaskItem = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    ...parsed.data
  };

  tasks.push(task);
  res.status(201).json(task);
});

case02CrudRouter.patch("/:id", (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const parsed = taskInputSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  Object.assign(task, parsed.data);
  res.json(task);
});

case02CrudRouter.delete("/:id", (req, res) => {
  const index = tasks.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const [removed] = tasks.splice(index, 1);
  res.json({ removed });
});
