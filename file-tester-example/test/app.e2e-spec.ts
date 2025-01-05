import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {FileSystemFileCreator, TestFilesDirectory} from "@elense/file-tester";

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    const genFiles = new TestFilesDirectory(__dirname, 'generated-test-files')

    const fileCreator = new FileSystemFileCreator({
          headerRow: ["First name", "Last name", "Age", "Type"]
        }
    )

    fileCreator.create(genFiles.path('test.xlsx'), [
        ["John", "Doe", 30, "Admin"],
        ["Adam", "Smith", 40, "Admin"],
        ["Rose", "Gatsby", 35, "User"]
    ])

    const file = fileCreator.readFile(genFiles.path('test.xlsx'))

    console.table(file)

    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
