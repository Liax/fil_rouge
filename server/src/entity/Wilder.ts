import { MaxLength } from "class-validator";
import { Field, InputType, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Grade from "./Grade";

@ObjectType()
class SkillOfWilder {
	@Field()
	id: number;

	@Field()
	name: string;

	@Field()
	votes: number;
}

@ObjectType() // Ce que la bdd renvoi
@Entity()
class Wilder {
	@Field()
	@PrimaryGeneratedColumn()
	id: number;

	@Field() // TypeGraphQL
	@Column() // typeORM
	name: string;

	@Field({ nullable: true })
	@Column({ nullable: true, length: 100, type: "varchar" })
	city?: string;

	@Field({ nullable: true })
	@Column({ nullable: true, length: 100, type: "varchar" })
	avatarUrl?: string;

	@Field({ nullable: true })
	@Column({ length: 500, nullable: true, type: "text" })
	bio?: string;

	@Field(() => [SkillOfWilder])
	skills?: SkillOfWilder[];

	@OneToMany(() => Grade, (g) => g.wilder)
	grades: Grade[];
}

@InputType() // Ce que le client envoie à l'api
export class SkillId {
	@Field()
	id: number;
}

@InputType() // Ce que le client envoie à l'api
export class WilderInput {
	@Field()
	@MaxLength(100)
	name: string;

	@Field({ nullable: true })
	@MaxLength(100)
	city?: string;

	@Field({ nullable: true })
	@MaxLength(500)
	bio?: string;

	@Field({ nullable: true })
	@MaxLength(100)
	avatarUrl?: string;

	@Field(() => [SkillId], { nullable: true })
	skills?: SkillId[];
}

export default Wilder;
