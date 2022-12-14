import "reflect-metadata";
import express from "express";
import cors from "cors";
import wildersController from "./controller/wilders";
import skillsController from "./controller/skills";
import { ApolloServer } from "apollo-server";
import datasource from "./db";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { WilderResolver } from "./resolver/WilderResolver";

const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

app.post("/wilders", wildersController.create);
app.get("/wilders", wildersController.read);
app.get("/wilders/:id", wildersController.readOne);
app.patch("/wilders/:id", wildersController.update);
app.delete("/wilders/:id", wildersController.delete);
app.post("/wilders/:wilderId/skills", wildersController.addSkill);
app.delete("/wilders/:wilderId/skills/:skillId", wildersController.removeSkill);
app.patch("/wilders/:wilderId/skills/:skillId", wildersController.updateGrade);

app.post("/skills", skillsController.create);
app.get("/skills", skillsController.read);
app.patch("/skills/:id", skillsController.update);
app.delete("/skills/:id", skillsController.delete);

const start = async (): Promise<void> => {
	await datasource.initialize();

	const schema = await buildSchema({
		resolvers: [WilderResolver],
	});

	const server = new ApolloServer({
		schema,
		csrfPrevention: true,
		cache: "bounded",
		plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
	});

	await server.listen().then(({ url }) => {
		console.log(`🚀  Server ready at ${url}`);
	});

	app.listen(5001, () => {
		console.log("listening on port 5001");
	});
};

void start();
