import {ExactFilePathGenerationStrategy, FilePathGenerationStrategy} from "./test-files-directory";
import fs from "fs";
import * as path from 'path'

export class StaticTestFilesDirectory {
    static defaultFolderName = 'static-test-files'

    static async runInDirectory(
        basePath: string,
        folder: string = StaticTestFilesDirectory.defaultFolderName,
        callback: (dir: StaticTestFilesDirectory) => Promise<void>) {
        const testDirectory = new StaticTestFilesDirectory(basePath, folder)

        await callback(testDirectory)
    }

    readonly directory: string

    constructor(basePath: string, folder: string = StaticTestFilesDirectory.defaultFolderName, fileValidator?: (filePath: string) => void) {
        this.directory = path.resolve(basePath, folder)

        if (fileValidator) {
            this.validateFilesInDirectory(fileValidator);
        }
    }

    validateFilesInDirectory(fileValidator: (filePath: string) => void) {
        const files = fs.readdirSync(this.directory);

        files.forEach(file => {
            const filePath = path.join(this.directory, file);
            if (fs.lstatSync(filePath).isFile()) {
                fileValidator(filePath);
            }
        });
    }

    readFile(filePath: string, options: | {
        encoding: BufferEncoding;
        flag?: string | undefined;
    } | BufferEncoding): string {
        return fs.readFileSync(this.path(filePath), options)
    }

    path(filePath: string, filePathTransformationStrategy: FilePathGenerationStrategy = new ExactFilePathGenerationStrategy()): string {
        const finalFilePath: string = filePathTransformationStrategy.generate(filePath)

        return path.resolve(this.directory, finalFilePath)
    }
}