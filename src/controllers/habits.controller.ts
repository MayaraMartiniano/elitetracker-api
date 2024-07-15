import { type Request, type Response, request } from "express";
import { z } from "zod";
import { habitModel } from "../models/habit.model";
import { buildValidationErrorMessage } from "../utils/build-validation-error-message.util";

import dayjs from "dayjs";

export class HabitsController {
	store = async (request: Request, response: Response): Promise<Response> => {
		const schema = z.object({
			name: z.string(),
		});

		const habit = schema.safeParse(request.body);

		if (!habit.success) {
			const errors = buildValidationErrorMessage(habit.error.issues);

			return response.status(422).json({ message: errors });
		}

		const findHabit = await habitModel.findOne({
			name: habit.data.name,
		});

		if (findHabit) {
			return response.status(400).json({ message: "Habite already exist." });
		}

		const newHabit = await habitModel.create({
			name: habit.data.name,
			completedDates: [],
		});

		return response.status(201).json(newHabit);
	};

	index = async (request: Request, response: Response) => {
		const habits = await habitModel.find().sort({ name: 1 }); //colocando a lista em ordem alfabetica (-1 ordem decrescente)
		return response.status(200).json(habits);
	};

	remove = async (request: Request, response: Response) => {
		const schema = z.object({
			id: z.string(),
		});

		const habit = schema.safeParse(request.params);

		if (!habit.success) {
			const errors = buildValidationErrorMessage(habit.error.issues);

			return response.status(422).json({ message: errors });
		}

		const findHabit = await habitModel.findOne ({ //verificando se o habito existe
			_id: habit.data.id,

		})

		if (!findHabit) {
			return response.status(404).json({ message: 'Habit not foound.'})
		}

		await habitModel.deleteOne({
			_id: habit.data.id,
		});

		return response.status(204).send();
	};

	toggle = async (request: Request, response: Response) => { //marcando /desmarcando o habito como concluido
		const schema = z.object({
			id: z.string(),
		});

		const validated = schema.safeParse(request.params);

		if (!validated.success) {
			const errors = buildValidationErrorMessage(validated.error.issues);

			return response.status(422).json({ message: errors });
		}

		const findHabit = await habitModel.findOne ({ //verificando se o habito existe
			_id: validated.data.id,

		})

		if (!findHabit) {
			return response.status(404).json({ message: 'Habit not foound.'})
		}

		const now = dayjs().startOf('day').toISOString()

		const isHabitCompletedOnDate = findHabit.toObject()?.completedDates.find(
			(item) => dayjs(String(item)).toISOString() === now
		)

		if(isHabitCompletedOnDate) {
			const habitUpdate = await habitModel.findOneAndUpdate (
				{
					_id: validated.data.id
				},
				{
					$pull: {
						completedDates: now,
					},
				},
				{
					returnDocument: 'after'
				},
			)

			return response.status(200).json(habitUpdate)
		}

		const habitUpdated = await habitModel.findOneAndUpdate(
			{
				_id: validated.data.id,
			},
			{
				$push: {
					completedDates: now,
				},
			},
			{
				returnDocument: 'after',
			},
		)

		return response.status(200).json(habitUpdated)
	}
}