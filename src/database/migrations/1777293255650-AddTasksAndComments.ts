import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTasksAndComments1777293255650 implements MigrationInterface {
    name = 'AddTasksAndComments1777293255650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_ce17f8b1c8016554cafa2dc8fb5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce17f8b1c8016554cafa2dc8fb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_855d484825b715c545349212c7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9eecdb5b1ed8c7c2a1b392c28d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e6d38899c31997c45d128a8973"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18c2493067c11f44efb35ca0e0"`);
        await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "team_id" TO "teamId"`);
        await queryRunner.query(`CREATE INDEX "IDX_2f789e58a882d8dd5b936c747c" ON "projects" ("teamId") `);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_2f789e58a882d8dd5b936c747c2" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_2f789e58a882d8dd5b936c747c2" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_2f789e58a882d8dd5b936c747c2"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "FK_2f789e58a882d8dd5b936c747c2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f789e58a882d8dd5b936c747c"`);
        await queryRunner.query(`ALTER TABLE "projects" RENAME COLUMN "teamId" TO "team_id"`);
        await queryRunner.query(`CREATE INDEX "IDX_18c2493067c11f44efb35ca0e0" ON "comments" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_e6d38899c31997c45d128a8973" ON "comments" ("author_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9eecdb5b1ed8c7c2a1b392c28d" ON "tasks" ("project_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_855d484825b715c545349212c7" ON "tasks" ("assignee_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ce17f8b1c8016554cafa2dc8fb" ON "projects" ("team_id") `);
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "FK_ce17f8b1c8016554cafa2dc8fb5" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
