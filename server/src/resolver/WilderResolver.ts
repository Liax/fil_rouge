import { Arg, Mutation, Query, Resolver } from "type-graphql";
import Wilder, { SkillId, WilderInput } from "../entity/Wilder";
import datasource from "../db";
import { ApolloError } from "apollo-server-errors";
import Grade from "../entity/Grade";

@Resolver(Wilder)
export class WilderResolver {
	@Query(() => [Wilder]) // typeGraphQL
	async wilders(): Promise<Wilder[]> {
		const wilders = await datasource
			.getRepository(Wilder)
			.find({ relations: { grades: { skill: true } } });

		return wilders.map((w) => ({
			...w,
			skills: w.grades.map((g) => ({
				id: g.skill.id,
				name: g.skill.name,
				votes: g.votes,
			})),
		}));
	}

	@Mutation(() => Wilder)
	async createWilder(@Arg("data") data: WilderInput): Promise<Wilder> {
		const { raw: id } = await datasource.getRepository(Wilder).insert(data);
		return { id, grades: [], ...data, skills: [] };
	}

	@Mutation(() => Boolean)
	async deleteWilder(@Arg("id") id: string): Promise<boolean> {
		const { affected } = await datasource.getRepository(Wilder).delete(id);
		if (affected === 0) throw new ApolloError("wilder not found", "NOT_FOUND");
		return true;
	}

	@Mutation(() => Wilder)
	async updateWilder(
		@Arg("id") id: string,
		@Arg("data") data: WilderInput
	): Promise<Wilder | undefined> {
		try {
			const { name, bio, avatarUrl, city, skills } = data;
			const wilderToUpdate = await datasource.getRepository(Wilder).findOne({
				where: { id: parseInt(id, 10) },
				relations: { grades: { skill: true } },
			});

			if (wilderToUpdate === null)
				throw new ApolloError("Wilder not found", "NOT_FOUND");

			wilderToUpdate.name = name;
			wilderToUpdate.bio = bio;
			wilderToUpdate.city = city;
			wilderToUpdate.avatarUrl = avatarUrl;

			await datasource.getRepository(Wilder).save(wilderToUpdate);

			const existingSkillsIds = wilderToUpdate.grades.map(
				(grade) => grade.skill.id
			);
			console.log("existingSkillsIds", existingSkillsIds);

			const newSkillsIds = (typeof skills === "undefined" ? [] : skills).map(
				(skill: SkillId) => skill.id
			);

			const skillIdsToAdd = newSkillsIds.filter(
				(newId) => !existingSkillsIds.includes(newId)
			);
			const skillsToRemove = existingSkillsIds.filter(
				(existingId) => !newSkillsIds.includes(existingId)
			);

			await datasource.getRepository(Grade).save(
				skillIdsToAdd.map((skillId) => ({
					skillId,
					wilderId: wilderToUpdate.id,
				}))
			);

			await Promise.all(
				skillsToRemove.map(
					async (skillId: number) =>
						await datasource
							.getRepository(Grade)
							.delete({ wilderId: wilderToUpdate.id, skillId })
				)
			);
			return wilderToUpdate;
		} catch (err) {
			console.error(err);
		}
	}
}
